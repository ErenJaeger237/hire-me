# Phase 3: UML Design Documentation - "Hire Me"

This document contains the complete structural and behavioral UML models for the "Hire Me" platform, required for Phase 3 of your timeline.

---

## 1. Comprehensive Use Case Diagram
This diagram illustrates the primary actors (Client, Provider, Admin) and their interactions with the system's core functionalities.

```mermaid
flowchart LR
    %% Actors
    C((Client))
    P((Provider))
    A((Admin))
    
    %% System Boundary
    subgraph Hire_Me_System [Hire Me Platform]
        direction TB
        UC1([Search Providers])
        UC2([Book Service with Escrow])
        UC3([Top-Up Digital Wallet])
        UC4([Mark Job Completed])
        UC5([Upload Verification Docs])
        UC6([Approve/Reject Providers])
        UC7([View Platform Analytics])
        UC8([Real-time Messaging])
    end
    
    %% Relationships
    C --> UC1
    C --> UC2
    C --> UC3
    C --> UC8
    
    P --> UC4
    P --> UC5
    P --> UC8
    
    A --> UC6
    A --> UC7
```

---

## 2. Class Diagram
The Class Diagram displays the database-backed models (User, ProviderProfile, Booking, Transaction, Message), their attributes, methods, and multiplicities.

```mermaid
classDiagram
    class User {
        +int id
        +string name
        +string email
        +string password
        +string role
        +float wallet_balance
        +login()
        +register()
        +updateProfile()
    }
    class ProviderProfile {
        +int id
        +int user_id
        +string category
        +float hourly_rate
        +boolean is_verified
        +string verification_doc
        +uploadDocument()
    }
    class Booking {
        +int id
        +int client_id
        +int provider_id
        +string status
        +float amount
        +string description
        +updateStatus()
    }
    class Transaction {
        +int id
        +int user_id
        +string type
        +float amount
        +processPayment()
    }
    class Message {
        +int id
        +int booking_id
        +int sender_id
        +string content
        +send()
    }
    
    User "1" -- "0..1" ProviderProfile : has profile
    User "1" -- "*" Booking : creates/receives
    User "1" -- "*" Transaction : performs
    User "1" -- "*" Message : sends
    Booking "1" *-- "*" Message : contains
```

---

## 3. Sample Object Diagram
This Object Diagram shows a snapshot of the system in memory when a Client (Alice) has an active booking with a Provider (Bob), and the funds are held in escrow.

```mermaid
classDiagram
    class client1_User {
        id = 1
        name = "Alice (Client)"
        role = "CLIENT"
        wallet_balance = 45000.0
    }
    class provider1_User {
        id = 2
        name = "Bob (Provider)"
        role = "PROVIDER"
        wallet_balance = 10000.0
    }
    class profile1_ProviderProfile {
        id = 1
        category = "Plumbing"
        hourly_rate = 5000.0
        is_verified = true
    }
    class booking1_Booking {
        id = 101
        status = "IN_PROGRESS"
        amount = 5000.0
    }
    class tx1_Transaction {
        id = 501
        type = "ESCROW_HOLD"
        amount = 5000.0
    }
    
    provider1_User -- profile1_ProviderProfile : owns
    client1_User -- booking1_Booking : booked by
    provider1_User -- booking1_Booking : assigned to
    client1_User -- tx1_Transaction : generated
```

---

## 4. Sequence Diagrams (Flow of Messages)

### Sequence Diagram 1: User Registration & Authentication
Demonstrates how a new user registers and retrieves a JWT for subsequent API requests.

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant AuthController
    participant Database

    User->>Frontend: Enter credentials & role
    Frontend->>AuthController: POST /api/auth/register
    AuthController->>Database: Check if email exists
    Database-->>AuthController: Email available
    AuthController->>Database: Save hashed password & User
    Database-->>AuthController: User Created (ID)
    AuthController-->>Frontend: 201 Created + JWT Token
    Frontend-->>User: Redirect to Dashboard
```

### Sequence Diagram 2: Wallet Top-Up Simulation
Demonstrates the local Mobile Money simulation updating a user's wallet.

```mermaid
sequenceDiagram
    actor Client
    participant Frontend
    participant WalletController
    participant TransactionModel
    participant UserModel

    Client->>Frontend: Enter Top-up amount (e.g., 10000 FCFA)
    Frontend->>WalletController: POST /api/wallet/topup (Amount)
    WalletController->>TransactionModel: Create 'TOPUP' Transaction
    TransactionModel-->>WalletController: Transaction Saved
    WalletController->>UserModel: Update wallet_balance (+10000)
    UserModel-->>WalletController: Balance Updated
    WalletController-->>Frontend: 200 OK (New Balance)
    Frontend-->>Client: Update UI Balance
```

### Sequence Diagram 3: Booking Creation & Escrow Hold
Shows the critical path where a client books a provider and funds are locked into Escrow.

```mermaid
sequenceDiagram
    actor Client
    participant Frontend
    participant BookingController
    participant Database

    Client->>Frontend: Click "Book Now" & Confirm Amount
    Frontend->>BookingController: POST /api/bookings
    BookingController->>Database: Query Client wallet_balance
    Database-->>BookingController: Balance = 50000 (Sufficient)
    BookingController->>Database: Deduct Amount (wallet_balance - Amount)
    BookingController->>Database: Create 'ESCROW_HOLD' Transaction
    BookingController->>Database: Create Booking (Status: PENDING)
    Database-->>BookingController: Booking Saved
    BookingController-->>Frontend: 201 Booking Created
    Frontend-->>Client: Show Booking Success
```

### Sequence Diagram 4: Job Completion & Escrow Release
Shows the atomic transaction flow when a provider completes the job and receives the escrowed funds.

```mermaid
sequenceDiagram
    actor Provider
    participant Frontend
    participant BookingController
    participant Database

    Provider->>Frontend: Click "Mark Job Completed"
    Frontend->>BookingController: PATCH /api/bookings/{id}/status (COMPLETED)
    BookingController->>Database: BEGIN TRANSACTION
    BookingController->>Database: Update Booking Status -> COMPLETED
    BookingController->>Database: Query Provider wallet_balance
    Database-->>BookingController: Current Balance
    BookingController->>Database: Add Escrow Amount to Provider wallet
    BookingController->>Database: Create 'PAYMENT_RECEIVED' Transaction
    BookingController->>Database: COMMIT TRANSACTION
    Database-->>BookingController: Success
    BookingController-->>Frontend: 200 OK
    Frontend-->>Provider: Update Dashboard UI
```

### Sequence Diagram 5: Real-Time Chat (WebSockets)
Shows how messages are exchanged instantly between Client and Provider.

```mermaid
sequenceDiagram
    actor Client
    participant Socket.IO (Server)
    participant Database
    actor Provider

    Client->>Socket.IO (Server): Emit 'joinRoom' (Booking_ID)
    Provider->>Socket.IO (Server): Emit 'joinRoom' (Booking_ID)
    
    Client->>Socket.IO (Server): POST /api/bookings/{id}/messages
    Socket.IO (Server)->>Database: Save Message to DB
    Database-->>Socket.IO (Server): Message Saved
    Socket.IO (Server)-->>Client: 201 OK
    
    Socket.IO (Server)-)Provider: Emit 'receiveMessage' (Payload)
    Provider->>Provider: UI renders new message instantly
```
