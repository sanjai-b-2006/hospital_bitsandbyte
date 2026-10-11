import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  ShieldAlert, 
  Search, 
  AlertTriangle, 
  PhoneCall, 
  HeartHandshake, 
  CheckCircle2, 
  FileText, 
  Lock, 
  Activity,
  Heart
} from 'lucide-react';

export default function HospitalEmergency() {
  const { hospital, performEmergencyLookup } = useHospital();

  const [queryTerm, setQueryTerm] = useState('9876543210');
  const [doctorOrStaff, setDoctorOrStaff] = useState('Dr. Anand Verghese (ER Chief)');
  const [reason, setReason] = useState('Break-Glass: Acute Trauma & Unconscious Patient Verification');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emergencyResult, setEmergencyResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!queryTerm) {
      setError('Please enter patient mobile number or Aadhaar');
      return;
    }

    setLoading(true);
    setError('');
    setEmergencyResult(null);

    const res = await performEmergencyLookup(queryTerm, doctorOrStaff, reason);
    setLoading(false);

    if (res.success) {
      setEmergencyResult(res);
    } else {
      setError(res.message || 'No patient record found');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
        borderRadius: '20px',
        padding: '24px 28px',
        color: 'white',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffe4e6', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
          <ShieldAlert size={16} /> Hospital Emergency Room • Break-Glass Terminal
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginTop: '2px' }}>
          Emergency Patient Dossier Lookup
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#fecdd3', marginTop: '2px', maxWidth: '680px' }}>
          Instant, password-free break-glass search for unconscious patients, trauma victims, and acute Golden Hour admissions across India.
        </p>
      </div>

      {/* Break-Glass Search Console */}
      <div className="card" style={{ padding: '24px', borderTop: '4px solid #e11d48' }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ color: '#0f172a' }}>
                Patient Mobile Number or Aadhaar Number *
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210 (Sample patient)"
                  className="form-input"
                  value={queryTerm}
                  onChange={(e) => setQueryTerm(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Attending ER Clinician / Staff</label>
              <input
                type="text"
                required
                className="form-input"
                value={doctorOrStaff}
                onChange={(e) => setDoctorOrStaff(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                  padding: '11px',
                  fontWeight: 700
                }}
              >
                <Activity size={16} />
                <span>{loading ? 'Searching...' : 'Break-Glass Search'}</span>
              </button>
            </div>
          </div>

          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap', fontSize: '0.78rem', color: '#64748b' }}>
              Triage Clinical Reason:
            </label>
            <input
              type="text"
              required
              className="form-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            />
          </div>
        </form>

        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#be123c',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Emergency Result Dossier */}
      {emergencyResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Audit Logging Notice */}
          <div style={{
            padding: '12px 18px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#065f46'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>
                Break-Glass verified. Audit entry logged to PostgreSQL with ID: <code>{emergencyResult.accessLogId}</code>
              </span>
            </div>
            <span>Hospital: {hospital.name}</span>
          </div>

          {/* Patient Card */}
          <div className="card" style={{ borderTop: '6px solid #e11d48' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <span className="badge badge-red" style={{ marginBottom: '8px' }}>
                  Emergency Record Verified
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                  {emergencyResult.patient.name}
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  OneRecord UID: {emergencyResult.patient.id} • Age: {emergencyResult.patient.age} ({emergencyResult.patient.gender})
                </div>
              </div>

              {/* Blood Group */}
              <div style={{
                background: '#e11d48',
                color: 'white',
                borderRadius: '14px',
                padding: '10px 22px',
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.4)'
              }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#ffe4e6' }}>
                  Blood Group
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1 }}>
                  {emergencyResult.patient.bloodGroup}
                </div>
              </div>
            </div>

            {/* Contacts & Organ Donation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                  Primary Emergency Contact
                </div>
                <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0f172a' }}>
                  {emergencyResult.patient.emergencyContacts?.[0]?.name}
                </div>
                <a
                  href={`tel:${emergencyResult.patient.emergencyContacts?.[0]?.phone}`}
                  style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}
                >
                  <PhoneCall size={14} /> {emergencyResult.patient.emergencyContacts?.[0]?.phone}
                </a>
              </div>

              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                  Organ Donor Status
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.925rem', fontWeight: 700, color: '#059669' }}>
                  <HeartHandshake size={18} />
                  <span>{emergencyResult.patient.organDonor ? 'Pledged Organ Donor' : 'Not Pledged'}</span>
                </div>
              </div>
            </div>

            {/* Critical Allergies */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9f1239', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <AlertTriangle size={15} color="#e11d48" />
                <span>Life-Threatening Allergies (Contraindications)</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {emergencyResult.patient.allergies?.map((item, idx) => (
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
                      <span style={{ fontSize: '0.78rem', color: '#be123c', marginLeft: '8px' }}>
                        ({item.reaction})
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', background: '#e11d48', color: 'white', borderRadius: '4px' }}>
                      {item.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Conditions */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                Chronic Conditions & Implants
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {emergencyResult.patient.criticalConditions?.map((cond, idx) => (
                  <div key={idx} style={{ padding: '6px 12px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                    • {cond}
                  </div>
                ))}
              </div>
            </div>

            {/* Attached Emergency Records */}
            {emergencyResult.emergencyRecords?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9f1239', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Critical Emergency Records & Tests ({emergencyResult.emergencyRecords.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {emergencyResult.emergencyRecords.map((rec) => (
                    <div key={rec.id} style={{ padding: '12px 14px', background: '#fff1f2', borderRadius: '8px', border: '1px solid #fecdd3' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#9f1239' }}>{rec.title}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#be123c' }}>{rec.date}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                        {rec.hospital} • {rec.doctor}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#be123c', marginTop: '2px' }}>
                        <em>{rec.riskReason || rec.diagnosis}</em>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
