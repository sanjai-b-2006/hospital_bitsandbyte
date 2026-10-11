import React, { useState, useEffect } from 'react';
import { useDoctor } from '../../context/DoctorContext';
import { API_BASE_URL } from '../../config';
import { 
  Ticket, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Pill, 
  Activity, 
  Clock, 
  Stethoscope, 
  Plus, 
  Search, 
  ShieldAlert, 
  ChevronRight,
  ExternalLink,
  Calendar,
  AlertCircle,
  BrainCircuit,
  RefreshCw
} from 'lucide-react';

export default function DoctorHome({ onNavigateToPatient }) {
  const { 
    doctor, 
    queue, 
    activeToken, 
    setActiveToken, 
    activePatientRecords, 
    updateTokenStatus,
    addConsultationRecord 
  } = useDoctor();

  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newRisk, setNewRisk] = useState('GREEN');
  const [submittingNote, setSubmittingNote] = useState(false);

  // ML Clinical Risk Score state
  const [risk, setRisk] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState('');

  const loadRiskScore = async (patientId) => {
    if (!patientId) {
      setRisk(null);
      return;
    }
    setRiskLoading(true);
    setRiskError('');
    try {
      const res = await fetch(`${API_BASE_URL}/ml/risk-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      });
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(`Server answered with non-JSON (HTTP ${res.status}).`);
      }
      if (json.success) {
        setRisk(json);
      } else {
        setRiskError(json.error || 'Risk score failed.');
      }
    } catch (err) {
      setRiskError(err.message);
    } finally {
      setRiskLoading(false);
    }
  };

  // Recompute the score whenever the active patient changes
  useEffect(() => {
    loadRiskScore(activeToken?.patientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeToken?.patientId]);

  const waitingTokens = queue.filter(t => t.status === 'Waiting');
  const inProgressTokens = queue.filter(t => t.status === 'In Consultation');

  const handleStartConsultation = async (token) => {
    setActiveToken(token);
    await updateTokenStatus(token.id, 'In Consultation');
  };

  const handleCompleteConsultation = async (token) => {
    await updateTokenStatus(token.id, 'Completed');
  };

  const handleSaveConsultationNote = async (e) => {
    e.preventDefault();
    if (!activeToken?.patientId || !newDiagnosis) return;

    setSubmittingNote(true);
    const recData = {
      patientId: activeToken.patientId,
      title: `${doctor.specialization.split('&')[0].trim()} Clinical Consultation`,
      type: 'Prescription',
      doctor: doctor.name,
      hospital: doctor.hospitalName || 'Hospital Network',
      department: activeToken.department || 'Cardiology',
      risk: newRisk,
      riskReason: newRisk === 'RED' ? 'Critical condition / high alert medication modification' : (newRisk === 'AMBER' ? 'Moderate monitoring needed' : 'Normal follow-up'),
      diagnosis: newDiagnosis,
      medications: newMedName ? [{ name: newMedName, dosage: newMedDosage, frequency: 'As advised', duration: '30 Days' }] : [],
      notes: newNotes || 'Patient examined in clinical consultation.',
    };

    const res = await addConsultationRecord(recData);
    setSubmittingNote(false);
    if (res.success) {
      setShowAddNoteModal(false);
      setNewDiagnosis('');
      setNewMedName('');
      setNewMedDosage('');
      setNewNotes('');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'flex-start' }}>
      
      {/* ======================================================== */}
      {/* LEFT SIDE: QUEUE OF TOKEN NUMBERS */}
      {/* ======================================================== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#ccfbf1',
                color: '#0f766e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Ticket size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Patient Queue
              </h3>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', background: '#f1f5f9', borderRadius: '12px', color: '#475569' }}>
              {queue.length} Active
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '14px' }}>
            Assigned to <strong>{doctor.name}</strong> • Department: <strong>{doctor.specialization.split('&')[0].trim()}</strong>
          </div>

          {/* Tokens List */}
          {queue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
              <Clock size={32} style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>No patients waiting</div>
              <div style={{ fontSize: '0.75rem' }}>Hospital reception tokens will appear here automatically.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
              {queue.map((t) => {
                const isSelected = activeToken?.id === t.id;
                const isRiskRed = t.riskLevel === 'RED';
                const isRiskAmber = t.riskLevel === 'AMBER';

                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveToken(t)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #0d9488' : '1px solid var(--border-color)',
                      background: isSelected ? '#f0fdfa' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        color: isSelected ? '#0f766e' : '#0f172a',
                        background: isSelected ? '#ccfbf1' : '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {t.tokenNumber}
                      </span>

                      {/* Risk Badge on Token Card */}
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: isRiskRed ? '#fee2e2' : (isRiskAmber ? '#fef3c7' : '#dcfce7'),
                        color: isRiskRed ? '#b91c1c' : (isRiskAmber ? '#b45309' : '#15803d'),
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: isRiskRed ? '#dc2626' : (isRiskAmber ? '#d97706' : '#16a34a')
                        }} />
                        {t.riskLevel || 'GREEN'}
                      </span>
                    </div>

                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                        {t.patientName}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Phone: {t.patientPhone}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: t.status === 'In Consultation' ? '#0d9488' : (t.status === 'Completed' ? '#16a34a' : '#64748b')
                      }}>
                        {t.status}
                      </span>

                      {t.status === 'Waiting' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStartConsultation(t); }}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#0d9488',
                            color: 'white',
                            border: 'none',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Call Patient
                        </button>
                      )}
                      {t.status === 'In Consultation' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCompleteConsultation(t); }}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#16a34a',
                            color: 'white',
                            border: 'none',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT SIDE (MAIN PAGE): CURRENT TOKEN PATIENT'S RECORD */}
      {/* ======================================================== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {!activeToken ? (
          <div className="card" style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b' }}>
            <Stethoscope size={48} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>No Patient Selected</h2>
            <p style={{ fontSize: '0.85rem' }}>Select a patient token from the left queue to begin consultation.</p>
          </div>
        ) : (
          <>
            {/* Top Patient Header Bar */}
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      background: '#0d9488',
                      color: 'white',
                      padding: '3px 10px',
                      borderRadius: '8px'
                    }}>
                      Token {activeToken.tokenNumber}
                    </span>

                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)', margin: 0 }}>
                      {activeToken.patientName}
                    </h2>

                    <span style={{
                      fontSize: '0.75rem',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontWeight: 700,
                      background: activeToken.status === 'In Consultation' ? '#ccfbf1' : '#f1f5f9',
                      color: activeToken.status === 'In Consultation' ? '#0f766e' : '#475569'
                    }}>
                      ● {activeToken.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#64748b', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span>Phone: <strong>{activeToken.patientPhone}</strong></span>
                    <span>Patient ID: <code style={{ fontFamily: 'var(--font-mono)' }}>{activeToken.patientId}</code></span>
                    <span>Department: <strong>{activeToken.department}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setShowAddNoteModal(true)}
                    className="btn btn-primary btn-sm"
                    style={{ background: '#0d9488', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={15} />
                    <span>+ Add Prescription / Clinical Note</span>
                  </button>

                  <button
                    onClick={() => onNavigateToPatient && onNavigateToPatient(activeToken.patientId)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ExternalLink size={14} />
                    <span>Detailed Patient Timeline & Calendar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CRITICAL RISK COLOR INDICATOR BANNER */}
            {/* Red means doctor should check past, Green means no need of checking */}
            <div style={{
              borderRadius: '16px',
              padding: '18px 24px',
              border: activeToken.riskLevel === 'RED' 
                ? '2px solid #ef4444' 
                : (activeToken.riskLevel === 'AMBER' ? '2px solid #f59e0b' : '2px solid #22c55e'),
              background: activeToken.riskLevel === 'RED'
                ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                : (activeToken.riskLevel === 'AMBER' ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: activeToken.riskLevel === 'RED' ? '#dc2626' : (activeToken.riskLevel === 'AMBER' ? '#d97706' : '#16a34a'),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {activeToken.riskLevel === 'RED' ? <ShieldAlert size={24} /> : (activeToken.riskLevel === 'AMBER' ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: activeToken.riskLevel === 'RED' ? '#991b1b' : (activeToken.riskLevel === 'AMBER' ? '#92400e' : '#166534')
                    }}>
                      Triage Risk Level: {activeToken.riskLevel}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    marginTop: '2px',
                    color: activeToken.riskLevel === 'RED' ? '#b91c1c' : (activeToken.riskLevel === 'AMBER' ? '#b45309' : '#15803d')
                  }}>
                    {activeToken.riskLevel === 'RED' && (
                      '🔴 HIGH CLINICAL RISK: Doctor MUST check past medical history & drug interactions before prescribing!'
                    )}
                    {activeToken.riskLevel === 'AMBER' && (
                      '🟡 MODERATE RISK: Doctor advised to review active prescriptions and recent lab tests.'
                    )}
                    {activeToken.riskLevel === 'GREEN' && (
                      '🟢 LOW CLINICAL RISK: Standard consultation. No critical past drug warnings or adverse history flagged.'
                    )}
                  </div>
                </div>
              </div>

              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.7)',
                color: activeToken.riskLevel === 'RED' ? '#991b1b' : (activeToken.riskLevel === 'AMBER' ? '#92400e' : '#166534'),
                textAlign: 'right',
                whiteSpace: 'nowrap'
              }}>
                {activeToken.riskLevel === 'RED' ? 'Detailed Review Required' : (activeToken.riskLevel === 'AMBER' ? 'Review Recommended' : 'Routine Check')}
              </div>
            </div>

            {/* ML Clinical Risk Score */}
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BrainCircuit size={18} color="#4338ca" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    ML Clinical Risk Score
                  </h3>
                  <span style={{ fontSize: '0.68rem', padding: '2px 8px', background: '#eef2ff', color: '#4338ca', borderRadius: '6px', fontWeight: 700 }}>
                    AI TRIAGE
                  </span>
                </div>
                <button
                  onClick={() => loadRiskScore(activeToken?.patientId)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <RefreshCw size={13} /> Recompute
                </button>
              </div>

              {riskLoading && !risk && (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b', fontSize: '0.85rem' }}>
                  <BrainCircuit size={26} className="spin" style={{ margin: '0 auto 10px', color: '#4f46e5' }} />
                  Computing risk from chart, allergies & labs…
                </div>
              )}

              {riskError && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', fontSize: '0.8rem', color: '#b91c1c' }}>
                  ⚠️ {riskError}
                </div>
              )}

              {risk && !riskLoading && (
                <div style={{ display: 'flex', gap: '22px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center', flex: '0 0 auto' }}>
                    <div style={{
                      width: '110px', height: '110px', borderRadius: '50%',
                      background: `conic-gradient(${risk.levelColor} ${risk.score * 3.6}deg, #e2e8f0 0deg)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
                    }}>
                      <div style={{
                        width: '86px', height: '86px', borderRadius: '50%', background: 'white',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: 900, color: risk.levelColor }}>{risk.score}</span>
                        <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>/ 100</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800,
                        background: risk.levelColor, color: 'white', letterSpacing: '0.03em'
                      }}>
                        {risk.level} RISK
                      </span>
                    </div>
                  </div>

                  <div style={{ flex: '1 1 380px', minWidth: '300px' }}>
                    <div style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 600, marginBottom: '12px' }}>
                      {risk.summary}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { key: 'age', label: 'Age', cap: 15, note: risk.factors.age?.note },
                        { key: 'allergies', label: 'Allergies', cap: 30 },
                        { key: 'conditions', label: 'Critical conditions', cap: 24 },
                        { key: 'records', label: 'Record risk (RED/AMBER)', cap: 56 },
                        { key: 'labs', label: 'Abnormal lab values', cap: 15 },
                        { key: 'medications', label: 'Risky medications', cap: 16 },
                      ].map((f) => {
                        const pts = risk.factors[f.key]?.points || 0;
                        const pct = Math.min(100, Math.round((pts / f.cap) * 100));
                        return (
                          <div key={f.key}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                              <span>{f.label}</span>
                              <span>{pts} / {f.cap}{f.note ? ` · ${f.note}` : ''}</span>
                            </div>
                            <div style={{ height: '6px', borderRadius: '4px', background: '#f1f5f9', overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: '4px', background: risk.levelColor, width: `${pct}%`, transition: 'width 0.4s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#94a3b8' }}>
                      Weighted score from age, allergies, critical conditions, record risk levels, abnormal labs and risky medications.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Longitudinal Medical Records of Active Patient */}
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="#0d9488" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Longitudinal Medical Records ({activePatientRecords.length})
                  </h3>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Synced from OneRecord Vault
                </span>
              </div>

              {activePatientRecords.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                  <FileText size={32} style={{ margin: '0 auto 8px' }} />
                  <div>No past medical records uploaded for this patient yet.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {activePatientRecords.map((rec) => {
                    const isRed = rec.risk === 'RED';
                    const isAmber = rec.risk === 'AMBER';

                    return (
                      <div
                        key={rec.id}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          border: isRed ? '1px solid #fca5a5' : (isAmber ? '1px solid #fde68a' : '1px solid #e2e8f0'),
                          background: isRed ? '#fff5f5' : (isAmber ? '#fffdf0' : '#ffffff'),
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                {rec.title}
                              </h4>
                              <span style={{
                                fontSize: '0.68rem',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                background: isRed ? '#fee2e2' : (isAmber ? '#fef3c7' : '#dcfce7'),
                                color: isRed ? '#b91c1c' : (isAmber ? '#b45309' : '#15803d')
                              }}>
                                {rec.risk} RISK
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                              Date: <strong>{rec.date}</strong> • Doctor: <strong>{rec.doctor}</strong> • Hospital: <strong>{rec.hospital}</strong>
                            </div>
                          </div>

                          <span style={{ fontSize: '0.72rem', padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px', fontWeight: 600 }}>
                            {rec.type}
                          </span>
                        </div>

                        {rec.diagnosis && (
                          <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '10px' }}>
                            <strong>Diagnosis: </strong> {rec.diagnosis}
                          </div>
                        )}

                        {rec.riskReason && (
                          <div style={{
                            fontSize: '0.8rem',
                            marginTop: '8px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: isRed ? '#fee2e2' : '#fef3c7',
                            color: isRed ? '#991b1b' : '#92400e',
                            fontWeight: 600
                          }}>
                            <strong>⚠️ Risk Warning: </strong> {rec.riskReason}
                          </div>
                        )}

                        {/* Medications */}
                        {rec.medications && rec.medications.length > 0 && (
                          <div style={{ marginTop: '10px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                              Prescribed Medications:
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {rec.medications.map((m, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: '0.76rem',
                                    padding: '3px 8px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Pill size={12} color="#0d9488" />
                                  <strong>{m.name}</strong> ({m.dosage}) - {m.frequency}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {rec.notes && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px', fontStyle: 'italic' }}>
                            "{rec.notes}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Consultation Note Modal */}
      {showAddNoteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 100
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            maxWidth: '540px',
            width: '100%',
            padding: '24px 28px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
              Add Clinical Prescription / Note
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
              Issuing to patient: <strong>{activeToken?.patientName}</strong> (Token {activeToken?.tokenNumber})
            </p>

            <form onSubmit={handleSaveConsultationNote}>
              <div className="form-group">
                <label className="form-label">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hypertension review, Acute bronchitis"
                  className="form-input"
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Prescribed Medicine (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Telmisartan 40mg"
                    className="form-input"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Dosage & Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Tab Daily OD"
                    className="form-input"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Risk Level</label>
                <select
                  className="form-select"
                  value={newRisk}
                  onChange={(e) => setNewRisk(e.target.value)}
                >
                  <option value="GREEN">🟢 GREEN - Low Risk / Routine Follow-up</option>
                  <option value="AMBER">🟡 AMBER - Moderate Risk / Lab Monitoring Needed</option>
                  <option value="RED">🔴 RED - High Risk / Critical Attention</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Doctor's Clinical Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enter clinical examination notes, diet advice, follow-up schedule..."
                  className="form-textarea"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="btn btn-primary btn-sm"
                  style={{ background: '#0d9488' }}
                >
                  {submittingNote ? 'Saving to Vault...' : 'Save & Issue to Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
