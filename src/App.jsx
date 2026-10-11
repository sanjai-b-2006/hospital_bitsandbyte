import React, { useState, useEffect } from 'react';
import { HealthProvider, useHealth } from './context/HealthContext';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { DoctorProvider, useDoctor } from './context/DoctorContext';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import PatientHome from './pages/patient/PatientHome';
import PatientRecords from './pages/patient/PatientRecords';
import ManageAccess from './pages/patient/ManageAccess';
import EmergencyProfile from './pages/patient/EmergencyProfile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import HospitalLayout from './pages/hospital/HospitalLayout';
import HospitalAuth from './pages/hospital/HospitalAuth';
import DoctorLayout from './pages/doctor/DoctorLayout';
import DoctorLogin from './pages/doctor/DoctorLogin';
import { 
  Pill, 
  CheckCircle2
} from 'lucide-react';

function AppContent() {
  const { isAuthenticated } = useHealth();
  const { isHospitalAuthenticated } = useHospital();
  const { isDoctorAuthenticated } = useDoctor();

  const [portalMode, setPortalMode] = useState(() => {
    return localStorage.getItem('onerecord_portal_mode') || 'patient';
  });

  const [activeTab, setActiveTab] = useState('home'); // 'home', 'records', 'access', 'emergency', 'login', 'register'

  useEffect(() => {
    localStorage.setItem('onerecord_portal_mode', portalMode);
  }, [portalMode]);

  // 1. Doctor Portal Mode
  if (portalMode === 'doctor') {
    if (!isDoctorAuthenticated) {
      return (
        <DoctorLogin onSwitchToPortal={(portal) => setPortalMode(portal || 'patient')} />
      );
    }
    return (
      <DoctorLayout />
    );
  }

  // 2. Hospital Portal Mode
  if (portalMode === 'hospital') {
    if (!isHospitalAuthenticated) {
      return (
        <HospitalAuth onSwitchToPortal={(portal) => setPortalMode(portal || 'patient')} />
      );
    }
    return (
      <HospitalLayout />
    );
  }

  // 3. Patient Portal Mode: If not logged in, show Login or Register
  if (!isAuthenticated) {
    if (activeTab === 'register') {
      return (
        <div className="app-container">
          <Navbar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onSwitchPortal={(portal) => setPortalMode(portal)} 
          />
          <Register onSwitchToLogin={() => setActiveTab('login')} />
        </div>
      );
    }
    return (
      <div className="app-container">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onSwitchPortal={(portal) => setPortalMode(portal)} 
        />
        <Login onSwitchToRegister={() => setActiveTab('register')} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSwitchPortal={(portal) => setPortalMode(portal)} 
      />

      {/* Main Page Content */}
      <main className="main-content">
        {activeTab === 'home' && <PatientHome onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'records' && <PatientRecords />}
        {activeTab === 'access' && <ManageAccess />}
        {activeTab === 'emergency' && <EmergencyProfile />}
      </main>

      {/* Ecosystem Architecture Footnote / Roadmap Bar */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        padding: '16px 24px',
        marginTop: '40px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              background: '#ecfdf5',
              color: '#059669',
              borderRadius: '4px',
              fontWeight: 700,
              fontSize: '0.72rem'
            }}>
              <CheckCircle2 size={12} /> Phase 1: Patient Dashboard Live
            </span>
            <span>OneRecord National Consent & Longitudinal Health Vault</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                background: '#fef3c7',
                color: '#b45309',
                border: '1px solid #fde68a',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.74rem',
                textDecoration: 'none'
              }}
            >
              <Pill size={13} />
              <span>Pharmacy & Lab Desk ↗</span>
            </a>
          </div>
        </div>
      </footer>
      <ChatBot />
    </div>
  );
}

export default function App() {
  return (
    <HealthProvider>
      <HospitalProvider>
        <DoctorProvider>
          <AppContent />
        </DoctorProvider>
      </HospitalProvider>
    </HealthProvider>
  );
}
