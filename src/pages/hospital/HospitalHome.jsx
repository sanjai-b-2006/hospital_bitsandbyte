import React, { useState, useEffect } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  Ticket, 
  Users, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  Search, 
  Building2,
  RefreshCw,
  Phone,
  ArrowRight
} from 'lucide-react';

export default function HospitalHome() {
  const { 
    hospital, 
    queue, 
    fetchQueue, 
    addPatientToQueue, 
    updateTokenStatus, 
    doctors 
  } = useHospital();

  const [showAddModal, setShowAddModal] = useState(false);
  const [patientPhone, setPatientPhone] = useState('9876543210');
  const [doctorId, setDoctorId] = useState('');
  const [department, setDepartment] = useState('Cardiology');

  useEffect(() => {
    if (doctors.length > 0 && !doctorId) {
      setDoctorId(doctors[0].id);
    }
  }, [doctors, doctorId]);
  const [loading, setLoading] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [error, setError] = useState('');

  const waitingCount = queue.filter(t => t.status === 'Waiting').length;
  const inConsultCount = queue.filter(t => t.status === 'In Consultation').length;
  const completedCount = queue.filter(t => t.status === 'Completed').length;

  const handleIssueToken = async (e) => {
    e.preventDefault();
    if (!patientPhone) {
      setError('Please enter patient mobile number');
      return;
    }

    setLoading(true);
    setError('');

    const res = await addPatientToQueue({
      patientPhone,
      doctorId,
      department,
    });

    setLoading(false);
    if (res.success) {
      setGeneratedToken(res.token);
      setPatientPhone('');
    } else {
      setError(res.message || 'Failed to generate token');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner & Queue Stats */}
      <div style={{
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        borderRadius: '20px',
        padding: '24px 28px',
        color: 'white',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Hospital Reception & Queue Management
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginTop: '2px' }}>
            {hospital.name}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#d1fae5', marginTop: '2px' }}>
            Hospital UID: <code style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{hospital.uid}</code> • Live Patient Queue
          </p>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '14px', marginTop: '16px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#d1fae5', textTransform: 'uppercase', fontWeight: 600 }}>Waiting: </span>
              <strong style={{ fontSize: '1rem', color: '#ffffff', marginLeft: '4px' }}>{waitingCount}</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#d1fae5', textTransform: 'uppercase', fontWeight: 600 }}>In Consultation: </span>
              <strong style={{ fontSize: '1rem', color: '#fef08a', marginLeft: '4px' }}>{inConsultCount}</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#d1fae5', textTransform: 'uppercase', fontWeight: 600 }}>Completed Today: </span>
              <strong style={{ fontSize: '1rem', color: '#a7f3d0', marginLeft: '4px' }}>{completedCount}</strong>
            </div>
          </div>
        </div>

        <button
          onClick={() => { setShowAddModal(true); setGeneratedToken(null); setError(''); }}
          className="btn"
          style={{
            background: '#ffffff',
            color: '#065f46',
            fontWeight: 700,
            padding: '10px 18px',
            fontSize: '0.875rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <Plus size={16} color="#059669" />
          <span>+ Check-in Patient & Issue Token</span>
        </button>
      </div>

      {/* Live Queue Table */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              Live Patient Consultation Queue ({queue.length})
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Auto-updating real-time sequence. Tokens tie consultations to patient OneRecord profiles.
            </p>
          </div>

          <button
            onClick={fetchQueue}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {queue.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
            <Ticket size={40} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>No patients in queue</h3>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Click "+ Check-in Patient & Issue Token" above to register an incoming patient.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 14px' }}>Token #</th>
                  <th style={{ padding: '10px 14px' }}>Patient Name</th>
                  <th style={{ padding: '10px 14px' }}>Mobile Number</th>
                  <th style={{ padding: '10px 14px' }}>Department</th>
                  <th style={{ padding: '10px 14px' }}>Assigned Doctor</th>
                  <th style={{ padding: '10px 14px' }}>Risk Flag</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '4px 10px',
                        background: '#f0fdf4',
                        color: '#166534',
                        border: '1px solid #bbf7d0',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {t.tokenNumber}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                      {t.patientName}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>
                      +91 {t.patientPhone}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>
                      {t.department || 'General'}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#0f172a', fontWeight: 600 }}>
                      {t.doctorName}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge ${t.riskLevel === 'RED' ? 'badge-red' : t.riskLevel === 'AMBER' ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>
                        {t.riskLevel === 'RED' ? '🔴 High Risk' : t.riskLevel === 'AMBER' ? '🟡 Moderate' : '🟢 Routine'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: t.status === 'In Consultation' ? '#fef9c3' : t.status === 'Completed' ? '#dcfce7' : '#f1f5f9',
                        color: t.status === 'In Consultation' ? '#854d0e' : t.status === 'Completed' ? '#166534' : '#475569'
                      }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <select
                        value={t.status}
                        onChange={(e) => updateTokenStatus(t.id, e.target.value)}
                        className="form-select"
                        style={{ width: 'auto', padding: '4px 8px', fontSize: '0.78rem', display: 'inline-block' }}
                      >
                        <option value="Waiting">Waiting</option>
                        <option value="In Consultation">In Consultation</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Check-In / Generate Token Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={20} color="#059669" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Check-In Walk-In Patient</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="btn btn-sm btn-secondary">✕</button>
            </div>

            <div style={{ padding: '24px' }}>
              {!generatedToken ? (
                <form onSubmit={handleIssueToken}>
                  {error && (
                    <div style={{ padding: '8px 12px', background: '#fff1f2', color: '#be123c', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '14px' }}>
                      {error}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Patient Registered Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile (e.g. 9876543210)"
                      className="form-input"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                    />
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                      Try <strong>9876543210</strong> (Aarav Sharma) to see automatic clinical risk detection.
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Specialist Department</label>
                    <select
                      className="form-select"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Endocrinology">Endocrinology</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Emergency Care">Emergency Care</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assign Available Doctor</label>
                    <select
                      className="form-select"
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                    >
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.specialization})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                      style={{ background: '#059669' }}
                    >
                      <span>{loading ? 'Issuing...' : 'Generate Patient Token'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Generated Token Display */
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: '#dcfce7',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px'
                  }}>
                    <CheckCircle2 size={30} />
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Token Generated!</h3>

                  {/* Token Card */}
                  <div style={{
                    margin: '18px auto',
                    padding: '18px 24px',
                    background: '#f0fdf4',
                    border: '2px dashed #059669',
                    borderRadius: '12px',
                    maxWidth: '300px'
                  }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#166534', fontWeight: 700 }}>
                      Consultation Token Number
                    </div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-mono)' }}>
                      {generatedToken.tokenNumber}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#0f172a', fontWeight: 700, marginTop: '4px' }}>
                      {generatedToken.patientName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {generatedToken.department} • {generatedToken.doctorName}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <span className={`badge ${generatedToken.riskLevel === 'RED' ? 'badge-red' : generatedToken.riskLevel === 'AMBER' ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>
                        Risk: {generatedToken.riskLevel}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => { setShowAddModal(false); setGeneratedToken(null); }}
                    className="btn btn-primary"
                    style={{ background: '#059669', width: '100%' }}
                  >
                    Done & Add to Queue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
