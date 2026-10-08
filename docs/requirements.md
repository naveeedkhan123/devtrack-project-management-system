# DevTrack System Requirements Specification (SRS)

## 1. Executive Summary & Vision
**DevTrack** is an enterprise-grade Software Development Project Management and Bug Tracking System engineered for modern cross-functional engineering teams. DevTrack unifies agile task management, high-fidelity defect tracking, interactive Kanban workflows, real-time collaboration, and executive analytics into a cohesive, high-performance platform.

The system replaces fragmented toolchains by providing a single source of truth for software development lifecycles (SDLC), offering role-tailored workspaces for Administrators, Project Managers, and Developers.

---

## 2. User Personas & Role-Based Access Control (RBAC)

DevTrack implements a strict, multi-tiered Role-Based Access Control model:

| Role | Persona | Key Responsibilities & Permissions |
| :--- | :--- | :--- |
| **Admin** | System Administrator / Director of Engineering | Full administrative sovereignty. Manages organization user lifecycle (create, toggle active status, update roles, delete accounts), views platform-wide telemetry, manages all projects, tasks, and system configurations. |
| **Project Manager** (`project_manager`) | Scrum Master / Product Owner / Technical Lead | Project portfolio management. Creates projects, manages contributor rosters, creates and assigns tasks/bugs, tracks project health, reviews milestones, and monitors team velocity. |
| **Developer** (`developer`) | Software / QA / DevOps Engineer | Execution and delivery. Moves tasks across Kanban workflow lanes, submits and resolves bug reports with reproduction steps, participates in technical discussions, logs resolution notes, and manages personal workload. |

---

## 3. Functional Requirements (FR)

### FR-1: Authentication & Identity Management
- **FR-1.1 (Registration & Onboarding):** Users can register with full name, email, secure password (minimum 6 characters), and professional title/role.
- **FR-1.2 (Secure Authentication):** Authenticate via JWT (JSON Web Tokens) with 7-day expiration. Passwords hashed using `bcryptjs` with salt factor 10.
- **FR-1.3 (Role Guards):** Frontend route guards (`ProtectedRoute`, `RoleRoute`) and backend Express middlewares (`authenticate`, `authorize`) enforce least-privilege access.
- **FR-1.4 (Demo Authentication):** One-click demo credentials provided on the login view for instant evaluation of Admin, Project Manager, and Developer experiences.
- **FR-1.5 (Profile & Preferences):** Users can update their avatar, full name, professional bio, phone number, and toggle between Light and Dark interface themes.
- **FR-1.6 (Password Recovery):** Secure password reset workflow with tokenized email simulation and credential modification.

### FR-2: Project Portfolio Management
- **FR-2.1 (Project CRUD):** Authorized managers/admins can create, view, edit, and archive software projects with title, key/prefix, description, status (`PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `CANCELLED`), priority, repository URL, and target milestones.
- **FR-2.2 (Roster Management):** Project managers can add or remove team members dynamically with distinct project roles.
- **FR-2.3 (Project Analytics):** Real-time aggregation of task completion rates, open bugs by severity, active developers, and budget/milestone tracking.

### FR-3: Agile Task Management & Kanban Board
- **FR-3.1 (Task Schema):** Tasks encompass title, description, project association, status (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`), priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), story points / estimated hours, due dates, and assignee.
- **FR-3.2 (Interactive Kanban Board):** Full drag-and-drop workflow powered by `@dnd-kit`, allowing fluid transitions between status columns.
- **FR-3.3 (Optimistic UI & Resilient Sync):** Board state updates immediately on drop for zero perceived latency, with automated state rollback and toast notification in case of API failure.
- **FR-3.4 (Filtering & Search):** Instant client-side and server-side filtering by project, priority, assignee, status, and search keywords.

### FR-4: Defect & Bug Tracking Lifecycle
- **FR-4.1 (Defect Schema):** Defect reports capture title, detailed description, project, assignee, reporter, status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), environment (`Development`, `Staging`, `Production`), reproduction steps, and expected vs. actual behavior.
- **FR-4.2 (Defect Resolution Workflow):** Developers can transition bug status and record verified `resolutionNotes`.
- **FR-4.3 (Cross-linking):** Bugs are indexed against projects and visible in both dedicated defect tracking views and consolidated project detail dashboards.

### FR-5: Technical Discussions & Collaboration
- **FR-5.1 (Comment Threads):** Unified, responsive discussion threads attached to both tasks and bug reports.
- **FR-5.2 (Audit Trails):** Immutable system activity logs automatically capturing all task transitions, bug creations, project updates, and user modifications.

### FR-6: In-App Notifications
- **FR-6.1 (Event Triggers):** Automated notification generation upon task assignment, bug reporting, status transitions, and mentions.
- **FR-6.2 (Notification Drawer & Center):** Quick-glance navbar popover with unread counter badge and a dedicated Notifications Management page with "Mark all as read" capability.

### FR-7: Executive Dashboard & Team Telemetry
- **FR-7.1 (Executive KPI Cards):** Instant visibility into Total Projects, Open Tasks, Critical Bugs, and Active Developers.
- **FR-7.2 (Visual Analytics):** Interactive Recharts visualizations featuring:
  - Task Status Distribution (Bar Chart)
  - Bug Severity Breakdown (Donut Chart)
  - Team Velocity & Sprint Burndown (Area Chart)
- **FR-7.3 (Team Directory):** Real-time view of developer workloads, active task counts, and completed contributions.

### FR-8: System Administration & Governance
- **FR-8.1 (User Management Console):** Admins can manage all user accounts, alter roles (`admin`, `project_manager`, `developer`), toggle active status, and perform deletions.
- **FR-8.2 (Platform Health Overview):** System telemetry displaying database health, uptime, entity distributions, memory utilization, and node runtime diagnostics.

---

## 4. Non-Functional Requirements (NFR)

### NFR-1: Performance & Scalability
- **Page Load Time:** Initial load under 1.5 seconds on standard 4G broadband; subsequent navigation under 150ms via client-side routing.
- **API Response Latency:** 95th percentile response times below 150ms for indexed MongoDB queries.
- **Bundle Optimization:** Manual vendor chunk splitting in Vite (`vendor-react`, `vendor-charts`, `vendor-dndkit`, `vendor-icons`), ensuring no single chunk exceeds 500kB.

### NFR-2: Security & Protection
- **Header Hardening:** HTTP security headers applied across all endpoints via `helmet`.
- **Rate Limiting:** API rate limiter restricting bursts to 100 requests per 15-minute window per IP to prevent brute-force attacks.
- **Data Validation & Sanitization:** Strict request validation using `express-validator` to neutralize SQL/NoSQL injection and XSS vectors.
- **Credential Storage:** One-way irreversible password hashing using `bcryptjs`. Sensitive fields excluded from JSON serialization (`select: '-password'`).

### NFR-3: Usability, Design & Accessibility
- **Design System:** Cohesive Tailwind CSS design system with custom brand palette (`indigo-600` primary, slate neutrals, status-semantic color tokens).
- **Responsive Layout:** 100% responsive fluid grid system supporting mobile viewports (375px), tablets (768px), and high-resolution desktop displays (1920px+).
- **Dark Mode Support:** System-wide dark/light mode toggle with persistent `localStorage` preference and smooth color transitions.
- **Accessibility:** Semantic HTML5 landmarks, explicit form labels (`htmlFor` matching input IDs), keyboard navigation support, and WCAG 2.1 AA color contrast compliance.

### NFR-4: Resiliency & High Availability
- **Resilient Database Layer:** Dual-mode database connection architecture that automatically falls back to an embedded `MongoMemoryServer` if an external MongoDB cluster is unavailable, guaranteeing zero-friction local evaluations and continuous test execution.
- **Optimistic UI Rollback:** Frontend state updates optimistically on drag-and-drop; in the event of network disconnection, the UI reverts to the canonical server state with a descriptive toast.

### NFR-5: Maintainability & Testability
- **Test Automation:** Comprehensive end-to-end test suites for both backend (Jest + Supertest) and frontend (Vitest + React Testing Library) with 100% pass rates.
- **Separation of Concerns:** Clear three-tier architecture: Routes $\rightarrow$ Controllers $\rightarrow$ Services/Models, completely decoupling presentation, business logic, and persistence.
