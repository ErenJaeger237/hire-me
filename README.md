# Hire Me - On-Demand Local Services Marketplace

A modern, decoupled 3-tier web application connecting local talent and service providers with clients in real-time. Built with a robust Node.js/Express backend and a responsive React frontend.

## 🚀 Key Features

* **Role-Based Dashboards:** Distinct tailored experiences for Clients, Service Providers, and Administrators.
* **Real-Time Chat:** Integrated Socket.io messaging allowing clients and providers to communicate seamlessly once a booking is initiated.
* **Kanban Workflow:** Intuitive drag-and-drop-style status tracking (Pending, Active, Completed) for Service Providers.
* **Secure Financial Wallet:** Built-in digital wallet system for managing FCFA balances, handling escrow during active jobs, and facilitating seamless provider payouts.
* **Rating & Reviews:** Comprehensive feedback system with half-star precision and written testimonials.
* **Layered Security:** Robust protections against SQL injection (Sequelize ORM), XSS, JWT forging, and malicious file uploads. 

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, Lucide React (Icons), React Router
* **Backend:** Node.js, Express, Socket.io, Multer (File Uploads)
* **Database:** MySQL / MariaDB via Sequelize ORM
* **Security:** bcrypt (Hashing), JSON Web Tokens (JWT), Helmet, Express Rate Limit, Zod (Input Validation)

---

## 📋 System Prerequisites

Before you begin, ensure you have met the following requirements:

* **Node.js:** v18.0.0 or newer (LTS recommended)
* **npm:** v9.0.0 or newer (comes with Node.js)
* **Database:** MySQL (v8.0+) or MariaDB (v10.4+) running locally or on a remote server.
* **Git:** For version control and cloning the repository.

---

## ⚙️ Installation & Setup Guide

### 1. Clone the Repository
```bash
git clone https://github.com/ErenJaeger237/hire-me.git
cd hire-me
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and configure the environment:

```bash
cd backend
npm install
```

**Configure Backend Environment Variables:**
Create a `.env` file in the root of the `backend/` directory:
```env
PORT=5000
DB_NAME=hire_me_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=127.0.0.1
DB_DIALECT=mysql
JWT_SECRET=generate_a_strong_random_secret_key_here
```
> **Note:** If `JWT_SECRET` is missing, the backend will fail to start as a security precaution.

**Initialize the Database:**
Ensure your MySQL server is running and create the database:
```sql
CREATE DATABASE hire_me_db;
```
*(Sequelize will automatically synchronize the tables when you start the server).*

**Start the Backend Server:**
```bash
npm run dev
```
The API will be available at `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and configure the environment:

```bash
cd frontend
npm install
```

**Configure Frontend Environment Variables:**
Create a `.env` file in the root of the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000
```

**Start the Frontend Development Server:**
```bash
npm run dev
```
The web application will be available at `http://localhost:5173`.

---

## 📂 Project Structure

- `frontend/`: Contains the presentation layer (React + Vite, Tailwind CSS).
- `backend/`: Contains the application layer and APIs (Node.js, Express, Sequelize).
- `documentation/`: Contains project planning, PRD, and SRD documents.
- `UML diagrams/`: Contains architectural and flow diagrams.

---

## 🔒 Security Notes for Production Deployment
Before deploying to a live environment (e.g., Render, Vercel, AWS):
1. Change `sequelize.sync({ alter: true })` to use formal Sequelize Migrations.
2. Set a strong, cryptographically secure `JWT_SECRET`.
3. Use a managed database service (e.g., PlanetScale, AWS RDS) instead of local MySQL.
4. Ensure `VITE_API_URL` points to your production backend URL.
