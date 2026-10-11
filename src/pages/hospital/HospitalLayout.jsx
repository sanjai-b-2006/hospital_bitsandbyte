import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  Building2, 
  Ticket, 
  Users, 
  Stethoscope, 
  Clock, 
  ShieldAlert, 
  LogOut, 
  ChevronRight,
  RefreshCw,
  Activity
} from 'lucide-react';
import HospitalHome from './HospitalHome';
import ManageHospitalUsers from './ManageHospitalUsers';
import ManageDoctors from './ManageDoctors';
import HospitalHistory from './HospitalHistory';
import HospitalEmergency from './HospitalEmergency';

export default function HospitalLayout({ onSwitchPortal }) {
  const { hospital, logoutHospital, queue } = useHospital();
  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'patients', 'doctors', 'history', 'emergency'

  const waitingCount = queue.filter(t => t.status === 'Waiting').length;

  return (
    <div className="app-container">
      {/* Hospital Top Navigation Header */}
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
          {/* Logo & Hospital Identifier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('queue')}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
              }}>
                <Building2 size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                    OneRecord
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 8px',
                    background: '#dcfce7',
                    color: '#166534',
                    fontWeight: 700,
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    Hospital Admin
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '-2px' }}>
                  {hospital.name} • UID: <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>{hospital.uid}</strong>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setActiveTab('queue')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'queue' ? '#ecfdf5' : 'transparent',
                  color: activeTab === 'queue' ? '#059669' : '#475569',
                  fontWeight: activeTab === 'queue' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Ticket size={16} />
                <span>Queue & Tokens</span>
                {waitingCount > 0 && (
                  <span style={{ fontSize: '0.65rem', padding: '1px 6px', background: '#059669', color: 'white', borderRadius: '10px', fontWeight: 700 }}>
                    {waitingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('patients')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'patients' ? '#ecfdf5' : 'transparent',
                  color: activeTab === 'patients' ? '#059669' : '#475569',
                  fontWeight: activeTab === 'patients' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Users size={16} />
                <span>Manage Patients</span>
              </button>

              <button
                onClick={() => setActiveTab('doctors')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'doctors' ? '#ecfdf5' : 'transparent',
                  color: activeTab === 'doctors' ? '#059669' : '#475569',
                  fontWeight: activeTab === 'doctors' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Stethoscope size={16} />
                <span>Manage Doctors</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'history' ? '#ecfdf5' : 'transparent',
                  color: activeTab === 'history' ? '#059669' : '#475569',
                  fontWeight: activeTab === 'history' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Clock size={16} />
                <span>Visit History</span>
              </button>

              <button
                onClick={() => setActiveTab('emergency')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'emergency' ? '#fff1f2' : 'transparent',
                  color: '#e11d48',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ShieldAlert size={16} />
                <span>Emergency Lookup</span>
              </button>
            </nav>
          </div>

          {/* Right Action: Switch Portal & Logout */}
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
              onClick={() => onSwitchPortal('doctor')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
              title="Switch to Doctor Portal"
            >
              <span>Doctor Portal</span>
            </button>

            <button
              onClick={logoutHospital}
              className="btn btn-danger btn-sm"
              title="Log out of Hospital Admin"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'queue' && <HospitalHome />}
        {activeTab === 'patients' && <ManageHospitalUsers />}
        {activeTab === 'doctors' && <ManageDoctors />}
        {activeTab === 'history' && <HospitalHistory />}
        {activeTab === 'emergency' && <HospitalEmergency />}
      </main>
    </div>
  );
}
