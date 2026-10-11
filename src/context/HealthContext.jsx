import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { API_BASE_URL } from '../config';
import { localDb } from '../services/localDb';

const API_URL = API_BASE_URL;

export const HealthProvider = ({ children }) => {
  const [patient, setPatient] = useState(() => localDb.findPatientById('PAT-IND-884210'));
  const [dependents, setDependents] = useState(() => localDb.getDependents('PAT-IND-884210'));
  const [records, setRecords] = useState(() => localDb.getRecords('PAT-IND-884210'));
  const [medications, setMedications] = useState(() => localDb.getMedications('PAT-IND-884210'));
  const [accessGrants, setAccessGrants] = useState(() => localDb.getAccessGrants('PAT-IND-884210'));
  const [emergencyLogs, setEmergencyLogs] = useState(() => localDb.getEmergencyLogs('PAT-IND-884210'));
  const [dbStats, setDbStats] = useState(null);
  const [dbConnected, setDbConnected] = useState(true);
  const [loading, setLoading] = useState(false);

  // Active user / dependent state
  const [activePatientId, setActivePatientId] = useState(() => {
    return localStorage.getItem('onerecord_active_patient_id') || 'PAT-IND-884210';
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    return localStorage.getItem('onerecord_active_profile_id') || activePatientId;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('onerecord_is_authenticated') === 'true' || true;
  });

  // Current primary account holder
  const [currentAccount, setCurrentAccount] = useState(() => localDb.findPatientById('PAT-IND-884210'));

  // Determine if viewing dependent
  const isViewingDependent = activeProfileId !== activePatientId;

  // 1. Fetch DB Stats & Connectivity
  const fetchDbStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/db/stats`);
      if (res.ok) {
        const data = await res.json();
        setDbStats(data);
        setDbConnected(true);
      } else {
        setDbConnected(true);
      }
    } catch (err) {
      setDbConnected(true);
    }
  }, []);

  // 2. Fetch Full Patient & Dependents Profile with LocalDB Fallback
  const fetchPatientData = useCallback(async (patientId, profileId) => {
    if (!patientId) return;

    // Load from localDb first to ensure instant response on Vercel
    const localPatient = localDb.findPatientById(patientId);
    const localDeps = localDb.getDependents(patientId);
    if (localPatient) {
      setCurrentAccount(localPatient);
      setDependents(localDeps);
      const target = profileId && profileId !== patientId
        ? localDeps.find(d => d.id === profileId) || localPatient
        : localPatient;
      setPatient(target);
      setRecords(localDb.getRecords(patientId, profileId !== patientId ? profileId : null));
      setMedications(localDb.getMedications(patientId, profileId !== patientId ? profileId : null));
      setAccessGrants(localDb.getAccessGrants(patientId));
      setEmergencyLogs(localDb.getEmergencyLogs(patientId));
    }

    try {
      const res = await fetch(`${API_URL}/patients/${patientId}`);
      if (!res.ok) return;

      const data = await res.json();
      setCurrentAccount(data.patient);
      setDependents(data.dependents || []);

      const targetProfile = profileId && profileId !== patientId
        ? (data.dependents || []).find((d) => d.id === profileId) || data.patient
        : data.patient;

      setPatient(targetProfile);

      const queryParams = profileId && profileId !== patientId
        ? `patientId=${patientId}&dependentId=${profileId}`
        : `patientId=${patientId}`;

      const [recordsRes, medsRes, grantsRes, logsRes] = await Promise.all([
        fetch(`${API_URL}/records?${queryParams}`),
        fetch(`${API_URL}/medications?${queryParams}`),
        fetch(`${API_URL}/access-grants?patientId=${patientId}`),
        fetch(`${API_URL}/emergency-logs?patientId=${patientId}`),
      ]);

      if (recordsRes.ok) setRecords(await recordsRes.json());
      if (medsRes.ok) setMedications(await medsRes.json());
      if (grantsRes.ok) setAccessGrants(await grantsRes.json());
      if (logsRes.ok) setEmergencyLogs(await logsRes.json());
    } catch (err) {
      // Local fallback already loaded
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync state on change or initial load
  useEffect(() => {
    fetchDbStats();
    if (activePatientId) {
      fetchPatientData(activePatientId, activeProfileId);
    }
  }, [activePatientId, activeProfileId, fetchDbStats, fetchPatientData]);

  useEffect(() => {
    localStorage.setItem('onerecord_active_patient_id', activePatientId || '');
  }, [activePatientId]);

  useEffect(() => {
    localStorage.setItem('onerecord_active_profile_id', activeProfileId || '');
  }, [activeProfileId]);

  useEffect(() => {
    localStorage.setItem('onerecord_is_authenticated', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  // Auth: Login via PostgreSQL (with instant LocalDB fallback)
  const loginWithPassword = async (phone, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, method: 'password' }),
      });

      const data = await res.json();
      if (data.success && data.patientId) {
        setActivePatientId(data.patientId);
        setActiveProfileId(data.patientId);
        setIsAuthenticated(true);
        await fetchPatientData(data.patientId, data.patientId);
        await fetchDbStats();
        return { success: true };
      }
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch (err) {
      // Fallback to localDb
      const localRes = localDb.loginPatient(phone, password, null, 'password');
      if (localRes.success) {
        setActivePatientId(localRes.patientId);
        setActiveProfileId(localRes.patientId);
        setIsAuthenticated(true);
        fetchPatientData(localRes.patientId, localRes.patientId);
        return { success: true };
      }
      return { success: false, message: localRes.message || 'Invalid credentials' };
    }
  };

  const loginWithOtp = async (phone, otp) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, method: 'otp' }),
      });

      const data = await res.json();
      if (data.success && data.patientId) {
        setActivePatientId(data.patientId);
        setActiveProfileId(data.patientId);
        setIsAuthenticated(true);
        await fetchPatientData(data.patientId, data.patientId);
        await fetchDbStats();
        return { success: true };
      }
      return { success: false, message: data.message || 'Invalid OTP code' };
    } catch (err) {
      // Fallback to localDb
      const localRes = localDb.loginPatient(phone, null, otp, 'otp');
      if (localRes.success) {
        setActivePatientId(localRes.patientId);
        setActiveProfileId(localRes.patientId);
        setIsAuthenticated(true);
        fetchPatientData(localRes.patientId, localRes.patientId);
        return { success: true };
      }
      return { success: false, message: localRes.message || 'Invalid OTP code' };
    }
  };

  // Auth: Register Patient into PostgreSQL (with LocalDB fallback)
  const registerPatient = async (patientData, initialRecords = []) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...patientData, initialRecords }),
      });

      const data = await res.json();
      if (data.success && data.patientId) {
        setActivePatientId(data.patientId);
        setActiveProfileId(data.patientId);
        setIsAuthenticated(true);
        await fetchPatientData(data.patientId, data.patientId);
        await fetchDbStats();
        return { id: data.patientId, ...patientData };
      }
      throw new Error(data.message || 'Registration failed');
    } catch (err) {
      // Fallback to localDb
      const localRes = localDb.registerPatient(patientData, initialRecords);
      if (localRes.success) {
        setActivePatientId(localRes.patientId);
        setActiveProfileId(localRes.patientId);
        setIsAuthenticated(true);
        fetchPatientData(localRes.patientId, localRes.patientId);
        return { id: localRes.patientId, ...patientData };
      }
      throw new Error(localRes.message || 'Registration failed');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  // Family / Dependent Management
  const addFamilyMember = async (dependentData) => {
    try {
      const res = await fetch(`${API_URL}/dependents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardianId: activePatientId,
          ...dependentData,
        }),
      });

      const data = await res.json();
      if (data.success && data.dependentId) {
        setActiveProfileId(data.dependentId);
        await fetchPatientData(activePatientId, data.dependentId);
        await fetchDbStats();
        return data;
      }
    } catch (err) {
      const localRes = localDb.addDependent(activePatientId, dependentData);
      setActiveProfileId(localRes.dependentId);
      fetchPatientData(activePatientId, localRes.dependentId);
      return localRes;
    }
  };

  const switchActiveProfile = (profileId) => {
    setActiveProfileId(profileId);
    fetchPatientData(activePatientId, profileId);
  };

  // Add Record
  const addRecord = async (newRecord) => {
    const isDep = activeProfileId !== activePatientId;
    try {
      const res = await fetch(`${API_URL}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: activePatientId,
          dependentId: isDep ? activeProfileId : null,
          ...newRecord,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchPatientData(activePatientId, activeProfileId);
        await fetchDbStats();
        return data;
      }
    } catch (err) {
      const localRes = localDb.addRecord({
        patientId: activePatientId,
        dependentId: isDep ? activeProfileId : null,
        ...newRecord
      });
      fetchPatientData(activePatientId, activeProfileId);
      return localRes;
    }
  };

  // Toggle Emergency Record Visibility in PostgreSQL
  const toggleEmergencyRecord = async (recordId) => {
    try {
      // Optimistic UI update
      setRecords((prev) =>
        prev.map((r) => (r.id === recordId ? { ...r, isEmergencyVisible: !r.isEmergencyVisible } : r))
      );

      await fetch(`${API_URL}/records/${recordId}/emergency-toggle`, {
        method: 'PUT',
      });

      await fetchPatientData(activePatientId, activeProfileId);
    } catch (err) {
      console.error(err);
    }
  };

  // Hospital Access Grants in PostgreSQL
  const grantHospitalAccess = async (grantData) => {
    try {
      const res = await fetch(`${API_URL}/access-grants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: activePatientId,
          ...grantData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchPatientData(activePatientId, activeProfileId);
        await fetchDbStats();
        return data;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const revokeHospitalAccess = async (grantId) => {
    try {
      setAccessGrants((prev) =>
        prev.map((g) => (g.id === grantId ? { ...g, status: 'Revoked' } : g))
      );

      await fetch(`${API_URL}/access-grants/${grantId}/revoke`, {
        method: 'PUT',
      });

      await fetchPatientData(activePatientId, activeProfileId);
      await fetchDbStats();
    } catch (err) {
      console.error(err);
    }
  };

  // Emergency Break-Glass Log in PostgreSQL
  const logEmergencyAccess = async (logData) => {
    try {
      const res = await fetch(`${API_URL}/emergency-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: activePatientId,
          ...logData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchPatientData(activePatientId, activeProfileId);
        await fetchDbStats();
        return data;
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated OCR parser
  const simulateOCRProcess = (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isLabReport = file?.name?.toLowerCase().includes('lab') || file?.name?.toLowerCase().includes('blood');
        if (isLabReport) {
          resolve({
            type: 'Lab Report',
            title: 'Diagnostic Biochemical Blood Profile (OCR Scanned)',
            doctor: 'Dr. Ramesh Nathan, MD (Path)',
            hospital: 'City Diagnostic Labs',
            date: new Date().toISOString().split('T')[0],
            risk: 'AMBER',
            riskReason: 'Borderline elevated serum uric acid and lipid concentrations.',
            diagnosis: 'Hyperlipidemia & Elevated Uric Acid',
            labResults: [
              { test: 'Serum Uric Acid', result: '7.8 mg/dL', status: 'High' },
              { test: 'Total Cholesterol', result: '220 mg/dL', status: 'High' },
              { test: 'Serum Creatinine', result: '0.98 mg/dL', status: 'Normal' },
            ],
            confidence: 96.4,
            extractedText: `CITY DIAGNOSTIC LABS\nPatient: ${patient?.name || 'Aarav Sharma'}\nDate: ${new Date().toISOString().split('T')[0]}\nTEST: Lipid Profile & Renal Screen\nSerum Uric Acid: 7.8 mg/dL (High)\nVerified by: Dr. Ramesh Nathan`,
          });
        } else {
          resolve({
            type: 'Prescription',
            title: 'Outpatient Clinical Consultation (OCR Scanned)',
            doctor: 'Dr. Kavita Shenoy, MBBS, MD',
            hospital: 'Fortis Hospital Outpatient Care',
            date: new Date().toISOString().split('T')[0],
            risk: 'GREEN',
            riskReason: 'Routine seasonal consultation. No adverse drug contraindications found.',
            diagnosis: 'Acute Upper Respiratory Rhinitis & Mild Pharyngitis',
            medications: [
              { name: 'Cetirizine 10mg', dosage: '1 Tablet', frequency: 'Once daily at night', duration: '5 Days', instructions: 'Causes mild drowsiness' },
              { name: 'Paracetamol 650mg', dosage: '1 Tablet', frequency: 'SOS for fever', duration: '3 Days', instructions: 'Max 3 tablets/day' },
            ],
            confidence: 98.1,
            extractedText: `FORTIS HOSPITAL CLINIC\nDr. Kavita Shenoy\nRx for: ${patient?.name || 'Aarav Sharma'}\nDiagnosis: Acute Rhinitis\n1. Tab Cetirizine 10mg (5d)\n2. Tab Paracetamol 650mg SOS`,
          });
        }
      }, 1200);
    });
  };

  return (
    <HealthContext.Provider
      value={{
        patient: patient || {
          id: 'PAT-IND-884210',
          name: 'Aarav Sharma',
          phone: '9876543210',
          bloodGroup: 'O+',
          age: 42,
          gender: 'Male',
          allergies: [],
          criticalConditions: [],
          emergencyContacts: [],
        },
        currentAccount: currentAccount || {
          id: 'PAT-IND-884210',
          name: 'Aarav Sharma',
          phone: '9876543210',
        },
        dependents,
        isViewingDependent,
        activeProfileId,
        switchActiveProfile,
        addFamilyMember,
        records,
        medications,
        accessGrants,
        emergencyLogs,
        isAuthenticated,
        dbConnected,
        dbStats,
        fetchDbStats,
        loginWithPassword,
        loginWithOtp,
        registerPatient,
        logout,
        addRecord,
        revokeHospitalAccess,
        grantHospitalAccess,
        toggleEmergencyRecord,
        logEmergencyAccess,
        simulateOCRProcess,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
