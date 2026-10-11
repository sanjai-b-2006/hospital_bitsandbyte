import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { 
  Activity, 
  User, 
  Phone, 
  CreditCard, 
  Lock, 
  MapPin, 
  Heart, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  UploadCloud, 
  Scan, 
  FileText,
  Sparkles,
  Plus,
  Trash2
} from 'lucide-react';

export default function Register({ onSwitchToLogin }) {
  const { registerPatient, simulateOCRProcess } = useHealth();
  const [currentStep, setCurrentStep] = useState(1); // 1 = Personal Details, 2 = Optional Records Upload

  // Step 1 Form Data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    aadhaar: '',
    password: '',
    bloodGroup: 'O+',
    age: '',
    gender: 'Male',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    organDonor: true,
  });

  // Step 2 Optional Records
  const [uploadedRecords, setUploadedRecords] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrFileName, setOcrFileName] = useState('');

  // Manual record input in Step 2
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualType, setManualType] = useState('Prescription');
  const [manualDiagnosis, setManualDiagnosis] = useState('');

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAadhaarFormat = (val) => {
    // Format as 12 digits: 0000 0000 0000
    const raw = val.replace(/\D/g, '').slice(0, 12);
    const parts = raw.match(/.{1,4}/g);
    handleInputChange('aadhaar', parts ? parts.join(' ') : raw);
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.password) {
      alert('Please fill all mandatory fields (Name, Phone, Password).');
      return;
    }
    if (formData.phone.length < 10) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    setCurrentStep(2);
  };

  // OCR Processing in Step 2
  const handleOcrUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrFileName(file.name);
    setIsScanning(true);

    try {
      const extracted = await simulateOCRProcess(file);
      setUploadedRecords((prev) => [extracted, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSampleOcr = async (type) => {
    setOcrFileName(type === 'rx' ? 'Past_Prescription_Sample.jpg' : 'Past_Lab_Report.pdf');
    setIsScanning(true);
    const mockFile = { name: type === 'rx' ? 'prescription.jpg' : 'lab_report.pdf' };
    const extracted = await simulateOCRProcess(mockFile);
    setUploadedRecords((prev) => [extracted, ...prev]);
    setIsScanning(false);
  };

  const handleAddManualRecord = (e) => {
    e.preventDefault();
    if (!manualTitle) return;

    const newRec = {
      title: manualTitle,
      type: manualType,
      date: new Date().toISOString().split('T')[0],
      hospital: 'Previous Hospital',
      doctor: 'Previous Doctor',
      risk: 'GREEN',
      riskReason: 'Historical record submitted during onboarding.',
      diagnosis: manualDiagnosis || 'Past Medical History',
      medications: [],
      notes: 'Added during patient registration.',
      isEmergencyVisible: false,
    };

    setUploadedRecords((prev) => [newRec, ...prev]);
    setManualTitle('');
    setManualDiagnosis('');
    setShowManualForm(false);
  };

  const handleFinishRegistration = () => {
    registerPatient(
      {
        ...formData,
        age: Number(formData.age) || 30,
        emergencyContacts: [
          {
            name: formData.emergencyContactName || 'Family Contact',
            phone: formData.emergencyContactPhone || formData.phone,
            relation: 'Emergency Primary',
          },
        ],
      },
      uploadedRecords
    );
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      background: 'radial-gradient(circle at 10% 20%, #f0f9ff 0%, #f8fafc 90%)'
    }}>
      <div style={{
        maxWidth: currentStep === 1 ? '680px' : '760px',
        width: '100%',
        background: '#ffffff',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-color)',
        padding: '36px 36px',
        transition: 'all 0.3s ease'
      }}>
        {/* Stepper Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}>
                <Activity size={20} />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                Create OneRecord Account
              </h2>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '4px' }}>
              {currentStep === 1 
                ? 'Step 1 of 2: Personal & Identity Information' 
                : 'Step 2 of 2: Upload Past Medical History (Optional)'}
            </p>
          </div>

          {/* Stepper Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: currentStep >= 1 ? '#0284c7' : '#e2e8f0',
              color: currentStep >= 1 ? 'white' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700
            }}>
              1
            </div>
            <div style={{ width: '24px', height: '2px', background: currentStep >= 2 ? '#0284c7' : '#e2e8f0' }} />
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: currentStep >= 2 ? '#0284c7' : '#e2e8f0',
              color: currentStep >= 2 ? 'white' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700
            }}>
              2
            </div>
          </div>
        </div>

        {/* STEP 1: Personal Details */}
        {currentStep === 1 && (
          <form onSubmit={handleStep1Submit}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                    style={{ paddingLeft: '48px' }}
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
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Aadhaar Number (Optional)</label>
                <input
                  type="text"
                  placeholder="xxxx xxxx xxxx"
                  className="form-input"
                  value={formData.aadhaar}
                  onChange={(e) => handleAadhaarFormat(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Create strong password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select
                  className="form-select"
                  value={formData.bloodGroup}
                  onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                >
                  <option value="O+">O +ve</option>
                  <option value="O-">O -ve</option>
                  <option value="A+">A +ve</option>
                  <option value="A-">A -ve</option>
                  <option value="B+">B +ve</option>
                  <option value="B-">B -ve</option>
                  <option value="AB+">AB +ve</option>
                  <option value="AB-">AB -ve</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 42"
                  className="form-input"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address & City</label>
              <input
                type="text"
                placeholder="e.g. Flat 402, Green Glen Layout, Bellandur, Bengaluru"
                className="form-input"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Emergency Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma (Spouse)"
                  className="form-input"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543211"
                  className="form-input"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                />
              </div>
            </div>

            {/* Organ donor pledge */}
            <div style={{
              margin: '12px 0 20px',
              padding: '12px',
              background: '#ecfdf5',
              borderRadius: '8px',
              border: '1px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <input
                type="checkbox"
                id="organ-donor-check"
                checked={formData.organDonor}
                onChange={(e) => handleInputChange('organDonor', e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
              />
              <label htmlFor="organ-donor-check" style={{ fontSize: '0.825rem', color: '#065f46', cursor: 'pointer', fontWeight: 600 }}>
                I wish to register as a pledged Organ Donor in case of medical emergency
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              <span>Continue to Past Records Upload</span>
              <ArrowRight size={16} />
            </button>

            {/* Link to Login */}
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#64748b' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                style={{ background: 'transparent', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Optional Past Records (OCR & Manual Entry) */}
        {currentStep === 2 && (
          <div>
            <div style={{
              padding: '14px 18px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0369a1' }}>
                  Optional Health Records Onboarding
                </div>
                <div style={{ fontSize: '0.78rem', color: '#0284c7' }}>
                  Upload past prescriptions or lab reports to populate your medical timeline. You can skip this and upload later anytime!
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', padding: '3px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontWeight: 700 }}>
                Optional
              </span>
            </div>

            {/* OCR Upload Area */}
            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '16px',
              padding: '24px 20px',
              textAlign: 'center',
              background: '#f8fafc',
              position: 'relative',
              marginBottom: '16px'
            }}>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleOcrUpload}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              />

              {isScanning ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '3px solid #bae6fd',
                    borderTopColor: '#0284c7',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7' }}>
                    Scanning and extracting details via OCR...
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px'
                  }}>
                    <UploadCloud size={22} />
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                    Drop past prescription or lab report image/PDF
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    AI OCR will automatically detect diagnosis and medicines
                  </div>
                </div>
              )}
            </div>

            {/* Quick test buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => handleSampleOcr('rx')}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, fontSize: '0.78rem' }}
              >
                <Sparkles size={14} color="#0284c7" />
                <span>Sample Rx (Prescription)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSampleOcr('lab')}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, fontSize: '0.78rem' }}
              >
                <Sparkles size={14} color="#0284c7" />
                <span>Sample Lab Report</span>
              </button>
              <button
                type="button"
                onClick={() => setShowManualForm(!showManualForm)}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, fontSize: '0.78rem' }}
              >
                <Plus size={14} />
                <span>Manual Entry</span>
              </button>
            </div>

            {/* Manual Form Accordion */}
            {showManualForm && (
              <form onSubmit={handleAddManualRecord} style={{
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>
                  Quick Manual Record Details
                </div>
                <div className="form-grid-2">
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label">Record Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Previous Cardiology Visit"
                      className="form-input"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label">Record Type</label>
                    <select
                      className="form-select"
                      value={manualType}
                      onChange={(e) => setManualType(e.target.value)}
                    >
                      <option value="Prescription">Prescription</option>
                      <option value="Lab Report">Lab Report</option>
                      <option value="Scan">Scan</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Condition / Diagnosis</label>
                  <input
                    type="text"
                    placeholder="e.g. Mild Asthma, Hypertension"
                    className="form-input"
                    value={manualDiagnosis}
                    onChange={(e) => setManualDiagnosis(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" onClick={() => setShowManualForm(false)} className="btn btn-sm btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary">
                    Add Record
                  </button>
                </div>
              </form>
            )}

            {/* Uploaded records list */}
            {uploadedRecords.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Attached Records ({uploadedRecords.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {uploadedRecords.map((rec, i) => (
                    <div 
                      key={i} 
                      style={{
                        padding: '10px 14px',
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={18} color="#0284c7" />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                            {rec.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {rec.type} • {rec.diagnosis || 'Clinical Notes'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedRecords(uploadedRecords.filter((_, idx) => idx !== i))}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleFinishRegistration}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                <CheckCircle2 size={16} />
                <span>
                  {uploadedRecords.length > 0 
                    ? `Finish & Save ${uploadedRecords.length} Records` 
                    : 'Complete Registration & Open Dashboard'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
