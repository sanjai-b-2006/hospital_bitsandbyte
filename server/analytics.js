// ============================================================
// OneRecord — Analytics & Machine-Learning Service
// Pure-JS statistics (no heavy deps): aggregates over the live
// PostgreSQL tables, parses lab results into numeric trends,
// computes a weighted clinical risk score, and fits a tiny
// linear-regression model for wait-time prediction.
// ============================================================

import { query } from './db.js';

// ------------------------------------------------------------------
// Small numeric / ML helpers
// ------------------------------------------------------------------

// Closed-form ordinary least squares: X is [n x k] (first column
// should usually be 1 for the intercept), y is [n]. Returns beta (k).
export function trainLinearRegression(X, y) {
  const n = X.length;
  const k = X[0].length;
  if (n < 2 || k < 1) throw new Error('Not enough training data');

  // XtX (k x k) and Xty
  const XtX = Array.from({ length: k }, () => new Array(k).fill(0));
  const Xty = new Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    for (let a = 0; a < k; a++) {
      Xty[a] += X[i][a] * y[i];
      for (let b = 0; b < k; b++) {
        XtX[a][b] += X[i][a] * X[i][b];
      }
    }
  }

  // Solve XtX * beta = Xty with Gauss-Jordan elimination
  const aug = XtX.map((row, i) => [...row, Xty[i]]);
  for (let col = 0; col < k; col++) {
    let piv = col;
    for (let r = col + 1; r < k; r++) {
      if (Math.abs(aug[r][col]) > Math.abs(aug[piv][col])) piv = r;
    }
    [aug[col], aug[piv]] = [aug[piv], aug[col]];
    const pivot = Math.abs(aug[col][col]);
    if (pivot < 1e-12) continue;
    for (let c = col; c <= k; c++) aug[col][c] /= aug[col][col];
    for (let r = 0; r < k; r++) {
      if (r === col) continue;
      const factor = aug[r][col];
      for (let c = col; c <= k; c++) aug[r][c] -= factor * aug[col][c];
    }
  }
  return aug.map((row) => row[k]);
}

export function predictLinearRegression(beta, x) {
  return beta.reduce((s, b, i) => s + b * x[i], 0);
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// Normalise a DATE / TIMESTAMP into 'YYYY-MM-DD' (local calendar date — safe
// for both node-postgres DATE and TIMESTAMP values where toISOString() can
// shift the day by the server's UTC offset).
function dateKey(d) {
  if (!d) return '';
  if (d instanceof Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return String(d).slice(0, 10);
}

// ------------------------------------------------------------------
// 1. HOSPITAL ANALYTICS — live ops dashboard at a glance
// ------------------------------------------------------------------
export async function getHospitalAnalytics(hospitalId) {
  const result = await query(
    'SELECT * FROM patient_tokens WHERE hospital_id = $1 ORDER BY created_at ASC',
    [hospitalId]
  );
  const tokens = result.rows;
  const today = dateKey(new Date());
  const okTokens = tokens.filter((t) => dateKey(t.visit_date) === today);

  const countBy = (arr, fn) => {
    const map = {};
    arr.forEach((x) => {
      const k = fn(x);
      map[k] = (map[k] || 0) + 1;
    });
    return map;
  };

  // Status distribution (whole hospital)
  const allStatus = countBy(tokens, (t) => t.status || 'Unknown');

  // Today's flow
  const todayStatus = countBy(okTokens, (t) => t.status || 'Unknown');

  // Average wait today: started_at - created_at (minutes), seated tokens only
  const waitsToday = okTokens
    .filter((t) => t.created_at && t.started_at)
    .map((t) => (new Date(t.started_at) - new Date(t.created_at)) / 60000)
    .filter((m) => m >= 0 && m <= 480);
  const avgWaitTodayMinutes = waitsToday.length
    ? Math.round(waitsToday.reduce((a, b) => a + b, 0) / waitsToday.length)
    : null;

  // Avg consultation length across history: completed_at - started_at
  const consults = tokens
    .filter((t) => t.started_at && t.completed_at)
    .map((t) => (new Date(t.completed_at) - new Date(t.started_at)) / 60000)
    .filter((m) => m >= 1 && m <= 240);
  const avgConsultMinutes = consults.length
    ? Math.round(consults.reduce((a, b) => a + b, 0) / consults.length)
    : null;

  // Completion rate (served = completed + cancelled)
  const served = allStatus['Completed'] || 0;
  const cancelledAll = allStatus['Cancelled'] || 0;
  const completionRate = served + cancelledAll > 0
    ? Math.round((served / (served + cancelledAll)) * 100)
    : 0;

  // Last 14 days of visits (by visit_date)
  const byDate = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    byDate[dateKey(d)] = 0;
  }
  tokens.forEach((t) => {
    const k = dateKey(t.visit_date);
    if (k in byDate) byDate[k] += 1;
  });
  const dailyVisits = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, visits]) => ({ day: day.slice(5), visits }));

  // Peak hours (hour of created_at)
  const hourMap = countBy(tokens, (t) => {
    const d = t.created_at ? new Date(t.created_at) : new Date(t.visit_date);
    return d.getHours();
  });
  const peakHours = Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, '0')}:00`,
    count: hourMap[h] || 0,
  }));

  // Department load
  const deptMap = {};
  tokens.forEach((t) => {
    const dept = t.department || 'General OPD';
    deptMap[dept] = deptMap[dept] || { department: dept, waiting: 0, inConsultation: 0, completed: 0, cancelled: 0, other: 0, total: 0 };
    deptMap[dept].total += 1;
    const s = t.status || 'Unknown';
    if (s === 'Waiting') deptMap[dept].waiting += 1;
    else if (s === 'In Consultation') deptMap[dept].inConsultation += 1;
    else if (s === 'Completed') deptMap[dept].completed += 1;
    else if (s === 'Cancelled') deptMap[dept].cancelled += 1;
    else deptMap[dept].other += 1;
  });
  const departmentLoad = Object.values(deptMap).sort((a, b) => b.total - a.total);

  // Risk mix
  const riskMap = countBy(tokens, (t) => t.risk_level || 'GREEN');
  const riskMix = ['RED', 'AMBER', 'GREEN']
    .filter((r) => riskMap[r])
    .map((risk) => ({ risk, count: riskMap[risk] }));

  // Week / month totals (by created_at for live-ness)
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - now.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const when = (t) => (t.created_at ? new Date(t.created_at) : new Date(t.visit_date));
  const thisWeek = tokens.filter((t) => when(t) >= weekStart).length;
  const thisMonth = tokens.filter((t) => when(t) >= monthStart).length;

  return {
    today: {
      visits: okTokens.length,
      waiting: todayStatus['Waiting'] || 0,
      inConsultation: todayStatus['In Consultation'] || 0,
      completed: todayStatus['Completed'] || 0,
      cancelled: todayStatus['Cancelled'] || 0,
      avgWaitMinutes: avgWaitTodayMinutes,
      hasWaitData: waitsToday.length > 0,
    },
    live: {
      waiting: allStatus['Waiting'] || 0,
      inConsultation: allStatus['In Consultation'] || 0,
      completed: served,
      cancelled: cancelledAll,
      completionRate,
      avgConsultMinutes,
    },
    capacity: {
      totalVisits: tokens.length,
      thisWeek,
      thisMonth,
    },
    peakHours,
    departmentLoad,
    riskMix,
    dailyVisits,
  };
}

// ------------------------------------------------------------------
// 2. VISITS BY RANGE — daily / monthly / yearly patient visits
// ------------------------------------------------------------------
export async function getVisitsByRange(hospitalId, range = 'daily') {
  const result = await query(
    'SELECT visit_date FROM patient_tokens WHERE hospital_id = $1',
    [hospitalId]
  );
  const counts = {};
  result.rows.forEach((r) => {
    const k = dateKey(r.visit_date);
    counts[k] = (counts[k] || 0) + 1;
  });

  if (range === 'yearly') {
    const yearMap = {};
    Object.entries(counts).forEach(([day, n]) => {
      const y = day.slice(0, 4);
      yearMap[y] = (yearMap[y] || 0) + n;
    });
    const years = Object.keys(yearMap).sort();
    const filled = [];
    if (years.length) {
      const start = Number(years[0]);
      const end = Math.max(Number(years[years.length - 1]), new Date().getFullYear());
      for (let y = start; y <= end; y++) filled.push({ label: String(y), visits: yearMap[String(y)] || 0 });
    }
    return { range, data: filled };
  }

  if (range === 'monthly') {
    const monthMap = {};
    Object.entries(counts).forEach(([day, n]) => {
      const m = day.slice(0, 7);
      monthMap[m] = (monthMap[m] || 0) + n;
    });
    const data = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      data.push({ label: key, visits: monthMap[key] || 0 });
    }
    return { range, data };
  }

  // daily — last 30 days
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    data.push({ label: key.slice(5), visits: counts[key] || 0, full: key });
  }
  return { range, data };
}

// ------------------------------------------------------------------
// 3. PATIENT HEALTH TRENDS — numeric lab results over time
// ------------------------------------------------------------------
function parseLabValue(resultStr) {
  if (resultStr == null) return { value: null, unit: '' };
  const s = String(resultStr).trim();
  if (!s) return { value: null, unit: '' };
  // optional prefix (<, >, <=, ~) · number · unit
  const m = s.match(/^\s*([<>≤≥≈=~±]?)\s*([\d][\d,.]*)\s*(.*)$/);
  if (!m) return { value: null, unit: '' };
  const num = parseFloat(m[2].replace(/,/g, ''));
  if (Number.isNaN(num)) return { value: null, unit: '' };
  return { value: num, unit: (m[3] || '').trim(), prefix: m[1] };
}

export async function getPatientTrends(patientId) {
  if (!patientId) return { tests: [], totalRecords: 0 };

  const result = await query(
    `SELECT id, title, date, lab_results
       FROM medical_records
      WHERE patient_id = $1 OR dependent_id = $1
      ORDER BY date ASC`,
    [patientId]
  );

  const seriesMap = {};
  result.rows.forEach((r) => {
    const day = dateKey(r.date);
    const labs = Array.isArray(r.lab_results) ? r.lab_results : [];
    labs.forEach((l) => {
      if (!l || !l.test) return;
      const parsed = parseLabValue(l.result);
      if (parsed.value === null) return; // non-numeric — no trend possible
      if (!seriesMap[l.test]) seriesMap[l.test] = { test: l.test, unit: parsed.unit, points: [] };
      seriesMap[l.test].points.push({
        date: day,
        value: parsed.value,
        status: l.status || 'Normal',
        recordId: r.id,
        title: r.title,
      });
    });
  });

  const tests = Object.values(seriesMap)
    .map((s) => ({
      ...s,
      points: s.points
        .slice()
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((p) => ({
          ...p,
          abnormal: String(p.status).toLowerCase() !== 'normal',
        })),
    }))
    .filter((s) => s.points.length >= 2)
    .sort((a, b) => b.points.length - a.points.length);

  return { tests, totalRecords: result.rows.length };
}

// ------------------------------------------------------------------
// 4. ML PATIENT RISK SCORE — weighted early-warning score 0–100
// ------------------------------------------------------------------
export async function computeRiskScore(patientId) {
  const factors = {};
  let score = 0;

  // --- a) Profile: age + allergies + critical conditions
  const depResult = await query('SELECT * FROM dependents WHERE id = $1', [patientId]);
  let base = null;
  let isDependent = false;
  if (depResult.rows.length) {
    base = depResult.rows[0];
    isDependent = true;
  } else {
    const patResult = await query('SELECT * FROM patients WHERE id = $1', [patientId]);
    base = patResult.rows[0] || null;
  }

  let allergies = [];
  let conditions = [];
  if (base) {
    allergies = Array.isArray(base.allergies) ? base.allergies : [];
    conditions = Array.isArray(base.critical_conditions) ? base.critical_conditions : [];
  }

  const ageRaw = base ? Number(base.age) : null;
  let agePts = 0;
  if (ageRaw !== null && !Number.isNaN(ageRaw)) {
    if (ageRaw >= 65) agePts = 15;
    else if (ageRaw >= 50) agePts = 8;
    else if (ageRaw < 12) agePts = 5;
  }
  score += agePts;
  factors.age = { points: agePts, note: ageRaw ? `Age ${ageRaw}` : 'Age not on file' };

  let allergyPts = 0;
  let severeAllergies = 0;
  allergies.forEach((a) => {
    const label = (typeof a === 'string' ? a : a.name || a.allergen || a.allergy || '').toString();
    const detail = (typeof a === 'string' ? '' : a.severity || a.reaction || a.level || '').toString();
    if (/anaphyl|severe|life.?threat|allergic shock/i.test(`${label} ${detail}`)) {
      allergyPts += 15;
      severeAllergies += 1;
    } else {
      allergyPts += 5;
    }
  });
  allergyPts = Math.min(allergyPts, 30);
  score += allergyPts;
  factors.allergies = { points: allergyPts, count: allergies.length, severeCount: severeAllergies };

  const condPts = Math.min(conditions.length * 12, 24);
  score += condPts;
  factors.conditions = { points: condPts, count: conditions.length };

  // --- b) Medical records: RED/AMBER risk levels + lab anomalies
  const recResult = await query(
    `SELECT risk, lab_results FROM medical_records
      WHERE patient_id = $1 OR dependent_id = $1`,
    [patientId]
  );
  let red = 0, amber = 0, anomalies = 0;
  recResult.rows.forEach((r) => {
    if (r.risk === 'RED') red += 1;
    else if (r.risk === 'AMBER') amber += 1;
    if (Array.isArray(r.lab_results)) {
      anomalies += r.lab_results.filter(
        (l) => l && l.status && String(l.status).toLowerCase() !== 'normal'
      ).length;
    }
  });
  const recPts = Math.min(red * 20, 40) + Math.min(amber * 8, 16);
  score += recPts;
  factors.records = { points: recPts, redCount: red, amberCount: amber };

  const labPts = Math.min(anomalies * 3, 15);
  score += labPts;
  factors.labs = { points: labPts, anomalyCount: anomalies };

  // --- c) Active medications: risky / warning meds
  const medResult = await query(
    `SELECT name, risk_level, warning FROM active_medications
      WHERE patient_id = $1 OR dependent_id = $1`,
    [patientId]
  );
  const riskyMeds = medResult.rows.filter(
    (m) => m.risk_level === 'RED' || m.risk_level === 'AMBER' || (m.warning && String(m.warning).trim())
  );
  const medPts = Math.min(riskyMeds.length * 8, 16);
  score += medPts;
  factors.medications = { points: medPts, riskyCount: riskyMeds.length };

  // --- d) Final
  const finalScore = clamp(Math.round(score), 0, 100);
  const level = finalScore >= 75 ? 'CRITICAL' : finalScore >= 55 ? 'HIGH' : finalScore >= 30 ? 'MODERATE' : 'LOW';
  const levelColor = { CRITICAL: '#dc2626', HIGH: '#ea580c', MODERATE: '#d97706', LOW: '#16a34a' }[level];
  const summary = {
    CRITICAL: 'Immediate attention — multiple severe risk drivers present.',
    HIGH: 'Elevated risk drivers found. Strong triage review advised.',
    MODERATE: 'Some risk factors present. Recommended to review during this visit.',
    LOW: 'Minimal risk drivers detected on this chart.',
  }[level];

  return {
    success: true,
    patientId,
    isDependent,
    name: base ? base.name : null,
    score: finalScore,
    level,
    levelColor,
    summary,
    factors,
  };
}

// ------------------------------------------------------------------
// 5. ML WAIT-TIME PREDICTOR — linear regression + live queue depth
// ------------------------------------------------------------------
const DEFAULT_CONSULT_MINUTES = {
  'General OPD': 12,
  'Cardiology': 25,
  'Pediatrics': 15,
  'Orthopedics': 18,
  'Dermatology': 15,
  'Gynecology': 17,
  'ENT': 12,
  'Ophthalmology': 14,
  'Neurology': 22,
};

export async function predictWaitTime(hospitalId, department = 'General OPD') {
  const dept = department || 'General OPD';

  const result = await query(
    `SELECT department, status, created_at, started_at, completed_at
       FROM patient_tokens WHERE hospital_id = $1`,
    [hospitalId]
  );
  const tokens = result.rows;

  // Department encodings for the model
  const depts = [...new Set(tokens.map((t) => t.department || 'General OPD'))];
  const deptIdx = (d) => {
    const i = depts.indexOf(d);
    return i >= 0 ? i : depts.length;
  };

  // Training rows: completed consultations with real timestamps
  const train = tokens
    .filter((t) => t.started_at && t.completed_at)
    .map((t) => {
      const arr = t.created_at ? new Date(t.created_at) : new Date(t.started_at);
      const dur = (new Date(t.completed_at) - new Date(t.started_at)) / 60000;
      return {
        dept: t.department || 'General OPD',
        hour: arr.getHours(),
        dow: arr.getDay(),
        dur,
      };
    })
    .filter((r) => r.dur >= 1 && r.dur <= 240);

  // Fit y ≈ b0 + b1*hour + b2*dayOfWeek + b3*deptIndex  (duration minutes)
  let beta = null;
  let trainingSamples = train.length;
  if (train.length >= 8) {
    const X = train.map((r) => [1, r.hour, r.dow, deptIdx(r.dept)]);
    const y = train.map((r) => r.dur);
    try {
      beta = trainLinearRegression(X, y);
    } catch (err) {
      beta = null;
    }
  }

  const now = new Date();
  const predicted = beta
    ? predictLinearRegression(beta, [1, now.getHours(), now.getDay(), deptIdx(dept)])
    : null;
  // Keep the estimate sane (8–75 min per consult)
  const avgConsultMinutes = Math.round(clamp(
    predicted || DEFAULT_CONSULT_MINUTES[dept] || 15,
    8,
    75
  ));

  // Live queue depth in this department
  const ahead = tokens.filter(
    (t) => (t.status === 'Waiting' || t.status === 'In Consultation') && (t.department || 'General OPD') === dept
  ).length;
  const inProgressNow = tokens.some(
    (t) => t.status === 'In Consultation' && (t.department || 'General OPD') === dept
  );

  let wait = ahead * avgConsultMinutes + (inProgressNow ? avgConsultMinutes / 2 : 0);
  const estimatedWaitMinutes = Math.max(5, Math.round(wait / 5) * 5);

  return {
    success: true,
    department: dept,
    estimatedWaitMinutes,
    aheadInQueue: ahead,
    avgConsultMinutes,
    inProgressNow,
    model: beta ? 'linear-regression' : 'heuristic-average',
    trainingSamples,
  };
}