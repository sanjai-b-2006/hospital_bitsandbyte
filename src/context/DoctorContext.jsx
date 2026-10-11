import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { API_BASE_URL } from '../config';
import { localDb } from '../services/localDb';

const API_URL = API_BASE_URL;

export const DoctorContext = createContext(null);

const SAMPLE_DOCTOR = {
  id: 'DOC-101',
  name: 'Dr. Rajesh Kulkarni',
  specialization: 'Cardiology & Interventional Cardiology',
  registrationNo: 'KMC-CARD-8812',
  email: 'dr.kulkarni@manipalhospitals.com',
  phone: '9845011223',
  status: 'Active',
  hospitalId: 'HOSP-KA-BLR-0042',
  hospitalName: 'Manipal Hospital, Old Airport Road',
  hospitalUid: 'MANIPAL-001',
};

export const DoctorProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(() => {
    const saved = localStorage.getItem('onerecord_current_doctor');
    return saved ? JSON.parse(saved) : SAMPLE_DOCTOR;
  });

  const [isDoctorAuthenticated, setIsDoctorAuthenticated] = useState(() => {
    return localStorage.getItem('onerecord_doctor_auth') === 'true';
  });

  const [queue, setQueue] = useState(() => localDb.getDoctorQueue(SAMPLE_DOCTOR.id));
  const [activeToken, setActiveToken] = useState(() => localDb.getDoctorQueue(SAMPLE_DOCTOR.id)[0] || null);
  const [activePatientRecords, setActivePatientRecords] = useState(() => localDb.getRecords('PAT-IND-884210'));
  const [history, setHistory] = useState(() => localDb.getDoctorHistory(SAMPLE_DOCTOR.id));
  const [patients, setPatients] = useState(() => localDb.getDoctorPatients(SAMPLE_DOCTOR.id));
  const [loading, setLoading] = useState(false);

  // Sync to local storage
  useEffect(() => {
    if (doctor) {
      localStorage.setItem('onerecord_current_doctor', JSON.stringify(doctor));
    }
  }, [doctor]);

  useEffect(() => {
    localStorage.setItem('onerecord_doctor_auth', isDoctorAuthenticated ? 'true' : 'false');
  }, [isDoctorAuthenticated]);

  // Fetch Doctor's Live Queue with LocalDB Fallback
  const fetchQueue = useCallback(async () => {
    if (!doctor?.id) return;
    const localQ = localDb.getDoctorQueue(doctor.id);
    setQueue(localQ);
    if (localQ.length > 0) {
      setActiveToken(prev => prev || localQ[0]);
    }
    try {
      const res = await fetch(`${API_URL}/doctor/${doctor.id}/queue`);
      if (res.ok) {
        const data = await res.json();
        setQueue(data);

        // Auto-select current patient if none selected or if waiting
        if (data.length > 0) {
          setActiveToken((prev) => {
            if (!prev) {
              const inProg = data.find((t) => t.status === 'In Consultation') || data[0];
              return inProg;
            }
            const updated = data.find((t) => t.id === prev.id);
            return updated || data[0];
          });
        }
      }
    } catch (err) {
      // Local fallback active
    }
  }, [doctor?.id]);

  // Fetch Active Patient's Full Longitudinal Records
  const fetchActivePatientRecords = useCallback(async (patientId) => {
    if (!patientId) {
      setActivePatientRecords([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/records?patientId=${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setActivePatientRecords(data);
      }
    } catch (err) {
      console.error('Error fetching patient records:', err);
    }
  }, []);

  // Update active patient records when active token changes
  useEffect(() => {
    if (activeToken?.patientId) {
      fetchActivePatientRecords(activeToken.patientId);
    } else {
      setActivePatientRecords([]);
    }
  }, [activeToken?.patientId, fetchActivePatientRecords]);

  // Fetch Doctor's Consultation History
  const fetchHistory = useCallback(async (filters = {}) => {
    if (!doctor?.id) return;
    try {
      const queryParams = new URLSearchParams();
      if (filters.sort) queryParams.append('sort', filters.sort);
      if (filters.risk) queryParams.append('risk', filters.risk);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);

      const res = await fetch(`${API_URL}/doctor/${doctor.id}/history?${queryParams.toString()}`);
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch (err) {
      console.error('Error fetching doctor history:', err);
    }
  }, [doctor?.id]);

  // Fetch Doctor's Accessible Patients Directory
  const fetchPatients = useCallback(async () => {
    if (!doctor?.id) return;
    try {
      const res = await fetch(`${API_URL}/doctor/${doctor.id}/patients`);
      if (res.ok) {
        setPatients(await res.json());
      }
    } catch (err) {
      console.error('Error fetching doctor patients:', err);
    }
  }, [doctor?.id]);

  // Refresh data on mount or doctor change
  useEffect(() => {
    if (isDoctorAuthenticated && doctor?.id) {
      fetchQueue();
      fetchHistory();
      fetchPatients();

      // Auto poll queue every 15s
      const timer = setInterval(() => {
        fetchQueue();
      }, 15000);

      return () => clearInterval(timer);
    }
  }, [isDoctorAuthenticated, doctor?.id, fetchQueue, fetchHistory, fetchPatients]);

  // Doctor Login
  const loginDoctor = async (credential, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/doctor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, password }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success && data.doctor) {
        setDoctor(data.doctor);
        setIsDoctorAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      setLoading(false);
      const localRes = localDb.loginDoctor(credential, password);
      if (localRes.success) {
        setDoctor(localRes.doctor);
        setIsDoctorAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: localRes.message || 'Login failed' };
    }
  };

  // Update token status (e.g. Call Patient, Complete Consultation)
  const updateTokenStatus = async (tokenId, status) => {
    localDb.updateTokenStatus(tokenId, status);
    setQueue(localDb.getDoctorQueue(doctor?.id));
    setHistory(localDb.getDoctorHistory(doctor?.id));
    try {
      await fetch(`${API_URL}/hospital/queue/${tokenId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return { success: true };
    } catch (err) {
      return { success: true };
    }
  };

  // Add prescription/record to active patient
  const addConsultationRecord = async (recordData) => {
    const localRes = localDb.addRecord(recordData);
    if (activeToken?.patientId) {
      setActivePatientRecords(localDb.getRecords(activeToken.patientId));
    }
    try {
      const res = await fetch(`${API_URL}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, recordId: data.recordId };
      }
      return { success: true, recordId: localRes.recordId };
    } catch (err) {
      return { success: true, recordId: localRes.recordId };
    }
  };

  const logoutDoctor = () => {
    setIsDoctorAuthenticated(false);
    localStorage.removeItem('onerecord_doctor_auth');
  };

  return (
    <DoctorContext.Provider
      value={{
        doctor,
        isDoctorAuthenticated,
        queue,
        activeToken,
        setActiveToken,
        activePatientRecords,
        history,
        patients,
        loading,
        fetchQueue,
        fetchHistory,
        fetchPatients,
        fetchActivePatientRecords,
        loginDoctor,
        logoutDoctor,
        updateTokenStatus,
        addConsultationRecord,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctor must be used within a DoctorProvider');
  }
  return context;
};
