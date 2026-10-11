import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { API_BASE_URL } from '../config';
import { localDb } from '../services/localDb';

const API_URL = API_BASE_URL;

const SAMPLE_HOSPITAL = {
  id: 'HOSP-KA-BLR-0042',
  name: 'Manipal Hospital, Old Airport Road',
  address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru, Karnataka 560017',
  uid: 'MANIPAL-001',
  contactEmail: 'admin@manipalhospitals.com',
  contactPhone: '08025024444',
  mfaType: 'SMS',
};

export const HospitalProvider = ({ children }) => {
  const [hospital, setHospital] = useState(() => {
    const saved = localStorage.getItem('onerecord_current_hospital');
    return saved ? JSON.parse(saved) : SAMPLE_HOSPITAL;
  });

  const [isHospitalAuthenticated, setIsHospitalAuthenticated] = useState(() => {
    return localStorage.getItem('onerecord_hospital_auth') === 'true';
  });

  const [queue, setQueue] = useState(() => localDb.getHospitalQueue(SAMPLE_HOSPITAL.id));
  const [linkedPatients, setLinkedPatients] = useState(() => localDb.getLinkedPatients(SAMPLE_HOSPITAL.id));
  const [doctors, setDoctors] = useState(() => localDb.getDoctors(SAMPLE_HOSPITAL.id));
  const [history, setHistory] = useState(() => localDb.getHospitalQueue(SAMPLE_HOSPITAL.id));
  const [loading, setLoading] = useState(false);

  // Sync to local storage
  useEffect(() => {
    if (hospital) {
      localStorage.setItem('onerecord_current_hospital', JSON.stringify(hospital));
    }
  }, [hospital]);

  useEffect(() => {
    localStorage.setItem('onerecord_hospital_auth', isHospitalAuthenticated ? 'true' : 'false');
  }, [isHospitalAuthenticated]);

  // Fetch Hospital Queue with LocalDB Fallback
  const fetchQueue = useCallback(async () => {
    if (!hospital?.id) return;
    setQueue(localDb.getHospitalQueue(hospital.id));
    try {
      const res = await fetch(`${API_URL}/hospital/${hospital.id}/queue`);
      if (res.ok) {
        setQueue(await res.json());
      }
    } catch (err) {
      // Local fallback already active
    }
  }, [hospital?.id]);

  // Fetch Linked Patients
  const fetchLinkedPatients = useCallback(async () => {
    if (!hospital?.id) return;
    setLinkedPatients(localDb.getLinkedPatients(hospital.id));
    try {
      const res = await fetch(`${API_URL}/hospital/${hospital.id}/patients`);
      if (res.ok) {
        setLinkedPatients(await res.json());
      }
    } catch (err) {
      // Local fallback active
    }
  }, [hospital?.id]);

  // Fetch Doctors
  const fetchDoctors = useCallback(async () => {
    if (!hospital?.id) return;
    setDoctors(localDb.getDoctors(hospital.id));
    try {
      const res = await fetch(`${API_URL}/hospital/${hospital.id}/doctors`);
      if (res.ok) {
        setDoctors(await res.json());
      }
    } catch (err) {
      // Local fallback active
    }
  }, [hospital?.id]);

  // Fetch Visit History
  const fetchHistory = useCallback(async () => {
    if (!hospital?.id) return;
    setHistory(localDb.getHospitalQueue(hospital.id));
    try {
      const res = await fetch(`${API_URL}/hospital/${hospital.id}/history`);
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch (err) {
      // Local fallback active
    }
  }, [hospital?.id]);

  // Initial load and periodic queue refresh (auto-updates live queue every 15s)
  useEffect(() => {
    if (isHospitalAuthenticated && hospital?.id) {
      fetchQueue();
      fetchLinkedPatients();
      fetchDoctors();
      fetchHistory();

      const timer = setInterval(() => {
        fetchQueue();
      }, 15000);
      return () => clearInterval(timer);
    }
  }, [isHospitalAuthenticated, hospital?.id, fetchQueue, fetchLinkedPatients, fetchDoctors, fetchHistory]);

  // Auth: Hospital Login
  const loginHospital = async (uid, password, mfaCode) => {
    try {
      const res = await fetch(`${API_URL}/hospital/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, password, mfaCode }),
      });

      const data = await res.json();
      if (data.success && data.hospital) {
        setHospital(data.hospital);
        setIsHospitalAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: 'Could not connect to database server.' };
    }
  };

  // Auth: Hospital Register
  const registerHospital = async (hospitalData) => {
    try {
      const res = await fetch(`${API_URL}/hospital/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hospitalData),
      });

      const data = await res.json();
      if (data.success) {
        const newHosp = {
          id: data.hospitalId,
          name: hospitalData.name,
          address: hospitalData.address,
          uid: hospitalData.uid,
          contactEmail: hospitalData.contactEmail,
          contactPhone: hospitalData.contactPhone,
          mfaType: hospitalData.mfaType || 'SMS',
        };
        setHospital(newHosp);
        setIsHospitalAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: 'Could not connect to database server.' };
    }
  };

  const logoutHospital = () => {
    setIsHospitalAuthenticated(false);
  };

  // Queue Operations
  const addPatientToQueue = async ({ patientPhone, doctorId, department }) => {
    try {
      const res = await fetch(`${API_URL}/hospital/queue/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: hospital.id,
          patientPhone,
          doctorId,
          department,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchQueue();
        await fetchHistory();
        return { success: true, token: data.token };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateTokenStatus = async (tokenId, status) => {
    try {
      // Optimistic update
      setQueue((prev) => prev.map((t) => (t.id === tokenId ? { ...t, status } : t)));
      await fetch(`${API_URL}/hospital/queue/${tokenId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await fetchQueue();
      await fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  // Link Patient via Mobile OTP
  const linkPatientWithOtp = async (phone, otp) => {
    try {
      const res = await fetch(`${API_URL}/hospital/patients/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: hospital.id,
          phone,
          otp,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchLinkedPatients();
        return { success: true, patient: data.patient, message: data.message };
      }
      return { success: false, message: data.message || 'Verification failed' };
    } catch (err) {
      return { success: false, message: 'Network error linking patient.' };
    }
  };

  // Doctor Operations
  const provisionDoctor = async (doctorData) => {
    try {
      const res = await fetch(`${API_URL}/hospital/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId: hospital.id,
          ...doctorData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchDoctors();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateDoctorStatus = async (doctorId, status) => {
    try {
      setDoctors((prev) => prev.map((d) => (d.id === doctorId ? { ...d, status } : d)));
      await fetch(`${API_URL}/hospital/doctors/${doctorId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await fetchDoctors();
    } catch (err) {
      console.error(err);
    }
  };

  // Emergency Break-Glass Lookup
  const performEmergencyLookup = async (query, doctorOrStaff, reason) => {
    try {
      const res = await fetch(`${API_URL}/hospital/emergency-lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          hospitalName: hospital.name,
          doctorOrStaff,
          reason,
        }),
      });

      const data = await res.json();
      return data;
    } catch (err) {
      return { success: false, message: 'Error performing emergency lookup.' };
    }
  };

  return (
    <HospitalContext.Provider
      value={{
        hospital,
        isHospitalAuthenticated,
        loginHospital,
        registerHospital,
        logoutHospital,
        queue,
        fetchQueue,
        addPatientToQueue,
        updateTokenStatus,
        linkedPatients,
        fetchLinkedPatients,
        linkPatientWithOtp,
        doctors,
        fetchDoctors,
        provisionDoctor,
        updateDoctorStatus,
        history,
        fetchHistory,
        performEmergencyLookup,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
