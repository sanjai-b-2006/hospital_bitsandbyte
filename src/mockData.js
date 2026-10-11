// In-browser fallback data engine for standalone Vercel hosting & offline demo
// Synchronously mirrors the PostgreSQL seed database schema

export const INITIAL_PATIENT = {
  id: 'PAT-IND-884210',
  name: 'Aarav Sharma',
  phone: '9876543210',
  password: 'password123',
  aadhaar: '5421 9832 1045',
  email: 'aarav.sharma@example.com',
  age: 42,
  gender: 'Male',
  bloodGroup: 'O+',
  address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru, Karnataka - 560103',
  dob: '1984-06-14',
  organDonor: true,
  emergencyContacts: [
    { name: 'Priya Sharma (Spouse)', phone: '+91 98765 43211', relation: 'Spouse' },
    { name: 'Dr. Rajesh Kulkarni', phone: '+91 98450 11223', relation: 'Primary Cardiologist' }
  ],
  allergies: [
    { allergen: 'Penicillin', severity: 'Severe (Anaphylaxis Risk)', reaction: 'Bronchospasm, facial swelling' },
    { allergen: 'Sulfa Drugs', severity: 'Moderate', reaction: 'Urticaria and cutaneous rash' }
  ],
  criticalConditions: [
    'Hypertension (Stage II - Diagnosed 2021)',
    'Type 2 Diabetes Mellitus (Controlled)',
    'Coronary Artery Stent (DES placed in RCA, 2024)'
  ]
};

export const INITIAL_DEPENDENTS = [
  {
    id: 'DEP-KABIR-01',
    guardianId: 'PAT-IND-884210',
    name: 'Kabir Sharma',
    relation: 'Son',
    age: 8,
    gender: 'Male',
    bloodGroup: 'B+',
    dob: '2018-04-12',
    aadhaar: '8832 1192 4432',
    allergies: [{ allergen: 'Peanuts', severity: 'Moderate', reaction: 'Urticaria and lip swelling' }],
    criticalConditions: ['Pediatric Asthma (Dust & Cold Triggered)'],
    organDonor: false
  }
];

export const INITIAL_RECORDS = [
  {
    id: 'REC-2026-091',
    patientId: 'PAT-IND-884210',
    dependentId: null,
    title: 'Cardiology Follow-Up & Stress Echo',
    type: 'Prescription',
    date: '2026-09-18',
    doctor: 'Dr. Rajesh Kulkarni, MD, DM',
    hospital: 'Manipal Hospital, Old Airport Road, Bengaluru',
    department: 'Cardiology',
    risk: 'RED',
    riskReason: 'Coronary Stent maintenance, dual antiplatelet regimen. Close bleeding risk monitoring required.',
    diagnosis: 'CAD Post-PTCA (DES in RCA), Well-controlled systemic hypertension.',
    medications: [
      { name: 'Ecosprin AV 75/20', dosage: '1 Capsule', frequency: 'Once daily after dinner', duration: '90 Days', instructions: 'Do not stop abruptly' },
      { name: 'Telmisartan 40mg', dosage: '1 Tablet', frequency: 'Once daily morning (8 AM)', duration: '90 Days', instructions: 'Monitor BP weekly' },
      { name: 'Metoprolol Succinate 25mg ER', dosage: '1 Tablet', frequency: 'Once daily morning', duration: '90 Days', instructions: 'Pulse rate monitoring' }
    ],
    notes: 'Patient feels asymptomatic on brisk walking. ECG shows normal sinus rhythm with stable T-wave changes. Advised lipid panel in 3 months.',
    isEmergencyVisible: true
  },
  {
    id: 'REC-2026-085',
    patientId: 'PAT-IND-884210',
    dependentId: null,
    title: 'Comprehensive Metabolic Panel & Glycated HbA1c',
    type: 'Lab Report',
    date: '2026-08-30',
    doctor: 'Dr. Sunita Rao (Pathologist)',
    hospital: 'Anand Diagnostic Laboratory, Indiranagar',
    department: 'Biochemistry',
    risk: 'AMBER',
    riskReason: 'HbA1c elevated at 7.2%. Fasting Blood Sugar 138 mg/dL. Requires lifestyle & dose calibration.',
    diagnosis: 'Type 2 Diabetes Mellitus - Moderate Glycemic Control',
    labResults: [
      { test: 'HbA1c', result: '7.2 %', status: 'High' },
      { test: 'Fasting Blood Glucose', result: '138 mg/dL', status: 'High' },
      { test: 'Serum Creatinine', result: '1.02 mg/dL', status: 'Normal' }
    ],
    notes: 'Renal function is well preserved. Kidney panel clear.',
    isEmergencyVisible: true
  },
  {
    id: 'REC-2026-072',
    patientId: 'PAT-IND-884210',
    dependentId: null,
    title: 'Monthly Chronic Refill Dispensation',
    type: 'Pharmacy Bill',
    date: '2026-07-15',
    doctor: 'Pharmacist: M. Venkatesh (Lic #KA-BLR-841)',
    hospital: 'MedPlus Pharmacy, Bellandur Branch',
    department: 'Pharmacy Retail',
    risk: 'GREEN',
    riskReason: 'Regular refill verified against digital prescription REC-2026-091.',
    diagnosis: 'Routine Prescription Refill',
    medications: [
      { name: 'Metformin 500mg SR', dosage: '60 Tablets', frequency: 'Twice daily', duration: '30 Days', instructions: 'With meals' }
    ],
    notes: 'Refill dispensed under OTP authentication.',
    isEmergencyVisible: false
  },
  {
    id: 'REC-2026-064',
    patientId: 'PAT-IND-884210',
    dependentId: null,
    title: '2D Echocardiography & 24h Holter Monitoring',
    type: 'Diagnostic Report',
    date: '2026-06-22',
    doctor: 'Dr. Rajesh Kulkarni, MD, DM',
    hospital: 'Manipal Hospital, Old Airport Road',
    department: 'Cardiology',
    risk: 'RED',
    riskReason: 'Left ventricular ejection fraction (LVEF) 52%, stable post-stent wall motion abnormality. Strict antiplatelet adherence required.',
    diagnosis: 'Post-PTCA Ischemic Cardiomyopathy (Stable)',
    labResults: [
      { test: 'LVEF (Ejection Fraction)', result: '52 %', status: 'Normal' },
      { test: 'E/A Ratio', result: '0.85', status: 'Low' },
      { test: 'Holter PVC Burden', result: '1.2 %', status: 'Normal' },
      { test: 'RCA Stent Patency', result: 'Patent (No In-Stent Restenosis)', status: 'Normal' }
    ],
    notes: 'Echo reveals preserved global systolic function with hypokinesia in inferior segment. Stent in RCA is widely patent with good distal run-off. Continue dual antiplatelet therapy (Ecosprin + Clopidogrel).',
    isEmergencyVisible: true
  },
  {
    id: 'REC-2026-050',
    patientId: 'PAT-IND-884210',
    dependentId: null,
    title: 'Annual Diabetic Retinal Screening & Fundus Exam',
    type: 'Clinical Summary',
    date: '2026-05-18',
    doctor: 'Dr. Preeti Ganguly, MS (Ophthalmology)',
    hospital: 'Narayana Nethralaya, Rajajinagar',
    department: 'Ophthalmology',
    risk: 'AMBER',
    riskReason: 'Mild non-proliferative diabetic retinopathy (NPDR) in right eye. Requires tight glycemic and BP control to prevent progression.',
    diagnosis: 'Mild Non-Proliferative Diabetic Retinopathy (OU)',
    medications: [
      { name: 'Tears Naturale II Lubricant Eye Drops', dosage: '1 Drop in both eyes', frequency: '3 times daily', duration: '90 Days', instructions: 'For dry eyes and digital strain' }
    ],
    notes: 'Fundus photograph shows microaneurysms in right temporal arcade, no macular edema. Left eye clear. Advised repeat dilated fundus evaluation in 6 months.',
    isEmergencyVisible: false
  },
  {
    id: 'REC-2026-038',
    patientId: 'PAT-IND-884210',
    dependentId: null,
    title: 'Annual Renal & Liver Biochemical Profile',
    type: 'Lab Report',
    date: '2026-04-10',
    doctor: 'Dr. Anand Raman, MD (Pathology)',
    hospital: 'Apollo Diagnostics, Koramangala',
    department: 'Clinical Biochemistry',
    risk: 'GREEN',
    riskReason: 'All renal and hepatic parameters within standard physiological reference ranges.',
    diagnosis: 'Normal Renal & Hepatic Function',
    labResults: [
      { test: 'Serum Creatinine', result: '0.95 mg/dL', status: 'Normal' },
      { test: 'Blood Urea Nitrogen (BUN)', result: '14 mg/dL', status: 'Normal' },
      { test: 'eGFR', result: '> 90 mL/min/1.73m²', status: 'Normal' },
      { test: 'SGOT (AST)', result: '24 U/L', status: 'Normal' },
      { test: 'SGPT (ALT)', result: '28 U/L', status: 'Normal' },
      { test: 'Serum Bilirubin Total', result: '0.7 mg/dL', status: 'Normal' }
    ],
    notes: 'Excellent organ profile. Kidney filtration rate is optimal. Liver enzymes completely normal despite chronic oral medications.',
    isEmergencyVisible: true
  },
  {
    id: 'REC-KABIR-01',
    patientId: 'PAT-IND-884210',
    dependentId: 'DEP-KABIR-01',
    title: 'Pediatric Asthma Follow-Up & Inhaler Protocol',
    type: 'Prescription',
    date: '2026-08-14',
    doctor: 'Dr. Anita Desai, MD (Pediatrics)',
    hospital: 'Rainbow Children\'s Hospital, Marathahalli',
    department: 'Pediatric Pulmonology',
    risk: 'AMBER',
    riskReason: 'Seasonal wheezing triggered by dust mites. Advised Budecort inhaler with pediatric spacer.',
    diagnosis: 'Mild Persistent Pediatric Asthma',
    medications: [
      { name: 'Budecort 100 Inhaler', dosage: '1 Puff', frequency: 'Twice daily', duration: '60 Days', instructions: 'Use with baby spacer mask' }
    ],
    notes: 'Lungs clear today. Peak flow acceptable. Emergency Salbutamol SOS available.',
    isEmergencyVisible: true
  }
];

export const INITIAL_MEDICATIONS = [
  {
    id: 'MED-1',
    patientId: 'PAT-IND-884210',
    name: 'Ecosprin AV 75/20',
    dosage: '1 Capsule',
    frequency: 'Once Daily (Night after dinner)',
    purpose: 'Cardioprotection & Lipid Lowering',
    prescribedBy: 'Dr. Rajesh Kulkarni (Cardiology)',
    startDate: '2024-02-10',
    riskLevel: 'RED',
    warning: 'Anticoagulant effect. Stop only under doctor guidance before surgery.'
  },
  {
    id: 'MED-2',
    patientId: 'PAT-IND-884210',
    name: 'Telmisartan 40mg',
    dosage: '1 Tablet',
    frequency: 'Once Daily (Morning 8:00 AM)',
    purpose: 'Blood Pressure Management',
    prescribedBy: 'Dr. Rajesh Kulkarni (Cardiology)',
    startDate: '2021-08-15',
    riskLevel: 'AMBER',
    warning: 'Monitor BP weekly.'
  },
  {
    id: 'MED-3',
    patientId: 'PAT-IND-884210',
    name: 'Metformin 500mg SR',
    dosage: '1 Tablet',
    frequency: 'Twice Daily (With meals)',
    purpose: 'Type 2 Diabetes Glycemic Control',
    prescribedBy: 'Dr. Sunita Rao (Endocrinology)',
    startDate: '2023-01-20',
    riskLevel: 'AMBER',
    warning: 'Take with food to minimize GI upset.'
  }
];

export const INITIAL_HOSPITAL = {
  id: 'HOSP-KA-BLR-0042',
  name: 'Manipal Hospital, Old Airport Road',
  address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru, Karnataka 560017',
  uid: 'MANIPAL-001',
  contactEmail: 'admin@manipalhospitals.com',
  contactPhone: '08025024444',
  mfaType: 'SMS'
};

export const INITIAL_DOCTORS = [
  {
    id: 'DOC-101',
    hospitalId: 'HOSP-KA-BLR-0042',
    name: 'Dr. Rajesh Kulkarni',
    specialization: 'Cardiology & Interventional Cardiology',
    registrationNo: 'KMC-CARD-8812',
    email: 'dr.kulkarni@manipalhospitals.com',
    phone: '9845011223',
    password: 'doctor123',
    status: 'Active'
  },
  {
    id: 'DOC-102',
    hospitalId: 'HOSP-KA-BLR-0042',
    name: 'Dr. Sunita Rao',
    specialization: 'Endocrinology & Diabetology',
    registrationNo: 'KMC-ENDO-5419',
    email: 'dr.sunita@manipalhospitals.com',
    phone: '9845022334',
    password: 'doctor123',
    status: 'Active'
  },
  {
    id: 'DOC-103',
    hospitalId: 'HOSP-KA-BLR-0042',
    name: 'Dr. Anita Desai',
    specialization: 'Pediatrics & Neonatology',
    registrationNo: 'KMC-PED-9904',
    email: 'dr.anita@manipalhospitals.com',
    phone: '9845033445',
    password: 'doctor123',
    status: 'Active'
  }
];

export const INITIAL_TOKENS = [
  {
    id: 'TOK-101',
    hospitalId: 'HOSP-KA-BLR-0042',
    patientId: 'PAT-IND-884210',
    patientName: 'Aarav Sharma',
    patientPhone: '9876543210',
    tokenNumber: 'TK-101',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Rajesh Kulkarni',
    department: 'Cardiology',
    riskLevel: 'RED',
    status: 'In Consultation',
    visitDate: new Date().toISOString().split('T')[0]
  },
  {
    id: 'TOK-102',
    hospitalId: 'HOSP-KA-BLR-0042',
    patientId: 'PAT-IND-884210',
    patientName: 'Kabir Sharma (Child)',
    patientPhone: '9876543210',
    tokenNumber: 'TK-102',
    doctorId: 'DOC-103',
    doctorName: 'Dr. Anita Desai',
    department: 'Pediatrics',
    riskLevel: 'AMBER',
    status: 'Waiting',
    visitDate: new Date().toISOString().split('T')[0]
  }
];

export const INITIAL_ACCESS_GRANTS = [
  {
    id: 'HOSP-ACC-01',
    patientId: 'PAT-IND-884210',
    hospitalName: 'Manipal Hospital, Old Airport Road',
    hospitalUid: 'HOSP-KA-BLR-0042',
    doctorInCharge: 'Dr. Rajesh Kulkarni (Cardiology OPD)',
    grantedDate: '2026-08-10',
    expiryDate: '2026-11-10',
    status: 'Active',
    accessLevel: 'Full Clinical History & Labs',
    lastAccessed: '2026-09-18 10:45 AM'
  }
];

export const INITIAL_EMERGENCY_LOGS = [
  {
    id: 'EMG-LOG-1',
    patientId: 'PAT-IND-884210',
    hospitalName: 'Aster CMI Hospital (Emergency Department)',
    accessedAt: '2026-05-12 10:14 PM',
    personnel: 'Dr. Anand Verghese (ER Chief / Staff ID #ER-94)',
    reason: 'Break-Glass: Acute Anaphylaxis Emergency Triage',
    location: 'Hebbal, Bengaluru',
    ipAddress: '103.24.18.91 (Verified Hospital Subnet)'
  }
];
