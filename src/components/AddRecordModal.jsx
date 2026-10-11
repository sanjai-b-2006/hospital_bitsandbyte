import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2,
  Scan,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import MarkdownView from './MarkdownView';
import { API_BASE_URL } from '../config';

export default function AddRecordModal({ onClose, defaultMode = 'manual' }) {
  const { addRecord, simulateOCRProcess, activeProfileId, patient } = useHealth();
  const profileId = activeProfileId || patient?.id || 'PAT-IND-884210';
  const [mode, setMode] = useState(defaultMode); // 'manual' or 'ocr'

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Prescription');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hospital, setHospital] = useState('');
  const [doctor, setDoctor] = useState('');
  const [risk, setRisk] = useState('GREEN');
  const [riskReason, setRiskReason] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [isEmergencyVisible, setIsEmergencyVisible] = useState(false);

  // Medications list for manual entry
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);

  // OCR Processing State
  const [isScanning, setIsScanning] = useState(false);
  const [ocrCompleted, setOcrCompleted] = useState(false);
  const [ocrConfidence, setOcrConfidence] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleAddMedicationRow = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const handleRemoveMedicationRow = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  // Simulated OCR Trigger
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsScanning(true);
    setOcrCompleted(false);

    try {
      const extracted = await simulateOCRProcess(file);
      setTitle(extracted.title);
      setType(extracted.type);
      setDate(extracted.date);
      setHospital(extracted.hospital);
      setDoctor(extracted.doctor);
      setRisk(extracted.risk);
      setRiskReason(extracted.riskReason);
      setDiagnosis(extracted.diagnosis);
      setNotes(extracted.extractedText);
      setOcrConfidence(extracted.confidence);
      
      if (extracted.medications) {
        setMedications(extracted.medications);
      }
      setOcrCompleted(true);
      // Switch back to review/manual mode so user can verify
      setMode('manual');
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  // Demo file trigger
  const handleSampleOCR = async (sampleType) => {
    setFileName(sampleType === 'lab' ? 'Blood_Biochemistry_Panel_Report.pdf' : 'Dr_Shenoy_Clinic_Prescription.jpg');
    setIsScanning(true);
    setOcrCompleted(false);

    const mockFile = { name: sampleType === 'lab' ? 'lab_report.pdf' : 'prescription.jpg' };
    const extracted = await simulateOCRProcess(mockFile);

    setTitle(extracted.title);
    setType(extracted.type);
    setDate(extracted.date);
    setHospital(extracted.hospital);
    setDoctor(extracted.doctor);
    setRisk(extracted.risk);
    setRiskReason(extracted.riskReason);
    setDiagnosis(extracted.diagnosis);
    setNotes(extracted.extractedText);
    setOcrConfidence(extracted.confidence);

    if (extracted.medications) {
      setMedications(extracted.medications);
    }
    setOcrCompleted(true);
    setIsScanning(false);
    setMode('manual');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) {
      alert('Please enter a record title');
      return;
    }

    const filteredMeds = medications.filter(m => m.name.trim() !== '');

    addRecord({
      title,
      type,
      date,
      hospital: hospital || 'Self-Uploaded Record',
      doctor: doctor || 'Consulting Physician',
      risk,
      riskReason: riskReason || (risk === 'RED' ? 'High risk medication or condition noted.' : 'Standard clinical documentation.'),
      diagnosis: diagnosis || 'General Health Consultation',
      notes,
      medications: filteredMeds,
      isEmergencyVisible,
    });

    onClose();
  };

  // AI Drug–Allergy / Interaction Safety Check
  const [safetyLoading, setSafetyLoading] = useState(false);
  const [safetyResult, setSafetyResult] = useState('');
  const [safetyError, setSafetyError] = useState('');

  const checkMedicationSafety = async () => {
    if (safetyLoading) return;

    const filteredMeds = medications.filter(m => m.name.trim() !== '');
    if (filteredMeds.length === 0) {
      setSafetyError('Add at least one medication to check (or the AI will review your current meds only).');
      setSafetyResult('');
      return;
    }

    setSafetyLoading(true);
    setSafetyResult('');
    setSafetyError('');

    try {
      const res = await fetch(`${API_BASE_URL}/ai/check-medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: profileId,
          newMedications: filteredMeds.map((m) => ({ name: m.name, dosage: m.dosage, frequency: m.frequency })),
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(`Server answered with non-JSON (HTTP ${res.status}).`);
      }

      if (data.success) {
        setSafetyResult(data.content);
      } else {
        setSafetyError(data.error || 'Safety check failed.');
      }
    } catch (err) {
      setSafetyError(err.message);
    } finally {
      setSafetyLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '720px' }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Add Medical Record
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Upload via AI Optical Character Recognition (OCR) or enter details manually
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab switch between Manual and OCR */}
        <div style={{ 
          padding: '12px 24px 0 24px', 
          display: 'flex', 
          gap: '8px',
          background: '#f8fafc',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => setMode('manual')}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              borderBottom: mode === 'manual' ? '2px solid #0284c7' : '2px solid transparent',
              color: mode === 'manual' ? '#0284c7' : '#64748b',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={16} />
            <span>Record Details {ocrCompleted && '(Extracted from OCR)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('ocr')}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              borderBottom: mode === 'ocr' ? '2px solid #0284c7' : '2px solid transparent',
              color: mode === 'ocr' ? '#0284c7' : '#64748b',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Scan size={16} />
            <span>OCR Document Scanner</span>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontWeight: 700 }}>
              AI Powered
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* OCR Mode */}
          {mode === 'ocr' && (
            <div>
              {/* Drag & Drop File Zone */}
              <div 
                style={{
                  border: '2px dashed #93c5fd',
                  borderRadius: '16px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: '#f0f9ff',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                
                {isScanning ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      border: '4px solid #bae6fd',
                      borderTopColor: '#0284c7',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0369a1' }}>
                      Scanning document with Medical OCR...
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Recognizing doctor handwriting, medications, doses, and clinical risk flags
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      background: '#e0f2fe',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 14px'
                    }}>
                      <UploadCloud size={28} />
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                      Upload Prescription or Lab Report (Image / PDF)
                    </h4>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>
                      Drag and drop here, or browse files from your computer or phone
                    </p>
                  </div>
                )}
              </div>

              {/* Sample Document quick buttons for easy testing */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Quick OCR Test Samples:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleSampleOCR('rx')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', justifyContent: 'flex-start' }}
                  >
                    <Sparkles size={14} color="#0284c7" />
                    <span>Try Sample: Clinical Rx (Dr. Shenoy)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSampleOCR('lab')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', justifyContent: 'flex-start' }}
                  >
                    <Sparkles size={14} color="#0284c7" />
                    <span>Try Sample: Lab Report (Biochemistry)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Manual Entry or OCR Review Mode */}
          {mode === 'manual' && (
            <form onSubmit={handleSubmit}>
              {ocrCompleted && (
                <div style={{
                  padding: '12px 16px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={20} color="#059669" />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46' }}>
                        OCR Recognition Complete ({ocrConfidence}% Confidence)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                        Extracted from {fileName}. Please review and adjust the fields below before saving.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMode('ocr')}
                    className="btn btn-sm btn-secondary"
                  >
                    Rescan
                  </button>
                </div>
              )}

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Record Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cardiology OPD Follow-Up & ECG"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Record Type *</label>
                  <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="Prescription">Prescription</option>
                    <option value="Lab Report">Lab Report</option>
                    <option value="Scan">Scan / Imaging (X-Ray, MRI, CT)</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Pharmacy Bill">Pharmacy Bill / Refill</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Date of Consultation / Test *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Risk Categorization *</label>
                  <select
                    className="form-select"
                    value={risk}
                    onChange={(e) => setRisk(e.target.value)}
                    style={{
                      borderColor: risk === 'RED' ? '#f87171' : risk === 'AMBER' ? '#fcd34d' : '#86efac'
                    }}
                  >
                    <option value="GREEN">🟢 Green (Routine / Stable)</option>
                    <option value="AMBER">🟡 Amber (Moderate / Needs Follow-up)</option>
                    <option value="RED">🔴 Red (High Risk / Critical Contraindication)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Hospital / Clinic / Diagnostic Center</label>
                  <input
                    type="text"
                    placeholder="e.g. Apollo Hospital, Bengaluru"
                    className="form-input"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Doctor / Pathologist Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rajesh Kulkarni"
                    className="form-input"
                    value={doctor}
                    onChange={(e) => setDoctor(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Diagnosis / Key Findings</label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension Stage II, Post-PTCA follow-up"
                  className="form-input"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              {risk !== 'GREEN' && (
                <div className="form-group">
                  <label className="form-label" style={{ color: risk === 'RED' ? '#e11d48' : '#d97706' }}>
                    Clinical Risk Note / Reason for Alert
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Patient on blood thinners. Stent placed 2024."
                    className="form-input"
                    value={riskReason}
                    onChange={(e) => setRiskReason(e.target.value)}
                  />
                </div>
              )}

              {/* Prescribed Tablets / Medicines Section */}
              {type === 'Prescription' && (
                <div style={{ marginTop: '14px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Medications Prescribed ({medications.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddMedicationRow}
                      className="btn btn-sm btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    >
                      <Plus size={14} /> Add Medicine
                    </button>
                  </div>

                  {medications.map((med, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '2fr 1fr 1fr 1fr auto', 
                        gap: '8px', 
                        marginBottom: '8px',
                        alignItems: 'center'
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Medicine Name (e.g. Telmisartan 40mg)"
                        className="form-input"
                        value={med.name}
                        onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                        style={{ fontSize: '0.825rem' }}
                      />
                      <input
                        type="text"
                        placeholder="Dosage (1 Tab)"
                        className="form-input"
                        value={med.dosage}
                        onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                        style={{ fontSize: '0.825rem' }}
                      />
                      <input
                        type="text"
                        placeholder="Frequency (Daily)"
                        className="form-input"
                        value={med.frequency}
                        onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                        style={{ fontSize: '0.825rem' }}
                      />
                      <input
                        type="text"
                        placeholder="Duration (30d)"
                        className="form-input"
                        value={med.duration}
                        onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                        style={{ fontSize: '0.825rem' }}
                      />
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicationRow(idx)}
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            color: '#ef4444',
                            borderRadius: '6px',
                            padding: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Notes / Transcription */}
              <div className="form-group">
                <label className="form-label">Clinical Notes / Doctor Advice</label>
                <textarea
                  rows={3}
                  placeholder="Doctor's notes, dietary instructions, or lab values summary..."
                  className="form-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Emergency Profile Visibility Checkbox */}
              <div style={{
                margin: '16px 0',
                padding: '12px',
                background: '#fff1f2',
                borderRadius: '8px',
                border: '1px solid #fecdd3',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <input
                  type="checkbox"
                  id="emergency-check"
                  checked={isEmergencyVisible}
                  onChange={(e) => setIsEmergencyVisible(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#e11d48', cursor: 'pointer' }}
                />
                <label htmlFor="emergency-check" style={{ fontSize: '0.825rem', color: '#9f1239', cursor: 'pointer', fontWeight: 600 }}>
                  Show this record prominently on my Emergency Break-Glass Profile
                </label>
              </div>

              {/* AI Medication Safety Check */}
              <div style={{
                margin: '16px 0',
                padding: '14px',
                background: '#eef2ff',
                borderRadius: '10px',
                border: '1px solid #c7d2fe'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.825rem', color: '#3730a3', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={16} />
                    <span>AI Drug–Allergy & Interaction Check</span>
                  </div>
                  <button
                    type="button"
                    onClick={checkMedicationSafety}
                    disabled={safetyLoading}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: safetyLoading ? '#c7d2fe' : '#4f46e5',
                      color: 'white',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: safetyLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Sparkles size={14} />
                    {safetyLoading ? 'Checking…' : 'Run Safety Check'}
                  </button>
                </div>

                {safetyResult && (
                  <div style={{ marginTop: '12px', padding: '12px', background: 'white', borderRadius: '8px', fontSize: '0.8rem', maxHeight: '300px', overflowY: 'auto' }}>
                    <MarkdownView content={safetyResult} />
                  </div>
                )}
                {safetyError && (
                  <div style={{ marginTop: '10px', padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '0.78rem', color: '#b91c1c' }}>
                    ⚠️ {safetyError}
                  </div>
                )}
                <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#6366f1', opacity: 0.8 }}>
                  Checks the medications above against your allergies and current prescriptions.
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  <span>Save to Health Timeline</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
