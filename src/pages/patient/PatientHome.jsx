import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Pill, 
  Clock, 
  Calendar, 
  Building2, 
  Stethoscope, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Activity,
  HeartPulse,
  Baby,
  Users,
  Plus
} from 'lucide-react';
import AddFamilyMemberModal from '../../components/AddFamilyMemberModal';

export default function PatientHome({ onNavigate }) {
  const { 
    patient, 
    records, 
    medications, 
    dependents, 
    isViewingDependent, 
    currentAccount, 
    switchActiveProfile 
  } = useHealth();

  const [selectedRecordDetail, setSelectedRecordDetail] = useState(null);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);

  // Group records into risk categories
  const currentPatient = patient || currentAccount || {
    id: 'PAT-IND-884210',
    name: 'Aarav Sharma',
    bloodGroup: 'O+',
    age: 42,
    gender: 'Male',
    criticalConditions: [],
    allergies: []
  };

  const highRiskRecords = (records || []).filter(r => r.risk === 'RED');
  const moderateRiskRecords = (records || []).filter(r => r.risk === 'AMBER');
  const lowRiskRecords = (records || []).filter(r => r.risk === 'GREEN');

  // Recent history items (sorted by date descending)
  const recentHistory = [...(records || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Overview Banner (Clean, without verbose marketing text or duplicate CTA buttons) */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '20px',
        padding: '24px 28px',
        color: 'white',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
              {isViewingDependent ? `${currentPatient.name} (${currentPatient.relation || 'Dependent'})` : currentPatient.name}
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              OneRecord UID: <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{currentPatient.id}</span>
              {isViewingDependent && ` • Guardian: ${currentAccount?.name || 'Primary'}`}
            </p>

            {/* Quick Stats Pill Row */}
            <div style={{ display: 'flex', gap: '14px', marginTop: '16px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Blood Group: </span>
                <strong style={{ fontSize: '0.95rem', color: '#f43f5e', marginLeft: '4px' }}>{currentPatient.bloodGroup}</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Age & Gender: </span>
                <strong style={{ fontSize: '0.95rem', color: '#ffffff', marginLeft: '4px' }}>{currentPatient.age} Yrs ({currentPatient.gender})</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total Records: </span>
                <strong style={{ fontSize: '0.95rem', color: '#38bdf8', marginLeft: '4px' }}>{records.length}</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Active Medicines: </span>
                <strong style={{ fontSize: '0.95rem', color: '#34d399', marginLeft: '4px' }}>{medications.length}</strong>
              </div>
            </div>
          </div>

          {/* Family Dependents Quick View / Add button */}
          {!isViewingDependent && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setShowAddFamilyModal(true)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Users size={15} />
                <span>+ Add Family Member</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Family Dependents Bar if parent has registered family members */}
      {dependents.length > 0 && !isViewingDependent && (
        <div style={{
          padding: '12px 18px',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
            <Baby size={18} color="#16a34a" />
            <span>Family Members Under Your Care ({dependents.length}):</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {dependents.map((dep) => (
              <button
                key={dep.id}
                onClick={() => switchActiveProfile(dep.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{dep.name} ({dep.relation}, {dep.age}y)</span>
                <ArrowRight size={12} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 1: Health Alerts Categorized by Risk-Based Colors */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="#e11d48" />
              <span>Clinical Health Alerts</span>
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge badge-red">{highRiskRecords.length} High Risk</span>
            <span className="badge badge-amber">{moderateRiskRecords.length} Moderate</span>
            <span className="badge badge-green">{lowRiskRecords.length} Routine</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {/* RED ALERT CARD */}
          <div style={{
            background: 'var(--risk-red-bg)',
            border: '1px solid var(--risk-red-border)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-red">
                  🔴 High Clinical Risk
                </span>
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#9f1239', marginBottom: '4px' }}>
                {highRiskRecords.length > 0 ? highRiskRecords[0].title : 'No Critical Drug Allergies Reported'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#be123c', lineHeight: 1.4 }}>
                {highRiskRecords.length > 0 
                  ? highRiskRecords[0].riskReason 
                  : (currentPatient.allergies?.length > 0 
                      ? `Documented allergy: ${currentPatient.allergies.map(a => a.allergen).join(', ')}` 
                      : 'No acute life-threatening contraindications on file.')}
              </p>
            </div>
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #fecdd3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#9f1239', fontWeight: 600 }}>
                High Attention Flag
              </span>
              <button
                onClick={() => onNavigate('records')}
                style={{ background: 'transparent', border: 'none', color: '#e11d48', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Inspect Records <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* AMBER ALERT CARD */}
          <div style={{
            background: 'var(--risk-amber-bg)',
            border: '1px solid var(--risk-amber-border)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-amber">
                  🟡 Moderate Risk / Monitoring
                </span>
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>
                {moderateRiskRecords.length > 0 ? moderateRiskRecords[0].title : 'Chronic Care Maintenance'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#b45309', lineHeight: 1.4 }}>
                {moderateRiskRecords.length > 0 
                  ? moderateRiskRecords[0].riskReason 
                  : (currentPatient.criticalConditions?.length > 0 
                      ? currentPatient.criticalConditions.join(' • ') 
                      : 'Routine monitoring parameters are within standard thresholds.')}
              </p>
            </div>
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 600 }}>
                Follow-up required
              </span>
              <button
                onClick={() => onNavigate('records')}
                style={{ background: 'transparent', border: 'none', color: '#d97706', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                View Labs <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* GREEN ALERT CARD */}
          <div style={{
            background: 'var(--risk-green-bg)',
            border: '1px solid var(--risk-green-border)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge badge-green">
                  🟢 Routine / Stable
                </span>
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#065f46', marginBottom: '4px' }}>
                {lowRiskRecords.length > 0 ? lowRiskRecords[0].title : 'Routine Checkups Normal'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#047857', lineHeight: 1.4 }}>
                {lowRiskRecords.length > 0 
                  ? lowRiskRecords[0].riskReason 
                  : 'Vital signs and routine wellness consultations clear.'}
              </p>
            </div>
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#065f46', fontWeight: 600 }}>
                Clear Status
              </span>
              <button
                onClick={() => onNavigate('records')}
                style={{ background: 'transparent', border: 'none', color: '#059669', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Timeline <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: Current Medications & Recent History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* CURRENT MEDICATIONS */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Pill size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Current Medications
                </h3>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px' }}>
              {medications.length} Active
            </span>
          </div>

          {medications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b', fontSize: '0.85rem' }}>
              No active medications recorded for this profile.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {medications.map((med) => (
                <div
                  key={med.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                        {med.name}
                      </h4>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: med.riskLevel === 'RED' ? '#fee2e2' : med.riskLevel === 'AMBER' ? '#fef3c7' : '#dcfce7',
                        color: med.riskLevel === 'RED' ? '#991b1b' : med.riskLevel === 'AMBER' ? '#92400e' : '#166534',
                      }}>
                        {med.dosage}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                      <strong>Schedule:</strong> {med.frequency}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      <strong>Purpose:</strong> {med.purpose} • <em>{med.prescribedBy}</em>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 600, display: 'block' }}>
                      Active
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                      Since {med.startDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT HISTORY: Hospital Visits, Lab Reports, Pharmacy Bills */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
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
                <Clock size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Recent History
                </h3>
              </div>
            </div>
            <button
              onClick={() => onNavigate('records')}
              style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
            >
              View All ({records.length})
            </button>
          </div>

          {recentHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b', fontSize: '0.85rem' }}>
              No health records recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentHistory.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecordDetail(rec)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '6px',
                      height: '34px',
                      borderRadius: '3px',
                      background: rec.risk === 'RED' ? 'var(--risk-red)' : rec.risk === 'AMBER' ? 'var(--risk-amber)' : 'var(--risk-green)'
                    }} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        {rec.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {rec.hospital?.split(',')[0]} • {rec.doctor?.split(',')[0]}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${rec.type === 'Prescription' ? 'badge-primary' : rec.type === 'Lab Report' ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>
                      {rec.type}
                    </span>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                      {rec.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Record Inspection Modal if clicked */}
      {selectedRecordDetail && (
        <div className="modal-overlay" onClick={() => setSelectedRecordDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className={`badge ${selectedRecordDetail.risk === 'RED' ? 'badge-red' : selectedRecordDetail.risk === 'AMBER' ? 'badge-amber' : 'badge-green'}`}>
                  {selectedRecordDetail.risk} RISK
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '6px' }}>
                  {selectedRecordDetail.title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {selectedRecordDetail.hospital} • {selectedRecordDetail.date}
                </div>
              </div>
              <button onClick={() => setSelectedRecordDetail(null)} className="btn btn-sm btn-secondary">
                Close
              </button>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem' }}>
              <strong>Doctor:</strong> {selectedRecordDetail.doctor} <br />
              <strong>Diagnosis:</strong> {selectedRecordDetail.diagnosis} <br />
              <strong>Assessment:</strong> {selectedRecordDetail.riskReason}
            </div>

            {selectedRecordDetail.medications?.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Prescribed Medicines
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedRecordDetail.medications.map((m, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>{m.name}</strong> ({m.dosage})</span>
                      <span style={{ color: '#475569' }}>{m.frequency} • {m.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Family Member Modal */}
      {showAddFamilyModal && (
        <AddFamilyMemberModal onClose={() => setShowAddFamilyModal(false)} />
      )}
    </div>
  );
}
