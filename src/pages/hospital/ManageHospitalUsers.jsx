import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  Users, 
  Plus, 
  Search, 
  FileText, 
  CheckCircle2, 
  Phone, 
  ShieldCheck, 
  KeyRound,
  X,
  Stethoscope,
  Calendar,
  Eye
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function ManageHospitalUsers() {
  const { 
    hospital, 
    linkedPatients, 
    linkPatientWithOtp 
  } = useHospital();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Selected patient to inspect records
  const [selectedPatientRecords, setSelectedPatientRecords] = useState(null);
  const [patientRecordList, setPatientRecordList] = useState([]);

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtp('123456'); // Pre-fill for instant test
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await linkPatientWithOtp(phone, otp);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`Patient linked successfully to ${hospital.name}!`);
      setTimeout(() => {
        setShowAddModal(false);
        setSuccessMsg('');
        setOtpSent(false);
      }, 1200);
    } else {
      setError(res.message || 'Verification failed');
    }
  };

  const handleInspectRecords = async (patient) => {
    try {
      const res = await fetch(`${API_BASE_URL}/records?patientId=${patient.id}`);
      if (res.ok) {
        const recs = await res.json();
        setPatientRecordList(recs);
        setSelectedPatientRecords(patient);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPatients = linkedPatients.filter(p => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.phone?.includes(q) || p.id?.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
            Hospital Patient Directory
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Register incoming patients to this hospital's network via mobile OTP authentication.
          </p>
        </div>

        <button
          onClick={() => { setShowAddModal(true); setError(''); setSuccessMsg(''); setOtpSent(false); }}
          className="btn btn-primary"
          style={{ background: '#059669', padding: '10px 18px' }}
        >
          <Plus size={16} />
          <span>+ Link Patient via Mobile OTP</span>
        </button>
      </div>

      {/* Search & Directory Table */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by patient name, phone, or UID..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Total Linked Patients: <strong>{linkedPatients.length}</strong>
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <Users size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>No patients found</h3>
            <p style={{ fontSize: '0.8rem' }}>Click "+ Link Patient via Mobile OTP" to add patient accounts to this hospital.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 14px' }}>Patient ID</th>
                  <th style={{ padding: '10px 14px' }}>Name</th>
                  <th style={{ padding: '10px 14px' }}>Mobile Number</th>
                  <th style={{ padding: '10px 14px' }}>Blood Group</th>
                  <th style={{ padding: '10px 14px' }}>Age & Gender</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0284c7' }}>
                      {p.id}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                      {p.name}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>
                      +91 {p.phone}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ color: '#e11d48', fontWeight: 800 }}>{p.bloodGroup}</span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>
                      {p.age} Yrs ({p.gender})
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleInspectRecords(p)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                      >
                        <Eye size={13} color="#0284c7" />
                        <span>View Records</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Link Patient OTP Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} color="#059669" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Link Patient via Mobile OTP</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="btn btn-sm btn-secondary">✕</button>
            </div>

            <div style={{ padding: '24px' }}>
              {error && (
                <div style={{ padding: '8px 12px', background: '#fff1f2', color: '#be123c', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '14px' }}>
                  {error}
                </div>
              )}
              {successMsg && (
                <div style={{ padding: '8px 12px', background: '#ecfdf5', color: '#065f46', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '14px' }}>
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleLinkSubmit}>
                <div className="form-group">
                  <label className="form-label">Patient Registered Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="btn btn-secondary"
                    style={{ width: '100%', marginBottom: '16px' }}
                  >
                    Send 6-Digit Consent OTP to Patient Phone
                  </button>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Enter 6-Digit OTP Provided by Patient *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      className="form-input"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      style={{ textAlign: 'center', letterSpacing: '0.25em', fontFamily: 'var(--font-mono)', fontSize: '1.2rem' }}
                    />
                    <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '4px' }}>
                      Demo Mode: Auto-filled as <strong>123456</strong>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !otpSent}
                    className="btn btn-primary"
                    style={{ background: '#059669' }}
                  >
                    <span>{loading ? 'Verifying...' : 'Verify OTP & Link Account'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Records Modal */}
      {selectedPatientRecords && (
        <div className="modal-overlay" onClick={() => setSelectedPatientRecords(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {selectedPatientRecords.name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  OneRecord UID: {selectedPatientRecords.id} • Blood: <strong style={{ color: '#e11d48' }}>{selectedPatientRecords.bloodGroup}</strong> • Age: {selectedPatientRecords.age}
                </div>
              </div>
              <button onClick={() => setSelectedPatientRecords(null)} className="btn btn-sm btn-secondary">
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
              Verified Clinical Records ({patientRecordList.length}):
            </div>

            {patientRecordList.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                No past records uploaded by this patient yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                {patientRecordList.map((rec) => (
                  <div key={rec.id} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className={`badge ${rec.risk === 'RED' ? 'badge-red' : rec.risk === 'AMBER' ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>
                        {rec.risk} RISK
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{rec.date}</span>
                    </div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '4px' }}>{rec.title}</h4>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {rec.hospital} • {rec.doctor}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#0f172a', marginTop: '4px' }}>
                      <strong>Diagnosis:</strong> {rec.diagnosis}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
