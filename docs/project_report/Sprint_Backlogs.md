# Hire Me Platform - Sprint Backlogs

The development of the Hire Me platform was divided into a 4-week timeline. We utilized the Scrum methodology to iteratively build, test, and deploy features. Below is the breakdown of tasks across four one-week Sprints.

## Sprint 1: Foundation and Architecture
**Goal:** Establish the project architecture, database models, and core authentication system.

| Task | Assignee | Status |
|------|----------|--------|
| Initialize backend (Node.js/Express) and frontend (React/Vite) repositories. | Nyadinga (Frontend), ErenJaeger237 (Backend) | Done |
| Design database schema (Users, Profiles, Bookings, Transactions, Messages). | ErenJaeger237 | Done |
| Implement JWT Authentication and Role-Based Access Control (RBAC). | ErenJaeger237 | Done |
| Create basic UI wireframes and establish the Tailwind CSS design system. | Nyadinga | Done |
| Build Landing Auth page and basic routing structure. | Nyadinga | Done |
| **Deliverable:** Working login/registration system with persistent local storage. | **Team** | **Achieved** |

## Sprint 2: Core Marketplace Workflows
**Goal:** Implement the primary flows: Profiles, Wallets, and the Booking Lifecycle.

| Task | Assignee | Status |
|------|----------|--------|
| Develop the Wallet & Escrow system endpoints (Top-up, Escrow Hold, Payout). | ErenJaeger237 | Done |
| Build Provider Search API with filtering by category and hourly rate. | ErenJaeger237 | Done |
| Develop Client Dashboard (Provider search, listing bookings). | Nyadinga | Done |
| Develop Provider Dashboard (Accept/Reject bookings, Earnings view). | Nyadinga | Done |
| Implement Provider Profile page and Booking Modal. | Nyadinga | Done |
| **Deliverable:** Users can fund wallets, find providers, and complete a booking cycle. | **Team** | **Achieved** |

## Sprint 3: Enhancements and Real-Time Features
**Goal:** Add real-time communication, reviews, and administrative oversight.

| Task | Assignee | Status |
|------|----------|--------|
| Integrate Socket.io for real-time notifications (`booking_updated`). | ErenJaeger237 | Done |
| Develop Real-Time Chat Modal with optimistic UI updates. | Nyadinga | Done |
| Implement Review and Rating logic (updates provider average rating). | ErenJaeger237 | Done |
| Build Admin Dashboard (User moderation, analytics, verifying credentials). | Nyadinga | Done |
| Draft Project Report Chapter 1 & 2. | BesombaBoanerges | Done |
| **Deliverable:** Interactive platform with real-time chat and an administrative backend. | **Team** | **Achieved** |

## Sprint 4: Polish, UI Consistency, and Documentation
**Goal:** Finalize UI features, fix bugs, and complete academic documentation.

| Task | Assignee | Status |
|------|----------|--------|
| Implement "Save/Favorite Provider" feature with optimistic UI. | Nyadinga (Front), ErenJaeger237 (Back) | Done |
| Fix Socket.io duplicate message bugs and cancel booking edge cases. | ErenJaeger237 | Done |
| Finalize UML diagrams (Class, Sequence, Use Case, ERD). | levi20-25 | Done |
| Finalize Project Management artifacts (Backlogs) and remaining report chapters. | BesombaBoanerges | Done |
| Final QA Testing and deployment to Render (Backend) and Vercel/Netlify (Frontend). | Team | In Progress |
| **Deliverable:** Production-ready application and complete academic report. | **Team** | **Achieved** |
