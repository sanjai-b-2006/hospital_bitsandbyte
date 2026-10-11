import React, { useState, useEffect } from 'react';
import { useDoctor } from '../../context/DoctorContext';
import { 
  Users, 
  Search, 
  ChevronRight, 
  Calendar, 
  FileText, 
  Pill, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowLeft,
  Filter,
  Activity,
  UserCheck,
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function DoctorPatients({ initialPatientId }) {
  const { doctor, patients, fetchPatients } = useDoctor();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || null);
  const [patientData, setPatientData] = useState(null);
  const [records, setRecords] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Calendar State for detailed view
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // Sept 2026
  const [selectedDateFilter, setSelectedDateFilter] = useState(null);

  // If initialPatientId was passed, auto-select it
  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId]);

  // Load detailed patient records & profile when a patient is selected
  useEffect(() => {
    if (!selectedPatientId) {
      setPatientData(null);
      setRecords([]);
      return;
    }

    const loadDetails = async () => {
      setLoadingDetails(true);
      try {
        // 1. Fetch patient basic profile
        const pRes = await fetch(`${API_BASE_URL}/patients/${selectedPatientId}`);
        if (pRes.ok) {
          setPatientData(await pRes.json());
        }
        // 2. Fetch all patient longitudinal records
        const rRes = await fetch(`${API_BASE_URL}/records?patientId=${selectedPatientId}`);
        if (rRes.ok) {
          const recs = await rRes.json();
          setRecords(recs);

          // Focus calendar on latest record's month
          if (recs.length > 0) {
            const latestDate = new Date(recs[0].date);
            if (!isNaN(latestDate.getTime())) {
              setCurrentDate(new Date(latestDate.getFullYear(), latestDate.getMonth(), 1));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching patient detailed records:', err);
      } finally {
        setLoadingDetails(false);
      }
    };

    loadDetails();
  }, [selectedPatientId]);

  const filteredPatients = patients.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.phone?.includes(q) || p.id?.toLowerCase().includes(q);
  });

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create lookup of records by date
  const recordsByDate = {};
  records.forEach((r) => {
    if (!r.date) return;
    const dateStr = r.date; // 'YYYY-MM-DD'
    if (!recordsByDate[dateStr]) recordsByDate[dateStr] = [];
    recordsByDate[dateStr].push(r);
  });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Records to display (filtered by calendar date if clicked)
  const displayedRecords = selectedDateFilter
    ? records.filter((r) => r.date === selectedDateFilter)
    : records;

  // ========================================================
  // VIEW 1: PATIENTS DIRECTORY LIST
  // ========================================================
  if (!selectedPatientId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
              Accessible Patients Directory
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Patients with active hospital consultation tokens or consent grants accessible to Dr. {doctor.name}.
            </p>
          </div>

          <button onClick={fetchPatients} className="btn btn-secondary btn-sm">
            Refresh Directory
          </button>
        </div>

        {/* Directory Card */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search patient name, phone, or UID..."
                className="form-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
              />
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Showing {filteredPatients.length} accessible patients
            </span>
          </div>

          {filteredPatients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <Users size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>No patients found</h3>
              <p style={{ fontSize: '0.8rem' }}>Patients assigned to you during clinic check-ins will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredPatients.map((p) => {
                const hasAllergies = p.allergies && p.allergies.length > 0;
                const hasCritical = p.criticalConditions && p.criticalConditions.length > 0;

                return (
                  <div
                    key={p.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            {p.name}
                          </h3>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                            UID: <code style={{ fontFamily: 'var(--font-mono)' }}>{p.id}</code>
                          </div>
                        </div>

                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          background: '#fee2e2',
                          color: '#dc2626',
                          borderRadius: '6px'
                        }}>
                          {p.bloodGroup || 'O+'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '12px', display: 'flex', gap: '12px' }}>
                        <span>Age: <strong>{p.age}</strong></span>
                        <span>Gender: <strong>{p.gender}</strong></span>
                        <span>Mobile: <strong>{p.phone}</strong></span>
                      </div>

                      {/* Alert pills */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {hasCritical && (
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#fee2e2', color: '#b91c1c', borderRadius: '4px', fontWeight: 700 }}>
                            ⚠️ Chronic Alert
                          </span>
                        )}
                        {hasAllergies && (
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#fef3c7', color: '#b45309', borderRadius: '4px', fontWeight: 700 }}>
                            Allergies Recorded
                          </span>
                        )}
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#f1f5f9', color: '#475569', borderRadius: '4px' }}>
                          Last Visit: {p.lastVisitDate || 'Today'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPatientId(p.id)}
                      className="btn btn-primary btn-sm"
                      style={{
                        width: '100%',
                        background: '#0d9488',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px'
                      }}
                    >
                      <span>View Detailed Records & Calendar</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 2: DETAILED PAGE (RECORDS ON LEFT, CALENDAR ON RIGHT)
  // ========================================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <button
          onClick={() => { setSelectedPatientId(null); setSelectedDateFilter(null); }}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={15} />
          <span>Back to Patients Directory</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Attending Clinician: <strong>{doctor.name}</strong> ({doctor.specialization.split('&')[0].trim()})
          </span>
        </div>
      </div>

      {/* Patient Profile Bar */}
      {patientData && (
        <div className="card" style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#ccfbf1', fontWeight: 700 }}>
                Patient Medical Timeline Dossier
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', margin: '2px 0 6px' }}>
                {patientData.name}
              </h2>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.82rem', color: '#e6fffa', flexWrap: 'wrap' }}>
                <span>UID: <code style={{ fontFamily: 'var(--font-mono)' }}>{patientData.id}</code></span>
                <span>Mobile: <strong>{patientData.phone}</strong></span>
                <span>Age: <strong>{patientData.age}</strong> ({patientData.gender})</span>
                <span>Blood Group: <strong style={{ color: '#fed7aa' }}>{patientData.bloodGroup}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 14px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#ccfbf1', textTransform: 'uppercase' }}>Records</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{records.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2-COLUMN SPLIT: LEFT = RECORDS LIST, RIGHT = INTERACTIVE CALENDAR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: LONGITUDINAL RECORDS */}
        {/* ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Clinical Records
                </h3>
                {selectedDateFilter ? (
                  <div style={{ fontSize: '0.78rem', color: '#0d9488', fontWeight: 700, marginTop: '2px' }}>
                    Filtered by Date: {selectedDateFilter} ({displayedRecords.length} found)
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    Showing all chronological records ({displayedRecords.length})
                  </div>
                )}
              </div>

              {selectedDateFilter && (
                <button
                  onClick={() => setSelectedDateFilter(null)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                >
                  Clear Date Filter
                </button>
              )}
            </div>

            {loadingDetails ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b' }}>
                Loading records from PostgreSQL vault...
              </div>
            ) : displayedRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748b' }}>
                <FileText size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700 }}>No records found for this date</div>
                <p style={{ fontSize: '0.8rem' }}>Click another calendar date with markings or clear filter.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                {displayedRecords.map((rec) => {
                  const isRed = rec.risk === 'RED';
                  const isAmber = rec.risk === 'AMBER';
                  const isConsultedByThisDoctor = rec.doctor?.toLowerCase().includes(doctor.name?.toLowerCase().replace('dr. ', '')) ||
                                                  rec.doctor?.toLowerCase().includes('kulkarni');

                  return (
                    <div
                      key={rec.id}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: isRed ? '1px solid #fca5a5' : (isAmber ? '1px solid #fde68a' : '1px solid #e2e8f0'),
                        background: isRed ? '#fff5f5' : (isAmber ? '#fffdf0' : '#ffffff'),
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                              {rec.title}
                            </h4>

                            {/* Risk Badge */}
                            <span style={{
                              fontSize: '0.68rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              background: isRed ? '#fee2e2' : (isAmber ? '#fef3c7' : '#dcfce7'),
                              color: isRed ? '#b91c1c' : (isAmber ? '#b45309' : '#15803d')
                            }}>
                              {rec.risk} RISK
                            </span>

                            {/* Marking if visited this doctor */}
                            {isConsultedByThisDoctor && (
                              <span style={{
                                fontSize: '0.68rem',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                background: '#ccfbf1',
                                color: '#0f766e',
                                border: '1px solid #99f6e4'
                              }}>
                                ★ Visited You
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                            Date: <strong>{rec.date}</strong> • Doctor: <strong>{rec.doctor}</strong> • Hospital: <strong>{rec.hospital}</strong>
                          </div>
                        </div>

                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px', fontWeight: 600 }}>
                          {rec.type}
                        </span>
                      </div>

                      {rec.diagnosis && (
                        <div style={{ fontSize: '0.82rem', color: '#1e293b', marginTop: '10px' }}>
                          <strong>Diagnosis: </strong> {rec.diagnosis}
                        </div>
                      )}

                      {rec.riskReason && (
                        <div style={{
                          fontSize: '0.8rem',
                          marginTop: '8px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: isRed ? '#fee2e2' : '#fef3c7',
                          color: isRed ? '#991b1b' : '#92400e',
                          fontWeight: 600
                        }}>
                          <strong>⚠️ Risk Advisory: </strong> {rec.riskReason}
                        </div>
                      )}

                      {/* Prescribed Medications */}
                      {rec.medications && rec.medications.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Prescribed Medications:
                          </div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {rec.medications.map((m, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '3px 8px',
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Pill size={11} color="#0d9488" />
                                <strong>{m.name}</strong> ({m.dosage})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {rec.notes && (
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '8px', fontStyle: 'italic' }}>
                          "{rec.notes}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: INTERACTIVE CALENDAR WITH MARKINGS */}
        {/* ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#0d9488" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Patient Visit Calendar
                </h3>
              </div>

              {/* Month Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={prevMonth} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                  ‹
                </button>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', minWidth: '130px', textAlign: 'center' }}>
                  {monthName}
                </span>
                <button onClick={nextMonth} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                  ›
                </button>
              </div>
            </div>

            {/* Calendar Legend */}
            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '8px 12px',
              background: '#f8fafc',
              borderRadius: '8px',
              marginBottom: '16px',
              flexWrap: 'wrap',
              fontSize: '0.72rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0d9488' }} />
                <span><strong>★ Visited This Doctor</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} />
                <span>🔴 Red Risk Visit</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706' }} />
                <span>🟡 Amber Risk Visit</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
                <span>🟢 Green Visit</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', padding: '6px 0' }}>
                  {d}
                </div>
              ))}

              {/* Empty leading days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} style={{ height: '46px' }} />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const formattedDay = day < 10 ? `0${day}` : `${day}`;
                const formattedMonth = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
                const dateKey = `${year}-${formattedMonth}-${formattedDay}`;

                const dayRecords = recordsByDate[dateKey] || [];
                const hasRecords = dayRecords.length > 0;
                const isSelected = selectedDateFilter === dateKey;

                // Check markings
                const hasRed = dayRecords.some((r) => r.risk === 'RED');
                const hasAmber = dayRecords.some((r) => r.risk === 'AMBER');
                const hasVisitedThisDoctor = dayRecords.some(
                  (r) => r.doctor?.toLowerCase().includes('kulkarni') || r.doctor?.toLowerCase().includes(doctor.name?.toLowerCase().replace('dr. ', ''))
                );

                return (
                  <div
                    key={day}
                    onClick={() => {
                      if (hasRecords) {
                        setSelectedDateFilter(isSelected ? null : dateKey);
                      }
                    }}
                    style={{
                      height: '46px',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.82rem',
                      fontWeight: hasRecords ? 800 : 500,
                      cursor: hasRecords ? 'pointer' : 'default',
                      background: isSelected
                        ? '#0d9488'
                        : hasVisitedThisDoctor
                        ? '#ccfbf1'
                        : hasRed
                        ? '#fee2e2'
                        : hasAmber
                        ? '#fef3c7'
                        : hasRecords
                        ? '#dcfce7'
                        : '#ffffff',
                      color: isSelected
                        ? 'white'
                        : hasVisitedThisDoctor
                        ? '#0f766e'
                        : hasRed
                        ? '#b91c1c'
                        : hasAmber
                        ? '#b45309'
                        : '#1e293b',
                      border: isSelected
                        ? '2px solid #0f766e'
                        : hasVisitedThisDoctor
                        ? '2px solid #0d9488'
                        : hasRecords
                        ? '1px solid #cbd5e1'
                        : '1px solid #f1f5f9',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    <span>{day}</span>

                    {/* Marking Dots & Icons */}
                    {hasRecords && (
                      <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                        {hasVisitedThisDoctor && (
                          <span style={{ fontSize: '0.62rem', lineHeight: 1 }} title="Visited this doctor">
                            ★
                          </span>
                        )}
                        <span
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: isSelected
                              ? '#ffffff'
                              : hasRed
                              ? '#dc2626'
                              : hasAmber
                              ? '#d97706'
                              : '#16a34a'
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '16px', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
              💡 Click any highlighted date to filter clinical records on the left panel.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
