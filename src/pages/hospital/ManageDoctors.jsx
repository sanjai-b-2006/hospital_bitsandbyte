import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  Stethoscope, 
  Plus, 
  Search, 
  CheckCircle2, 
  ShieldOff, 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  Phone,
  UserPlus
} from 'lucide-react';

export default function ManageDoctors() {
  const { 
    hospital, 
    doctors, 
    provisionDoctor, 
    updateDoctorStatus 
  } = useHospital();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Doctor Form
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('Cardiology & Interventional Cardiology');
  const [registrationNo, setRegistrationNo] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('doctor123');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    if (!name || !specialization) {
      setError('Doctor Name and Specialization are required');
      return;
    }

    setLoading(true);
    setError('');

    const res = await provisionDoctor({
      name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
      specialization,
      registrationNo,
      email,
      phone,
      password,
    });

    setLoading(false);
    if (res.success) {
      setShowAddModal(false);
      setName('');
      setRegistrationNo('');
      setEmail('');
      setPhone('');
    } else {
      setError(res.message || 'Failed to create doctor account');
    }
  };

  const filteredDoctors = doctors.filter(d => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return d.name?.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q) || d.registrationNo?.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
            Hospital Medical Staff & Doctor Access
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Provision physician credentials, assign clinical departments, and manage consultation privileges.
          </p>
        </div>

        <button
          onClick={() => { setShowAddModal(true); setError(''); }}
          className="btn btn-primary"
          style={{ background: '#059669', padding: '10px 18px' }}
        >
          <UserPlus size={16} />
          <span>+ Provision Doctor Account</span>
        </button>
      </div>

      {/* Doctors Table Card */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by doctor name or department..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Active Clinicians: <strong>{doctors.filter(d => d.status === 'Active').length}</strong> / {doctors.length} Total
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 14px' }}>Doctor Name</th>
                <th style={{ padding: '10px 14px' }}>Specialization / Dept</th>
                <th style={{ padding: '10px 14px' }}>Council Reg #</th>
                <th style={{ padding: '10px 14px' }}>Login Email</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Manage Access</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doc) => {
                const isActive = doc.status === 'Active';

                return (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#ecfdf5',
                          color: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700
                        }}>
                          <Stethoscope size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{doc.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>ID: {doc.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#0f172a', fontWeight: 600 }}>
                      {doc.specialization}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      {doc.registrationNo || 'N/A'}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>
                      {doc.email || 'hospital-portal@manipal.com'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge ${isActive ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.7rem' }}>
                        {doc.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => updateDoctorStatus(doc.id, isActive ? 'Suspended' : 'Active')}
                        style={{
                          background: isActive ? '#fff1f2' : '#ecfdf5',
                          border: '1px solid',
                          borderColor: isActive ? '#fecdd3' : '#a7f3d0',
                          color: isActive ? '#e11d48' : '#059669',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {isActive ? 'Suspend Access' : 'Activate Access'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Doctor Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope size={20} color="#059669" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Provision New Doctor Account</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="btn btn-sm btn-secondary">✕</button>
            </div>

            <form onSubmit={handleCreateDoctor} style={{ padding: '24px' }}>
              {error && (
                <div style={{ padding: '8px 12px', background: '#fff1f2', color: '#be123c', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '14px' }}>
                  {error}
                </div>
              )}

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Doctor Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ramesh Nathan"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Medical Council Reg No</label>
                  <input
                    type="text"
                    placeholder="e.g. KMC-CARD-9921"
                    className="form-input"
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Specialization / Department *</label>
                <select
                  className="form-select"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                >
                  <option value="Cardiology & Interventional Cardiology">Cardiology & Interventional Cardiology</option>
                  <option value="Endocrinology & Diabetology">Endocrinology & Diabetology</option>
                  <option value="Pediatrics & Neonatology">Pediatrics & Neonatology</option>
                  <option value="Pulmonology & Respiratory Medicine">Pulmonology & Respiratory Medicine</option>
                  <option value="Orthopedics & Joint Replacement">Orthopedics & Joint Replacement</option>
                  <option value="Emergency & Trauma Medicine">Emergency & Trauma Medicine</option>
                  <option value="General Outpatient Medicine">General Outpatient Medicine</option>
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Official Email</label>
                  <input
                    type="email"
                    placeholder="doctor@manipalhospitals.com"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="9845011223"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Doctor Portal Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Set password for doctor login"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
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
                  <span>{loading ? 'Creating Account...' : 'Provision Doctor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
