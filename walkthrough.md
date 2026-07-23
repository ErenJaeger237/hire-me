# Walkthrough - Hire Me Full-Stack Marketplace System

The **Hire Me** system specified in [overview.md](file:///c:/Users/NTS/Documents/hire-me/overview.md) has been fully built, structured, and tested.

## Accomplished Implementation

### 1. Database & Backend Architecture (`backend/`)
* **Sequelize Models**: Defined [User.js](file:///c:/Users/NTS/Documents/hire-me/backend/src/models/User.js), [ProviderProfile.js](file:///c:/Users/NTS/Documents/hire-me/backend/src/models/ProviderProfile.js), and [Booking.js](file:///c:/Users/NTS/Documents/hire-me/backend/src/models/Booking.js) mapping the MySQL database schema.
* **OOP Class Hierarchy**:
  * [UserClass.js](file:///c:/Users/NTS/Documents/hire-me/backend/src/classes/UserClass.js): Base class encapsulating core attributes and JWT token generation.
  * [ClientClass.js](file:///c:/Users/NTS/Documents/hire-me/backend/src/classes/ClientClass.js): Child class handling client booking requests & reviews.
  * [ServiceProviderClass.js](file:///c:/Users/NTS/Documents/hire-me/backend/src/classes/ServiceProviderClass.js): Child class handling job acceptance, rejection, and completion status transitions.
* **REST APIs & Controllers**: Implemented routes for Registration/Login (`/api/auth`), Discovery Search (`/api/providers`), and Booking Engine (`/api/bookings`).
* **Interactive Swagger UI**: Configured at `http://localhost:5000/api-docs` using JSDoc openapi annotations.

### 2. Presentation Layer (`frontend/`)
* **Vite + React + Tailwind CSS**: Built responsive UI with glassmorphic cards and dynamic role badges.
* **Screen 1 (Landing & Auth)**: [LandingAuth.jsx](file:///c:/Users/NTS/Documents/hire-me/frontend/src/pages/LandingAuth.jsx) with tabbed login/signup and role selection.
* **Screen 2 (Client Discovery)**: [ClientDashboard.jsx](file:///c:/Users/NTS/Documents/hire-me/frontend/src/pages/ClientDashboard.jsx) with real-time trade category and hourly rate filters.
* **Screen 3 (Provider Kanban Board)**: [ProviderDashboard.jsx](file:///c:/Users/NTS/Documents/hire-me/frontend/src/pages/ProviderDashboard.jsx) with `Pending Requests`, `Active Jobs`, and `Completed Jobs` columns.
* **Screen 4 (Booking Checkout Modal)**: [BookingModal.jsx](file:///c:/Users/NTS/Documents/hire-me/frontend/src/components/BookingModal.jsx) date/time picker modal.

---

## Verification Results

### Automated Jest Tests
```bash
PASS tests/auth.test.js (6.028 s)
  Hire Me Backend API & OOP Domain Tests
    UserClass OOP Unit Tests
      √ UserClass should encapsulate attributes and verify password correctly (7 ms)
    API Route HTTP Status Tests
      √ GET /api/providers should return 200 OK and an array (106 ms)
      √ POST /api/auth/login should return 401 for invalid credentials (93 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

---

## Running the Application Locally

1. **Start the Backend API Server**:
   ```bash
   cd c:\Users\NTS\Documents\hire-me\backend
   npm run dev
   ```
   * Express API: `http://localhost:5000`
   * Swagger Documentation: `http://localhost:5000/api-docs`

2. **Start the Frontend Web Application**:
   ```bash
   cd c:\Users\NTS\Documents\hire-me\frontend
   npm run dev
   ```
   * Vite App: `http://localhost:5173`
