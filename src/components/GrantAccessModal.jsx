import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  X, 
  Building2, 
  Clock, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2,
  Copy
} from 'lucide-react';

export default function GrantAccessModal({ onClose }) {
  const { grantHospitalAccess } = useHealth();
  const [hospitalName, setHospitalName] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [accessLevel, setAccessLevel] = useState('Full Clinical Records & Diagnostics');
  const [generatedPasscode, setGeneratedPasscode] = useState(null);
  const [copied, setCopied] = useState(false);

  const POPULAR_HOSPITALS = [
    'Manipal Hospital, Old Airport Road',
    'Apollo Multispecialty Hospital, Bengaluru',
    'Aster CMI Hospital, Hebbal',
    'Fortis Hospital, Bannerghatta Road',
    'Narayana Institute of Cardiac Sciences',
    'Cloudnine Hospital',
  ];

  const handleGrant = (e) => {
    e.preventDefault();
    if (!hospitalName) {
      alert('Please select or specify hospital name');
      return;
    }

    // Generate random 6-digit access code for offline OTP bypass
    const passcode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPasscode(passcode);

    grantHospitalAccess({
      hospitalName,
      durationDays,
      accessLevel,
    });
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(generatedPasscode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '560px' }}
      >
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#f0f9ff',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                Authorize Hospital Access
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Grant consent or generate manual bypass pass in case of OTP failure
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {!generatedPasscode ? (
            <form onSubmit={handleGrant}>
              <div className="form-group">
                <label className="form-label">Hospital / Clinic Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apollo Hospital or Select below"
                  className="form-input"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                />
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {POPULAR_HOSPITALS.map((hosp) => (
                    <button
                      key={hosp}
                      type="button"
                      onClick={() => setHospitalName(hosp)}
                      style={{
                        padding: '4px 8px',
                        background: hospitalName === hosp ? '#e0f2fe' : '#f1f5f9',
                        color: hospitalName === hosp ? '#0369a1' : '#475569',
                        border: '1px solid',
                        borderColor: hospitalName === hosp ? '#bae6fd' : '#e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        cursor: 'pointer'
                      }}
                    >
                      {hosp.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Access Duration *</label>
                <select
                  className="form-select"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                >
                  <option value="1">24 Hours (Single OPD Consultation)</option>
                  <option value="7">7 Days (Short Inpatient Care / Follow-up)</option>
                  <option value="30">30 Days (Ongoing Treatment / Monthly)</option>
                  <option value="90">90 Days (Quarterly Chronic Care Review)</option>
                  <option value="365">1 Year (Primary Care Family Hospital)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Access Scope / Permissions</label>
                <select
                  className="form-select"
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                >
                  <option value="Full Clinical Records & Diagnostics">Full Clinical History (Prescriptions, Scans, Labs & Bills)</option>
                  <option value="Prescriptions & Medications Only">Prescriptions & Active Medications Only</option>
                  <option value="Diagnostics & Lab Reports Only">Diagnostics & Lab Reports Only</option>
                  <option value="Emergency Profile Only">Emergency Profile Only (Vitals & Allergies)</option>
                </select>
              </div>

              <div style={{
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.78rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '18px 0'
              }}>
                <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0 }} />
                <span>You can revoke this consent at any time from your Patient Access dashboard.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <KeyRound size={16} />
                  <span>Authorize & Generate Code</span>
                </button>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px'
              }}>
                <CheckCircle2 size={32} />
              </div>

              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Hospital Access Granted!
              </h4>
              <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>
                Access granted to <strong>{hospitalName}</strong> for {durationDays} days.
              </p>

              {/* Passcode Box */}
              <div style={{
                margin: '20px auto',
                padding: '16px 20px',
                background: '#f8fafc',
                border: '2px dashed #0284c7',
                borderRadius: '12px',
                maxWidth: '320px'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Manual OTP Bypass Code
                </div>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 900,
                  letterSpacing: '0.25em',
                  color: '#0284c7',
                  fontFamily: 'var(--font-mono)',
                  margin: '6px 0'
                }}>
                  {generatedPasscode}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Provide this 6-digit code to the hospital receptionist if SMS OTP does not arrive.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button onClick={handleCopy} className="btn btn-secondary">
                  {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
                <button onClick={onClose} className="btn btn-primary">
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
