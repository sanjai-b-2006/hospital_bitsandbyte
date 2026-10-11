import React, { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { 
  X, 
  Users, 
  Baby, 
  Heart, 
  CheckCircle2, 
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';

export default function AddFamilyMemberModal({ onClose }) {
  const { addFamilyMember, currentAccount } = useHealth();

  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Son');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [aadhaar, setAadhaar] = useState('');
  const [allergyText, setAllergyText] = useState('');
  const [conditionText, setConditionText] = useState('');
  const [organDonor, setOrganDonor] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter family member name');
      return;
    }

    const allergies = allergyText.trim()
      ? allergyText.split(',').map((item) => ({
          allergen: item.trim(),
          severity: 'Moderate',
          reaction: 'Documented family entry',
        }))
      : [];

    const criticalConditions = conditionText.trim()
      ? conditionText.split(',').map((c) => c.trim())
      : [];

    addFamilyMember({
      name,
      relation,
      dob,
      age: Number(age) || 5,
      gender,
      bloodGroup,
      aadhaar,
      allergies,
      criticalConditions,
      organDonor,
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '620px' }}
      >
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Baby size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Add Family Member / Dependent
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Register child or dependent. Medical records will be linked to parent: {currentAccount.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Kabir Sharma"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Relationship to You *</label>
              <select
                className="form-select"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
              >
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Spouse">Spouse</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Ward / Dependent">Ward / Other Dependent</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                placeholder="e.g. 8"
                className="form-input"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                className="form-select"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
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
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Date of Birth (DOB)</label>
              <input
                type="date"
                className="form-input"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Aadhaar or Birth Reg No (Optional)</label>
              <input
                type="text"
                placeholder="xxxx xxxx xxxx"
                className="form-input"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Known Allergies (Comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Peanuts, Milk / Lactose, Penicillin"
              className="form-input"
              value={allergyText}
              onChange={(e) => setAllergyText(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Known Chronic Conditions / Pediatric Notes</label>
            <input
              type="text"
              placeholder="e.g. Pediatric Asthma, Febrile Seizures"
              className="form-input"
              value={conditionText}
              onChange={(e) => setConditionText(e.target.value)}
            />
          </div>

          <div style={{
            padding: '12px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '0.78rem',
            color: '#64748b',
            marginBottom: '18px'
          }}>
            <strong>Primary Guardian Registered:</strong> {currentAccount.name} (+91 {currentAccount.phone}) will be recorded as the primary medical proxy and emergency contact.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              <span>Register & Link Dependent</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
