import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { 
  Building2, 
  ShieldCheck, 
  ShieldOff, 
  Clock, 
  KeyRound, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Lock,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import GrantAccessModal from '../../components/GrantAccessModal';

export default function ManageAccess() {
  const { accessGrants, revokeHospitalAccess } = useHealth();
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL', 'Active', 'Revoked'

  const activeCount = accessGrants.filter(g => g.status === 'Active').length;
  const revokedCount = accessGrants.filter(g => g.status === 'Revoked' || g.status === 'Expired').length;

  const filteredGrants = accessGrants.filter(grant => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'Active') return grant.status === 'Active';
    if (filterStatus === 'Revoked') return grant.status === 'Revoked' || grant.status === 'Expired';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
            Hospital Consent & Access Management
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Control which hospitals and doctors have permission to view your medical records.
          </p>
        </div>

        <button
          onClick={() => setShowGrantModal(true)}
          className="btn btn-primary"
          style={{ padding: '10px 18px' }}
        >
          <Plus size={16} />
          <span>Authorize Hospital / Generate Bypass Code</span>
        </button>
      </div>

      {/* Info Notice about OTP & Manual Fallback */}
      <div style={{
        padding: '16px 20px',
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <KeyRound size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0369a1' }}>
              Facing SMS OTP failure at hospital reception?
            </div>
            <div style={{ fontSize: '0.8rem', color: '#0284c7' }}>
              Hospital receptionists usually initiate access requests by sending an OTP to your phone. If cellular network is down, tap "Authorize Hospital" to create a manual 6-digit bypass token.
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowGrantModal(true)}
          className="btn btn-secondary btn-sm"
          style={{ background: 'white' }}
        >
          Generate Bypass Token
        </button>
      </div>

      {/* Access Grants Header & Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilterStatus('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: filterStatus === 'ALL' ? '#0284c7' : '#e2e8f0',
              background: filterStatus === 'ALL' ? '#f0f9ff' : '#ffffff',
              color: filterStatus === 'ALL' ? '#0284c7' : '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            All Hospitals ({accessGrants.length})
          </button>
          <button
            onClick={() => setFilterStatus('Active')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: filterStatus === 'Active' ? '#059669' : '#e2e8f0',
              background: filterStatus === 'Active' ? '#ecfdf5' : '#ffffff',
              color: filterStatus === 'Active' ? '#059669' : '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Active Access ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('Revoked')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: filterStatus === 'Revoked' ? '#e11d48' : '#e2e8f0',
              background: filterStatus === 'Revoked' ? '#fff1f2' : '#ffffff',
              color: filterStatus === 'Revoked' ? '#e11d48' : '#64748b',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Revoked / Expired ({revokedCount})
          </button>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          All revocations take effect immediately across all hospital terminals.
        </div>
      </div>

      {/* Hospitals Access List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredGrants.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Building2 size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>No hospital grants found</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              No medical institutions currently match your selected status.
            </p>
          </div>
        ) : (
          filteredGrants.map((grant) => {
            const isActive = grant.status === 'Active';

            return (
              <div
                key={grant.id}
                className="card"
                style={{
                  padding: '22px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderLeft: `5px solid ${isActive ? '#059669' : '#94a3b8'}`,
                  background: isActive ? '#ffffff' : '#f8fafc'
                }}
              >
                {/* Hospital Information */}
                <div style={{ flex: '1 1 340px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className={`badge ${isActive ? 'badge-green' : grant.status === 'Revoked' ? 'badge-red' : 'badge-amber'}`}>
                      {grant.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                      UID: {grant.hospitalUid}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    {grant.hospitalName}
                  </h3>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
                    <span><strong>Authorized Dept:</strong> {grant.doctorInCharge}</span>
                    <span><strong>Scope:</strong> {grant.accessLevel}</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                    <span>Granted: {grant.grantedDate}</span>
                    <span>Valid Until: {grant.expiryDate}</span>
                    <span>Last Accessed: {grant.lastAccessed}</span>
                  </div>
                </div>

                {/* Revoke Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {isActive ? (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to revoke medical record access for ${grant.hospitalName}?`)) {
                          revokeHospitalAccess(grant.id);
                        }
                      }}
                      className="btn btn-danger"
                      style={{ padding: '8px 16px', fontSize: '0.825rem' }}
                    >
                      <ShieldOff size={15} />
                      <span>Revoke Access</span>
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
                      <Lock size={15} />
                      <span>Access Terminated</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showGrantModal && <GrantAccessModal onClose={() => setShowGrantModal(false)} />}
    </div>
  );
}
