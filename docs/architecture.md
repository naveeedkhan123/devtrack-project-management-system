# DevTrack Architecture & Design Specification

## 1. System Overview & Context

DevTrack is architected as a modern decoupled full-stack platform following the client-server REST paradigm. The frontend is a responsive Single Page Application (SPA) built with React and Vite, while the backend is an event-driven Node.js/Express REST API communicating with a MongoDB document database.

```mermaid
graph TD
    User["User / Web Browser"]
    
    subgraph Frontend ["DevTrack Frontend (React + Vite)"]
        UI["UI Layer (Tailwind CSS, Lucide, Recharts)"]
        State["State Layer (Auth, Theme, Notification Contexts)"]
        DnD["Kanban Engine (@dnd-kit)"]
        APIClient["API Client (Axios Interceptors)"]
        UI --> State
        UI --> DnD
        State --> APIClient
        DnD --> APIClient
    end

    subgraph Backend ["DevTrack Backend (Node.js + Express)"]
        Gate["Security & Middleware (Helmet, CORS, RateLimit)"]
        Router["Express Router & Route Guards"]
        Validators["Input Validation (express-validator)"]
        Controllers["Controller Layer"]
        Services["Domain Services (Audit, Notification)"]
        Mongoose["Mongoose ODM (Models, Hooks, Indexes)"]
        
        Gate --> Router
        Router --> Validators
        Validators --> Controllers
        Controllers --> Services
        Controllers --> Mongoose
        Services --> Mongoose
    end

    subgraph Storage ["Persistence Layer"]
        DB[("MongoDB / In-Memory MongoDB")]
        Mongoose --> DB
    end

    User -->|HTTPS Requests| UI
    APIClient -->|REST API (JSON / Bearer Token)| Gate
```

---

## 2. Component & Container Architecture

### 2.1 Frontend Architecture (`frontend/src`)
```
frontend/src/
├── components/
│   ├── common/         # Core atomic UI design system (Button, Input, Card, Modal, Badge, etc.)
│   ├── kanban/         # Drag-and-drop board components (KanbanColumn, KanbanCard)
│   ├── tasks/          # Task management forms, filters, and modals
│   ├── bugs/           # Defect management modals and triage forms
│   ├── projects/       # Project creation and member roster modals
│   ├── comments/       # Unified comment thread components
│   └── layout/         # AppLayout, Navbar, Sidebar, Footer, PublicNavbar
├── context/            # React context providers (AuthContext, ThemeContext, ToastContext, etc.)
├── pages/              # Routed page views (Dashboard, Kanban, Tasks, Bugs, Team, Admin, etc.)
├── routes/             # AppRoutes, ProtectedRoute guard, RoleRoute RBAC guard
├── services/           # Typed Axios API clients (authService, taskService, bugService, etc.)
└── utils/              # Pure utility functions (date formatters, metric calculators)
```

### 2.2 Backend Architecture (`backend/src`)
```
backend/src/
├── config/             # Environment variables and resilient DB connection loader
├── controllers/        # Request orchestration, status codes, and HTTP responses
├── middleware/         # auth (JWT), role (RBAC), error (central handler), validate
├── models/             # Mongoose schemas with compound indexes, hooks, and virtuals
├── routes/             # Versioned REST endpoints with route-level middleware
├── seeds/              # Comprehensive database seeder with realistic engineering data
├── services/           # Business logic: activityService (audit stream), notificationService
└── validators/         # Declarative request validation rules
```

---

## 3. Data Flow & Sequence Diagrams

### 3.1 Authentication & Authorization Flow
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Frontend (React)
    participant AuthAPI as Auth Controller
    participant DB as MongoDB
    
    User->>Browser: Enters credentials (email, password)
    Browser->>AuthAPI: POST /api/auth/login
    AuthAPI->>DB: Query User by email
    DB-->>AuthAPI: User document (with password hash)
    AuthAPI->>AuthAPI: bcrypt.compare(password, hash)
    alt Valid Credentials
        AuthAPI->>AuthAPI: Generate signed JWT (userId, role)
        AuthAPI-->>Browser: 200 OK { token, user: { id, name, role, email } }
        Browser->>Browser: Store token in localStorage & update AuthContext
        Browser-->>User: Redirect to /dashboard
    else Invalid Credentials
        AuthAPI-->>Browser: 401 Unauthorized { message: "Invalid credentials" }
        Browser-->>User: Render error toast
    end
```

### 3.2 Optimistic Kanban Drag-and-Drop Workflow
```mermaid
sequenceDiagram
    autonumber
    actor Engineer
    participant Board as Kanban Board (@dnd-kit)
    participant Context as React State
    participant TaskAPI as Task Controller
    participant DB as MongoDB
    
    Engineer->>Board: Drags task card from TODO to IN_PROGRESS
    Board->>Context: Optimistic Update: move card immediately in local state
    Board->>TaskAPI: PATCH /api/tasks/:id/status { status: "IN_PROGRESS" }
    alt API Success
        TaskAPI->>DB: findByIdAndUpdate(taskId, { status: "IN_PROGRESS" })
        TaskAPI->>DB: Create ActivityLog entry
        TaskAPI-->>Board: 200 OK { success: true, task }
        Board-->>Engineer: Show success toast notification
    else Network / Server Failure
        TaskAPI-->>Board: 500 Error / Network Timeout
        Board->>Context: Revert task to original column (Rollback)
        Board-->>Engineer: Show error toast: "Failed to update task status"
    end
```

---

## 4. Entity Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ PROJECT : "creates / leads"
    USER }o--o{ PROJECT : "participates in (members)"
    USER ||--o{ TASK : "assigned to"
    USER ||--o{ BUG : "assigned to / reported by"
    USER ||--o{ COMMENT : "authors"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ ACTIVITY_LOG : "triggers"

    PROJECT ||--o{ TASK : "contains"
    PROJECT ||--o{ BUG : "tracks"
    PROJECT ||--o{ ACTIVITY_LOG : "scoped to"

    TASK ||--o{ COMMENT : "has discussion"
    BUG ||--o{ COMMENT : "has discussion"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "admin | project_manager | developer"
        string title
        string department
        string avatar
        boolean isActive
        date lastLogin
    }

    PROJECT {
        ObjectId _id PK
        string name
        string key UK
        string description
        string status "PLANNING | ACTIVE | ON_HOLD | COMPLETED | CANCELLED"
        string priority "LOW | MEDIUM | HIGH | URGENT"
        ObjectId owner FK
        ObjectId[] members FK
        date startDate
        date endDate
        string repositoryUrl
    }

    TASK {
        ObjectId _id PK
        string title
        string description
        string status "TODO | IN_PROGRESS | IN_REVIEW | DONE"
        string priority "LOW | MEDIUM | HIGH | URGENT"
        ObjectId project FK
        ObjectId assignee FK
        ObjectId reporter FK
        number estimatedHours
        number loggedHours
        date dueDate
        string[] tags
    }

    BUG {
        ObjectId _id PK
        string title
        string description
        string status "OPEN | IN_PROGRESS | RESOLVED | CLOSED"
        string severity "LOW | MEDIUM | HIGH | CRITICAL"
        string environment "Development | Staging | Production"
        string reproductionSteps
        string expectedBehavior
        string actualBehavior
        string resolutionNotes
        ObjectId project FK
        ObjectId assignee FK
        ObjectId reporter FK
    }

    COMMENT {
        ObjectId _id PK
        string content
        ObjectId author FK
        string itemType "Task | Bug"
        ObjectId itemId FK
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId recipient FK
        ObjectId sender FK
        string title
        string message
        string type "TASK_ASSIGNED | BUG_REPORTED | STATUS_CHANGED | COMMENT_ADDED"
        boolean isRead
        string link
    }

    ACTIVITY_LOG {
        ObjectId _id PK
        ObjectId user FK
        string action
        string entityType "Project | Task | Bug | User"
        ObjectId entityId FK
        ObjectId project FK
        object details
    }
```

---

## 5. Security & Defensive Engineering

1. **Defense-in-Depth Middleware Stack:**
   - **`helmet`**: Enforces strict Content Security Policy, X-XSS-Protection, and Frameguard to prevent clickjacking and injection.
   - **`cors`**: Whitelists configured frontend origins (`CORS_ORIGIN`).
   - **`express-rate-limit`**: Restricts excessive client bursts to throttle brute-force attacks.
2. **Stateless JWT Verification:**
   - Cryptographically signs payloads using `HMAC SHA-256` with strong secret keys.
   - Verified on every protected route via `authenticate` middleware.
3. **Role-Based Access Control (RBAC):**
   - Express middleware `authorize(...roles)` gates administrative and managerial endpoints.
   - Unauthorized attempts yield `403 Forbidden` with standardized error schemas.
4. **Input Sanitization & Validation:**
   - All inbound payloads are validated using `express-validator` chains before reaching business controllers.
   - MongoDB queries rely exclusively on strongly-typed Mongoose models to prevent NoSQL query operator injection.
5. **Safe In-Memory Fallback:**
   - The connection manager attempts a connection to `MONGODB_URI`. If unavailable, it transparently spawns an in-memory `MongoMemoryServer` without leaking credentials or halting execution.
