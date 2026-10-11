import React, { useState } from 'react';
import { useDoctor } from '../../context/DoctorContext';
import { 
  Stethoscope, 
  Ticket, 
  Clock, 
  Users, 
  LogOut, 
  Building2, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import DoctorHome from './DoctorHome';
import DoctorHistory from './DoctorHistory';
import DoctorPatients from './DoctorPatients';

export default function DoctorLayout({ onSwitchPortal }) {
  const { doctor, logoutDoctor, queue } = useDoctor();
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'history', 'patients'
  const [focusedPatientId, setFocusedPatientId] = useState(null);

  const waitingCount = queue.filter(t => t.status === 'Waiting').length;

  const handleNavigateToPatient = (patientId) => {
    setFocusedPatientId(patientId);
    setActiveTab('patients');
  };

  return (
    <div className="app-container">
      {/* Doctor Top Navigation Bar */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Brand & Doctor Credentials */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
              }}>
                <Stethoscope size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                    OneRecord
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 8px',
                    background: '#ccfbf1',
                    color: '#0f766e',
                    fontWeight: 700,
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    Doctor Desk
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '-2px' }}>
                  {doctor.name} • <strong>{doctor.specialization.split('&')[0].trim()}</strong> ({doctor.registrationNo})
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => { setActiveTab('home'); setFocusedPatientId(null); }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'home' ? '#ccfbf1' : 'transparent',
                  color: activeTab === 'home' ? '#0f766e' : '#475569',
                  fontWeight: activeTab === 'home' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Ticket size={16} />
                <span>Live Clinic Queue</span>
                {waitingCount > 0 && (
                  <span style={{ fontSize: '0.65rem', padding: '1px 6px', background: '#0d9488', color: 'white', borderRadius: '10px', fontWeight: 700 }}>
                    {waitingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('history')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'history' ? '#ccfbf1' : 'transparent',
                  color: activeTab === 'history' ? '#0f766e' : '#475569',
                  fontWeight: activeTab === 'history' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Clock size={16} />
                <span>Consultation History</span>
              </button>

              <button
                onClick={() => { setActiveTab('patients'); setFocusedPatientId(null); }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'patients' ? '#ccfbf1' : 'transparent',
                  color: activeTab === 'patients' ? '#0f766e' : '#475569',
                  fontWeight: activeTab === 'patients' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Users size={16} />
                <span>Patients & Calendar</span>
              </button>
            </nav>
          </div>

          {/* Right Action: Portal Switcher & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => onSwitchPortal('patient')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
              title="Switch to Patient Portal"
            >
              <span>Patient Portal</span>
            </button>

            <button
              onClick={() => onSwitchPortal('hospital')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
              title="Switch to Hospital Admin"
            >
              <span>Hospital Admin</span>
            </button>

            <button
              onClick={logoutDoctor}
              className="btn btn-danger btn-sm"
              title="Sign out of Doctor Portal"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'home' && <DoctorHome onNavigateToPatient={handleNavigateToPatient} />}
        {activeTab === 'history' && <DoctorHistory onNavigateToPatient={handleNavigateToPatient} />}
        {activeTab === 'patients' && <DoctorPatients initialPatientId={focusedPatientId} />}
      </main>
    </div>
  );
}
