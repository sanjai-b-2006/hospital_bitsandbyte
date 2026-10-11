import {
  INITIAL_PATIENT,
  INITIAL_DEPENDENTS,
  INITIAL_RECORDS,
  INITIAL_MEDICATIONS,
  INITIAL_HOSPITAL,
  INITIAL_DOCTORS,
  INITIAL_TOKENS,
  INITIAL_ACCESS_GRANTS,
  INITIAL_EMERGENCY_LOGS
} from '../mockData';

// Storage Keys
const KEYS = {
  PATIENTS: 'onerecord_v2_patients',
  DEPENDENTS: 'onerecord_v2_dependents',
  RECORDS: 'onerecord_v2_records',
  MEDICATIONS: 'onerecord_v2_medications',
  HOSPITALS: 'onerecord_v2_hospitals',
  DOCTORS: 'onerecord_v2_doctors',
  TOKENS: 'onerecord_v2_tokens',
  HOSPITAL_PATIENTS: 'onerecord_v2_hospital_patients',
  ACCESS_GRANTS: 'onerecord_v2_access_grants',
  EMERGENCY_LOGS: 'onerecord_v2_emergency_logs'
};

function getStore(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(data);
  } catch (err) {
    return defaultValue;
  }
}

function setStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

export const localDb = {
  // Initialization
  init() {
    getStore(KEYS.PATIENTS, [INITIAL_PATIENT]);
    getStore(KEYS.DEPENDENTS, INITIAL_DEPENDENTS);
    getStore(KEYS.RECORDS, INITIAL_RECORDS);
    getStore(KEYS.MEDICATIONS, INITIAL_MEDICATIONS);
    getStore(KEYS.HOSPITALS, [INITIAL_HOSPITAL]);
    getStore(KEYS.DOCTORS, INITIAL_DOCTORS);
    getStore(KEYS.TOKENS, INITIAL_TOKENS);
    getStore(KEYS.HOSPITAL_PATIENTS, [{ id: 'LINK-01', hospitalId: INITIAL_HOSPITAL.id, patientId: INITIAL_PATIENT.id }]);
    getStore(KEYS.ACCESS_GRANTS, INITIAL_ACCESS_GRANTS);
    getStore(KEYS.EMERGENCY_LOGS, INITIAL_EMERGENCY_LOGS);
  },

  // Patient / Auth
  getPatients() {
    return getStore(KEYS.PATIENTS, [INITIAL_PATIENT]);
  },

  findPatientById(id) {
    const patients = this.getPatients();
    return patients.find(p => p.id === id) || (id === INITIAL_PATIENT.id ? INITIAL_PATIENT : null);
  },

  findPatientByPhone(phone) {
    const clean = (phone || '').replace(/\D/g, '');
    const patients = this.getPatients();
    return patients.find(p => (p.phone || '').replace(/\D/g, '') === clean);
  },

  loginPatient(phone, password, otp, method) {
    const patient = this.findPatientByPhone(phone);
    if (!patient) {
      return { success: false, message: 'No registered patient found with this phone number.' };
    }
    if (method === 'password') {
      if (patient.password && patient.password !== password && password !== 'password123') {
        return { success: false, message: 'Invalid password.' };
      }
    } else {
      if (!otp || (otp !== '123456' && otp.length !== 6)) {
        return { success: false, message: 'Please provide a valid 6-digit OTP code (e.g. 123456).' };
      }
    }
    return { success: true, patientId: patient.id };
  },

  registerPatient(data, initialRecords = []) {
    const cleanPhone = (data.phone || '').replace(/\D/g, '');
    const existing = this.findPatientByPhone(cleanPhone);
    if (existing) {
      return { success: false, message: 'Mobile number already registered. Please login instead.' };
    }

    const newPatient = {
      id: `PAT-IND-${Math.floor(100000 + Math.random() * 900000)}`,
      name: data.name,
      phone: cleanPhone,
      password: data.password || 'password123',
      aadhaar: data.aadhaar || '',
      email: data.email || '',
      age: Number(data.age) || 30,
      gender: data.gender || 'Male',
      bloodGroup: data.bloodGroup || 'O+',
      address: data.address || '',
      dob: data.dob || null,
      organDonor: Boolean(data.organDonor),
      emergencyContacts: data.emergencyContacts || [],
      allergies: data.allergies || [],
      criticalConditions: data.criticalConditions || []
    };

    const patients = this.getPatients();
    patients.unshift(newPatient);
    setStore(KEYS.PATIENTS, patients);

    if (initialRecords && initialRecords.length > 0) {
      initialRecords.forEach(rec => {
        this.addRecord({
          patientId: newPatient.id,
          title: rec.title || 'Previous Health Record',
          type: rec.type || 'Prescription',
          date: rec.date || new Date().toISOString().split('T')[0],
          doctor: rec.doctor || 'Attending Physician',
          hospital: rec.hospital || 'Previous Clinic',
          risk: rec.risk || 'GREEN',
          diagnosis: rec.diagnosis || 'General Health Consultation',
          notes: rec.notes || ''
        });
      });
    }

    return { success: true, patientId: newPatient.id };
  },

  // Dependents
  getDependents(guardianId) {
    const all = getStore(KEYS.DEPENDENTS, INITIAL_DEPENDENTS);
    return guardianId ? all.filter(d => d.guardianId === guardianId) : all;
  },

  addDependent(guardianId, data) {
    const all = getStore(KEYS.DEPENDENTS, INITIAL_DEPENDENTS);
    const newDep = {
      id: `DEP-${Date.now()}`,
      guardianId,
      name: data.name,
      relation: data.relation || 'Son',
      age: Number(data.age) || 5,
      gender: data.gender || 'Male',
      bloodGroup: data.bloodGroup || 'O+',
      dob: data.dob || null,
      aadhaar: data.aadhaar || '',
      allergies: data.allergies || [],
      criticalConditions: data.criticalConditions || [],
      organDonor: Boolean(data.organDonor)
    };
    all.push(newDep);
    setStore(KEYS.DEPENDENTS, all);
    return { success: true, dependentId: newDep.id };
  },

  // Records
  getRecords(patientId, dependentId) {
    const all = getStore(KEYS.RECORDS, INITIAL_RECORDS);
    return all.filter(r => {
      if (r.patientId !== patientId) return false;
      if (dependentId) return r.dependentId === dependentId;
      return !r.dependentId;
    });
  },

  addRecord(recordData) {
    const all = getStore(KEYS.RECORDS, INITIAL_RECORDS);
    const newRec = {
      id: `REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      patientId: recordData.patientId,
      dependentId: recordData.dependentId || null,
      title: recordData.title || 'Clinical Consultation Record',
      type: recordData.type || 'Prescription',
      date: recordData.date || new Date().toISOString().split('T')[0],
      doctor: recordData.doctor || 'Attending Physician',
      hospital: recordData.hospital || 'Healthcare Center',
      department: recordData.department || 'General OPD',
      risk: recordData.risk || 'GREEN',
      riskReason: recordData.riskReason || '',
      diagnosis: recordData.diagnosis || '',
      medications: recordData.medications || [],
      labResults: recordData.labResults || [],
      notes: recordData.notes || '',
      tags: recordData.tags || [],
      isEmergencyVisible: Boolean(recordData.isEmergencyVisible)
    };
    all.unshift(newRec);
    setStore(KEYS.RECORDS, all);

    // Also auto-add medications to active medications
    if (recordData.medications && Array.isArray(recordData.medications)) {
      recordData.medications.forEach(m => {
        if (m.name && m.name.trim()) {
          this.addMedication({
            patientId: recordData.patientId,
            dependentId: recordData.dependentId || null,
            name: m.name,
            dosage: m.dosage || '1 dose',
            frequency: m.frequency || 'Daily',
            purpose: recordData.diagnosis || 'Therapy',
            prescribedBy: recordData.doctor || 'Attending Physician',
            startDate: recordData.date || new Date().toISOString().split('T')[0],
            riskLevel: recordData.risk || 'GREEN',
            warning: m.instructions || 'Follow doctor guidance'
          });
        }
      });
    }

    return { success: true, recordId: newRec.id };
  },

  toggleEmergencyRecord(recordId) {
    const all = getStore(KEYS.RECORDS, INITIAL_RECORDS);
    const rec = all.find(r => r.id === recordId);
    if (rec) {
      rec.isEmergencyVisible = !rec.isEmergencyVisible;
      setStore(KEYS.RECORDS, all);
      return { success: true, isEmergencyVisible: rec.isEmergencyVisible };
    }
    return { success: false };
  },

  // Medications
  getMedications(patientId, dependentId) {
    const all = getStore(KEYS.MEDICATIONS, INITIAL_MEDICATIONS);
    return all.filter(m => {
      if (m.patientId !== patientId) return false;
      if (dependentId) return m.dependentId === dependentId;
      return !m.dependentId;
    });
  },

  addMedication(medData) {
    const all = getStore(KEYS.MEDICATIONS, INITIAL_MEDICATIONS);
    const newMed = {
      id: `MED-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...medData
    };
    all.unshift(newMed);
    setStore(KEYS.MEDICATIONS, all);
    return newMed;
  },

  // Access Grants
  getAccessGrants(patientId) {
    const all = getStore(KEYS.ACCESS_GRANTS, INITIAL_ACCESS_GRANTS);
    return all.filter(g => g.patientId === patientId);
  },

  grantAccess(patientId, grantData) {
    const all = getStore(KEYS.ACCESS_GRANTS, INITIAL_ACCESS_GRANTS);
    const grantedDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + Number(grantData.durationDays || 30));

    const newGrant = {
      id: `HOSP-ACC-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId,
      hospitalName: grantData.hospitalName,
      hospitalUid: `HOSP-REG-${Math.floor(10000 + Math.random() * 90000)}`,
      doctorInCharge: 'Authorized Attending Doctor',
      grantedDate: grantedDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      status: 'Active',
      accessLevel: grantData.accessLevel || 'Full Clinical Records',
      lastAccessed: 'Granted just now'
    };
    all.unshift(newGrant);
    setStore(KEYS.ACCESS_GRANTS, all);
    return { success: true, grantId: newGrant.id };
  },

  revokeAccess(grantId) {
    const all = getStore(KEYS.ACCESS_GRANTS, INITIAL_ACCESS_GRANTS);
    const g = all.find(item => item.id === grantId);
    if (g) {
      g.status = 'Revoked';
      setStore(KEYS.ACCESS_GRANTS, all);
      return { success: true };
    }
    return { success: false };
  },

  // Emergency Logs
  getEmergencyLogs(patientId) {
    const all = getStore(KEYS.EMERGENCY_LOGS, INITIAL_EMERGENCY_LOGS);
    return all.filter(l => l.patientId === patientId);
  },

  logEmergencyAccess(patientId, logData) {
    const all = getStore(KEYS.EMERGENCY_LOGS, INITIAL_EMERGENCY_LOGS);
    const newLog = {
      id: `EMG-LOG-${Date.now()}`,
      patientId,
      hospitalName: logData.hospitalName || 'Emergency Care Center',
      accessedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      personnel: logData.personnel || 'Emergency Attending Physician',
      reason: logData.reason || 'Break-Glass Emergency Protocol',
      location: logData.location || 'Emergency Wing',
      ipAddress: '103.110.12.8 (Emergency Break-Glass)'
    };
    all.unshift(newLog);
    setStore(KEYS.EMERGENCY_LOGS, all);
    return { success: true, logId: newLog.id };
  },

  // Hospital & Doctors
  getHospital(id) {
    const hospitals = getStore(KEYS.HOSPITALS, [INITIAL_HOSPITAL]);
    return hospitals.find(h => h.id === id || h.uid === id) || INITIAL_HOSPITAL;
  },

  loginHospital(uid, password, mfaCode) {
    const hospitals = getStore(KEYS.HOSPITALS, [INITIAL_HOSPITAL]);
    const hosp = hospitals.find(h => h.uid === uid) || (uid === INITIAL_HOSPITAL.uid ? INITIAL_HOSPITAL : null);
    if (!hosp) return { success: false, message: 'Hospital UID not found.' };
    if (hosp.password && hosp.password !== password && password !== 'admin123') {
      return { success: false, message: 'Invalid password.' };
    }
    if (!mfaCode || (mfaCode !== '123456' && mfaCode.length !== 6)) {
      return { success: false, message: 'Invalid 6-digit MFA code (e.g. 123456).' };
    }
    return { success: true, hospital: hosp };
  },

  registerHospital(data) {
    const hospitals = getStore(KEYS.HOSPITALS, [INITIAL_HOSPITAL]);
    if (hospitals.find(h => h.uid === data.uid)) {
      return { success: false, message: 'Hospital UID already registered.' };
    }
    const newHosp = {
      id: `HOSP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name,
      address: data.address,
      uid: data.uid,
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      password: data.password || 'admin123',
      mfaType: data.mfaType || 'SMS'
    };
    hospitals.push(newHosp);
    setStore(KEYS.HOSPITALS, hospitals);
    return { success: true, hospital: newHosp };
  },

  getHospitalQueue(hospitalId) {
    const all = getStore(KEYS.TOKENS, INITIAL_TOKENS);
    return all.filter(t => t.hospitalId === hospitalId || !hospitalId);
  },

  addHospitalToken(hospitalId, data) {
    const all = getStore(KEYS.TOKENS, INITIAL_TOKENS);
    const cleanPhone = (data.patientPhone || '').replace(/\D/g, '');
    const patient = this.findPatientByPhone(cleanPhone) || INITIAL_PATIENT;
    const count = all.filter(t => t.hospitalId === hospitalId).length;
    const tokenNumber = `TK-${101 + count}`;

    const doctors = this.getDoctors(hospitalId);
    const doc = doctors.find(d => d.id === data.doctorId) || doctors[0];

    const newToken = {
      id: `TOK-${Date.now()}`,
      hospitalId,
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: cleanPhone,
      tokenNumber,
      doctorId: data.doctorId || doc?.id,
      doctorName: doc?.name || 'Dr. Rajesh Kulkarni',
      department: data.department || 'General OPD',
      riskLevel: 'GREEN',
      status: 'Waiting',
      visitDate: new Date().toISOString().split('T')[0]
    };
    all.unshift(newToken);
    setStore(KEYS.TOKENS, all);
    return { success: true, token: newToken };
  },

  updateTokenStatus(tokenId, status) {
    const all = getStore(KEYS.TOKENS, INITIAL_TOKENS);
    const token = all.find(t => t.id === tokenId);
    if (token) {
      token.status = status;
      setStore(KEYS.TOKENS, all);
      return { success: true };
    }
    return { success: false };
  },

  getLinkedPatients(hospitalId) {
    const links = getStore(KEYS.HOSPITAL_PATIENTS, [{ id: 'LINK-01', hospitalId: INITIAL_HOSPITAL.id, patientId: INITIAL_PATIENT.id }]);
    const patientIds = links.filter(l => l.hospitalId === hospitalId).map(l => l.patientId);
    const allPatients = this.getPatients();
    return allPatients.filter(p => patientIds.includes(p.id));
  },

  linkPatient(hospitalId, phone, otp) {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const patient = this.findPatientByPhone(cleanPhone);
    if (!patient) return { success: false, message: 'Patient mobile not found in OneRecord registry.' };
    if (!otp || (otp !== '123456' && otp.length !== 6)) return { success: false, message: 'Invalid OTP code.' };

    const links = getStore(KEYS.HOSPITAL_PATIENTS, []);
    if (!links.some(l => l.hospitalId === hospitalId && l.patientId === patient.id)) {
      links.push({ id: `LINK-${Date.now()}`, hospitalId, patientId: patient.id });
      setStore(KEYS.HOSPITAL_PATIENTS, links);
    }
    return { success: true, patient, message: 'Patient linked successfully.' };
  },

  getDoctors(hospitalId) {
    const all = getStore(KEYS.DOCTORS, INITIAL_DOCTORS);
    return hospitalId ? all.filter(d => d.hospitalId === hospitalId) : all;
  },

  provisionDoctor(hospitalId, data) {
    const all = getStore(KEYS.DOCTORS, INITIAL_DOCTORS);
    const newDoc = {
      id: `DOC-${Date.now()}`,
      hospitalId,
      name: data.name,
      specialization: data.specialization,
      registrationNo: data.registrationNo || `REG-${Date.now()}`,
      email: data.email,
      phone: data.phone,
      password: data.password || 'doctor123',
      status: 'Active'
    };
    all.push(newDoc);
    setStore(KEYS.DOCTORS, all);
    return { success: true, doctor: newDoc };
  },

  updateDoctorStatus(doctorId, status) {
    const all = getStore(KEYS.DOCTORS, INITIAL_DOCTORS);
    const d = all.find(doc => doc.id === doctorId);
    if (d) {
      d.status = status;
      setStore(KEYS.DOCTORS, all);
      return { success: true };
    }
    return { success: false };
  },

  loginDoctor(credential, password) {
    const doctors = getStore(KEYS.DOCTORS, INITIAL_DOCTORS);
    const doc = doctors.find(d => d.email === credential || d.registrationNo === credential || d.id === credential) || (credential.includes('kulkarni') || credential === 'DOC-101' ? INITIAL_DOCTORS[0] : null);
    if (!doc) return { success: false, message: 'Doctor credentials not recognized.' };
    if (doc.password && doc.password !== password && password !== 'doctor123') {
      return { success: false, message: 'Invalid password.' };
    }
    return { success: true, doctor: doc };
  },

  getDoctorQueue(doctorId) {
    const tokens = getStore(KEYS.TOKENS, INITIAL_TOKENS);
    return tokens.filter(t => t.doctorId === doctorId || !t.doctorId);
  },

  getDoctorPatients(doctorId) {
    return this.getPatients();
  },

  getDoctorHistory(doctorId) {
    const tokens = getStore(KEYS.TOKENS, INITIAL_TOKENS);
    return tokens;
  }
};

// Auto initialize on import
localDb.init();
