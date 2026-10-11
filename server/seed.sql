-- Seed Data for OneRecord PostgreSQL (Aarav Sharma - Sample Data)

-- 1. Insert Sample Patient (Aarav Sharma)
INSERT INTO patients (
  id, name, phone, password, aadhaar, email, age, gender, blood_group, address, dob, organ_donor, emergency_contacts, allergies, critical_conditions
) VALUES (
  'PAT-IND-884210',
  'Aarav Sharma',
  '9876543210',
  'password123',
  '5421 9832 1045',
  'aarav.sharma@example.com',
  42,
  'Male',
  'O+',
  'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka - 560103',
  '1984-06-14',
  true,
  '[{"name": "Priya Sharma (Spouse)", "phone": "+91 98765 43211", "relation": "Spouse"}, {"name": "Dr. Rajesh Kulkarni", "phone": "+91 98450 11223", "relation": "Primary Cardiologist"}]'::jsonb,
  '[{"allergen": "Penicillin", "severity": "Severe (Anaphylaxis Risk)", "reaction": "Bronchospasm, facial swelling"}, {"allergen": "Sulfa Drugs", "severity": "Moderate", "reaction": "Urticaria and cutaneous rash"}]'::jsonb,
  '["Hypertension (Stage II - Diagnosed 2021)", "Type 2 Diabetes Mellitus (Controlled)", "Coronary Artery Stent (DES placed in RCA, 2024)"]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Sample Dependent (Son - Kabir Sharma)
INSERT INTO dependents (
  id, guardian_id, name, relation, age, gender, blood_group, dob, aadhaar, allergies, critical_conditions, organ_donor
) VALUES (
  'DEP-KABIR-01',
  'PAT-IND-884210',
  'Kabir Sharma',
  'Son',
  8,
  'Male',
  'B+',
  '2018-04-12',
  '8832 1192 4432',
  '[{"allergen": "Peanuts", "severity": "Moderate", "reaction": "Urticaria and lip swelling"}]'::jsonb,
  '["Pediatric Asthma (Dust & Cold Triggered)"]'::jsonb,
  false
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert Sample Medical Records (Aarav Sharma)
INSERT INTO medical_records (
  id, patient_id, dependent_id, title, type, date, doctor, hospital, department, risk, risk_reason, diagnosis, medications, notes, is_emergency_visible
) VALUES (
  'REC-2026-091',
  'PAT-IND-884210',
  NULL,
  'Cardiology Follow-Up & Stress Echo',
  'Prescription',
  '2026-09-18',
  'Dr. Rajesh Kulkarni, MD, DM',
  'Manipal Hospital, Old Airport Road, Bengaluru',
  'Cardiology',
  'RED',
  'Coronary Stent maintenance, dual antiplatelet regimen. Close bleeding risk monitoring required.',
  'CAD Post-PTCA (DES in RCA), Well-controlled systemic hypertension.',
  '[{"name": "Ecosprin AV 75/20", "dosage": "1 Capsule", "frequency": "Once daily after dinner", "duration": "90 Days", "instructions": "Do not stop abruptly"}, {"name": "Telmisartan 40mg", "dosage": "1 Tablet", "frequency": "Once daily morning (8 AM)", "duration": "90 Days", "instructions": "Monitor BP weekly"}, {"name": "Metoprolol Succinate 25mg ER", "dosage": "1 Tablet", "frequency": "Once daily morning", "duration": "90 Days", "instructions": "Pulse rate monitoring"}]'::jsonb,
  'Patient feels asymptomatic on brisk walking. ECG shows normal sinus rhythm with stable T-wave changes. Advised lipid panel in 3 months.',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_records (
  id, patient_id, dependent_id, title, type, date, doctor, hospital, department, risk, risk_reason, diagnosis, lab_results, notes, is_emergency_visible
) VALUES (
  'REC-2026-085',
  'PAT-IND-884210',
  NULL,
  'Comprehensive Metabolic Panel & Glycated HbA1c',
  'Lab Report',
  '2026-08-30',
  'Dr. Sunita Rao (Pathologist)',
  'Anand Diagnostic Laboratory, Indiranagar',
  'Biochemistry',
  'AMBER',
  'HbA1c elevated at 7.2%. Fasting Blood Sugar 138 mg/dL. Requires lifestyle & dose calibration.',
  'Type 2 Diabetes Mellitus - Moderate Glycemic Control',
  '[{"test": "HbA1c", "result": "7.2 %", "status": "High"}, {"test": "Fasting Blood Glucose", "result": "138 mg/dL", "status": "High"}, {"test": "Serum Creatinine", "result": "1.02 mg/dL", "status": "Normal"}]'::jsonb,
  'Renal function is well preserved. Kidney panel clear.',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO medical_records (
  id, patient_id, dependent_id, title, type, date, doctor, hospital, department, risk, risk_reason, diagnosis, medications, notes, is_emergency_visible
) VALUES (
  'REC-2026-072',
  'PAT-IND-884210',
  NULL,
  'Monthly Chronic Refill Dispensation',
  'Pharmacy Bill',
  '2026-07-15',
  'Pharmacist: M. Venkatesh (Lic #KA-BLR-841)',
  'MedPlus Pharmacy, Bellandur Branch',
  'Pharmacy Retail',
  'GREEN',
  'Regular refill verified against digital prescription REC-2026-091.',
  'Routine Prescription Refill',
  '[{"name": "Metformin 500mg SR", "dosage": "60 Tablets", "frequency": "Twice daily", "duration": "30 Days", "instructions": "With meals"}]'::jsonb,
  'Refill dispensed under OTP authentication.',
  false
) ON CONFLICT (id) DO NOTHING;

-- Record 4: Cardiology 2D Echo & Holter Monitor Report (RED RISK)
INSERT INTO medical_records (
  id, patient_id, dependent_id, title, type, date, doctor, hospital, department, risk, risk_reason, diagnosis, lab_results, notes, is_emergency_visible
) VALUES (
  'REC-2026-064',
  'PAT-IND-884210',
  NULL,
  '2D Echocardiography & 24h Holter Monitoring',
  'Diagnostic Report',
  '2026-06-22',
  'Dr. Rajesh Kulkarni, MD, DM',
  'Manipal Hospital, Old Airport Road',
  'Cardiology',
  'RED',
  'Left ventricular ejection fraction (LVEF) 52%, stable post-stent wall motion abnormality. Strict antiplatelet adherence required.',
  'Post-PTCA Ischemic Cardiomyopathy (Stable)',
  '[{"test": "LVEF (Ejection Fraction)", "result": "52 %", "status": "Normal"}, {"test": "E/A Ratio", "result": "0.85", "status": "Low"}, {"test": "Holter PVC Burden", "result": "1.2 %", "status": "Normal"}, {"test": "RCA Stent Patency", "result": "Patent (No In-Stent Restenosis)", "status": "Normal"}]'::jsonb,
  'Echo reveals preserved global systolic function with hypokinesia in inferior segment. Stent in RCA is widely patent with good distal run-off. Continue dual antiplatelet therapy (Ecosprin + Clopidogrel).',
  true
) ON CONFLICT (id) DO NOTHING;

-- Record 5: Comprehensive Ophthalmology & Diabetic Retinopathy Screening (AMBER RISK)
INSERT INTO medical_records (
  id, patient_id, dependent_id, title, type, date, doctor, hospital, department, risk, risk_reason, diagnosis, medications, notes, is_emergency_visible
) VALUES (
  'REC-2026-050',
  'PAT-IND-884210',
  NULL,
  'Annual Diabetic Retinal Screening & Fundus Exam',
  'Clinical Summary',
  '2026-05-18',
  'Dr. Preeti Ganguly, MS (Ophthalmology)',
  'Narayana Nethralaya, Rajajinagar',
  'Ophthalmology',
  'AMBER',
  'Mild non-proliferative diabetic retinopathy (NPDR) in right eye. Requires tight glycemic and BP control to prevent progression.',
  'Mild Non-Proliferative Diabetic Retinopathy (OU)',
  '[{"name": "Tears Naturale II Lubricant Eye Drops", "dosage": "1 Drop in both eyes", "frequency": "3 times daily", "duration": "90 Days", "instructions": "For dry eyes and digital strain"}]'::jsonb,
  'Fundus photograph shows microaneurysms in right temporal arcade, no macular edema. Left eye clear. Advised repeat dilated fundus evaluation in 6 months.',
  false
) ON CONFLICT (id) DO NOTHING;

-- Record 6: Annual Executive Health Checkup & Renal Function Panel (GREEN RISK)
INSERT INTO medical_records (
  id, patient_id, dependent_id, title, type, date, doctor, hospital, department, risk, risk_reason, diagnosis, lab_results, notes, is_emergency_visible
) VALUES (
  'REC-2026-038',
  'PAT-IND-884210',
  NULL,
  'Annual Renal & Liver Biochemical Profile',
  'Lab Report',
  '2026-04-10',
  'Dr. Anand Raman, MD (Pathology)',
  'Apollo Diagnostics, Koramangala',
  'Clinical Biochemistry',
  'GREEN',
  'All renal and hepatic parameters within standard physiological reference ranges.',
  'Normal Renal & Hepatic Function',
  '[{"test": "Serum Creatinine", "result": "0.95 mg/dL", "status": "Normal"}, {"test": "Blood Urea Nitrogen (BUN)", "result": "14 mg/dL", "status": "Normal"}, {"test": "eGFR", "result": "> 90 mL/min/1.73m²", "status": "Normal"}, {"test": "SGOT (AST)", "result": "24 U/L", "status": "Normal"}, {"test": "SGPT (ALT)", "result": "28 U/L", "status": "Normal"}, {"test": "Serum Bilirubin Total", "result": "0.7 mg/dL", "status": "Normal"}]'::jsonb,
  'Excellent organ profile. Kidney filtration rate is optimal. Liver enzymes completely normal despite chronic oral medications.',
  true
) ON CONFLICT (id) DO NOTHING;

-- 4. Insert Sample Dependent Medical Records (Son - Kabir Sharma)
INSERT INTO medical_records (
  id, patient_id, dependent_id, title, type, date, doctor, hospital, department, risk, risk_reason, diagnosis, medications, notes, is_emergency_visible
) VALUES (
  'REC-KABIR-01',
  'PAT-IND-884210',
  'DEP-KABIR-01',
  'Pediatric Asthma Follow-Up & Inhaler Protocol',
  'Prescription',
  '2026-08-14',
  'Dr. Anita Desai, MD (Pediatrics)',
  'Rainbow Children''s Hospital, Marathahalli',
  'Pediatric Pulmonology',
  'AMBER',
  'Seasonal wheezing triggered by dust mites. Advised Budecort inhaler with pediatric spacer.',
  'Mild Persistent Pediatric Asthma',
  '[{"name": "Budecort 100 Inhaler", "dosage": "1 Puff", "frequency": "Twice daily", "duration": "60 Days", "instructions": "Use with baby spacer mask"}]'::jsonb,
  'Lungs clear today. Peak flow acceptable. Emergency Salbutamol SOS available.',
  true
) ON CONFLICT (id) DO NOTHING;

-- 5. Insert Sample Active Medications (Aarav Sharma)
INSERT INTO active_medications (
  id, patient_id, name, dosage, frequency, purpose, prescribed_by, start_date, risk_level, warning
) VALUES (
  'MED-1',
  'PAT-IND-884210',
  'Ecosprin AV 75/20',
  '1 Capsule',
  'Once Daily (Night after dinner)',
  'Cardioprotection & Lipid Lowering',
  'Dr. Rajesh Kulkarni (Cardiology)',
  '2024-02-10',
  'RED',
  'Anticoagulant effect. Stop only under doctor guidance before surgery.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO active_medications (
  id, patient_id, name, dosage, frequency, purpose, prescribed_by, start_date, risk_level, warning
) VALUES (
  'MED-2',
  'PAT-IND-884210',
  'Telmisartan 40mg',
  '1 Tablet',
  'Once Daily (Morning 8:00 AM)',
  'Blood Pressure Management',
  'Dr. Rajesh Kulkarni (Cardiology)',
  '2021-08-15',
  'AMBER',
  'Monitor BP weekly.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO active_medications (
  id, patient_id, name, dosage, frequency, purpose, prescribed_by, start_date, risk_level, warning
) VALUES (
  'MED-3',
  'PAT-IND-884210',
  'Metformin 500mg SR',
  '1 Tablet',
  'Twice Daily (With meals)',
  'Type 2 Diabetes Glycemic Control',
  'Dr. Sunita Rao (Endocrinology)',
  '2023-01-20',
  'AMBER',
  'Take with food to minimize GI upset.'
) ON CONFLICT (id) DO NOTHING;

-- 6. Insert Hospital Access Grants (Aarav Sharma)
INSERT INTO hospital_access_grants (
  id, patient_id, hospital_name, hospital_uid, doctor_in_charge, granted_date, expiry_date, status, access_level, last_accessed
) VALUES (
  'HOSP-ACC-01',
  'PAT-IND-884210',
  'Manipal Hospital, Old Airport Road',
  'HOSP-KA-BLR-0042',
  'Dr. Rajesh Kulkarni (Cardiology OPD)',
  '2026-08-10',
  '2026-11-10',
  'Active',
  'Full Clinical History & Labs',
  '2026-09-18 10:45 AM'
) ON CONFLICT (id) DO NOTHING;

-- 7. Insert Emergency Logs
INSERT INTO emergency_access_logs (
  id, patient_id, hospital_name, accessed_at, personnel, reason, location, ip_address
) VALUES (
  'EMG-LOG-1',
  'PAT-IND-884210',
  'Aster CMI Hospital (Emergency Department)',
  '2026-05-12 10:14 PM',
  'Dr. Anand Verghese (ER Chief / Staff ID #ER-94)',
  'Break-Glass: Acute Anaphylaxis Emergency Triage',
  'Hebbal, Bengaluru',
  '103.24.18.91 (Verified Hospital Subnet)'
) ON CONFLICT (id) DO NOTHING;

-- 8. Insert Sample Hospital (Manipal Hospital, Old Airport Road)
INSERT INTO hospitals (
  id, name, address, uid, contact_email, contact_phone, password, mfa_type
) VALUES (
  'HOSP-KA-BLR-0042',
  'Manipal Hospital, Old Airport Road',
  '98, HAL Old Airport Rd, Kodihalli, Bengaluru, Karnataka 560017',
  'MANIPAL-001',
  'admin@manipalhospitals.com',
  '08025024444',
  'admin123',
  'SMS'
) ON CONFLICT (id) DO NOTHING;

-- 9. Insert Sample Doctors for Manipal Hospital
INSERT INTO doctors (
  id, hospital_id, name, specialization, registration_no, email, phone, password, status
) VALUES (
  'DOC-101',
  'HOSP-KA-BLR-0042',
  'Dr. Rajesh Kulkarni',
  'Cardiology & Interventional Cardiology',
  'KMC-CARD-8812',
  'dr.kulkarni@manipalhospitals.com',
  '9845011223',
  'doctor123',
  'Active'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO doctors (
  id, hospital_id, name, specialization, registration_no, email, phone, password, status
) VALUES (
  'DOC-102',
  'HOSP-KA-BLR-0042',
  'Dr. Sunita Rao',
  'Endocrinology & Diabetology',
  'KMC-ENDO-5419',
  'dr.sunita@manipalhospitals.com',
  '9845022334',
  'doctor123',
  'Active'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO doctors (
  id, hospital_id, name, specialization, registration_no, email, phone, password, status
) VALUES (
  'DOC-103',
  'HOSP-KA-BLR-0042',
  'Dr. Anita Desai',
  'Pediatrics & Neonatology',
  'KMC-PED-9904',
  'dr.anita@manipalhospitals.com',
  '9845033445',
  'doctor123',
  'Active'
) ON CONFLICT (id) DO NOTHING;

-- 10. Link Sample Patient to Hospital
INSERT INTO hospital_patients (
  id, hospital_id, patient_id
) VALUES (
  'LINK-01',
  'HOSP-KA-BLR-0042',
  'PAT-IND-884210'
) ON CONFLICT (id) DO NOTHING;

-- 11. Insert Live Patient Queue Tokens
INSERT INTO patient_tokens (
  id, hospital_id, patient_id, patient_name, patient_phone, token_number, doctor_id, doctor_name, department, risk_level, status, visit_date
) VALUES (
  'TOK-101',
  'HOSP-KA-BLR-0042',
  'PAT-IND-884210',
  'Aarav Sharma',
  '9876543210',
  'TK-101',
  'DOC-101',
  'Dr. Rajesh Kulkarni',
  'Cardiology',
  'RED',
  'In Consultation',
  CURRENT_DATE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO patient_tokens (
  id, hospital_id, patient_id, patient_name, patient_phone, token_number, doctor_id, doctor_name, department, risk_level, status, visit_date
) VALUES (
  'TOK-102',
  'HOSP-KA-BLR-0042',
  'PAT-IND-884210',
  'Kabir Sharma (Child)',
  '9876543210',
  'TK-102',
  'DOC-103',
  'Dr. Anita Desai',
  'Pediatrics',
  'AMBER',
  'Waiting',
  CURRENT_DATE
) ON CONFLICT (id) DO NOTHING;

