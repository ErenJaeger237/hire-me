# Hire Me Platform

**Hire Me** is a robust, full-stack digital marketplace connecting clients with local freelance professionals for everyday services (plumbing, tutoring, electrical work, etc.). The platform ensures secure transactions via an integrated virtual wallet and escrow system, while providing real-time chat and transparent rating mechanisms to build trust in the local gig economy.

## 👥 The Team
This project was engineered and developed by:
- **EBUA KEDZE FRANCK JORDAN** (Member 1) - Scrum Master & Backend Lead
- **AWONO FABIEN NYADINGA** (Member 2) - Frontend Lead & DevOps Engineer
- **Besomba Baonerges** (Member 3) - Systems Analyst & Lead Technical Writer
- **NDZI LEVI KONGNYU** (Member 4) - UML Architect & Quality Assurance (QA) Engineer

## 🚀 Key Features
- **Role-Based Access Control (RBAC):** Distinct dashboards for Clients, Providers, and Admins.
- **Wallet & Escrow System:** Securely hold client funds until a job is completed.
- **Real-Time Communication:** Instant messaging via Socket.io to negotiate terms safely.
- **Provider Verification:** Admin-verified professional profiles for trust and security.
- **Review & Rating Engine:** Transparent feedback loop after job completion.

## 🛠 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** Sequelize (MySQL/SQLite)
- **Real-Time:** Socket.io
- **Authentication:** JSON Web Tokens (JWT) & bcrypt

## 💻 How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/ErenJaeger237/hire-me.git
cd hire-me
```

### 2. Backend Setup
```bash
cd backend
npm install
# Copy the environment template
cp .env.example .env
# Start the development server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
# Start the Vite development server
npm run dev
```

### 4. Seed Dummy Data
To populate the database with fake users and providers for testing, run the seeders:
```bash
cd backend
npm run seed
```

The application will now be running on `http://localhost:5173` (Frontend) and `http://localhost:5000` (Backend).
