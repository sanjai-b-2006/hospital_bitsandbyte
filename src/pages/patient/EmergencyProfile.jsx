import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { 
  ShieldAlert, 
  Heart, 
  AlertTriangle, 
  PhoneCall, 
  Clock, 
  Building2, 
  QrCode, 
  Plus, 
  Check, 
  Trash2, 
  HeartHandshake, 
  FileText,
  Activity,
  CheckCircle2,
  X
} from 'lucide-react';
import EmergencyCardModal from '../../components/EmergencyCardModal';

export default function EmergencyProfile() {
  const { 
    patient, 
    records, 
    emergencyLogs, 
    logEmergencyAccess, 
    toggleEmergencyRecord 
  } = useHealth();

  const [showCardModal, setShowCardModal] = useState(false);
  const [simulatingERAccess, setSimulatingERAccess] = useState(false);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState(null);

  const currentPatient = patient || {
    id: 'PAT-IND-884210',
    name: 'Aarav Sharma',
    bloodGroup: 'O+',
    age: 42,
    gender: 'Male',
    criticalConditions: [],
    allergies: [],
    emergencyContacts: []
  };

  // Actively attached emergency records
  const activeEmergencyRecords = (records || []).filter(r => r.isEmergencyVisible);

  // Recommendations: records not yet attached or flagged high/moderate risk
  const unattachedRecords = (records || []).filter(r => !r.isEmergencyVisible);

  // Trigger simulated ER break-glass event
  const handleSimulateERAccess = () => {
    setSimulatingERAccess(true);
    setTimeout(() => {
      logEmergencyAccess({
        hospitalName: 'Apollo Hospital (Emergency Trauma Triage)',
        personnel: 'Dr. Vikram Malhotra (Casualty Medical Officer #CMO-14)',
        reason: 'Emergency Break-Glass: Trauma Protocol Consultation',
      });
      setSimulatingERAccess(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#e11d48', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
            <ShieldAlert size={16} /> Break-Glass Emergency Dossier
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
            Emergency Medical Profile
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Accessible 24/7 by any licensed emergency room or paramedic team when time is critical.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSimulateERAccess}
            className="btn btn-secondary"
            disabled={simulatingERAccess}
            style={{ fontSize: '0.825rem' }}
          >
            <Activity size={15} color="#e11d48" />
            <span>{simulatingERAccess ? 'Simulating...' : 'Simulate ER Break-Glass'}</span>
          </button>

          <button
            onClick={() => setShowCardModal(true)}
            className="btn btn-primary"
            style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' }}
          >
            <QrCode size={16} />
            <span>View Emergency QR Card</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Emergency Details & Attached Records */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Critical Identity & Vitals Card */}
          <div className="card" style={{ borderTop: '6px solid #e11d48' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <span className="badge badge-red" style={{ marginBottom: '8px' }}>
                  Emergency Identification
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                  {currentPatient.name}
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  OneRecord ID: {currentPatient.id} • Age: {currentPatient.age} ({currentPatient.gender})
                </div>
              </div>

              {/* Blood Group Display */}
              <div style={{
                background: '#e11d48',
                color: 'white',
                borderRadius: '12px',
                padding: '10px 18px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.35)'
              }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#ffe4e6' }}>
                  Blood Group
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1 }}>
                  {currentPatient.bloodGroup}
                </div>
              </div>
            </div>

            {/* Quick Grid: Contacts & Organ Donation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                  Primary Emergency Contact
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  {currentPatient.emergencyContacts?.[0]?.name || 'Priya Sharma (Spouse)'}
                </div>
                <a
                  href={`tel:${currentPatient.emergencyContacts?.[0]?.phone || '+91 98765 43211'}`}
                  style={{ fontSize: '0.825rem', color: '#0284c7', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}
                >
                  <PhoneCall size={13} /> {currentPatient.emergencyContacts?.[0]?.phone || '+91 98765 43211'}
                </a>
              </div>

              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                  Organ Donor Status
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: '#059669' }}>
                  <HeartHandshake size={18} />
                  <span>{currentPatient.organDonor ? 'Pledged Organ Donor' : 'Not Pledged'}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  Authorized in medical profile
                </div>
              </div>
            </div>

            {/* Critical Allergies Section */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9f1239', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <AlertTriangle size={15} color="#e11d48" />
                <span>Life-Threatening Allergies (Do Not Administer)</span>
              </div>
              {currentPatient.allergies?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentPatient.allergies.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        background: '#fff1f2',
                        border: '1px solid #fecdd3',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ color: '#9f1239', fontSize: '0.9rem' }}>{item.allergen}</strong>
                        {item.reaction && (
                          <span style={{ fontSize: '0.78rem', color: '#be123c', marginLeft: '8px' }}>
                            ({item.reaction})
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', background: '#e11d48', color: 'white', borderRadius: '4px' }}>
                        {item.severity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                  No known life-threatening drug allergies reported.
                </div>
              )}
            </div>

            {/* Chronic Medical Conditions & Implants */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                Critical Diagnoses, Chronic History & Implants
              </div>
              {currentPatient.criticalConditions?.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {currentPatient.criticalConditions.map((cond, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 12px',
                        background: '#f1f5f9',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      • {cond}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                  No chronic clinical implants or severe chronic conditions recorded.
                </div>
              )}
            </div>
          </div>

          {/* DEDICATED SECTION 1: ACTIVELY INCLUDED EMERGENCY RECORDS (Reflects live additions!) */}
          <div className="card" style={{ border: '2px solid #fecdd3' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#e11d48',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#9f1239' }}>
                    Active Emergency Medical Records ({activeEmergencyRecords.length})
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#be123c' }}>
                    These records are immediately visible to ER doctors when scanning your emergency profile.
                  </p>
                </div>
              </div>
              <span className="badge badge-red">
                Live on ER Profile
              </span>
            </div>

            {activeEmergencyRecords.length === 0 ? (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                background: '#fff1f2',
                borderRadius: '10px',
                border: '1px dashed #fecdd3',
                color: '#9f1239'
              }}>
                <FileText size={32} color="#e11d48" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>No specific medical records attached yet</div>
                <p style={{ fontSize: '0.78rem', color: '#be123c', marginTop: '4px' }}>
                  Select from the recommended records below to include critical prescriptions, ECGs, or allergies on this emergency profile.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeEmergencyRecords.map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: '1px solid #fecdd3',
                      background: '#fff1f2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${rec.risk === 'RED' ? 'badge-red' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                          {rec.risk} RISK
                        </span>
                        <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                          {rec.title}
                        </strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '3px' }}>
                        {rec.hospital?.split(',')[0]} • {rec.date} • {rec.doctor?.split(',')[0]}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9f1239', marginTop: '2px', fontWeight: 500 }}>
                        <em>{rec.riskReason || rec.diagnosis}</em>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedRecordDetail(rec)}
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => toggleEmergencyRecord(rec.id)}
                        style={{
                          background: 'white',
                          border: '1px solid #fca5a5',
                          color: '#e11d48',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Remove from Emergency Profile"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DEDICATED SECTION 2: AVAILABLE / RECOMMENDED RECORDS TO ADD */}
          <div className="card">
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#f0f9ff',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Plus size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                    Available Health Records ({unattachedRecords.length})
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Click "+ Add to ER Profile" to instantly attach any record to your emergency dossier.
                  </p>
                </div>
              </div>
            </div>

            {unattachedRecords.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                All available records are currently attached to your emergency profile.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {unattachedRecords.map((rec) => (
                  <div
                    key={rec.id}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${rec.risk === 'RED' ? 'badge-red' : rec.risk === 'AMBER' ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>
                          {rec.risk}
                        </span>
                        <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>
                          {rec.title}
                        </strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                        {rec.hospital?.split(',')[0]} • {rec.date}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        <em>{rec.riskReason || rec.diagnosis}</em>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleEmergencyRecord(rec.id)}
                      className="btn btn-sm btn-primary"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        background: '#0284c7',
                        flexShrink: 0
                      }}
                    >
                      <Plus size={14} />
                      <span>+ Add to ER Profile</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Emergency Access Audit History */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div className="card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#0284c7" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Emergency Access Audit Log
                </h3>
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>
                {emergencyLogs.length} Events
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '16px', lineHeight: 1.4 }}>
              Every break-glass access to this emergency profile is logged permanently with hospital IP, timestamp, and attending physician credentials.
            </p>

            {emergencyLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: '#94a3b8', fontSize: '0.8rem' }}>
                No emergency access events recorded for this profile yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {emergencyLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: '#f8fafc',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      {log.hospitalName}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#e11d48', fontWeight: 600, marginTop: '2px' }}>
                      {log.reason}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '4px' }}>
                      <strong>Clinician:</strong> {log.personnel}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                      <span>{log.accessedAt}</span>
                      <span>{log.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#fff1f2',
              borderRadius: '8px',
              border: '1px solid #fecdd3',
              fontSize: '0.72rem',
              color: '#9f1239',
              display: 'flex',
              gap: '8px'
            }}>
              <ShieldAlert size={16} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Break-Glass Verification:</strong> Automated SMS notifications are immediately dispatched to the primary emergency contact whenever this dossier is accessed.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Record Inspect Modal */}
      {selectedRecordDetail && (
        <div className="modal-overlay" onClick={() => setSelectedRecordDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <span className={`badge ${selectedRecordDetail.risk === 'RED' ? 'badge-red' : 'badge-amber'}`}>
                  {selectedRecordDetail.risk} RISK
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '4px' }}>
                  {selectedRecordDetail.title}
                </h3>
              </div>
              <button onClick={() => setSelectedRecordDetail(null)} className="btn btn-sm btn-secondary">
                <X size={16} />
              </button>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
              <div><strong>Hospital:</strong> {selectedRecordDetail.hospital}</div>
              <div><strong>Date:</strong> {selectedRecordDetail.date}</div>
              <div><strong>Doctor:</strong> {selectedRecordDetail.doctor}</div>
              <div><strong>Diagnosis:</strong> {selectedRecordDetail.diagnosis}</div>
              <div style={{ marginTop: '8px', color: '#9f1239' }}><strong>Clinical Assessment:</strong> {selectedRecordDetail.riskReason}</div>
            </div>
          </div>
        </div>
      )}

      {showCardModal && <EmergencyCardModal onClose={() => setShowCardModal(false)} />}
    </div>
  );
}
