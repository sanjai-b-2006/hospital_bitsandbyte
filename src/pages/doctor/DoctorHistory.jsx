import React, { useState } from 'react';
import { useDoctor } from '../../context/DoctorContext';
import { 
  Clock, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Calendar, 
  User, 
  CheckCircle2, 
  RefreshCw,
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function DoctorHistory({ onNavigateToPatient }) {
  const { doctor, history, fetchHistory } = useDoctor();

  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'

  const filteredHistory = history.filter((item) => {
    if (riskFilter !== 'ALL' && item.riskLevel !== riskFilter) return false;
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.patientName?.toLowerCase().includes(q) ||
      item.patientPhone?.includes(q) ||
      item.tokenNumber?.toLowerCase().includes(q) ||
      item.department?.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    const dateA = new Date(a.visitDate || a.createdAt);
    const dateB = new Date(b.visitDate || b.createdAt);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
            Doctor Consultation History
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            List of patients visited with dates, sort order, and multi-parameter filters.
          </p>
        </div>

        <button onClick={() => fetchHistory()} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={13} />
          <span>Refresh History</span>
        </button>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1 1 280px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by patient name, mobile, or token..."
                className="form-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Risk Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} color="#64748b" />
              <select
                className="form-select"
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 12px', width: 'auto' }}
              >
                <option value="ALL">All Risk Levels</option>
                <option value="RED">🔴 Red Risk Only</option>
                <option value="AMBER">🟡 Amber Risk Only</option>
                <option value="GREEN">🟢 Green Risk Only</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '6px 12px', width: 'auto' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Consultation">In Consultation</option>
              <option value="Waiting">Waiting</option>
            </select>

            {/* Sort by Date */}
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
            >
              <ArrowUpDown size={14} />
              <span>Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>

        {/* Consultations Table */}
        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
            <Clock size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>No consultation visits matched</h3>
            <p style={{ fontSize: '0.8rem' }}>Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 14px' }}>Visit Date</th>
                  <th style={{ padding: '10px 14px' }}>Token #</th>
                  <th style={{ padding: '10px 14px' }}>Patient Name</th>
                  <th style={{ padding: '10px 14px' }}>Mobile</th>
                  <th style={{ padding: '10px 14px' }}>Department</th>
                  <th style={{ padding: '10px 14px' }}>Risk Assessment</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => {
                  const isRed = item.riskLevel === 'RED';
                  const isAmber = item.riskLevel === 'AMBER';

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="#0d9488" />
                          <span>{item.visitDate}</span>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          background: '#f1f5f9',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          color: '#0f172a'
                        }}>
                          {item.tokenNumber}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                        {item.patientName}
                      </td>

                      <td style={{ padding: '12px 14px', color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                        {item.patientPhone}
                      </td>

                      <td style={{ padding: '12px 14px', color: '#64748b' }}>
                        {item.department || 'Cardiology'}
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: isRed ? '#fee2e2' : (isAmber ? '#fef3c7' : '#dcfce7'),
                          color: isRed ? '#b91c1c' : (isAmber ? '#b45309' : '#15803d'),
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: isRed ? '#dc2626' : (isAmber ? '#d97706' : '#16a34a')
                          }} />
                          {item.riskLevel || 'GREEN'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: item.status === 'Completed' ? '#16a34a' : (item.status === 'In Consultation' ? '#0d9488' : '#64748b')
                        }}>
                          {item.status}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <button
                          onClick={() => onNavigateToPatient && onNavigateToPatient(item.patientId)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        >
                          View Records & Calendar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
