import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, query } from './db.js';
import { askAI, getPatientVaultContext, hasAIConfigured } from './ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// 1. Health & Database Inspection Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'OneRecord PostgreSQL API', timestamp: new Date() });
});

app.get('/api/db/stats', async (req, res) => {
  try {
    const patientsCount = await query('SELECT COUNT(*) as count FROM patients');
    const dependentsCount = await query('SELECT COUNT(*) as count FROM dependents');
    const recordsCount = await query('SELECT COUNT(*) as count FROM medical_records');
    const medsCount = await query('SELECT COUNT(*) as count FROM active_medications');
    const grantsCount = await query('SELECT COUNT(*) as count FROM hospital_access_grants');
    const logsCount = await query('SELECT COUNT(*) as count FROM emergency_access_logs');

    const allPatients = await query('SELECT id, name, phone, age, gender, blood_group, created_at FROM patients ORDER BY created_at DESC');

    res.json({
      database: 'PostgreSQL',
      engine: process.env.DATABASE_URL ? 'Cloud PostgreSQL' : 'PGlite Persistent Engine',
      tables: {
        patients: Number(patientsCount.rows[0].count),
        dependents: Number(dependentsCount.rows[0].count),
        medical_records: Number(recordsCount.rows[0].count),
        active_medications: Number(medsCount.rows[0].count),
        hospital_access_grants: Number(grantsCount.rows[0].count),
        emergency_access_logs: Number(logsCount.rows[0].count),
      },
      registeredPatients: allPatients.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Auth: Login
app.post('/api/auth/login', async (req, res) => {
  const { phone, password, otp, method } = req.body;
  const cleanPhone = (phone || '').replace(/\D/g, '');

  try {
    const result = await query('SELECT * FROM patients WHERE phone = $1', [cleanPhone]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No registered patient found with this phone number.' });
    }

    const patient = result.rows[0];

    if (method === 'password') {
      if (patient.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid password.' });
      }
    } else {
      // OTP mode: accept 123456 or any 6-digit OTP in demo mode
      if (!otp || otp.length !== 6) {
        return res.status(400).json({ success: false, message: 'Please provide a valid 6-digit OTP code.' });
      }
    }

    res.json({ success: true, patientId: patient.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Auth: Register Patient
app.post('/api/auth/register', async (req, res) => {
  const {
    name,
    phone,
    password,
    aadhaar,
    email,
    age,
    gender,
    bloodGroup,
    address,
    dob,
    organDonor,
    emergencyContacts,
    allergies,
    criticalConditions,
    initialRecords,
  } = req.body;

  const cleanPhone = (phone || '').replace(/\D/g, '');
  const id = `PAT-IND-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    // Check if phone already registered
    const existing = await query('SELECT id FROM patients WHERE phone = $1', [cleanPhone]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Mobile number already registered. Please login instead.' });
    }

    await query(
      `INSERT INTO patients (
        id, name, phone, password, aadhaar, email, age, gender, blood_group, address, dob, organ_donor, emergency_contacts, allergies, critical_conditions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        id,
        name,
        cleanPhone,
        password || 'password123',
        aadhaar || '',
        email || '',
        Number(age) || 30,
        gender || 'Male',
        bloodGroup || 'O+',
        address || '',
        dob || null,
        Boolean(organDonor),
        JSON.stringify(emergencyContacts || []),
        JSON.stringify(allergies || []),
        JSON.stringify(criticalConditions || []),
      ]
    );

    // Optional initial records from Step 2
    if (initialRecords && Array.isArray(initialRecords) && initialRecords.length > 0) {
      for (const rec of initialRecords) {
        const recId = `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
        await query(
          `INSERT INTO medical_records (
            id, patient_id, title, type, date, doctor, hospital, risk, diagnosis, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            recId,
            id,
            rec.title || 'Previous Health Record',
            rec.type || 'Prescription',
            rec.date || new Date().toISOString().split('T')[0],
            rec.doctor || 'Attending Physician',
            rec.hospital || 'Previous Clinic',
            rec.risk || 'GREEN',
            rec.diagnosis || 'General Health Consultation',
            rec.notes || '',
          ]
        );
      }
    }

    res.json({ success: true, patientId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Get Patient Complete Profile + Dependents
app.get('/api/patients/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pResult = await query('SELECT * FROM patients WHERE id = $1', [id]);
    if (pResult.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const patient = pResult.rows[0];
    const dResult = await query('SELECT * FROM dependents WHERE guardian_id = $1 ORDER BY created_at ASC', [id]);

    res.json({
      patient: {
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        aadhaar: patient.aadhaar,
        email: patient.email,
        age: patient.age,
        gender: patient.gender,
        bloodGroup: patient.blood_group,
        address: patient.address,
        dob: patient.dob,
        organDonor: patient.organ_donor,
        emergencyContacts: patient.emergency_contacts,
        allergies: patient.allergies,
        criticalConditions: patient.critical_conditions,
      },
      dependents: dResult.rows.map((d) => ({
        id: d.id,
        guardianId: d.guardian_id,
        name: d.name,
        relation: d.relation,
        age: d.age,
        gender: d.gender,
        bloodGroup: d.blood_group,
        dob: d.dob,
        aadhaar: d.aadhaar,
        allergies: d.allergies,
        criticalConditions: d.critical_conditions,
        organDonor: d.organ_donor,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Add Family Member / Dependent
app.post('/api/dependents', async (req, res) => {
  const {
    guardianId,
    name,
    relation,
    age,
    gender,
    bloodGroup,
    dob,
    aadhaar,
    allergies,
    criticalConditions,
    organDonor,
  } = req.body;

  const id = `DEP-${Date.now()}`;

  try {
    await query(
      `INSERT INTO dependents (
        id, guardian_id, name, relation, age, gender, blood_group, dob, aadhaar, allergies, critical_conditions, organ_donor
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        guardianId,
        name,
        relation || 'Son',
        Number(age) || 5,
        gender || 'Male',
        bloodGroup || 'O+',
        dob || null,
        aadhaar || '',
        JSON.stringify(allergies || []),
        JSON.stringify(criticalConditions || []),
        Boolean(organDonor),
      ]
    );

    res.json({ success: true, dependentId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Get Medical Records (supports filtering by patient or dependent)
app.get('/api/records', async (req, res) => {
  const { patientId, dependentId } = req.query;

  try {
    let sql = 'SELECT * FROM medical_records WHERE patient_id = $1';
    const params = [patientId];

    if (dependentId) {
      sql += ' AND dependent_id = $2';
      params.push(dependentId);
    } else {
      sql += ' AND dependent_id IS NULL';
    }

    sql += ' ORDER BY date DESC';

    const result = await query(sql, params);
    res.json(
      result.rows.map((r) => ({
        id: r.id,
        patientId: r.patient_id,
        dependentId: r.dependent_id,
        title: r.title,
        type: r.type,
        date: r.date?.toISOString ? r.date.toISOString().split('T')[0] : String(r.date).split('T')[0],
        doctor: r.doctor,
        hospital: r.hospital,
        department: r.department,
        risk: r.risk,
        riskReason: r.risk_reason,
        diagnosis: r.diagnosis,
        medications: r.medications,
        labResults: r.lab_results,
        notes: r.notes,
        tags: r.tags,
        isEmergencyVisible: r.is_emergency_visible,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 7. Add Medical Record
app.post('/api/records', async (req, res) => {
  const {
    patientId,
    dependentId,
    title,
    type,
    date,
    doctor,
    hospital,
    department,
    risk,
    riskReason,
    diagnosis,
    medications,
    labResults,
    notes,
    tags,
    isEmergencyVisible,
  } = req.body;

  const id = `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  try {
    await query(
      `INSERT INTO medical_records (
        id, patient_id, dependent_id, title, type, date, doctor, hospital, department, risk, risk_reason, diagnosis, medications, lab_results, notes, tags, is_emergency_visible
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        id,
        patientId,
        dependentId || null,
        title,
        type || 'Prescription',
        date || new Date().toISOString().split('T')[0],
        doctor || 'Attending Physician',
        hospital || 'Outpatient Clinic',
        department || 'General',
        risk || 'GREEN',
        riskReason || '',
        diagnosis || '',
        JSON.stringify(medications || []),
        JSON.stringify(labResults || []),
        notes || '',
        JSON.stringify(tags || []),
        Boolean(isEmergencyVisible),
      ]
    );

    // Auto add medications to active_medications
    if (medications && Array.isArray(medications)) {
      for (const m of medications) {
        if (m.name?.trim()) {
          const medId = `MED-AUTO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          await query(
            `INSERT INTO active_medications (
              id, patient_id, dependent_id, name, dosage, frequency, purpose, prescribed_by, start_date, risk_level, warning
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              medId,
              patientId,
              dependentId || null,
              m.name,
              m.dosage || '1 dose',
              m.frequency || 'Daily',
              diagnosis || 'Therapy',
              doctor || 'Attending Physician',
              date || new Date().toISOString().split('T')[0],
              risk || 'GREEN',
              m.instructions || 'Follow doctor guidance',
            ]
          );
        }
      }
    }

    res.json({ success: true, recordId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 8. Toggle Emergency Record Visibility
app.put('/api/records/:id/emergency-toggle', async (req, res) => {
  const { id } = req.params;

  try {
    const current = await query('SELECT is_emergency_visible FROM medical_records WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const nextVal = !current.rows[0].is_emergency_visible;
    await query('UPDATE medical_records SET is_emergency_visible = $1 WHERE id = $2', [nextVal, id]);

    res.json({ success: true, isEmergencyVisible: nextVal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 9. Active Medications
app.get('/api/medications', async (req, res) => {
  const { patientId, dependentId } = req.query;

  try {
    let sql = 'SELECT * FROM active_medications WHERE patient_id = $1';
    const params = [patientId];

    if (dependentId) {
      sql += ' AND dependent_id = $2';
      params.push(dependentId);
    } else {
      sql += ' AND dependent_id IS NULL';
    }

    const result = await query(sql, params);
    res.json(
      result.rows.map((m) => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        purpose: m.purpose,
        prescribedBy: m.prescribed_by,
        startDate: m.start_date?.toISOString ? m.start_date.toISOString().split('T')[0] : String(m.start_date).split('T')[0],
        riskLevel: m.risk_level,
        warning: m.warning,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 10. Hospital Access Grants
app.get('/api/access-grants', async (req, res) => {
  const { patientId } = req.query;

  try {
    const result = await query('SELECT * FROM hospital_access_grants WHERE patient_id = $1 ORDER BY granted_date DESC', [patientId]);
    res.json(
      result.rows.map((g) => ({
        id: g.id,
        hospitalName: g.hospital_name,
        hospitalUid: g.hospital_uid,
        doctorInCharge: g.doctor_in_charge,
        grantedDate: g.granted_date?.toISOString ? g.granted_date.toISOString().split('T')[0] : String(g.granted_date).split('T')[0],
        expiryDate: g.expiry_date?.toISOString ? g.expiry_date.toISOString().split('T')[0] : String(g.expiry_date).split('T')[0],
        status: g.status,
        accessLevel: g.access_level,
        lastAccessed: g.last_accessed,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/access-grants', async (req, res) => {
  const { patientId, hospitalName, durationDays = 30, accessLevel } = req.body;
  const id = `HOSP-ACC-${Math.floor(1000 + Math.random() * 9000)}`;

  const grantedDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + Number(durationDays));

  try {
    await query(
      `INSERT INTO hospital_access_grants (
        id, patient_id, hospital_name, hospital_uid, doctor_in_charge, granted_date, expiry_date, status, access_level, last_accessed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        patientId,
        hospitalName,
        `HOSP-REG-${Math.floor(10000 + Math.random() * 90000)}`,
        'Authorized Attending Doctor',
        grantedDate.toISOString().split('T')[0],
        expiryDate.toISOString().split('T')[0],
        'Active',
        accessLevel || 'Full Clinical Records',
        'Granted just now',
      ]
    );

    res.json({ success: true, grantId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/access-grants/:id/revoke', async (req, res) => {
  const { id } = req.params;

  try {
    await query("UPDATE hospital_access_grants SET status = 'Revoked' WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 11. Emergency Access Logs
app.get('/api/emergency-logs', async (req, res) => {
  const { patientId } = req.query;

  try {
    const result = await query('SELECT * FROM emergency_access_logs WHERE patient_id = $1 ORDER BY created_at DESC', [patientId]);
    res.json(
      result.rows.map((l) => ({
        id: l.id,
        hospitalName: l.hospital_name,
        accessedAt: l.accessed_at,
        personnel: l.personnel,
        reason: l.reason,
        location: l.location,
        ipAddress: l.ip_address,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/emergency-logs', async (req, res) => {
  const { patientId, hospitalName, personnel, reason, location } = req.body;
  const id = `EMG-LOG-${Date.now()}`;

  try {
    await query(
      `INSERT INTO emergency_access_logs (
        id, patient_id, hospital_name, accessed_at, personnel, reason, location, ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        patientId,
        hospitalName,
        new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        personnel || 'Emergency Attending Physician',
        reason || 'Break-Glass Emergency Protocol',
        location || 'Emergency Wing',
        '103.110.12.8 (Emergency Break-Glass)',
      ]
    );

    res.json({ success: true, logId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// HOSPITAL ADMIN DASHBOARD ENDPOINTS
// ==========================================

// Hospital Registration
app.post('/api/hospital/register', async (req, res) => {
  const { name, address, uid, contactEmail, contactPhone, password, mfaType } = req.body;
  const id = `HOSP-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const existing = await query('SELECT id FROM hospitals WHERE uid = $1', [uid]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Hospital UID already registered.' });
    }

    await query(
      `INSERT INTO hospitals (id, name, address, uid, contact_email, contact_phone, password, mfa_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, name, address, uid, contactEmail || '', contactPhone || '', password, mfaType || 'SMS']
    );

    res.json({ success: true, hospitalId: id, uid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Hospital Login (UID + Password + MFA)
app.post('/api/hospital/login', async (req, res) => {
  const { uid, password, mfaCode } = req.body;

  try {
    const result = await query('SELECT * FROM hospitals WHERE uid = $1', [uid]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Hospital UID not found.' });
    }

    const hospital = result.rows[0];
    if (hospital.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password.' });
    }

    // Verify MFA (accept 123456 in demo mode)
    if (!mfaCode || (mfaCode !== '123456' && mfaCode.length !== 6)) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit MFA code.' });
    }

    res.json({
      success: true,
      hospital: {
        id: hospital.id,
        name: hospital.name,
        address: hospital.address,
        uid: hospital.uid,
        contactEmail: hospital.contact_email,
        contactPhone: hospital.contact_phone,
        mfaType: hospital.mfa_type,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Hospital Profile
app.get('/api/hospital/:id', async (req, res) => {
  try {
    const result = await query('SELECT id, name, address, uid, contact_email, contact_phone, mfa_type FROM hospitals WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Hospital not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Live Queue Tokens
app.get('/api/hospital/:id/queue', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM patient_tokens WHERE hospital_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(result.rows.map(t => ({
      id: t.id,
      tokenNumber: t.token_number,
      patientId: t.patient_id,
      patientName: t.patient_name,
      patientPhone: t.patient_phone,
      doctorId: t.doctor_id,
      doctorName: t.doctor_name,
      department: t.department,
      riskLevel: t.risk_level,
      status: t.status,
      visitDate: t.visit_date?.toISOString ? t.visit_date.toISOString().split('T')[0] : String(t.visit_date).split('T')[0],
      createdAt: t.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Patient to Live Queue & Issue Token
app.post('/api/hospital/queue/add', async (req, res) => {
  const { hospitalId, patientPhone, doctorId, department } = req.body;
  const cleanPhone = (patientPhone || '').replace(/\D/g, '');

  try {
    // 1. Look up patient by phone
    let patient = null;
    let patientId = `PAT-WALKIN-${Date.now()}`;
    let patientName = 'Walk-In Patient';
    let riskLevel = 'GREEN';

    const pResult = await query('SELECT * FROM patients WHERE phone = $1', [cleanPhone]);
    if (pResult.rows.length > 0) {
      patient = pResult.rows[0];
      patientId = patient.id;
      patientName = patient.name;

      // Check risk level from patient's records
      const rResult = await query("SELECT risk FROM medical_records WHERE patient_id = $1 AND risk = 'RED'", [patient.id]);
      if (rResult.rows.length > 0) {
        riskLevel = 'RED';
      } else {
        const aResult = await query("SELECT risk FROM medical_records WHERE patient_id = $1 AND risk = 'AMBER'", [patient.id]);
        if (aResult.rows.length > 0) riskLevel = 'AMBER';
      }
    }

    // 2. Fetch doctor name
    let doctorName = 'On-Duty Physician';
    if (doctorId) {
      const dResult = await query('SELECT name, specialization FROM doctors WHERE id = $1', [doctorId]);
      if (dResult.rows.length > 0) doctorName = dResult.rows[0].name;
    }

    // 3. Count today's tokens to generate sequential token number (e.g. TK-103)
    const countResult = await query('SELECT COUNT(*) as count FROM patient_tokens WHERE hospital_id = $1', [hospitalId]);
    const nextNum = 101 + Number(countResult.rows[0].count);
    const tokenNumber = `TK-${nextNum}`;

    const id = `TOK-${Date.now()}`;
    await query(
      `INSERT INTO patient_tokens (id, hospital_id, patient_id, patient_name, patient_phone, token_number, doctor_id, doctor_name, department, risk_level, status, visit_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_DATE)`,
      [id, hospitalId, patientId, patientName, cleanPhone, tokenNumber, doctorId || null, doctorName, department || 'General OPD', riskLevel, 'Waiting']
    );

    res.json({
      success: true,
      token: {
        id,
        tokenNumber,
        patientName,
        patientPhone: cleanPhone,
        doctorName,
        department,
        riskLevel,
        status: 'Waiting',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Queue Token Status
app.put('/api/hospital/queue/:tokenId/status', async (req, res) => {
  const { tokenId } = req.params;
  const { status } = req.body;

  try {
    await query('UPDATE patient_tokens SET status = $1 WHERE id = $2', [status, tokenId]);
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manage Patients: List linked users under this hospital
app.get('/api/hospital/:id/patients', async (req, res) => {
  try {
    const result = await query(
      `SELECT p.id, p.name, p.phone, p.blood_group, p.age, p.gender, p.address, hp.linked_at
       FROM hospital_patients hp
       JOIN patients p ON hp.patient_id = p.id
       WHERE hp.hospital_id = $1
       ORDER BY hp.linked_at DESC`,
      [req.params.id]
    );

    res.json(result.rows.map(r => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      bloodGroup: r.blood_group,
      age: r.age,
      gender: r.gender,
      address: r.address,
      linkedAt: r.linked_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manage Patients: Link patient via Mobile OTP
app.post('/api/hospital/patients/link', async (req, res) => {
  const { hospitalId, phone, otp } = req.body;
  const cleanPhone = (phone || '').replace(/\D/g, '');

  try {
    const pResult = await query('SELECT * FROM patients WHERE phone = $1', [cleanPhone]);
    if (pResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Patient mobile not found in OneRecord registry.' });
    }

    if (!otp || (otp !== '123456' && otp.length !== 6)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP entered.' });
    }

    const patient = pResult.rows[0];

    // Check if already linked
    const existing = await query('SELECT id FROM hospital_patients WHERE hospital_id = $1 AND patient_id = $2', [hospitalId, patient.id]);
    if (existing.rows.length > 0) {
      return res.json({ success: true, message: 'Patient is already linked.', patient });
    }

    const linkId = `LINK-${Date.now()}`;
    await query('INSERT INTO hospital_patients (id, hospital_id, patient_id) VALUES ($1, $2, $3)', [linkId, hospitalId, patient.id]);

    // Fetch actual hospital details
    let hospitalName = 'Hospital Network';
    let hospitalUid = 'HOSP-NET';
    const hResult = await query('SELECT name, uid FROM hospitals WHERE id = $1', [hospitalId]);
    if (hResult.rows.length > 0) {
      hospitalName = hResult.rows[0].name;
      hospitalUid = hResult.rows[0].uid;
    }

    // Auto-grant 30-day access with real hospital name and UID
    await query(
      `INSERT INTO hospital_access_grants (id, patient_id, hospital_name, hospital_uid, doctor_in_charge, granted_date, expiry_date, status, access_level, last_accessed)
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'Active', 'Full Clinical History', 'Linked via Admin OTP')`,
      [`HOSP-ACC-${Date.now()}`, patient.id, hospitalName, hospitalUid, 'Hospital Clinical Staff']
    );

    res.json({ success: true, patient, hospitalName });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Manage Doctors: Get all doctors in this hospital
app.get('/api/hospital/:id/doctors', async (req, res) => {
  try {
    const result = await query('SELECT * FROM doctors WHERE hospital_id = $1 ORDER BY created_at DESC', [req.params.id]);
    res.json(result.rows.map(d => ({
      id: d.id,
      name: d.name,
      specialization: d.specialization,
      registrationNo: d.registration_no,
      email: d.email,
      phone: d.phone,
      status: d.status,
      createdAt: d.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manage Doctors: Provision new doctor
app.post('/api/hospital/doctors', async (req, res) => {
  const { hospitalId, name, specialization, registrationNo, email, phone, password } = req.body;
  const id = `DOC-${Math.floor(100 + Math.random() * 900)}`;

  try {
    await query(
      `INSERT INTO doctors (id, hospital_id, name, specialization, registration_no, email, phone, password, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Active')`,
      [id, hospitalId, name, specialization, registrationNo || '', email || '', phone || '', password || 'doctor123']
    );

    res.json({ success: true, doctorId: id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Manage Doctors: Update doctor access status
app.put('/api/hospital/doctors/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await query('UPDATE doctors SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Visit History: All patients visited this hospital
app.get('/api/hospital/:id/history', async (req, res) => {
  try {
    const result = await query(
      `SELECT t.*, p.blood_group, p.age, p.gender
       FROM patient_tokens t
       LEFT JOIN patients p ON t.patient_id = p.id
       WHERE t.hospital_id = $1
       ORDER BY t.created_at DESC`,
      [req.params.id]
    );

    res.json(result.rows.map(r => ({
      id: r.id,
      tokenNumber: r.token_number,
      patientName: r.patient_name,
      patientPhone: r.patient_phone,
      patientId: r.patient_id,
      doctorName: r.doctor_name,
      department: r.department,
      riskLevel: r.risk_level,
      status: r.status,
      visitDate: r.visit_date?.toISOString ? r.visit_date.toISOString().split('T')[0] : String(r.visit_date).split('T')[0],
      bloodGroup: r.blood_group,
      age: r.age,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Emergency Break-Glass Lookup: Search patient by phone or Aadhaar
app.post('/api/hospital/emergency-lookup', async (req, res) => {
  const { query: searchQuery, hospitalName, doctorOrStaff, reason } = req.body;
  const cleanTerm = (searchQuery || '').replace(/\D/g, '');

  try {
    const result = await query(
      'SELECT * FROM patients WHERE phone = $1 OR replace(aadhaar, \' \', \'\') = $1',
      [cleanTerm]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No patient record found matching this mobile/Aadhaar number.' });
    }

    const patient = result.rows[0];

    // Fetch emergency medical records (is_emergency_visible = true or high risk)
    const rResult = await query(
      "SELECT * FROM medical_records WHERE patient_id = $1 AND (is_emergency_visible = true OR risk = 'RED') ORDER BY date DESC",
      [patient.id]
    );

    // Automatically log this Break-Glass access in PostgreSQL
    const logId = `EMG-LOG-${Date.now()}`;
    await query(
      `INSERT INTO emergency_access_logs (id, patient_id, hospital_name, accessed_at, personnel, reason, location, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        logId,
        patient.id,
        hospitalName || 'Emergency Triage Wing',
        new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        doctorOrStaff || 'Emergency Medical Officer',
        reason || 'Break-Glass Emergency Protocol Inspection',
        'Hospital Emergency Desk',
        '103.110.12.8 (Hospital Subnet)',
      ]
    );

    res.json({
      success: true,
      patient: {
        id: patient.id,
        name: patient.name,
        phone: patient.phone,
        bloodGroup: patient.blood_group,
        age: patient.age,
        gender: patient.gender,
        allergies: patient.allergies,
        criticalConditions: patient.critical_conditions,
        organDonor: patient.organ_donor,
        emergencyContacts: patient.emergency_contacts,
      },
      emergencyRecords: rResult.rows.map(r => ({
        id: r.id,
        title: r.title,
        type: r.type,
        date: r.date?.toISOString ? r.date.toISOString().split('T')[0] : String(r.date).split('T')[0],
        risk: r.risk,
        riskReason: r.risk_reason,
        diagnosis: r.diagnosis,
        doctor: r.doctor,
        hospital: r.hospital,
      })),
      accessLogId: logId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// DOCTOR DASHBOARD ENDPOINTS
// ==========================================

// Doctor Login (Email/Phone/RegistrationNo + Password)
app.post('/api/doctor/login', async (req, res) => {
  const { credential, password } = req.body;
  const cleanCred = (credential || '').trim();

  try {
    const result = await query(
      `SELECT d.*, h.name as hospital_name, h.uid as hospital_uid
       FROM doctors d
       JOIN hospitals h ON d.hospital_id = h.id
       WHERE (d.email = $1 OR d.phone = $1 OR d.registration_no = $1 OR d.id = $1)
       LIMIT 1`,
      [cleanCred]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No doctor account found with provided credentials.' });
    }

    const doctor = result.rows[0];

    if (doctor.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password.' });
    }

    if (doctor.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'Doctor clinical access has been suspended by hospital administration.' });
    }

    res.json({
      success: true,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialization: doctor.specialization,
        registrationNo: doctor.registration_no,
        email: doctor.email,
        phone: doctor.phone,
        status: doctor.status,
        hospitalId: doctor.hospital_id,
        hospitalName: doctor.hospital_name,
        hospitalUid: doctor.hospital_uid,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Doctor Live Patient Queue
app.get('/api/doctor/:id/queue', async (req, res) => {
  const doctorId = req.params.id;

  try {
    // Get doctor info to know hospital and specialization/department
    const dResult = await query('SELECT hospital_id, specialization FROM doctors WHERE id = $1', [doctorId]);
    let hospitalId = null;
    let deptKeyword = null;
    if (dResult.rows.length > 0) {
      hospitalId = dResult.rows[0].hospital_id;
      deptKeyword = dResult.rows[0].specialization.split('&')[0].trim();
    }

    let sql = `
      SELECT * FROM patient_tokens
      WHERE (doctor_id = $1 OR doctor_id IS NULL`;
    const params = [doctorId];

    if (hospitalId) {
      params.push(hospitalId);
      sql += ` OR hospital_id = $${params.length}`;
    }

    sql += `)
      ORDER BY CASE 
        WHEN status = 'In Consultation' THEN 1
        WHEN status = 'Waiting' THEN 2
        WHEN status = 'Completed' THEN 3
        ELSE 4
      END, created_at ASC`;

    const result = await query(sql, params);

    res.json(result.rows.map(t => ({
      id: t.id,
      tokenNumber: t.token_number,
      patientId: t.patient_id,
      patientName: t.patient_name,
      patientPhone: t.patient_phone,
      doctorId: t.doctor_id,
      doctorName: t.doctor_name,
      department: t.department,
      riskLevel: t.risk_level,
      status: t.status,
      visitDate: t.visit_date?.toISOString ? t.visit_date.toISOString().split('T')[0] : String(t.visit_date).split('T')[0],
      createdAt: t.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Doctor Consultation History with filters & sorting
app.get('/api/doctor/:id/history', async (req, res) => {
  const doctorId = req.params.id;
  const { sort = 'desc', risk, status, search } = req.query;

  try {
    let sql = `
      SELECT t.*, p.blood_group, p.age, p.gender
      FROM patient_tokens t
      LEFT JOIN patients p ON t.patient_id = p.id
      WHERE (t.doctor_id = $1 OR t.status = 'Completed')
    `;
    const params = [doctorId];

    if (risk && risk !== 'ALL') {
      params.push(risk);
      sql += ` AND t.risk_level = $${params.length}`;
    }

    if (status && status !== 'ALL') {
      params.push(status);
      sql += ` AND t.status = $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(t.patient_name) LIKE $${params.length} OR t.patient_phone LIKE $${params.length} OR LOWER(t.token_number) LIKE $${params.length})`;
    }

    sql += ` ORDER BY t.visit_date ${sort.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}, t.created_at DESC`;

    const result = await query(sql, params);

    res.json(result.rows.map(r => ({
      id: r.id,
      tokenNumber: r.token_number,
      patientName: r.patient_name,
      patientPhone: r.patient_phone,
      patientId: r.patient_id,
      doctorName: r.doctor_name,
      department: r.department,
      riskLevel: r.risk_level,
      status: r.status,
      visitDate: r.visit_date?.toISOString ? r.visit_date.toISOString().split('T')[0] : String(r.visit_date).split('T')[0],
      bloodGroup: r.blood_group,
      age: r.age,
      gender: r.gender,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Doctor Patients Directory (Patients accessible to this doctor via tokens or hospital grants)
app.get('/api/doctor/:id/patients', async (req, res) => {
  const doctorId = req.params.id;

  try {
    const result = await query(
      `SELECT DISTINCT ON (p.id)
         p.id, p.name, p.phone, p.blood_group, p.age, p.gender, p.address,
         p.allergies, p.critical_conditions,
         MAX(t.visit_date) as last_visit_date,
         COUNT(t.id) as total_visits
       FROM patients p
       JOIN patient_tokens t ON t.patient_id = p.id
       WHERE t.doctor_id = $1 OR t.hospital_id IN (SELECT hospital_id FROM doctors WHERE id = $1)
       GROUP BY p.id, p.name, p.phone, p.blood_group, p.age, p.gender, p.address, p.allergies, p.critical_conditions
       ORDER BY p.id, last_visit_date DESC`,
      [doctorId]
    );

    res.json(result.rows.map(p => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      bloodGroup: p.blood_group,
      age: p.age,
      gender: p.gender,
      address: p.address,
      allergies: p.allergies,
      criticalConditions: p.critical_conditions,
      lastVisitDate: p.last_visit_date?.toISOString ? p.last_visit_date.toISOString().split('T')[0] : String(p.last_visit_date).split('T')[0],
      totalVisits: Number(p.total_visits || 1),
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// PHARMACY POS BILLING & LAB REPORT SUBMISSION
// ==========================================

// 1. Pharmacy Bill Submission with OTP
app.post('/api/pharmacy/bill', async (req, res) => {
  const {
    phone,
    otp,
    storeName = 'MedPlus Pharmacy & Healthcare',
    invoiceNumber,
    items = [], // [{ name, dosage, qty, price }]
    totalAmount,
    pharmacistNotes,
    risk = 'GREEN',
    riskReason,
  } = req.body;

  const cleanPhone = (phone || '').replace(/\D/g, '');

  try {
    // 1. Find patient by phone
    const pResult = await query('SELECT * FROM patients WHERE phone = $1', [cleanPhone]);
    if (pResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No registered patient found with mobile ' + cleanPhone });
    }

    // 2. Validate OTP (accept demo 123456 or 6 digits)
    if (!otp || (otp !== '123456' && otp.length !== 6)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please enter the 6-digit OTP sent to patient.' });
    }

    const patient = pResult.rows[0];
    const recId = `REC-PHARM-${Date.now()}`;
    const invNo = invoiceNumber || `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    // Prepare medications structure
    const medications = items.map(it => ({
      name: it.name,
      dosage: it.dosage || '1 Tablet',
      frequency: `${it.qty || 1} units dispensed`,
      duration: 'Pharmacy Bill ' + invNo,
      instructions: `Price: ₹${it.price || 0}`,
    }));

    // Add to medical records
    await query(
      `INSERT INTO medical_records (
        id, patient_id, title, type, date, doctor, hospital, department, risk, risk_reason, diagnosis, medications, notes, is_emergency_visible
      ) VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        recId,
        patient.id,
        `Pharmacy Dispensation [${invNo}]`,
        'Prescription',
        'Registered Pharmacist',
        storeName,
        'Pharmacy & Therapeutics',
        risk,
        riskReason || (risk === 'RED' ? 'High alert drug dispensed' : 'Routine pharmacy dispensation'),
        `Dispensed Medicines (Total: ₹${totalAmount || 0})`,
        JSON.stringify(medications),
        pharmacistNotes || `Bill #${invNo} generated at ${storeName}. Verified via patient OTP.`,
        risk === 'RED',
      ]
    );

    // Auto-sync into active_medications
    for (const it of items) {
      if (it.name?.trim()) {
        const medId = `MED-PHARM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        await query(
          `INSERT INTO active_medications (
            id, patient_id, name, dosage, frequency, purpose, prescribed_by, start_date, risk_level, warning
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, $8, $9)`,
          [
            medId,
            patient.id,
            it.name,
            it.dosage || 'As directed',
            `Qty: ${it.qty || 1}`,
            'Pharmacy Dispensation',
            storeName,
            risk,
            riskReason || null,
          ]
        );
      }
    }

    res.json({
      success: true,
      message: 'Medicines billed and longitudinal record synced to patient profile!',
      patientName: patient.name,
      patientId: patient.id,
      recordId: recId,
      invoiceNumber: invNo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Diagnostic Lab Report Submission
app.post('/api/lab/submit', async (req, res) => {
  const {
    phone,
    labName = 'Apollo Diagnostics & Pathology Lab',
    testName,
    testCategory = 'Biochemistry',
    results = [], // [{ parameter, value, unit, referenceRange, status }]
    impression,
    pathologistName = 'Dr. Anand Raman, MD (Pathology)',
    risk = 'GREEN',
    riskReason,
  } = req.body;

  const cleanPhone = (phone || '').replace(/\D/g, '');

  try {
    const pResult = await query('SELECT * FROM patients WHERE phone = $1', [cleanPhone]);
    if (pResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No registered patient found with mobile ' + cleanPhone });
    }

    const patient = pResult.rows[0];
    const recId = `REC-LAB-${Date.now()}`;

    // Auto evaluate risk if abnormal results present
    const hasAbnormal = results.some(r => r.status === 'High' || r.status === 'Low' || r.status === 'Critical');
    const assignedRisk = risk !== 'GREEN' ? risk : (hasAbnormal ? 'AMBER' : 'GREEN');

    await query(
      `INSERT INTO medical_records (
        id, patient_id, title, type, date, doctor, hospital, department, risk, risk_reason, diagnosis, lab_results, notes, is_emergency_visible
      ) VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        recId,
        patient.id,
        `${testName || 'Diagnostic Investigation'} - Lab Report`,
        'Lab Report',
        pathologistName,
        labName,
        testCategory,
        assignedRisk,
        riskReason || (hasAbnormal ? 'Abnormal laboratory findings requiring clinical attention' : 'Normal diagnostic parameters'),
        impression || `Verified laboratory investigation results for ${testName}.`,
        JSON.stringify(results),
        `Certified by ${pathologistName} at ${labName}. Automatically submitted into OneRecord.`,
        assignedRisk === 'RED',
      ]
    );

    res.json({
      success: true,
      message: 'Lab report generated and added to patient health records!',
      patientName: patient.name,
      patientId: patient.id,
      recordId: recId,
      assignedRisk,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// AI CLINICAL ASSISTANT (OpenRouter LLM)
// Shared helpers live in server/ai.js.
// ==========================================

// Chat with the OpenRouter LLM (MedAssist AI) — helps uncover hard-to-find causes
app.post('/api/chat', async (req, res) => {
  if (!hasAIConfigured()) {
    return res.status(500).json({
      success: false,
      error: 'OPENROUTER_API_KEY is not configured on the server. Add it to your .env or server env vars.',
    });
  }

  const { messages, reasoning, patientId } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, error: 'Messages array is required.' });
  }

  const vaultContext = await getPatientVaultContext(patientId);

  const systemPrompt = {
    role: 'system',
    content:
      'You are MedAssist AI, a clinical decision-support assistant inside OneRecord. You help uncover rare or hard-to-find causes of medical presentations. ' +
      'Every request includes a "PATIENT HEALTH VAULT CONTEXT" section holding the patient\u2019s live data from OneRecord PostgreSQL.\n\n' +
      'RULES:\n' +
      '1. Answer ONLY the user\u2019s specific question. Do NOT dump unrelated records, history, or extra sections. Be concise — a few lines for simple questions; add detail only when asked.\n' +
      '2. Ground every statement in the provided vault context. NEVER say you lack access to the records — the data is already given. If something is missing, say exactly what is missing.\n' +
      '3. Output is rendered as Markdown. When presenting structured/tabular data (medications, labs, vitals, comparisons) use a Markdown table with a header row. Use **bold** for key terms and bullet lists for short points. Do NOT wrap the whole answer in code fences.\n' +
      '4. Do NOT append a disclaimer — the app already displays one. Add a brief clinical caveat only if the user explicitly asks for advice.\n' +
      '5. Be evidence-informed; flag red-flag/urgent findings when relevant.\n\n' +
      vaultContext,
  };

  try {
    const out = await askAI({
      system: systemPrompt.content,
      messages,
      reasoning: reasoning || { enabled: true },
    });

    res.json({
      success: true,
      model: out.model,
      content: out.content,
      // Preserve reasoning_details so the frontend can pass it back for continued reasoning
      reasoningDetails: out.reasoningDetails,
    });
  } catch (err) {
    console.error('[OpenRouter] Exception:', err);
    const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 502;
    res.status(status).json({ success: false, error: err.message });
  }
});

// ==========================================
// Launch (local) / Export (Vercel serverless)
// ==========================================

let dbReady = null;

// Run schema + seed once (memoized) so it works on serverless cold starts too
function ensureDbInitialized() {
  if (!dbReady) {
    dbReady = initDatabase().catch((err) => {
      dbReady = null; // allow retry on the next request
      throw err;
    });
  }
  return dbReady;
}

// Make sure the DB is ready before handling any API request.
// Vercel cold-starts a new function instance sometimes, so we can't rely on
// a one-time boot sequence like a normal long-running server.
app.use(async (req, res, next) => {
  try {
    await ensureDbInitialized();
    next();
  } catch (err) {
    console.error('[PostgreSQL Server] Failed to initialize database:', err);
    res.status(500).json({ error: 'Database initialization failed: ' + err.message });
  }
});

// Local development: listen on PORT only when executed directly (npm run server).
// When Vercel imports this file as a module, we skip listening and just export the app.
const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();

if (isDirectRun) {
  ensureDbInitialized()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[PostgreSQL Server] Express API running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('[PostgreSQL Server] Failed to initialize database:', err);
    });
}

export default app;
