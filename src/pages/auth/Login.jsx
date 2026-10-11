import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { 
  Activity, 
  Smartphone, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  KeyRound,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function Login({ onSwitchToRegister }) {
  const { loginWithPassword, loginWithOtp, patient } = useHealth();
  const [authMethod, setAuthMethod] = useState('otp'); // 'password' or 'otp'
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('password123');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtp('123456'); // Pre-fill sample OTP for instant evaluation ease
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (authMethod === 'password') {
        const res = loginWithPassword(phone, password);
        if (!res.success) {
          setError(res.message);
        }
      } else {
        const res = loginWithOtp(phone, otp);
        if (!res.success) {
          setError(res.message);
        }
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 10% 20%, #f0f9ff 0%, #f8fafc 90%)'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-color)',
        padding: '36px 32px'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            margin: '0 auto 14px',
            boxShadow: '0 6px 16px rgba(2, 132, 199, 0.35)'
          }}>
            <Activity size={30} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
            Patient Portal Login
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Access your unified clinical timeline and consent dashboard
          </p>
        </div>

        {/* Method Toggle: OTP vs Password */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#f1f5f9',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => { setAuthMethod('otp'); setError(''); }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: authMethod === 'otp' ? '#ffffff' : 'transparent',
              color: authMethod === 'otp' ? '#0284c7' : '#64748b',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: authMethod === 'otp' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Smartphone size={16} />
            <span>Mobile OTP</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMethod('password'); setError(''); }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: authMethod === 'password' ? '#ffffff' : 'transparent',
              color: authMethod === 'password' ? '#0284c7' : '#64748b',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: authMethod === 'password' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Lock size={16} />
            <span>Password</span>
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
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Phone input */}
          <div className="form-group">
            <label className="form-label">Registered Mobile Number</label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile number"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                style={{ paddingLeft: '48px', fontSize: '0.95rem' }}
              />
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                +91
              </span>
            </div>
          </div>

          {/* Conditional Input based on authMethod */}
          {authMethod === 'password' ? (
            <div className="form-group">
              <label className="form-label">
                <span>Account Password</span>
                <a href="#forgot" style={{ fontSize: '0.75rem', color: '#0284c7', textDecoration: 'none' }}>
                  Forgot?
                </a>
              </label>
              <input
                type="password"
                required
                placeholder="Enter password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          ) : (
            <div className="form-group">
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  <Sparkles size={16} color="#0284c7" />
                  <span>Send 6-Digit OTP SMS</span>
                </button>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      One-Time Password (OTP)
                    </label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Resend OTP
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit OTP (e.g. 123456)"
                    className="form-input"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    style={{ textAlign: 'center', letterSpacing: '0.25em', fontSize: '1.2rem', fontFamily: 'var(--font-mono)' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} />
                    <span>Demo mode: Code auto-filled as <strong>123456</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || (authMethod === 'otp' && !otpSent)}
            style={{ width: '100%', marginTop: '14px', padding: '12px' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to OneRecord'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Fast Login Helper */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <strong>Sample Account:</strong> +91 9876543210 (Aarav Sharma - Sample Data). Or click <strong>Register Now</strong> below to create your own isolated personal health profile!
        </div>

        {/* Link to Register */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: '#64748b' }}>
          Don't have a OneRecord account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            style={{ background: 'transparent', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer' }}
          >
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
}
