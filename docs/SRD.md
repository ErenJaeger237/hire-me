# Software Requirements Document (SRD)
**Project Name:** Hire Me Platform
**Document Version:** 1.0
**Author:** Besomba Baonerges (Systems Analyst)

## 1. System Architecture
The platform follows a Client-Server architecture:
- **Presentation Layer (Frontend):** React.js Single Page Application (SPA) bundled with Vite. State is managed via React Context/Hooks. Styling via Tailwind CSS.
- **Application Layer (Backend):** Node.js runtime with Express.js framework. RESTful API endpoints and WebSocket (Socket.io) connections.
- **Data Layer:** Relational database managed via Sequelize ORM (SQLite for development, MySQL/PostgreSQL for production).

## 2. Functional Requirements

### 2.1 Authentication & Authorization
- **REQ-01:** The system shall allow users to register with a name, email, password, and role (CLIENT or PROVIDER).
- **REQ-02:** The system shall issue a JWT upon successful login, which must be attached to the `Authorization` header for protected routes.

### 2.2 Wallet & Transactions
- **REQ-03:** The system shall maintain a digital wallet balance for all users.
- **REQ-04:** Creating a booking shall deduct the estimated fee from the client's wallet and log an `ESCROW_HOLD` transaction.
- **REQ-05:** Completing a booking shall deposit 95% of the escrowed funds to the provider and 5% to the platform.

### 2.3 Provider Discovery
- **REQ-06:** The system shall provide a search endpoint allowing clients to filter providers by trade/category and maximum hourly rate.
- **REQ-07:** The system shall allow clients to save/bookmark providers for future reference.

### 2.4 Real-Time Chat
- **REQ-08:** The system shall establish a WebSocket connection authenticated via JWT.
- **REQ-09:** The system shall broadcast new messages only to the specific client and provider associated with that booking room.

## 3. Database Schema Requirements
- `Users`: id, name, email, password_hash, role, wallet_balance, created_at
- `ProviderProfiles`: id, user_id, trade, hourly_rate, bio, is_verified, rating
- `Bookings`: id, client_id, provider_id, job_date, status (PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED), estimated_hours, rating
- `Transactions`: id, user_id, amount, type, status, created_at
- `Messages`: id, booking_id, sender_id, content, timestamp
