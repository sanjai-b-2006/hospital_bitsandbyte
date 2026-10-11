import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  ShieldAlert, 
  Activity, 
  User, 
  LogOut, 
  QrCode, 
  ChevronDown,
  Users,
  Plus,
  Baby,
  Check,
  ArrowRight,
  Database,
  Building2,
  Stethoscope
} from 'lucide-react';
import EmergencyCardModal from './EmergencyCardModal';
import AddFamilyMemberModal from './AddFamilyMemberModal';
import DatabaseInspectorModal from './DatabaseInspectorModal';

export default function Navbar({ activeTab, setActiveTab, onSwitchPortal }) {
  const { 
    patient, 
    currentAccount, 
    dependents, 
    isViewingDependent, 
    switchActiveProfile, 
    isAuthenticated, 
    logout 
  } = useHealth();

  const [showEmergencyCard, setShowEmergencyCard] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFamilyMenu, setShowFamilyMenu] = useState(false);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  const currentPatient = patient || currentAccount || {
    id: 'PAT-IND-884210',
    name: 'Aarav Sharma',
    bloodGroup: 'O+',
    age: 42,
    gender: 'Male'
  };

  return (
    <>
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
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('home')}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
              }}>
                <Activity size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                    OneRecord
                  </span>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    padding: '2px 6px', 
                    background: '#e0f2fe', 
                    color: '#0369a1', 
                    fontWeight: 700, 
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    Patient Portal
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs (When Authenticated) */}
            {isAuthenticated && (
              <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setActiveTab('home')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'home' ? '#f0f9ff' : 'transparent',
                    color: activeTab === 'home' ? '#0284c7' : '#475569',
                    fontWeight: activeTab === 'home' ? 600 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('records')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'records' ? '#f0f9ff' : 'transparent',
                    color: activeTab === 'records' ? '#0284c7' : '#475569',
                    fontWeight: activeTab === 'records' ? 600 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Medical Records & Calendar
                </button>
                <button
                  onClick={() => setActiveTab('access')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'access' ? '#f0f9ff' : 'transparent',
                    color: activeTab === 'access' ? '#0284c7' : '#475569',
                    fontWeight: activeTab === 'access' ? 600 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Manage Access
                </button>
                <button
                  onClick={() => setActiveTab('emergency')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === 'emergency' ? '#fff1f2' : 'transparent',
                    color: '#e11d48',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <ShieldAlert size={16} />
                  Emergency Profile
                </button>
              </nav>
            )}
          </div>

          {/* Right Section: Family Switcher, Emergency Card, and Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              <>
                {/* Family Members Switcher Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => { setShowFamilyMenu(!showFamilyMenu); setShowUserMenu(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: isViewingDependent ? '#f0fdf4' : '#f8fafc',
                      border: '1px solid',
                      borderColor: isViewingDependent ? '#86efac' : 'var(--border-color)',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: isViewingDependent ? '#166534' : '#0f172a'
                    }}
                    title="Switch profile between Self and Family Dependents"
                  >
                    {isViewingDependent ? <Baby size={16} color="#16a34a" /> : <Users size={16} color="#0284c7" />}
                    <span>{isViewingDependent ? `${currentPatient.name} (${currentPatient.relation || 'Dependent'})` : 'Family Profile'}</span>
                    <ChevronDown size={14} color="#64748b" />
                  </button>

                  {/* Family Dropdown Menu */}
                  {showFamilyMenu && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '280px',
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-xl)',
                      padding: '8px',
                      zIndex: 100
                    }}>
                      <div style={{ padding: '8px 10px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        Switch Active Medical Profile
                      </div>

                      {/* Primary Account Option */}
                      <button
                        onClick={() => {
                          switchActiveProfile(currentAccount.id);
                          setShowFamilyMenu(false);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          border: 'none',
                          background: !isViewingDependent ? '#f0f9ff' : 'transparent',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={16} color="#0284c7" />
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                              {currentAccount.name} (Self)
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              Primary Account Holder
                            </div>
                          </div>
                        </div>
                        {!isViewingDependent && <Check size={16} color="#0284c7" />}
                      </button>

                      {/* Dependents list */}
                      {dependents.length > 0 && (
                        <div style={{ margin: '6px 0', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                          <div style={{ padding: '4px 10px', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                            Children & Dependents:
                          </div>
                          {dependents.map((dep) => {
                            const isSelected = patient.id === dep.id;
                            return (
                              <button
                                key={dep.id}
                                onClick={() => {
                                  switchActiveProfile(dep.id);
                                  setShowFamilyMenu(false);
                                }}
                                style={{
                                  width: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 12px',
                                  border: 'none',
                                  background: isSelected ? '#f0fdf4' : 'transparent',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Baby size={16} color="#16a34a" />
                                  <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                                      {dep.name}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                      {dep.relation} • Age {dep.age} ({dep.bloodGroup})
                                    </div>
                                  </div>
                                </div>
                                {isSelected && <Check size={16} color="#16a34a" />}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Add Family Member CTA */}
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                        <button
                          onClick={() => {
                            setShowAddFamilyModal(true);
                            setShowFamilyMenu(false);
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            border: 'none',
                            background: '#f8fafc',
                            color: '#0284c7',
                            fontSize: '0.825rem',
                            fontWeight: 700,
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          <Plus size={15} />
                          <span>Add Son / Daughter / Dependent</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>


                {/* Emergency QR Badge Button */}
                <button
                  onClick={() => setShowEmergencyCard(true)}
                  className="btn"
                  style={{
                    padding: '8px 14px',
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    color: '#e11d48',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    borderRadius: '8px'
                  }}
                  title="View Emergency QR & Wallet Card"
                >
                  <QrCode size={16} />
                  <span>Emergency QR</span>
                </button>

                {/* Profile Widget */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => { setShowUserMenu(!showUserMenu); setShowFamilyMenu(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: '#f8fafc',
                      border: '1px solid var(--border-color)',
                      padding: '6px 12px 6px 8px',
                      borderRadius: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: isViewingDependent ? '#dcfce7' : '#e0f2fe',
                      color: isViewingDependent ? '#16a34a' : '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      {currentPatient.name?.charAt(0) || 'P'}
                    </div>
                    <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                        {currentPatient.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Blood: <strong style={{ color: '#e11d48' }}>{currentPatient.bloodGroup}</strong> | Age: {currentPatient.age}
                      </div>
                    </div>
                    <ChevronDown size={14} color="#64748b" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '260px',
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-xl)',
                      padding: '8px',
                      zIndex: 100
                    }}>
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                          Patient OneRecord UID
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                          {patient.id}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                          Primary Mobile: +91 {currentAccount.phone}
                        </div>
                      </div>

                      <div style={{ padding: '6px 0' }}>
                        <button
                          onClick={() => { setActiveTab('emergency'); setShowUserMenu(false); }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'transparent',
                            color: '#0f172a',
                            fontSize: '0.85rem',
                            textAlign: 'left',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <ShieldAlert size={16} color="#e11d48" />
                          <span>Emergency Medical Profile</span>
                        </button>

                        <button
                          onClick={() => { setShowEmergencyCard(true); setShowUserMenu(false); }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'transparent',
                            color: '#0f172a',
                            fontSize: '0.85rem',
                            textAlign: 'left',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <QrCode size={16} color="#0284c7" />
                          <span>Download Emergency QR Card</span>
                        </button>
                      </div>

                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            border: 'none',
                            background: '#fff1f2',
                            color: '#e11d48',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <LogOut size={16} />
                          <span>Logout of Session</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('login')}
                  className="btn btn-secondary btn-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="btn btn-primary btn-sm"
                >
                  Register Patient
                </button>
              </div>
            )}

            {/* Switch to Hospital Admin Portal Button */}
            <button
              onClick={() => onSwitchPortal && onSwitchPortal('hospital')}
              className="btn btn-sm"
              style={{
                background: '#ecfdf5',
                color: '#047857',
                border: '1px solid #a7f3d0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '7px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                marginLeft: '4px'
              }}
              title="Switch to Hospital Admin Dashboard"
            >
              <Building2 size={15} />
              <span>Hospital Admin</span>
            </button>

            {/* Switch to Doctor Clinical Portal Button */}
            <button
              onClick={() => onSwitchPortal && onSwitchPortal('doctor')}
              className="btn btn-sm"
              style={{
                background: '#ccfbf1',
                color: '#0f766e',
                border: '1px solid #99f6e4',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '7px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                marginLeft: '4px'
              }}
              title="Switch to Doctor Clinical Dashboard"
            >
              <Stethoscope size={15} />
              <span>Doctor Portal</span>
            </button>
          </div>
        </div>

        {/* Dependent Viewing Indicator Banner if viewing a child */}
        {isAuthenticated && isViewingDependent && (
          <div style={{
            background: '#f0fdf4',
            borderTop: '1px solid #bbf7d0',
            padding: '6px 24px',
            fontSize: '0.8rem',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Baby size={16} color="#16a34a" />
              <span>
                Viewing Dependent: <strong>{patient.name}</strong> ({patient.relation || 'Child'}) • Managed by Guardian <strong>{currentAccount.name}</strong>
              </span>
            </div>
            <button
              onClick={() => switchActiveProfile(currentAccount.id)}
              style={{
                background: 'white',
                border: '1px solid #86efac',
                color: '#166534',
                padding: '2px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Switch back to My Profile
            </button>
          </div>
        )}
      </header>

      {/* Emergency Wallet Card Modal */}
      {showEmergencyCard && (
        <EmergencyCardModal onClose={() => setShowEmergencyCard(false)} />
      )}

      {/* Add Family Member Modal */}
      {showAddFamilyModal && (
        <AddFamilyMemberModal onClose={() => setShowAddFamilyModal(false)} />
      )}

      {/* Database Inspector Modal */}
      {showDbModal && (
        <DatabaseInspectorModal onClose={() => setShowDbModal(false)} />
      )}
    </>
  );
}
