import React, { useState } from 'react';
import { 
  Pill, 
  FlaskConical, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  KeyRound, 
  Receipt, 
  ShieldCheck, 
  ArrowRight,
  Database,
  Building,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('pharmacy'); // 'pharmacy' | 'lab'

  // ========================================================
  // PHARMACY BILLING POS STATE
  // ========================================================
  const [pharmStoreName, setPharmStoreName] = useState('MedPlus Pharmacy & Healthcare');
  const [pharmPatientPhone, setPharmPatientPhone] = useState('9876543210');
  const [pharmOtp, setPharmOtp] = useState('');
  const [pharmOtpSent, setPharmOtpSent] = useState(false);
  const [pharmItems, setPharmItems] = useState([
    { id: 1, name: 'Telmisartan 40mg', dosage: '1 Tab Daily', qty: 30, price: 180 },
    { id: 2, name: 'Metformin 500mg SR', dosage: '1 Tab BD', qty: 60, price: 120 }
  ]);
  const [pharmNewItemName, setPharmNewItemName] = useState('');
  const [pharmNewItemDosage, setPharmNewItemDosage] = useState('1 Tablet Daily');
  const [pharmNewItemQty, setPharmNewItemQty] = useState(10);
  const [pharmNewItemPrice, setPharmNewItemPrice] = useState(50);
  const [pharmLoading, setPharmLoading] = useState(false);
  const [pharmSuccessResult, setPharmSuccessResult] = useState(null);
  const [pharmError, setPharmError] = useState('');

  // ========================================================
  // LAB REPORT SUBMISSION STATE
  // ========================================================
  const [labName, setLabName] = useState('Apollo Diagnostics & Pathology Lab');
  const [labPatientPhone, setLabPatientPhone] = useState('9876543210');
  const [labTestName, setLabTestName] = useState('Comprehensive Metabolic Panel & Lipid Profile');
  const [labCategory, setLabCategory] = useState('Biochemistry & Pathology');
  const [labPathologist, setLabPathologist] = useState('Dr. Anand Raman, MD (Pathology)');
  const [labImpression, setLabImpression] = useState('Mild dyslipidemia noted with elevated LDL. Normal fasting plasma glucose and renal parameters.');
  const [labRisk, setLabRisk] = useState('AMBER');
  const [labRiskReason, setLabRiskReason] = useState('Elevated LDL cholesterol (142 mg/dL) requires statin review');
  const [labParameters, setLabParameters] = useState([
    { id: 1, parameter: 'Fasting Blood Sugar (FBS)', value: '98', unit: 'mg/dL', referenceRange: '70 - 100', status: 'Normal' },
    { id: 2, parameter: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.7 - 1.3', status: 'Normal' },
    { id: 3, parameter: 'Total Cholesterol', value: '215', unit: 'mg/dL', referenceRange: '< 200', status: 'High' },
    { id: 4, parameter: 'LDL Cholesterol', value: '142', unit: 'mg/dL', referenceRange: '< 100', status: 'High' },
    { id: 5, parameter: 'HDL Cholesterol', value: '46', unit: 'mg/dL', referenceRange: '> 40', status: 'Normal' }
  ]);
  const [labNewParam, setLabNewParam] = useState({ parameter: '', value: '', unit: '', referenceRange: '', status: 'Normal' });
  const [labLoading, setLabLoading] = useState(false);
  const [labSuccessResult, setLabSuccessResult] = useState(null);
  const [labError, setLabError] = useState('');

  // ========================================================
  // PHARMACY HANDLERS
  // ========================================================
  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!pharmNewItemName.trim()) return;

    setPharmItems(prev => [
      ...prev,
      {
        id: Date.now(),
        name: pharmNewItemName.trim(),
        dosage: pharmNewItemDosage.trim() || '1 Dose',
        qty: Number(pharmNewItemQty) || 1,
        price: Number(pharmNewItemPrice) || 0
      }
    ]);
    setPharmNewItemName('');
    setPharmNewItemDosage('1 Tablet Daily');
    setPharmNewItemQty(10);
    setPharmNewItemPrice(50);
  };

  const handleRemoveMedicine = (id) => {
    setPharmItems(prev => prev.filter(it => it.id !== id));
  };

  const pharmTotal = pharmItems.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);

  const handleSendPharmOtp = () => {
    if (!pharmPatientPhone || pharmPatientPhone.length < 10) {
      setPharmError('Please enter a valid 10-digit mobile number');
      return;
    }
    setPharmError('');
    setPharmOtpSent(true);
    setPharmOtp('123456'); // Pre-fill for instant frictionless demo testing
  };

  const handlePharmacySubmit = async (e) => {
    e.preventDefault();
    if (pharmItems.length === 0) {
      setPharmError('Please add at least one medicine to the bill');
      return;
    }
    if (!pharmOtp) {
      setPharmError('Please verify patient OTP');
      return;
    }

    setPharmLoading(true);
    setPharmError('');
    setPharmSuccessResult(null);

    try {
      const res = await fetch(`${API_BASE}/pharmacy/bill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: pharmPatientPhone,
          otp: pharmOtp,
          storeName: pharmStoreName,
          items: pharmItems,
          totalAmount: pharmTotal,
          risk: pharmItems.some(i => i.name.toLowerCase().includes('ecosprin') || i.name.toLowerCase().includes('stent')) ? 'RED' : 'GREEN',
        })
      });
      const data = await res.json();
      setPharmLoading(false);

      if (data.success) {
        setPharmSuccessResult(data);
        setPharmOtpSent(false);
        setPharmOtp('');
      } else {
        setPharmError(data.message || 'Billing submission failed');
      }
    } catch (err) {
      setPharmLoading(false);
      setPharmError('Server communication error: ' + err.message);
    }
  };

  // ========================================================
  // LAB REPORT HANDLERS
  // ========================================================
  const handleAddLabParam = (e) => {
    e.preventDefault();
    if (!labNewParam.parameter.trim() || !labNewParam.value.trim()) return;

    setLabParameters(prev => [
      ...prev,
      {
        id: Date.now(),
        parameter: labNewParam.parameter.trim(),
        value: labNewParam.value.trim(),
        unit: labNewParam.unit.trim(),
        referenceRange: labNewParam.referenceRange.trim() || '-',
        status: labNewParam.status
      }
    ]);
    setLabNewParam({ parameter: '', value: '', unit: '', referenceRange: '', status: 'Normal' });
  };

  const handleRemoveLabParam = (id) => {
    setLabParameters(prev => prev.filter(p => p.id !== id));
  };

  const handleLabSubmit = async (e) => {
    e.preventDefault();
    if (!labPatientPhone || labPatientPhone.length < 10) {
      setLabError('Please enter a valid patient mobile number');
      return;
    }
    if (labParameters.length === 0) {
      setLabError('Please provide at least one diagnostic test parameter');
      return;
    }

    setLabLoading(true);
    setLabError('');
    setLabSuccessResult(null);

    try {
      const res = await fetch(`${API_BASE}/lab/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: labPatientPhone,
          labName,
          testName: labTestName,
          testCategory: labCategory,
          results: labParameters,
          impression: labImpression,
          pathologistName: labPathologist,
          risk: labRisk,
          riskReason: labRiskReason,
        })
      });
      const data = await res.json();
      setLabLoading(false);

      if (data.success) {
        setLabSuccessResult(data);
      } else {
        setLabError(data.message || 'Lab submission failed');
      }
    } catch (err) {
      setLabLoading(false);
      setLabError('Server communication error: ' + err.message);
    }
  };

  return (
    <div className="app-wrapper">
      {/* Top Header */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="container" style={{
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: activeTab === 'pharmacy' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              {activeTab === 'pharmacy' ? <Pill size={24} /> : <FlaskConical size={24} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                  OneRecord
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  background: activeTab === 'pharmacy' ? '#dcfce7' : '#ede9fe',
                  color: activeTab === 'pharmacy' ? '#166534' : '#5b21b6'
                }}>
                  {activeTab === 'pharmacy' ? 'Pharmacy' : 'Diagnostics'}
                </span>
              </div>
              
            </div>
          </div>

          {/* Module Switcher Tabs */}
          <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
            <button
              onClick={() => setActiveTab('pharmacy')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'pharmacy' ? '#ffffff' : 'transparent',
                color: activeTab === 'pharmacy' ? '#059669' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'pharmacy' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Pill size={16} />
              <span>Medical Shop Billing</span>
            </button>

            <button
              onClick={() => setActiveTab('lab')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'lab' ? '#ffffff' : 'transparent',
                color: activeTab === 'lab' ? '#7c3aed' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'lab' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <FlaskConical size={16} />
              <span>Lab Report Submission</span>
            </button>
          </div>

          
        </div>
      </header>

      {/* Main Container */}
      <main style={{ padding: '32px 0', flex: 1 }}>
        <div className="container">

          {/* ======================================================== */}
          {/* TAB 1: MEDICAL SHOP BILLING SOFTWARE REPLICA */}
          {/* ======================================================== */}
          {activeTab === 'pharmacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                borderRadius: '20px',
                padding: '24px 28px',
                color: 'white',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#a7f3d0', fontWeight: 700 }}>
                  Retail Pharmacy Point-of-Sale (POS) Billing Replica
                </div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '2px' }}>
                  Medical Shop Billing & Patient OTP Verification
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#d1fae5', marginTop: '2px', maxWidth: '750px' }}>
                  Bill prescribed tablets, enter patient mobile number, verify via patient OTP, and automatically record dispensation to the patient's OneRecord longitudinal health account.
                </p>
              </div>

              {/* Success Notification */}
              {pharmSuccessResult && (
                <div style={{
                  padding: '18px 24px',
                  background: '#ecfdf5',
                  border: '2px solid #a7f3d0',
                  borderRadius: '16px',
                  color: '#065f46',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckCircle2 size={28} color="#059669" />
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>
                        {pharmSuccessResult.message}
                      </h4>
                      <p style={{ fontSize: '0.82rem', marginTop: '2px' }}>
                        Linked to Patient: <strong>{pharmSuccessResult.patientName}</strong> ({pharmSuccessResult.patientId}) • Invoice #{pharmSuccessResult.invoiceNumber}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPharmSuccessResult(null)}
                    className="btn btn-pharmacy btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    Bill Next Patient
                  </button>
                </div>
              )}

              {/* Error Notification */}
              {pharmError && (
                <div style={{
                  padding: '14px 18px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.85rem'
                }}>
                  <AlertCircle size={18} />
                  <span>{pharmError}</span>
                </div>
              )}

              {/* Billing Interface Grid: Left = Tablet Items, Right = Patient Mobile & OTP Checkout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
                
                {/* LEFT: Medicine Cart & Add Tablet Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="card">
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Pill size={18} color="#059669" />
                      <span>Add Tablets & Medicines to Invoice</span>
                    </h3>

                    <form onSubmit={handleAddMedicine} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto', gap: '10px', alignItems: 'flex-end', marginBottom: '20px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Tablet / Medicine Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Atorvastatin 20mg"
                          className="form-input"
                          value={pharmNewItemName}
                          onChange={(e) => setPharmNewItemName(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Dosage</label>
                        <input
                          type="text"
                          placeholder="e.g. 1 Tab Daily HS"
                          className="form-input"
                          value={pharmNewItemDosage}
                          onChange={(e) => setPharmNewItemDosage(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          required
                          className="form-input"
                          value={pharmNewItemQty}
                          onChange={(e) => setPharmNewItemQty(e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Unit ₹</label>
                        <input
                          type="number"
                          min="0"
                          required
                          className="form-input"
                          value={pharmNewItemPrice}
                          onChange={(e) => setPharmNewItemPrice(e.target.value)}
                        />
                      </div>

                      <button type="submit" className="btn btn-pharmacy" style={{ height: '42px' }}>
                        <Plus size={16} />
                        <span>Add</span>
                      </button>
                    </form>

                    {/* Medicines Table */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155', marginBottom: '10px' }}>
                        Billed Medicines ({pharmItems.length})
                      </h4>

                      {pharmItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '0.85rem' }}>
                          No tablets added yet. Add items above to build invoice.
                        </div>
                      ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'left' }}>
                              <th style={{ padding: '8px 12px' }}>Medicine</th>
                              <th style={{ padding: '8px 12px' }}>Dosage Advice</th>
                              <th style={{ padding: '8px 12px' }}>Qty</th>
                              <th style={{ padding: '8px 12px' }}>Price / Unit</th>
                              <th style={{ padding: '8px 12px' }}>Subtotal</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pharmItems.map((item) => (
                              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                                  {item.name}
                                </td>
                                <td style={{ padding: '10px 12px', color: '#64748b' }}>
                                  {item.dosage}
                                </td>
                                <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                                  {item.qty}
                                </td>
                                <td style={{ padding: '10px 12px', color: '#64748b' }}>
                                  ₹{item.price}
                                </td>
                                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#059669' }}>
                                  ₹{item.qty * item.price}
                                </td>
                                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                  <button
                                    onClick={() => handleRemoveMedicine(item.id)}
                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                    title="Remove item"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {/* Total Amount Summary */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '16px',
                        padding: '14px 18px',
                        background: '#f8fafc',
                        borderRadius: '10px',
                        fontWeight: 800
                      }}>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>Total Bill Amount:</span>
                        <span style={{ fontSize: '1.3rem', color: '#059669', fontFamily: 'var(--font-mono)' }}>₹{pharmTotal}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Patient Mobile & OTP Verification Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="card" style={{ borderTop: '4px solid #059669' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} color="#059669" />
                      <span>Patient Verification & Sync</span>
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
                      Enter patient's registered mobile number to request OTP consent.
                    </p>

                    <form onSubmit={handlePharmacySubmit}>
                      <div className="form-group">
                        <label className="form-label">Pharmacy Store Name</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={pharmStoreName}
                          onChange={(e) => setPharmStoreName(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Patient Mobile Number *</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ position: 'relative', width: '100%' }}>
                            <Phone size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                              type="tel"
                              required
                              placeholder="9876543210"
                              className="form-input"
                              value={pharmPatientPhone}
                              onChange={(e) => setPharmPatientPhone(e.target.value)}
                              style={{ paddingLeft: '36px' }}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleSendPharmOtp}
                            className="btn btn-secondary"
                            style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}
                          >
                            {pharmOtpSent ? 'Resend OTP' : 'Send OTP'}
                          </button>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                          Sample registered patient: <code>9876543210</code> (Aarav Sharma)
                        </span>
                      </div>

                      {/* OTP Field (Shown after Send OTP or Always visible) */}
                      <div className="form-group" style={{
                        background: '#f0fdf4',
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid #bbf7d0'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label className="form-label" style={{ color: '#166534', margin: 0 }}>
                            Patient Verification OTP *
                          </label>
                          <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                            Demo Code: 123456
                          </span>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <KeyRound size={16} color="#059669" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="text"
                            required
                            maxLength={6}
                            placeholder="Enter 6-digit OTP"
                            className="form-input"
                            value={pharmOtp}
                            onChange={(e) => setPharmOtp(e.target.value)}
                            style={{
                              paddingLeft: '36px',
                              letterSpacing: '0.2em',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              textAlign: 'center'
                            }}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={pharmLoading || pharmItems.length === 0}
                        className="btn btn-pharmacy"
                        style={{ width: '100%', padding: '12px', fontSize: '0.92rem', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)' }}
                      >
                        <Receipt size={16} />
                        <span>{pharmLoading ? 'Verifying & Syncing...' : `Submit Bill & Sync Record (₹${pharmTotal})`}</span>
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: LAB REPORT SUBMISSION PORTAL */}
          {/* ======================================================== */}
          {activeTab === 'lab' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                borderRadius: '20px',
                padding: '24px 28px',
                color: 'white',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#ddd6fe', fontWeight: 700 }}>
                  Diagnostic Pathology & Imaging Submission Desk
                </div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '2px' }}>
                  Lab Report Generation & Automatic Patient Vault Delivery
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#ede9fe', marginTop: '2px', maxWidth: '750px' }}>
                  Generate diagnostic test findings and deliver verified medical laboratory reports straight to the patient's longitudinal record.
                </p>
              </div>

              {/* Success Notification */}
              {labSuccessResult && (
                <div style={{
                  padding: '18px 24px',
                  background: '#f5f3ff',
                  border: '2px solid #ddd6fe',
                  borderRadius: '16px',
                  color: '#5b21b6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckCircle2 size={28} color="#7c3aed" />
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>
                        {labSuccessResult.message}
                      </h4>
                      <p style={{ fontSize: '0.82rem', marginTop: '2px' }}>
                        Delivered to Patient: <strong>{labSuccessResult.patientName}</strong> ({labSuccessResult.patientId}) • Assigned Triage Risk: <strong>{labSuccessResult.assignedRisk}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setLabSuccessResult(null)}
                    className="btn btn-lab btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    Submit Next Report
                  </button>
                </div>
              )}

              {/* Error Notification */}
              {labError && (
                <div style={{
                  padding: '14px 18px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '0.85rem'
                }}>
                  <AlertCircle size={18} />
                  <span>{labError}</span>
                </div>
              )}

              {/* Lab Submission Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
                
                {/* LEFT: Test Parameters Table & Add Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="card">
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FlaskConical size={18} color="#7c3aed" />
                      <span>Diagnostic Parameters & Observation Values</span>
                    </h3>

                    {/* Add Parameter Form */}
                    <form onSubmit={handleAddLabParam} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1.2fr 1.2fr auto', gap: '8px', alignItems: 'flex-end', marginBottom: '20px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Parameter *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. HbA1c"
                          className="form-input"
                          value={labNewParam.parameter}
                          onChange={(e) => setLabNewParam({ ...labNewParam, parameter: e.target.value })}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Value *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 7.2"
                          className="form-input"
                          value={labNewParam.value}
                          onChange={(e) => setLabNewParam({ ...labNewParam, value: e.target.value })}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Unit</label>
                        <input
                          type="text"
                          placeholder="%"
                          className="form-input"
                          value={labNewParam.unit}
                          onChange={(e) => setLabNewParam({ ...labNewParam, unit: e.target.value })}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Ref Range</label>
                        <input
                          type="text"
                          placeholder="< 5.7"
                          className="form-input"
                          value={labNewParam.referenceRange}
                          onChange={(e) => setLabNewParam({ ...labNewParam, referenceRange: e.target.value })}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Status</label>
                        <select
                          className="form-select"
                          value={labNewParam.status}
                          onChange={(e) => setLabNewParam({ ...labNewParam, status: e.target.value })}
                        >
                          <option value="Normal">Normal</option>
                          <option value="High">High</option>
                          <option value="Low">Low</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>

                      <button type="submit" className="btn btn-lab" style={{ height: '42px' }}>
                        <Plus size={16} />
                        <span>Add</span>
                      </button>
                    </form>

                    {/* Parameters Table */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155', marginBottom: '10px' }}>
                        Investigation Values ({labParameters.length})
                      </h4>

                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'left' }}>
                            <th style={{ padding: '8px 12px' }}>Test Parameter</th>
                            <th style={{ padding: '8px 12px' }}>Observed Result</th>
                            <th style={{ padding: '8px 12px' }}>Unit</th>
                            <th style={{ padding: '8px 12px' }}>Reference Range</th>
                            <th style={{ padding: '8px 12px' }}>Flag</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {labParameters.map((p) => {
                            const isHigh = p.status === 'High' || p.status === 'Critical';
                            const isLow = p.status === 'Low';

                            return (
                              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                                  {p.parameter}
                                </td>
                                <td style={{ padding: '10px 12px', fontWeight: 800, color: isHigh ? '#dc2626' : (isLow ? '#d97706' : '#059669') }}>
                                  {p.value}
                                </td>
                                <td style={{ padding: '10px 12px', color: '#64748b' }}>
                                  {p.unit}
                                </td>
                                <td style={{ padding: '10px 12px', color: '#64748b' }}>
                                  {p.referenceRange}
                                </td>
                                <td style={{ padding: '10px 12px' }}>
                                  <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    background: isHigh ? '#fee2e2' : (isLow ? '#fef3c7' : '#dcfce7'),
                                    color: isHigh ? '#b91c1c' : (isLow ? '#b45309' : '#15803d')
                                  }}>
                                    {p.status}
                                  </span>
                                </td>
                                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                  <button
                                    onClick={() => handleRemoveLabParam(p.id)}
                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Lab Information & Submission Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="card" style={{ borderTop: '4px solid #7c3aed' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>
                      Diagnostic Laboratory Metadata
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
                      Certified test results will be pushed directly to the patient's timeline.
                    </p>

                    <form onSubmit={handleLabSubmit}>
                      <div className="form-group">
                        <label className="form-label">Patient Mobile Number *</label>
                        <div style={{ position: 'relative' }}>
                          <Phone size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="tel"
                            required
                            placeholder="9876543210"
                            className="form-input"
                            value={labPatientPhone}
                            onChange={(e) => setLabPatientPhone(e.target.value)}
                            style={{ paddingLeft: '36px' }}
                          />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                          Sample patient: <code>9876543210</code> (Aarav Sharma)
                        </span>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Diagnostic Test / Investigation Title *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={labTestName}
                          onChange={(e) => setLabTestName(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Diagnostic Center / Laboratory</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={labName}
                          onChange={(e) => setLabName(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Signing Pathologist / Microbiologist</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={labPathologist}
                          onChange={(e) => setLabPathologist(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Pathologist Clinical Impression</label>
                        <textarea
                          rows={2}
                          className="form-textarea"
                          value={labImpression}
                          onChange={(e) => setLabImpression(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Calculated Risk Flag</label>
                        <select
                          className="form-select"
                          value={labRisk}
                          onChange={(e) => setLabRisk(e.target.value)}
                        >
                          <option value="GREEN">🟢 GREEN - Normal Parameters</option>
                          <option value="AMBER">🟡 AMBER - Elevated / Borderline (Review Recommended)</option>
                          <option value="RED">🔴 RED - Critical Value / High Alert</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={labLoading || labParameters.length === 0}
                        className="btn btn-lab"
                        style={{ width: '100%', padding: '12px', fontSize: '0.92rem', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)' }}
                      >
                        <FlaskConical size={16} />
                        <span>{labLoading ? 'Submitting to Vault...' : 'Submit Lab Report to Patient Vault'}</span>
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        padding: '16px 20px',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: '#64748b'
      }}>
        OneRecord Health Network
      </footer>
    </div>
  );
}
