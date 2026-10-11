import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  X, 
  Printer, 
  Download, 
  ShieldAlert, 
  PhoneCall, 
  AlertTriangle, 
  HeartHandshake,
  CheckCircle2,
  Copy
} from 'lucide-react';

export default function EmergencyCardModal({ onClose }) {
  const { patient, currentAccount } = useHealth();
  const [copied, setCopied] = useState(false);

  const currentPatient = patient || currentAccount || {
    id: 'PAT-IND-884210',
    name: 'Aarav Sharma',
    bloodGroup: 'O+',
    age: 42,
    gender: 'Male',
    allergies: [],
    criticalConditions: [],
    emergencyContacts: []
  };

  const emergencyUrl = `https://onerecord.health/emergency/${currentPatient.id}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(emergencyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '580px', padding: 0, overflow: 'hidden' }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff1f2'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="#e11d48" />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#9f1239' }}>
                Emergency Medical ID & Lock Screen Card
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#be123c' }}>
                Instant Break-Glass Access for ER Doctors & Paramedics
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer', 
              color: '#9f1239',
              display: 'flex',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: The Physical/Digital Card */}
        <div style={{ padding: '24px' }}>
          <div 
            id="emergency-wallet-card" 
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: '16px',
              padding: '24px',
              color: 'white',
              boxShadow: '0 12px 28px rgba(15, 23, 42, 0.25)',
              border: '1px solid #334155',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Red alert ribbon at top */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #e11d48, #f43f5e, #fb7185)'
            }} />

            {/* Top row: Brand & Blood Group */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={18} color="#f43f5e" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.05em', color: '#fecdd3', textTransform: 'uppercase' }}>
                    OneRecord Emergency ID
                  </span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', letterSpacing: '-0.02em' }}>
                  {currentPatient.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  ID: {currentPatient.id} | Age: {currentPatient.age} ({currentPatient.gender})
                </div>
              </div>

              {/* Blood Group Badge */}
              <div style={{
                background: '#e11d48',
                borderRadius: '12px',
                padding: '8px 16px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(225, 29, 72, 0.4)'
              }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffe4e6', fontWeight: 700 }}>
                  Blood Group
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1.1, color: '#ffffff' }}>
                  {currentPatient.bloodGroup}
                </div>
              </div>
            </div>

            {/* Middle Section: QR Code & Critical Clinical Vitals */}
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '18px', alignItems: 'center', marginBottom: '18px' }}>
              {/* QR Code Container */}
              <div style={{
                background: 'white',
                padding: '8px',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}>
                {/* Clean inline SVG QR code mockup */}
                <svg viewBox="0 0 100 100" width="94" height="94" fill="#0f172a">
                  {/* Position detection patterns */}
                  <rect x="0" y="0" width="28" height="28" fill="#0f172a" rx="4"/>
                  <rect x="4" y="4" width="20" height="20" fill="white" rx="2"/>
                  <rect x="8" y="8" width="12" height="12" fill="#e11d48"/>

                  <rect x="72" y="0" width="28" height="28" fill="#0f172a" rx="4"/>
                  <rect x="76" y="4" width="20" height="20" fill="white" rx="2"/>
                  <rect x="80" y="8" width="12" height="12" fill="#0f172a"/>

                  <rect x="0" y="72" width="28" height="28" fill="#0f172a" rx="4"/>
                  <rect x="4" y="76" width="20" height="20" fill="white" rx="2"/>
                  <rect x="8" y="80" width="12" height="12" fill="#0f172a"/>

                  {/* Data blocks */}
                  <rect x="36" y="4" width="8" height="8"/>
                  <rect x="52" y="4" width="12" height="8"/>
                  <rect x="36" y="20" width="16" height="8"/>
                  <rect x="58" y="20" width="8" height="8"/>
                  <rect x="4" y="36" width="8" height="16"/>
                  <rect x="20" y="44" width="8" height="8"/>
                  <rect x="36" y="36" width="28" height="28" fill="#e11d48" rx="2"/>
                  <rect x="72" y="36" width="12" height="8"/>
                  <rect x="88" y="44" width="8" height="16"/>
                  <rect x="36" y="72" width="16" height="8"/>
                  <rect x="58" y="80" width="12" height="16"/>
                  <rect x="76" y="72" width="8" height="8"/>
                  <rect x="88" y="80" width="8" height="16"/>
                </svg>
                <div style={{ fontSize: '0.62rem', color: '#0f172a', fontWeight: 800, marginTop: '4px', textTransform: 'uppercase' }}>
                  Scan in ER
                </div>
              </div>

              {/* Medical Criticals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={12} /> Critical Allergies
                  </div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fecdd3' }}>
                    {currentPatient.allergies?.map(a => `${a.allergen} (${a.severity?.split(' ')[0] || ''})`).join(', ') || 'No known drug allergies'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase' }}>
                    Chronic Diagnoses / Implants
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.3 }}>
                    {currentPatient.criticalConditions?.join(' • ') || 'None recorded'}
                  </div>
                </div>

                {currentPatient.organDonor && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      padding: '2px 8px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#6ee7b7',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      borderRadius: '4px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <HeartHandshake size={12} /> Pledged Organ Donor
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contacts Footer */}
            <div style={{ 
              borderTop: '1px solid #334155', 
              paddingTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: '#94a3b8'
            }}>
              <div>
                <strong style={{ color: '#ffffff' }}>Emergency Contact: </strong>
                {patient.emergencyContacts?.[0]?.name}
              </div>
              <a 
                href={`tel:${patient.emergencyContacts?.[0]?.phone}`} 
                style={{ 
                  color: '#38bdf8', 
                  fontWeight: 700, 
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <PhoneCall size={12} /> {patient.emergencyContacts?.[0]?.phone}
              </a>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button 
              onClick={handlePrint}
              className="btn btn-secondary" 
              style={{ flex: 1 }}
            >
              <Printer size={16} />
              <span>Print Wallet Card</span>
            </button>
            <button 
              onClick={handleCopyLink}
              className="btn btn-primary" 
              style={{ flex: 1 }}
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Link Copied!' : 'Copy Emergency Link'}</span>
            </button>
          </div>

          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: '#f8fafc', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0',
            fontSize: '0.75rem',
            color: '#64748b',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start'
          }}>
            <ShieldAlert size={16} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Break-Glass Policy:</strong> Any licensed medical provider or ambulance crew can scan this QR code to view life-saving allergies, blood group, and emergency records without requiring patient password. Every access is timestamped and logged with geolocated audit logs.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
