import React, { useState, useMemo } from 'react';
import { useHealth } from '../../context/HealthContext';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Stethoscope, 
  Building2, 
  Pill, 
  ShieldAlert, 
  ArrowUpDown, 
  Check, 
  X,
  Scan,
  Download,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import AddRecordModal from '../../components/AddRecordModal';
import MarkdownView from '../../components/MarkdownView';
import { API_BASE_URL } from '../../config';

export default function PatientRecords() {
  const { records, toggleEmergencyRecord, activeProfileId, patient } = useHealth();
  const profileId = activeProfileId || patient?.id || 'PAT-IND-884210';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'risk'
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null); // 'YYYY-MM-DD'
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState(null);

  // AI Report Explainer state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiError, setAiError] = useState('');

  const explainRecordWithAI = async () => {
    const rec = selectedRecordDetail;
    if (!rec || aiLoading) return;

    setAiLoading(true);
    setAiResult('');
    setAiError('');

    try {
      const parts = [];
      if (rec.title) parts.push(`Title: ${rec.title}`);
      if (rec.type) parts.push(`Type: ${rec.type}`);
      if (rec.date) parts.push(`Date: ${rec.date}`);
      if (rec.hospital) parts.push(`Hospital: ${rec.hospital}`);
      if (rec.doctor) parts.push(`Doctor: ${rec.doctor}`);
      if (rec.diagnosis) parts.push(`Diagnosis: ${rec.diagnosis}`);
      if (rec.risk && rec.riskReason) parts.push(`Clinical assessment (${rec.risk} risk): ${rec.riskReason}`);
      if (rec.medications?.length) parts.push('Medications: ' + rec.medications.map((m) => `${m.name} ${m.dosage} ${m.frequency}`).join(', '));
      if (rec.labResults?.length) parts.push('Lab results: ' + rec.labResults.map((t) => `${t.test}: ${t.result} (${t.status || 'Normal'})`).join(', '));
      if (rec.notes) parts.push(`Notes: ${rec.notes}`);

      const res = await fetch(`${API_BASE_URL}/ai/explain-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: profileId, reportTitle: rec.title, reportText: parts.join('\n') }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(`Server answered with non-JSON (HTTP ${res.status}).`);
      }

      if (data.success) {
        setAiResult(data.content);
      } else {
        setAiError(data.error || 'AI explainer failed.');
      }
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Calendar month state
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(() => {
    // Default to the month of the most recent record or current month
    return new Date(2026, 8, 1); // September 2026
  });

  // Map records to dates for calendar colored marking
  const recordsByDate = useMemo(() => {
    const map = {};
    records.forEach((rec) => {
      if (!map[rec.date]) {
        map[rec.date] = [];
      }
      map[rec.date].push(rec);
    });
    return map;
  }, [records]);

  // Filtered and Sorted Records
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Search filter: query across title, doctor, hospital, diagnosis, notes, and medication names
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitle = rec.title?.toLowerCase().includes(q);
          const matchDoc = rec.doctor?.toLowerCase().includes(q);
          const matchHosp = rec.hospital?.toLowerCase().includes(q);
          const matchDiag = rec.diagnosis?.toLowerCase().includes(q);
          const matchNotes = rec.notes?.toLowerCase().includes(q);
          const matchMeds = rec.medications?.some((m) => m.name.toLowerCase().includes(q));
          const matchTags = rec.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDoc && !matchHosp && !matchDiag && !matchNotes && !matchMeds && !matchTags) {
            return false;
          }
        }

        // Type filter
        if (selectedTypeFilter !== 'ALL' && rec.type !== selectedTypeFilter) {
          return false;
        }

        // Risk filter
        if (selectedRiskFilter !== 'ALL' && rec.risk !== selectedRiskFilter) {
          return false;
        }

        // Calendar date click filter
        if (selectedCalendarDate && rec.date !== selectedCalendarDate) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'risk') {
          const weight = { RED: 3, AMBER: 2, GREEN: 1 };
          return (weight[b.risk] || 0) - (weight[a.risk] || 0);
        }
        return 0;
      });
  }, [records, searchTerm, selectedTypeFilter, selectedRiskFilter, sortBy, selectedCalendarDate]);

  // Calendar Helpers
  const year = currentCalendarMonth.getFullYear();
  const month = currentCalendarMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentCalendarMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarMonth(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Add Record Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
            Medical Records & Longitudinal Timeline
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Unified record vault across all clinics, hospitals, pharmacies, and pathology labs
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ padding: '10px 18px' }}
        >
          <Plus size={16} />
          <span>Add Record (Manual / OCR)</span>
        </button>
      </div>

      {/* Search & Filters Control Bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search records by diagnosis, doctor, medicine (e.g. Telmisartan), hospital..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Type Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['ALL', 'Prescription', 'Lab Report', 'Scan', 'Discharge Summary', 'Pharmacy Bill'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTypeFilter(t)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: selectedTypeFilter === t ? '#0284c7' : '#e2e8f0',
                  background: selectedTypeFilter === t ? '#f0f9ff' : '#ffffff',
                  color: selectedTypeFilter === t ? '#0284c7' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: selectedTypeFilter === t ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {t === 'ALL' ? 'All Formats' : t}
              </button>
            ))}
          </div>

          {/* Risk Level Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Risk:</span>
            <select
              className="form-select"
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8rem' }}
            >
              <option value="ALL">All Risks</option>
              <option value="RED">🔴 High Risk</option>
              <option value="AMBER">🟡 Moderate Risk</option>
              <option value="GREEN">🟢 Routine</option>
            </select>
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Sort:</span>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8rem' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="risk">High Risk First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Timeline + Right Calendar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Chronological Timeline */}
        <div>
          {/* Active calendar date filter indicator */}
          {selectedCalendarDate && (
            <div style={{
              padding: '10px 16px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '10px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CalendarIcon size={16} />
                <span>Showing records for date: <strong>{selectedCalendarDate}</strong></span>
              </div>
              <button
                onClick={() => setSelectedCalendarDate(null)}
                style={{
                  background: 'white',
                  border: '1px solid #bae6fd',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#0284c7',
                  cursor: 'pointer'
                }}
              >
                Clear Date Filter
              </button>
            </div>
          )}

          {filteredRecords.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <FileText size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                No records matching your filter
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>
                Try adjusting your search terms or clearing the date/type filters
              </p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedTypeFilter('ALL'); setSelectedRiskFilter('ALL'); setSelectedCalendarDate(null); }}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '16px' }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredRecords.map((rec) => {
                const isRed = rec.risk === 'RED';
                const isAmber = rec.risk === 'AMBER';

                return (
                  <div
                    key={rec.id}
                    className="card"
                    style={{
                      padding: '20px',
                      borderLeft: `6px solid ${isRed ? 'var(--risk-red)' : isAmber ? 'var(--risk-amber)' : 'var(--risk-green)'}`,
                      position: 'relative'
                    }}
                  >
                    {/* Top Row: Type, Date & Risk Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${rec.type === 'Prescription' ? 'badge-primary' : rec.type === 'Lab Report' ? 'badge-amber' : 'badge-green'}`}>
                          {rec.type}
                        </span>
                        <span className={`badge ${isRed ? 'badge-red' : isAmber ? 'badge-amber' : 'badge-green'}`}>
                          {rec.risk === 'RED' ? '🔴 High Risk' : rec.risk === 'AMBER' ? '🟡 Moderate' : '🟢 Routine'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                          {rec.id}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                        <CalendarIcon size={14} />
                        <strong>{rec.date}</strong>
                      </div>
                    </div>

                    {/* Title & Organization */}
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                      {rec.title}
                    </h3>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.8rem', color: '#475569', marginBottom: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={14} color="#0284c7" />
                        <strong>{rec.hospital}</strong>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Stethoscope size={14} color="#0284c7" />
                        {rec.doctor}
                      </span>
                    </div>

                    {/* Diagnosis & Clinical Summary */}
                    {rec.diagnosis && (
                      <div style={{
                        padding: '10px 14px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.825rem',
                        marginBottom: '12px'
                      }}>
                        <strong style={{ color: '#0f172a' }}>Diagnosis / Indication:</strong> {rec.diagnosis}
                        {rec.riskReason && (
                          <div style={{ marginTop: '4px', color: isRed ? '#9f1239' : isAmber ? '#92400e' : '#065f46', fontWeight: 500 }}>
                            <em>Assessment: {rec.riskReason}</em>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Prescribed Tablets Preview if present */}
                    {rec.medications && rec.medications.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                          Prescribed Tablets ({rec.medications.length}):
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {rec.medications.map((m, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                background: '#f1f5f9',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                color: '#0f172a',
                                border: '1px solid #e2e8f0'
                              }}
                            >
                              <Pill size={12} color="#0284c7" />
                              <strong>{m.name}</strong> ({m.dosage}) • {m.frequency}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lab Results Preview if present */}
                    {rec.labResults && rec.labResults.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                          Key Lab Test Values:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                          {rec.labResults.slice(0, 4).map((test, idx) => (
                            <div key={idx} style={{ padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                              <span style={{ color: '#475569' }}>{test.test}: </span>
                              <strong style={{ color: test.status === 'High' ? '#e11d48' : '#0f172a' }}>{test.result}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Bar: Details & Emergency toggle */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '12px',
                      marginTop: '6px',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Emergency Profile toggle */}
                        <button
                          onClick={() => toggleEmergencyRecord(rec.id)}
                          style={{
                            background: rec.isEmergencyVisible ? '#fff1f2' : '#f8fafc',
                            border: '1px solid',
                            borderColor: rec.isEmergencyVisible ? '#fecdd3' : '#e2e8f0',
                            color: rec.isEmergencyVisible ? '#e11d48' : '#64748b',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <ShieldAlert size={14} />
                          <span>{rec.isEmergencyVisible ? 'Visible on Emergency Profile' : 'Add to Emergency Profile'}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedRecordDetail(rec)}
                        className="btn btn-secondary btn-sm"
                      >
                        <FileText size={14} />
                        <span>Inspect Full Document</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Colored Medical Calendar */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div className="card" style={{ padding: '20px' }}>
            {/* Calendar Header with Month Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={18} color="#0284c7" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  {monthNames[month]} {year}
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={handlePrevMonth}
                  style={{
                    padding: '4px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex'
                  }}
                >
                  <ChevronLeft size={16} color="#64748b" />
                </button>
                <button
                  onClick={handleNextMonth}
                  style={{
                    padding: '4px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex'
                  }}
                >
                  <ChevronRight size={16} color="#64748b" />
                </button>
              </div>
            </div>

            {/* Day Names Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {/* Empty leading days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} style={{ height: '36px' }} />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const formattedDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayRecords = recordsByDate[formattedDay] || [];
                const hasRed = dayRecords.some((r) => r.risk === 'RED');
                const hasAmber = dayRecords.some((r) => r.risk === 'AMBER');
                const hasGreen = dayRecords.some((r) => r.risk === 'GREEN');
                const isSelected = selectedCalendarDate === formattedDay;

                return (
                  <button
                    key={dayNum}
                    onClick={() => {
                      if (dayRecords.length > 0) {
                        setSelectedCalendarDate(isSelected ? null : formattedDay);
                      }
                    }}
                    style={{
                      height: '36px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #0284c7' : '1px solid transparent',
                      background: isSelected ? '#e0f2fe' : dayRecords.length > 0 ? '#f8fafc' : 'transparent',
                      cursor: dayRecords.length > 0 ? 'pointer' : 'default',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      fontSize: '0.8rem',
                      fontWeight: dayRecords.length > 0 ? 700 : 400,
                      color: dayRecords.length > 0 ? '#0f172a' : '#94a3b8',
                      transition: 'all 0.15s ease'
                    }}
                    title={dayRecords.length > 0 ? `${dayRecords.length} record(s) on ${formattedDay}` : ''}
                  >
                    <span>{dayNum}</span>

                    {/* Colored Risk Dots below day number */}
                    {dayRecords.length > 0 && (
                      <div style={{ display: 'flex', gap: '2px', position: 'absolute', bottom: '3px' }}>
                        {hasRed && (
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--risk-red)' }} />
                        )}
                        {hasAmber && (
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--risk-amber)' }} />
                        )}
                        {hasGreen && (
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--risk-green)' }} />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
              fontSize: '0.72rem',
              color: '#64748b',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: '2px' }}>
                Color-Based Calendar Marking:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--risk-red)', display: 'inline-block' }} />
                <span><strong>Red:</strong> High Clinical Risk / ER / Surgery</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--risk-amber)', display: 'inline-block' }} />
                <span><strong>Amber:</strong> Lab Tests / Glycemic / BP Review</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--risk-green)', display: 'inline-block' }} />
                <span><strong>Green:</strong> Pharmacy Refill / Routine Clear</span>
              </div>
            </div>

            {/* Quick helper tip */}
            <div style={{
              marginTop: '14px',
              padding: '10px 12px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.72rem',
              color: '#64748b'
            }}>
              💡 <em>Click any highlighted day on the calendar to instantly isolate that date's health records.</em>
            </div>
          </div>
        </div>
      </div>

      {/* Record Full Inspection Modal */}
      {selectedRecordDetail && (
        <div className="modal-overlay" onClick={() => setSelectedRecordDetail(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                  <span className={`badge ${selectedRecordDetail.risk === 'RED' ? 'badge-red' : selectedRecordDetail.risk === 'AMBER' ? 'badge-amber' : 'badge-green'}`}>
                    {selectedRecordDetail.risk} RISK
                  </span>
                  <span className="badge badge-primary">
                    {selectedRecordDetail.type}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                    {selectedRecordDetail.id}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                  {selectedRecordDetail.title}
                </h2>
              </div>
              <button onClick={() => setSelectedRecordDetail(null)} className="btn btn-sm btn-secondary">
                <X size={16} />
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              padding: '14px',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '0.825rem',
              marginBottom: '18px'
            }}>
              <div>
                <span style={{ color: '#64748b' }}>Hospital: </span>
                <strong>{selectedRecordDetail.hospital}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Date: </span>
                <strong>{selectedRecordDetail.date}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Doctor / Specialist: </span>
                <strong>{selectedRecordDetail.doctor}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Department: </span>
                <strong>{selectedRecordDetail.department || 'Outpatient'}</strong>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Primary Diagnosis & Clinical Rationale
              </div>
              <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>
                {selectedRecordDetail.diagnosis}
              </div>
              <p style={{ fontSize: '0.825rem', color: '#475569', marginTop: '4px' }}>
                {selectedRecordDetail.riskReason}
              </p>
            </div>

            {selectedRecordDetail.medications?.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Prescribed Regimens ({selectedRecordDetail.medications.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedRecordDetail.medications.map((m, idx) => (
                    <div key={idx} style={{ padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.825rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{m.name}</strong> • <span style={{ color: '#0284c7' }}>{m.dosage}</span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.instructions}</div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#475569' }}>
                        <div>{m.frequency}</div>
                        <div>Duration: {m.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedRecordDetail.notes && (
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>
                <strong>Doctor Notes:</strong> {selectedRecordDetail.notes}
              </div>
            )}

            {/* AI Report Explainer result */}
            {aiResult && (
              <div style={{
                marginTop: '16px',
                padding: '14px 16px',
                background: '#f0f9ff',
                borderRadius: '10px',
                border: '1px solid #bae6fd',
                fontSize: '0.85rem',
                color: '#0f172a',
                maxHeight: '320px',
                overflowY: 'auto'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> AI Report Explainer
                </div>
                <MarkdownView content={aiResult} />
              </div>
            )}
            {aiError && (
              <div style={{ marginTop: '14px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '0.8rem', color: '#b91c1c' }}>
                ⚠️ {aiError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={explainRecordWithAI}
                disabled={aiLoading}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#a5b4fc', color: '#4338ca', background: '#eef2ff' }}
              >
                <Sparkles size={14} />
                <span>{aiLoading ? 'Explaining…' : 'Explain with AI'}</span>
              </button>
              <button
                onClick={() => {
                  toggleEmergencyRecord(selectedRecordDetail.id);
                  setSelectedRecordDetail({ ...selectedRecordDetail, isEmergencyVisible: !selectedRecordDetail.isEmergencyVisible });
                }}
                className="btn btn-secondary btn-sm"
              >
                <ShieldAlert size={14} color={selectedRecordDetail.isEmergencyVisible ? '#e11d48' : '#64748b'} />
                <span>{selectedRecordDetail.isEmergencyVisible ? 'Remove from Emergency View' : 'Add to Emergency View'}</span>
              </button>
              <button onClick={() => setSelectedRecordDetail(null)} className="btn btn-primary btn-sm">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {showAddModal && <AddRecordModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
