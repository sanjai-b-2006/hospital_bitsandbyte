import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  Building2, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  KeyRound,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';

export default function HospitalAuth({ onSwitchToPortal }) {
  const { loginHospital, registerHospital } = useHospital();
  const [isRegister, setIsRegister] = useState(false);

  // Login Form
  const [loginUid, setLoginUid] = useState('MANIPAL-001');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginMfa, setLoginMfa] = useState('123456');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regUid, setRegUid] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMfaType, setRegMfaType] = useState('SMS');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await loginHospital(loginUid, loginPassword, loginMfa);
    setLoading(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName || !regAddress || !regUid || !regPassword) {
      setError('Please fill in all required hospital details.');
      return;
    }
    setError('');
    setLoading(true);

    const res = await registerHospital({
      name: regName,
      address: regAddress,
      uid: regUid,
      contactEmail: regEmail,
      contactPhone: regPhone,
      password: regPassword,
      mfaType: regMfaType,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      background: 'radial-gradient(circle at 10% 20%, #f0fdf4 0%, #f8fafc 90%)'
    }}>
      <div style={{
        maxWidth: isRegister ? '620px' : '440px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-color)',
        padding: '36px 32px',
        transition: 'all 0.3s ease'
      }}>
        {/* Back to Patient Portal Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => onSwitchToPortal && onSwitchToPortal('patient')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#0284c7',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0
            }}
          >
            ← Switch to Patient Portal
          </button>
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#dcfce7', color: '#166534', borderRadius: '4px', fontWeight: 700 }}>
            ADMIN ACCESS
          </span>
        </div>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            margin: '0 auto 12px',
            boxShadow: '0 6px 16px rgba(5, 150, 105, 0.35)'
          }}>
            <Building2 size={28} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
            Hospital Administration Portal
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
            {isRegister ? 'Register your healthcare institution to the OneRecord network' : 'Secure institutional access & queue management'}
          </p>
        </div>

        {/* Toggle Mode */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#f1f5f9',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: !isRegister ? '#ffffff' : 'transparent',
              color: !isRegister ? '#059669' : '#64748b',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: !isRegister ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Hospital Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: isRegister ? '#ffffff' : 'transparent',
              color: isRegister ? '#059669' : '#64748b',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: isRegister ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Register Hospital
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#be123c',
            borderRadius: '8px',
            fontSize: '0.8rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {!isRegister ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Hospital UID (Identifier)</label>
              <input
                type="text"
                required
                placeholder="e.g. MANIPAL-001 or APOLLO-BLR-01"
                className="form-input"
                value={loginUid}
                onChange={(e) => setLoginUid(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Administrator Password</label>
              <input
                type="password"
                required
                placeholder="Enter password"
                className="form-input"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Multi-Factor Authentication (MFA)
                </label>
                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                  Demo Code: 123456
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="Enter 6-digit MFA Code"
                className="form-input"
                value={loginMfa}
                onChange={(e) => setLoginMfa(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '0.2em', fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '12px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
              }}
            >
              <span>{loading ? 'Verifying Credentials...' : 'Sign In to Hospital Admin'}</span>
              <ArrowRight size={16} />
            </button>

            {/* Quick Demo Credentials Card */}
            <div style={{
              marginTop: '18px',
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '0.75rem',
              color: '#64748b'
            }}>
              <strong>Sample Hospital:</strong> UID: <code>MANIPAL-001</code> | Pass: <code>admin123</code> | MFA: <code>123456</code> (Pre-filled for fast testing).
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Hospital Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fortis Multispecialty Hospital"
                  className="form-input"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hospital UID (Unique ID) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FORTIS-BLR-01"
                  className="form-input"
                  value={regUid}
                  onChange={(e) => setRegUid(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Hospital Address *</label>
              <input
                type="text"
                required
                placeholder="e.g. 154/9, Bannerghatta Main Rd, Opposite IIM-B, Bengaluru"
                className="form-input"
                value={regAddress}
                onChange={(e) => setRegAddress(e.target.value)}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input
                  type="email"
                  placeholder="admin@hospital.com"
                  className="form-input"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone / Reception</label>
                <input
                  type="tel"
                  placeholder="080-26961234"
                  className="form-input"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Admin Master Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Create secure password"
                  className="form-input"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Multi-Factor Authentication (MFA)</label>
                <select
                  className="form-select"
                  value={regMfaType}
                  onChange={(e) => setRegMfaType(e.target.value)}
                >
                  <option value="SMS">SMS OTP Verification (Administrator Mobile)</option>
                  <option value="TOTP">Time-based Authenticator App (TOTP)</option>
                  <option value="EMAIL">Encrypted Email OTP</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '10px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
              }}
            >
              <span>{loading ? 'Creating Hospital Profile...' : 'Complete Hospital Registration'}</span>
              <CheckCircle2 size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
