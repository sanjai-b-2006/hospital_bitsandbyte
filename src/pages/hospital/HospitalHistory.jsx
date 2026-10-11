import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { 
  Clock, 
  Search, 
  Calendar, 
  User, 
  Stethoscope, 
  Building2,
  RefreshCw,
  FileText
} from 'lucide-react';

export default function HospitalHistory() {
  const { hospital, history, fetchHistory } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredHistory = history.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.patientName?.toLowerCase().includes(q) ||
      item.doctorName?.toLowerCase().includes(q) ||
      item.tokenNumber?.toLowerCase().includes(q) ||
      item.department?.toLowerCase().includes(q) ||
      item.patientPhone?.includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
            Hospital Consultation & Visit History
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Complete audit trail of all patient consultations, assigned doctors, and token records.
          </p>
        </div>

        <button onClick={fetchHistory} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={13} />
          <span>Refresh History</span>
        </button>
      </div>

      {/* History Table Card */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1 1 300px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by patient, doctor, token #, or phone..."
                className="form-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
              />
            </div>

            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', padding: '8px 12px', fontSize: '0.8rem' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Consultation">In Consultation</option>
              <option value="Waiting">Waiting</option>
            </select>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Total Recorded Visits: <strong>{history.length}</strong>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <Clock size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>No consultation visits found</h3>
            <p style={{ fontSize: '0.8rem' }}>Visits registered through live token queue will appear here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 14px' }}>Date</th>
                  <th style={{ padding: '10px 14px' }}>Token #</th>
                  <th style={{ padding: '10px 14px' }}>Patient</th>
                  <th style={{ padding: '10px 14px' }}>Mobile</th>
                  <th style={{ padding: '10px 14px' }}>Consulting Doctor</th>
                  <th style={{ padding: '10px 14px' }}>Department</th>
                  <th style={{ padding: '10px 14px' }}>Risk Flag</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} color="#94a3b8" />
                        <span>{item.visitDate}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        background: '#f0fdf4',
                        color: '#166534',
                        border: '1px solid #bbf7d0',
                        borderRadius: '4px',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {item.tokenNumber}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                      {item.patientName}
                      {item.bloodGroup && (
                        <span style={{ color: '#e11d48', fontSize: '0.72rem', marginLeft: '6px' }}>({item.bloodGroup})</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b' }}>
                      +91 {item.patientPhone}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#0f172a', fontWeight: 600 }}>
                      {item.doctorName}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>
                      {item.department}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge ${item.riskLevel === 'RED' ? 'badge-red' : item.riskLevel === 'AMBER' ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>
                        {item.riskLevel || 'GREEN'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: item.status === 'Completed' ? '#dcfce7' : item.status === 'In Consultation' ? '#fef9c3' : '#f1f5f9',
                        color: item.status === 'Completed' ? '#166534' : item.status === 'In Consultation' ? '#854d0e' : '#475569'
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
