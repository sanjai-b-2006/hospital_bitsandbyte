-- OneRecord Unified Healthcare Database Schema (PostgreSQL)

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  aadhaar VARCHAR(50),
  email VARCHAR(255),
  age INTEGER,
  gender VARCHAR(20),
  blood_group VARCHAR(10),
  address TEXT,
  dob DATE,
  organ_donor BOOLEAN DEFAULT false,
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  allergies JSONB DEFAULT '[]'::jsonb,
  critical_conditions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Dependents / Family Members Table
CREATE TABLE IF NOT EXISTS dependents (
  id VARCHAR(64) PRIMARY KEY,
  guardian_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  relation VARCHAR(50) NOT NULL,
  age INTEGER,
  gender VARCHAR(20),
  blood_group VARCHAR(10),
  dob DATE,
  aadhaar VARCHAR(50),
  allergies JSONB DEFAULT '[]'::jsonb,
  critical_conditions JSONB DEFAULT '[]'::jsonb,
  organ_donor BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) NOT NULL,
  dependent_id VARCHAR(64) REFERENCES dependents(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  doctor VARCHAR(255),
  hospital VARCHAR(255),
  department VARCHAR(100),
  risk VARCHAR(20) NOT NULL DEFAULT 'GREEN',
  risk_reason TEXT,
  diagnosis TEXT,
  medications JSONB DEFAULT '[]'::jsonb,
  lab_results JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  is_emergency_visible BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Active Medications Table
CREATE TABLE IF NOT EXISTS active_medications (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) NOT NULL,
  dependent_id VARCHAR(64),
  name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  purpose VARCHAR(255),
  prescribed_by VARCHAR(255),
  start_date DATE,
  risk_level VARCHAR(20) DEFAULT 'GREEN',
  warning TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Hospital Consent & Access Grants Table
CREATE TABLE IF NOT EXISTS hospital_access_grants (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) NOT NULL,
  hospital_name VARCHAR(255) NOT NULL,
  hospital_uid VARCHAR(100) NOT NULL,
  doctor_in_charge VARCHAR(255),
  granted_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'Active',
  access_level VARCHAR(255),
  last_accessed VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Emergency Access Audit Logs Table
CREATE TABLE IF NOT EXISTS emergency_access_logs (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) NOT NULL,
  hospital_name VARCHAR(255) NOT NULL,
  accessed_at VARCHAR(100) NOT NULL,
  personnel VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  location VARCHAR(255),
  ip_address VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  uid VARCHAR(100) UNIQUE NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  mfa_type VARCHAR(50) DEFAULT 'SMS',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id VARCHAR(64) PRIMARY KEY,
  hospital_id VARCHAR(64) NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  registration_no VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Patient Queue & Tokens Table
CREATE TABLE IF NOT EXISTS patient_tokens (
  id VARCHAR(64) PRIMARY KEY,
  hospital_id VARCHAR(64) NOT NULL,
  patient_id VARCHAR(64) NOT NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(20) NOT NULL,
  token_number VARCHAR(50) NOT NULL,
  doctor_id VARCHAR(64),
  doctor_name VARCHAR(255),
  department VARCHAR(100),
  risk_level VARCHAR(20) DEFAULT 'GREEN',
  status VARCHAR(50) DEFAULT 'Waiting', -- 'Waiting', 'In Consultation', 'Completed', 'Cancelled'
  visit_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Hospital Linked Patients Table
CREATE TABLE IF NOT EXISTS hospital_patients (
  id VARCHAR(64) PRIMARY KEY,
  hospital_id VARCHAR(64) NOT NULL,
  patient_id VARCHAR(64) NOT NULL,
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_records_dependent ON medical_records(dependent_id);
CREATE INDEX IF NOT EXISTS idx_records_date ON medical_records(date);
CREATE INDEX IF NOT EXISTS idx_dependents_guardian ON dependents(guardian_id);
CREATE INDEX IF NOT EXISTS idx_meds_patient ON active_medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_grants_patient ON hospital_access_grants(patient_id);
CREATE INDEX IF NOT EXISTS idx_tokens_hospital ON patient_tokens(hospital_id);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON patient_tokens(status);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital ON doctors(hospital_id);

-- 11. Analytics columns: consult start / completion timestamps
--     (used by the ML wait-time model + analytics dashboards)
ALTER TABLE patient_tokens ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
ALTER TABLE patient_tokens ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_tokens_started ON patient_tokens(started_at);
CREATE INDEX IF NOT EXISTS idx_tokens_completed ON patient_tokens(completed_at);

