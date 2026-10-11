import React, { useState } from 'react';
import { useDoctor } from '../../context/DoctorContext';
import { 
  Stethoscope, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  Mail, 
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function DoctorLogin({ onSwitchToPortal }) {
  const { loginDoctor } = useDoctor();

  const [credential, setCredential] = useState('dr.kulkarni@manipalhospitals.com');
  const [password, setPassword] = useState('doctor123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await loginDoctor(credential, password);
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
      background: 'radial-gradient(circle at 10% 20%, #f0fdfa 0%, #f8fafc 90%)'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-color)',
        padding: '36px 32px',
        transition: 'all 0.3s ease'
      }}>
        {/* Navigation back */}
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
            ← Patient Portal
          </button>
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#ccfbf1', color: '#0f766e', borderRadius: '4px', fontWeight: 700 }}>
            CLINICIAN DESK
          </span>
        </div>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            margin: '0 auto 12px',
            boxShadow: '0 6px 16px rgba(13, 148, 136, 0.35)'
          }}>
            <Stethoscope size={28} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
            Doctor Clinical Portal
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
            Sign in using physician credentials issued by your hospital
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 14px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            color: '#dc2626',
            fontSize: '0.82rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email, Mobile, or KMC Registration No</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                required
                placeholder="dr.kulkarni@manipalhospitals.com"
                className="form-input"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Doctor Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                placeholder="Enter doctor password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '12px',
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)'
            }}
          >
            <span>{loading ? 'Verifying Credentials...' : 'Sign In as Doctor'}</span>
            <ArrowRight size={16} />
          </button>

          {/* Quick Demo Credentials Box */}
          <div style={{
            marginTop: '20px',
            padding: '12px 14px',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            fontSize: '0.75rem',
            color: '#64748b'
          }}>
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              Pre-provisioned Doctor Credentials:
            </div>
            <div><strong>Email:</strong> <code>dr.kulkarni@manipalhospitals.com</code></div>
            <div><strong>Reg No:</strong> <code>KMC-CARD-8812</code></div>
            <div><strong>Password:</strong> <code>doctor123</code></div>
          </div>
        </form>
      </div>
    </div>
  );
}
