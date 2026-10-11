import React, { useState, useEffect, useCallback } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { API_BASE_URL } from '../../config';
import {
  Activity,
  Users,
  Clock,
  Timer,
  CheckCircle2,
  CalendarDays,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  BrainCircuit,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const RISK_COLORS = { RED: '#ef4444', AMBER: '#f59e0b', GREEN: '#22c55e' };
const DEPT_STACK = ['waiting', 'inConsultation', 'completed'];

function KpiCard({ icon, label, value, sub, color = '#059669', bg = 'rgba(5,150,105,0.1)' }) {
  return (
    <div className="card" style={{ padding: '16px 18px', flex: '1 1 150px', minWidth: '150px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {label}
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
            {value ?? '—'}
          </div>
          {sub && <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, icon, subtitle, children, right }) {
  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '10px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#059669' }}>{icon}</span>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
          </div>
          {subtitle && <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>{subtitle}</div>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

const RANGE_LABELS = { daily: 'Daily', monthly: 'Monthly', yearly: 'Yearly' };

export default function HospitalAnalytics() {
  const { hospital } = useHospital();
  const hospitalId = hospital?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [visitsRange, setVisitsRange] = useState('daily');
  const [visitsData, setVisitsData] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(false);

  const [waitDept, setWaitDept] = useState('Cardiology');
  const [waitResult, setWaitResult] = useState(null);
  const [waitLoading, setWaitLoading] = useState(false);

  const loadAnalytics = useCallback(async () => {
    if (!hospitalId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/hospital/${hospitalId}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
        const depts = (json.departmentLoad || []).map((d) => d.department);
        if (depts.length) setWaitDept((prev) => (depts.includes(prev) ? prev : depts[0]));
      } else {
        setError(json.error || 'Failed to load analytics.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hospitalId]);

  const loadVisits = useCallback(async (range) => {
    if (!hospitalId) return;
    setVisitsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/hospital/${hospitalId}/visits?range=${range}`);
      const json = await res.json();
      if (json.success) setVisitsData(json.data || []);
    } catch (err) {
      // Keep last data
    } finally {
      setVisitsLoading(false);
    }
  }, [hospitalId]);

  const predictWait = async (dept) => {
    const d = dept || waitDept;
    if (!hospitalId || waitLoading) return;
    setWaitLoading(true);
    setWaitResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/ml/wait-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId, department: d }),
      });
      const json = await res.json();
      setWaitResult(json.success ? json : { ...json, error: json.error || 'Prediction failed.' });
    } catch (err) {
      setWaitResult({ error: err.message });
    } finally {
      setWaitLoading(false);
    }
  };

  useEffect(() => {
    if (hospitalId) {
      loadAnalytics();
      loadVisits('daily');
    }
  }, [hospitalId, loadAnalytics, loadVisits]);

  useEffect(() => {
    loadVisits(visitsRange);
  }, [visitsRange, loadVisits]);

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b', fontSize: '0.9rem' }}>
        <BarChart3 size={34} style={{ margin: '0 auto 12px', color: '#059669' }} />
        Loading hospital analytics…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#b91c1c', fontSize: '0.85rem' }}>
        ⚠️ {error}
      </div>
    );
  }

  const d = data;
  const today = d.today;
  const live = d.live;
  const capacity = d.capacity;
  const departments = (d.departmentLoad || []).map((x) => x.department);
  const waitDepts = departments.length ? departments : ['General OPD', 'Cardiology', 'Pediatrics', 'Orthopedics'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={22} color="#059669" />
            Hospital Analytics
          </h2>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            {hospital.name} • Live operational insights from OneRecord PostgreSQL
          </div>
        </div>
        <button
          onClick={loadAnalytics}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Error inline */}
      {error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', fontSize: '0.8rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* KPI cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <KpiCard icon={<Users size={18} />} label="Today's Visits" value={today.visits} sub={`${today.completed} completed · ${today.cancelled} cancelled`} />
        <KpiCard icon={<Clock size={18} />} label="Waiting Now" value={today.waiting} sub={`${live.waiting} across all departments`} color="#d97706" bg="rgba(245,158,11,0.12)" />
        <KpiCard icon={<Activity size={18} />} label="In Consultation" value={today.inConsultation} sub={`${live.inConsultation} total live`} color="#0d9488" bg="rgba(13,148,136,0.12)" />
        <KpiCard icon={<Timer size={18} />} label="Avg Wait Today" value={today.avgWaitMinutes != null ? `${today.avgWaitMinutes} min` : '—'} sub={today.hasWaitData ? 'per seated patient' : 'no consult data yet'} color="#0369a1" bg="rgba(2,132,199,0.12)" />
        <KpiCard icon={<CheckCircle2 size={18} />} label="Completion Rate" value={live.completionRate != null ? `${live.completionRate}%` : '—'} sub={`${live.completed} completed · ${live.cancelled} cancelled`} color="#16a34a" bg="rgba(34,197,94,0.12)" />
        <KpiCard icon={<CalendarDays size={18} />} label="Total Visits" value={capacity.totalVisits} sub={`${capacity.thisWeek} this week · ${capacity.thisMonth} this month`} color="#7c3aed" bg="rgba(124,58,237,0.12)" />
      </div>

      {/* Visits by range */}
      <ChartCard
        title="Patient Visits"
        subtitle="Visit counts by day, month or year"
        icon={<CalendarDays size={17} />}
        right={(
          <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
            {Object.entries(RANGE_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setVisitsRange(key)}
                style={{
                  padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: visitsRange === key ? '#059669' : 'transparent',
                  color: visitsRange === key ? 'white' : '#475569',
                  fontWeight: 700, fontSize: '0.72rem'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      >
        <div style={{ height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visitsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} interval={visitsRange === 'daily' ? 2 : 0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip cursor={{ fill: 'rgba(5,150,105,0.08)' }} />
              <Bar dataKey="visits" name="Visits" fill="#059669" radius={[5, 5, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {visitsLoading && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>Loading…</div>}
      </ChartCard>

      {/* Peak hours + Risk mix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '16px' }}>
        <ChartCard title="Peak Hours" subtitle="Tokens issued per hour (all history)" icon={<Timer size={17} />}>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.peakHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#94a3b8' }} interval={3} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: 'rgba(5,150,105,0.08)' }} />
                <Bar dataKey="count" name="Tokens" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Risk Mix" subtitle="Triage risk distribution across all tokens" icon={<PieIcon size={17} />}>
          <div style={{ height: '220px', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie
                  data={d.riskMix}
                  dataKey="count"
                  nameKey="risk"
                  cx="50%" cy="50%"
                  innerRadius={48}
                  outerRadius={75}
                  paddingAngle={3}
                  stroke="#fff"
                >
                  {d.riskMix.map((entry) => (
                    <Cell key={entry.risk} fill={RISK_COLORS[entry.risk] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '0.75rem' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {d.riskMix.map((r) => (
                <div key={r.risk} style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#334155' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: RISK_COLORS[r.risk] }} />
                    {r.risk}
                  </span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Department load */}
      <ChartCard title="Department Load" subtitle="Stacked workload per department (waiting / in consultation / completed)" icon={<BarChart3 size={17} />}>
        <div style={{ height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.departmentLoad} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-18} textAnchor="end" height={56} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip cursor={{ fill: 'rgba(5,150,105,0.06)' }} />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              <Bar dataKey="waiting" name="Waiting" stackId="a" fill="#f59e0b" />
              <Bar dataKey="inConsultation" name="In Consultation" stackId="a" fill="#0d9488" />
              <Bar dataKey="completed" name="Completed" stackId="a" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* ML Wait-Time Predictor */}
      <ChartCard
        title="ML Wait-Time Predictor"
        subtitle="Estimated wait for a NEW token in a department — live queue depth + linear regression on real consult durations"
        icon={<BrainCircuit size={17} />}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={waitDept}
            onChange={(e) => { setWaitDept(e.target.value); setWaitResult(null); }}
            style={{
              padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)',
              fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', background: 'white', minWidth: '180px'
            }}
          >
            {waitDepts.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <button
            onClick={() => predictWait(waitDept)}
            disabled={waitLoading}
            className="btn btn-primary btn-sm"
            style={{ background: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BrainCircuit size={15} />
            {waitLoading ? 'Predicting…' : 'Predict Wait Time'}
          </button>
        </div>

        {waitResult && waitResult.error && (
          <div style={{ marginTop: '14px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', fontSize: '0.8rem', color: '#b91c1c' }}>
            ⚠️ {waitResult.error}
          </div>
        )}

        {waitResult && waitResult.estimatedWaitMinutes != null && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'stretch' }}>
            <div style={{
              flex: '1 1 220px', textAlign: 'center', padding: '20px 16px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '2px solid #6ee7b7'
            }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#065f46' }}>
                ~{waitResult.estimatedWaitMinutes} min
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Estimated Wait
              </div>
            </div>
            <div style={{ flex: '2 1 320px', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '5px 10px', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.76rem', color: '#334155', fontWeight: 600 }}>
                  👥 {waitResult.aheadInQueue} ahead in queue
                </span>
                <span style={{ padding: '5px 10px', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.76rem', color: '#334155', fontWeight: 600 }}>
                  🕒 avg consult ~{waitResult.avgConsultMinutes} min
                </span>
                <span style={{
                  padding: '5px 10px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 700,
                  background: waitResult.model === 'linear-regression' ? '#ede9fe' : '#fef3c7',
                  color: waitResult.model === 'linear-regression' ? '#5b21b6' : '#92400e'
                }}>
                  🧠 {waitResult.model === 'linear-regression' ? 'Linear regression model' : 'Heuristic (limited data)'}
                </span>
                {waitResult.inProgressNow && (
                  <span style={{ padding: '5px 10px', background: '#ccfbf1', borderRadius: '8px', fontSize: '0.76rem', color: '#0f766e', fontWeight: 600 }}>
                    ⚡ consultation in progress
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Model trained on {waitResult.trainingSamples ?? 0} completed consultation(s).
                {waitResult.model !== 'linear-regression' && ' It switches to a learned regression once enough live consult data accumulates.'}
              </div>
            </div>
          </div>
        )}
      </ChartCard>
    </div>
  );
}