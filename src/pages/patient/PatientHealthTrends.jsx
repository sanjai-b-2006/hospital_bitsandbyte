import React, { useState, useEffect, useCallback } from 'react';
import { useHealth } from '../../context/HealthContext';
import { API_BASE_URL } from '../../config';
import {
  TrendingUp,
  Activity,
  FlaskConical,
  AlertTriangle,
  RefreshCw,
  LineChart as LineIcon,
  Baby,
  User,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function PatientHealthTrends() {
  const { patient, activeProfileId, isViewingDependent } = useHealth();
  const profileId = activeProfileId || patient?.id || 'PAT-IND-884210';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/patient-trends?patientId=${encodeURIComponent(profileId)}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || 'Failed to load trends.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    load();
  }, [load]);

  const profileName = patient?.name || (isViewingDependent ? patient?.name : 'this profile');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={22} color="#0284c7" />
            Health Trends
          </h2>
          <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isViewingDependent
              ? <><Baby size={14} color="#16a34a" /> Viewing trends for dependent <strong>{profileName}</strong></>
              : <><User size={14} color="#0284c7" /> Longitudinal lab trends for <strong>{profileName}</strong></>}
            {' · numeric lab results over time'}
          </div>
        </div>
        <button
          onClick={load}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', fontSize: '0.8rem', color: '#b91c1c' }}>
          ⚠️ {error}
        </div>
      )}

      {loading && !data && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b', fontSize: '0.9rem' }}>
          <Activity size={34} style={{ margin: '0 auto 12px', color: '#0284c7' }} />
          Building trend lines from your records…
        </div>
      )}

      {!loading && data && data.tests.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <LineIcon size={40} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            No trend lines yet
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '480px', margin: '0 auto' }}>
            Health trends are drawn from numeric lab results inside your medical records.
            Add a record containing a lab report (e.g. a metabolic panel) and come back here —
            the same test measured twice over time automatically becomes a trend line.
          </div>
        </div>
      )}

      {data && data.tests.length > 0 && (
        <>
          {/* Summary strip */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: '14px 18px', flex: '1 1 200px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tracked Tests</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{data.tests.length}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>with ≥2 readings</div>
            </div>
            <div className="card" style={{ padding: '14px 18px', flex: '1 1 200px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Latest Abnormal
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>
                {data.tests.reduce((sum, t) => sum + (t.points[t.points.length - 1]?.abnormal ? 1 : 0), 0)}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>of {data.tests.length} in most recent reading</div>
            </div>
            <div className="card" style={{ padding: '14px 18px', flex: '1 1 200px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Records Scanned</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{data.totalRecords}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>medical records analysed</div>
            </div>
          </div>

          {/* Trend cards */}
          {data.tests.map((test) => {
            const points = test.points;
            const first = points[0];
            const last = points[points.length - 1];
            const delta = Math.round((last.value - first.value) * 100) / 100;
            const chartData = points.map((p) => ({
              date: p.date,
              value: p.value,
              abnormalValue: p.abnormal ? p.value : null,
              status: p.status,
            }));
            return (
              <div key={test.test} className="card" style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(2,132,199,0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FlaskConical size={18} />
                    </span>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{test.test}</div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                        {test.unit ? `unit: ${test.unit}` : 'unitless'} · {points.length} readings
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '5px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700,
                      background: last.abnormal ? '#fef2f2' : '#f0fdf4',
                      color: last.abnormal ? '#dc2626' : '#16a34a',
                      border: `1px solid ${last.abnormal ? '#fecaca' : '#bbf7d0'}`
                    }}>
                      Latest: {last.value}{test.unit ? ` ${test.unit}` : ''} · {last.status}
                    </span>
                    <span style={{
                      padding: '5px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700,
                      background: '#f1f5f9', color: delta > 0 ? '#b45309' : (delta < 0 ? '#0f766e' : '#64748b')
                    }}>
                      {delta === 0 ? '→ Stable' : `${delta > 0 ? '↗ +' : '↘ '}${delta}${test.unit ? ` ${test.unit}` : ''}`}
                    </span>
                  </div>
                </div>

                <div style={{ height: '190px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} />
                      <Tooltip
                        labelStyle={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}
                        contentStyle={{ borderRadius: '10px', fontSize: '0.78rem' }}
                        formatter={(value, name) => [
                          `${value}${test.unit ? ` ${test.unit}` : ''}${name === 'Abnormal' ? ' ⚠️' : ''}`,
                          name,
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={test.test}
                        stroke="#0d9488"
                        strokeWidth={2.2}
                        dot={{ r: 4, fill: '#0d9488', stroke: '#fff', strokeWidth: 1.5 }}
                        connectNulls
                      />
                      <Line
                        type="monotone"
                        dataKey="abnormalValue"
                        name="Abnormal"
                        stroke="transparent"
                        dot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ marginTop: '10px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {points.map((p) => (
                    <span
                      key={p.date}
                      title={`${p.date}: ${p.value}${test.unit ? ` ${test.unit}` : ''} (${p.status})`}
                      style={{
                        padding: '3px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700,
                        background: p.abnormal ? '#fef2f2' : '#f8fafc',
                        color: p.abnormal ? '#dc2626' : '#64748b',
                        border: `1px solid ${p.abnormal ? '#fecaca' : '#e2e8f0'}`
                      }}
                    >
                      {p.date} · {p.value} {p.abnormal && <AlertTriangle size={11} style={{ verticalAlign: '-1px', marginLeft: '2px' }} />}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} color="#f59e0b" />
            Red dots mark values the lab flagged as High / Low. Trends need at least two readings of the same test.
            This view is informational — always discuss results with your doctor.
          </div>
        </>
      )}
    </div>
  );
}