# OneRecord

### 🚀 [Deployed Link](https://bits-one-beta.vercel.app/)

# OneRecord: Unified Longitudinal Health Record & Consent Platform

> **A National Health Stack Solution** for unified patient health record timelines, dynamic risk-stratified triage, institutional access consent management, emergency room break-glass protocols, and healthcare partner integrations.

---

## 🌟 Architecture Overview & Ecosystem

OneRecord solves the systemic healthcare problem of fragmented medical histories across disparate hospitals, pharmacies, and diagnostic laboratories.

The system is structured into four primary workflows:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   ONERECORD ECOSYSTEM                                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
        │                                  │                                  │
        ▼                                  ▼                                  ▼
┌──────────────────┐             ┌──────────────────┐             ┌──────────────────────┐
│  Patient Portal  │             │  Hospital Admin  │             │   Doctor Desk Portal │
│  (Port 5173)     │             │  (Port 5173)     │             │   (Port 5173)        │
├──────────────────┤             ├──────────────────┤             ├──────────────────────┤
│• Longitudinal    │             │• Live Queue      │             │• Patient Queue       │
│  Health Vault    │             │• Sequential      │             │• Triage Risk 🔴🟡🟢  │
│• Risk Stratified │             │  Tokens          │             │• Prescription Notes  │
│  Alerts 🔴🟡🟢   │             │• Link Patients   │             │• Interactive Visit   │
│• Medical Calendar│             │  via OTP         │             │  Calendar with       │
│• Dependents &    │             │• Provision MDs   │             │  Doctor Markings ★   │
│  Family Profiles │             │• Break-Glass ER  │             │• Consultation History│
│• Consent Manager │             │• Visit Logs      │             │                      │
└──────────────────┘             └──────────────────┘             └──────────────────────┘
        ▲                                  ▲                                  ▲
        └──────────────────────────────────┼──────────────────────────────────┘
                                           │
                        ┌─────────────────────────────────────┐
                        │   PostgreSQL Engine API (Port 5001) │
                        └─────────────────────────────────────┘
                                           ▲
        ┌──────────────────────────────────┴──────────────────────────────────┐
        │                                                                     │
┌───────────────────────────────┐                   ┌─────────────────────────────────┐
│  Retail Pharmacy Billing POS  │                   │ Diagnostic Lab Report Submission│
│  (Port 5174)                  │                   │ (Port 5174)                     │
├───────────────────────────────┤                   ├─────────────────────────────────┤
│• Tablet / Medicine Cart       │                   │• Clinical Parameter Builder     │
│• Patient Mobile & OTP Verify  │                   │• Pathology & Blood Reports      │
│• Auto-sync to Patient Vault   │                   │• Direct Delivery to Vault       │
└───────────────────────────────┘                   └─────────────────────────────────┘
```

---

## 🚀 Port & Service Mapping

| Service / Portal | Port | Description |
|---|---|---|
| **Main Clinical & Patient Web App** | `http://localhost:5173` | Patient Vault, Hospital Admin, and Doctor Desk |
| **Partner Web App (Pharmacy & Lab)** | `http://localhost:5174` | Standalone Pharmacy POS Billing & Diagnostic Lab Report Delivery |
| **PostgreSQL API Server** | `http://localhost:5001` | Express.js API connecting to persistent PostgreSQL engine |

---

## 🔑 Pre-Configured Sample Accounts for Demo

### 1. Patient Portal (`http://localhost:5173`)
- **Mobile Number**: `9876543210`
- **Password**: `password123` (or use OTP: `123456`)
- **Sample Profile**: *Aarav Sharma* (Age 42, Blood Group `O+`, CAD Post-PTCA, Systemic Hypertension, Penicillin Allergy)
- **Family Dependents**: *Kabir Sharma* (Son, Age 8, Pediatric Asthma)

### 2. Hospital Administration (`http://localhost:5173` -> Hospital Admin)
- **Hospital UID**: `MANIPAL-001`
- **Password**: `admin123`
- **MFA Code**: `123456`
- **Sample Hospital**: *Manipal Hospital, Old Airport Road, Bengaluru*

### 3. Doctor Clinical Portal (`http://localhost:5173` -> Doctor Portal)
- **Doctor Email / Reg No**: `dr.kulkarni@manipalhospitals.com` (or `KMC-CARD-8812`)
- **Password**: `doctor123`
- **Sample Doctor**: *Dr. Rajesh Kulkarni* (Cardiology & Interventional Cardiology)

### 4. Medical Shop & Lab Report Submission (`http://localhost:5174`)
- **Direct Access**: No login required.
- **Patient Mobile**: Enter `9876543210` (Verify via OTP `123456`) to bill medicines or submit lab reports directly to the patient's record.

---

## 🛠️ Step-by-Step Installation & Local Run Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Vigesh-VS/Bits-and-Bytes.git
cd Bits-and-Bytes
npm install
```

### 2. Start PostgreSQL Backend Engine (Port 5001)
Open a terminal and run:
```bash
npm run server
```
*The database automatically creates all 10 schema tables and seeds initial demonstration patients, doctors, and hospitals.*

### 3. Start Main Web Application (Port 5173)
Open a second terminal and run:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your web browser.

### 4. Start Pharmacy POS & Lab Report Partner Web App (Port 5174)
Open a third terminal and run:
```bash
npm run dev:partners
```
Open **`http://localhost:5174`** in your web browser.

---

## 🧪 Demonstration & Testing Workflow

### Scenario 1: Patient Dashboard Flow
1. Open `http://localhost:5173`.
2. Sign in with mobile `9876543210` and OTP `123456`.
3. Review the **Longitudinal Overview**:
   - 🔴 **Red Risk Alerts**: High-risk cardiac medications and bleeding warnings.
   - **Active Medications**: Full list of currently active prescriptions with dosages.
   - **Records & Interactive Calendar**: Filter records by clicking on dates with color-coded markers.
   - **Family Profiles**: Switch profile to *Kabir Sharma (Son)* to inspect pediatric asthma records.
   - **Emergency Card**: Download or view emergency QR code with blood group and critical contact info.

### Scenario 2: Hospital Reception & Queue Management
1. Click **Hospital Admin** in the top navigation bar.
2. Sign in with UID `MANIPAL-001`, Password `admin123`, and MFA `123456`.
3. **Queue & Tokens**:
   - Click **+ Check-in Patient**, type mobile `9876543210`, select *Cardiology* and *Dr. Rajesh Kulkarni*, and click *Generate Token*.
   - Notice the generated token (`TK-101`, `TK-102`, etc.) appear live in the queue.
4. **Manage Patients**:
   - Link a patient by entering their mobile number and confirming the OTP.
5. **Manage Doctors**:
   - Provision new doctor accounts and toggle status (*Active* / *Suspended*).
6. **Emergency Lookup**:
   - Enter mobile `9876543210` to view the instant Break-Glass emergency dossier without patient password.

### Scenario 3: Doctor Clinical Desk
1. Click **Doctor Portal** in the top navigation bar.
2. Sign in with `dr.kulkarni@manipalhospitals.com` and `doctor123`.
3. **Live Queue**: View all waiting patient tokens with triage color badges.
4. **Active Consultation**:
   - Click a patient token to view their complete longitudinal medical history.
   - Click **+ Add Prescription / Clinical Note** to prescribe new medicines and assign a risk rating.
5. **Patients & Calendar**:
   - Open the interactive calendar. Days where the patient visited Dr. Kulkarni are marked with **★ Visited You** (teal).
   - Click any date to filter records for that encounter.

### Scenario 4: Pharmacy POS & Lab Submission
1. Open `http://localhost:5174`.
2. **Medical Shop POS**:
   - Add medicines to the billing cart.
   - Enter patient mobile `9876543210`, click *Send OTP*, enter `123456`, and submit.
3. **Lab Report Submission**:
   - Switch to the *Lab Report Submission* tab.
   - Add test parameters (e.g., HbA1c, Lipid panel, CBC).
   - Submit the report with patient mobile `9876543210`.
4. Return to the **Patient Portal (Port 5173)** to see the newly billed medications and lab reports updated in real time.

---

## 📂 Project Structure

```
OneRecord/
├── package.json                     # Root dependencies & scripts (dev, dev:partners, server)
├── vite.config.js                   # Vite config for main app (Port 5173)
├── vite.pharmacy-lab.config.js      # Vite config for pharmacy & lab portal (Port 5174)
├── server/
│   ├── server.js                    # Express API with PostgreSQL CRUD
│   ├── db.js                        # Dual engine (PGlite persistent / Cloud Postgres)
│   ├── schema.sql                   # 10 DDL tables, indexes, constraints
│   └── seed.sql                     # Demonstration seed dataset
├── src/                             # Main Web Application (Port 5173)
│   ├── components/                  # Navbar, Modals, Calendar, QR cards
│   ├── context/                     # HealthContext, HospitalContext, DoctorContext
│   ├── pages/
│   │   ├── auth/                    # Patient Login & Registration
│   │   ├── patient/                 # Patient Home, Records, Calendar, Access, Emergency
│   │   ├── hospital/                # Hospital Auth, Queue, Users, Doctors, History, Emergency
│   │   └── doctor/                  # Doctor Login, Home Queue, History, Patients & Calendar
│   ├── App.jsx                      # Portal router & ecosystem footer
│   └── index.css                    # Unified clinical design system
└── pharmacy-lab-app/                # Standalone Partner App (Port 5174)
    ├── index.html                   # HTML entry point
    └── src/
        ├── App.jsx                  # Pharmacy POS Billing & Lab Report Submission
        ├── main.jsx                 # React root
        └── index.css                # Styling tokens
```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
