import React, { useState, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  X, 
  Database, 
  Table, 
  Server, 
  CheckCircle2, 
  RefreshCw, 
  User, 
  FileText, 
  ShieldAlert, 
  Pill,
  Baby
} from 'lucide-react';

export default function DatabaseInspectorModal({ onClose }) {
  const { dbStats, fetchDbStats } = useHealth();
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchDbStats();
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '680px' }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#0284c7',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  PostgreSQL Database Inspector
                </h3>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#ecfdf5', color: '#059669', borderRadius: '4px', fontWeight: 700 }}>
                  Live & Connected
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Engine: PostgreSQL (Port 5001) • Path: <code style={{ fontFamily: 'var(--font-mono)' }}>server/postgres_data</code>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleRefresh}
              className="btn btn-sm btn-secondary"
              title="Refresh database table counts"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Table Counts Grid */}
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
            Live SQL Tables & Row Counts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                <User size={14} color="#0284c7" />
                <span>patients</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {dbStats?.tables?.patients ?? 0}
              </div>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                <Baby size={14} color="#16a34a" />
                <span>dependents</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {dbStats?.tables?.dependents ?? 0}
              </div>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                <FileText size={14} color="#0284c7" />
                <span>medical_records</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {dbStats?.tables?.medical_records ?? 0}
              </div>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                <Pill size={14} color="#f59e0b" />
                <span>active_medications</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {dbStats?.tables?.active_medications ?? 0}
              </div>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                <Server size={14} color="#0284c7" />
                <span>hospital_access_grants</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {dbStats?.tables?.hospital_access_grants ?? 0}
              </div>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                <ShieldAlert size={14} color="#e11d48" />
                <span>emergency_access_logs</span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {dbStats?.tables?.emergency_access_logs ?? 0}
              </div>
            </div>
          </div>

          {/* Registered Patient Accounts in Postgres */}
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
            Registered Patient Accounts in PostgreSQL:
          </div>
          <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '8px 12px', color: '#64748b' }}>Patient ID</th>
                  <th style={{ padding: '8px 12px', color: '#64748b' }}>Full Name</th>
                  <th style={{ padding: '8px 12px', color: '#64748b' }}>Mobile Number</th>
                  <th style={{ padding: '8px 12px', color: '#64748b' }}>Blood Group</th>
                  <th style={{ padding: '8px 12px', color: '#64748b' }}>Age</th>
                </tr>
              </thead>
              <tbody>
                {dbStats?.registeredPatients?.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#0284c7' }}>{p.id}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '8px 12px', color: '#64748b' }}>+91 {p.phone}</td>
                    <td style={{ padding: '8px 12px', color: '#e11d48', fontWeight: 700 }}>{p.blood_group}</td>
                    <td style={{ padding: '8px 12px', color: '#64748b' }}>{p.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{
            padding: '12px 14px',
            background: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #bae6fd',
            fontSize: '0.75rem',
            color: '#0369a1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <strong>Physical Database File Location:</strong> <code>c:\Users\asif2\OneRecord\server\postgres_data</code>
            </div>
            <span style={{ fontWeight: 700 }}>100% Free & Persistent</span>
          </div>
        </div>
      </div>
    </div>
  );
}
