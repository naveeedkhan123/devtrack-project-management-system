# DevTrack — Software Development Project Management & Bug Tracking System

[![CI](https://github.com/naveeedkhan123/devtrack-project-management-system/actions/workflows/ci.yml/badge.svg)](https://github.com/naveeedkhan123/devtrack-project-management-system/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Node.js](https://img.shields.io/badge/node.js-%3E%3D18.0.0-green.svg)]()
[![React](https://img.shields.io/badge/react-18.x-61dafb.svg)]()
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-3.4-38bdf8.svg)]()
[![MongoDB](https://img.shields.io/badge/mongodb-mongoose-47a248.svg)]()

> **DevTrack** is a full-stack project management and defect tracking application for software teams. It combines project-scoped tasks, an interactive Kanban workflow, bug triage, team workload views, and administrative controls.

## Finalized product update (October 2026)

The development demo catalog is additive and repeat-safe: startup reconciles users, projects, tasks, and bugs without purging MongoDB records. Production startup does not seed demo data.

---

## 🌟 Executive Summary

Modern engineering teams often suffer from tool fatigue—juggling detached tools for task planning, issue reporting, and sprint tracking. **DevTrack** resolves this by consolidating the entire software development lifecycle into a single high-performance workspace:

- **Project Analytics:** Dashboard charts and metrics for task status, bug severity, team workload, milestones, and activity.
- **Interactive Kanban Board:** Fluid drag-and-drop task progression across TODO, IN PROGRESS, IN REVIEW, and DONE with optimistic UI updates and instant server synchronization.
- **Dedicated Bug Tracker:** Defect triage with reproduction steps, environment tagging, severity classification, and resolution logs.
- **Multi-Tenant Security:** Three-tiered Role-Based Access Control (`admin`, `project_manager`, `developer`) enforced both on the client via route guards and on the server via JWT-secured Express middleware.
- **Demo Evaluation:** Development demo accounts and quick-fill login controls. MongoDB must be available; database failures are not hidden behind a transient fallback.

---

## 📸 Key Interfaces & UI Flow

- **Landing Page (`/`):** High-converting SaaS landing page with hero illustration, feature matrix, live preview cards, and direct links to demo logins.
- **Executive Dashboard (`/dashboard`):** Real-time KPI summary cards, Recharts status bar charts, defect severity donuts, team velocity trends, upcoming milestone deadlines, and live activity feed.
- **Interactive Kanban Board (`/kanban`):** Full drag-and-drop board powered by `@dnd-kit`, multi-project filtering, search, priority badges, and instant status updates.
- **Project Portfolio (`/projects`, `/projects/:id`):** Multi-tab project workspace with tabs for Overview, Tasks, Bugs, and Team Roster, with member management and progress metrics.
- **Agile Task Backlog (`/tasks`, `/tasks/:id`):** Tabular task management with status filtering, assignee search, task creation modals, and comment threads.
- **Bug & Defect Center (`/bugs`, `/bugs/:id`):** Specialized QA defect workflow capturing environment details, reproduction steps, expected vs. actual behavior, and resolution notes.
- **Team Directory & Telemetry (`/team`):** Engineering roster showing real-time workload counts, active assignments, and completed tasks.
- **System Administration (`/admin/users`, `/admin/system`):** Administrative controls for role assignment, account activation toggling, deletion, and system health telemetry.

---

## 🚀 Technology Stack & Engineering Rationales

| Layer | Technology | Engineering Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18 + Vite** | Rapid build times with ES modules, concurrent rendering, and clean functional component patterns. |
| **Styling & Design** | **Tailwind CSS** | Atomic utility-first styling with custom dark/light theme support and consistent design tokens. |
| **Kanban Drag-and-Drop** | **`@dnd-kit`** | Accessible, modular, modern drag-and-drop engine with pointer sensor accuracy and touch support. |
| **Data Visualization** | **Recharts** | Declarative, SVG-based responsive charting library tailored for React dashboards. |
| **Icons** | **Lucide React** | Consistent, lightweight SVG icon set with tree-shaking capabilities. |
| **Backend Runtime** | **Node.js + Express** | High-throughput asynchronous event-driven server runtime with robust middleware ecosystem. |
| **Database & ODM** | **MongoDB + Mongoose** | Flexible document schema modeling, compound indexing, population hooks, and validation. |
| **Test Database** | **`mongodb-memory-server`** | Isolated MongoDB instances for backend integration tests. |
| **Security & Auth** | **JWT + bcryptjs** | Stateless HMAC SHA-256 token authorization coupled with salted password hashing. |
| **Hardening** | **Helmet + Rate-Limit** | HTTP header hardening and IP rate-limiting to mitigate brute-force and DDoS vectors. |
| **Testing** | **Jest + Supertest + Vitest** | Automated end-to-end and component testing across backend and frontend layers. |

---

## 🔐 Seed Credentials (Demo Accounts)

DevTrack includes a realistic database seeder pre-populated with active projects, tasks, bugs, and activity logs. You can log in using the one-click demo buttons on the login page or enter the credentials below:

| Role | Email Address | Password | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@devtrack.io` | `Admin123!Strong` | Development-only seed account. |
| **Project Manager** | `pm@devtrack.io` | `Pm123!Strong` | Development-only seed account. |
| **Developers 1–7** | `dev1@devtrack.io` … `dev7@devtrack.io` | `Dev123!Strong` | Development-only seed accounts. |

---

## ⚙️ Prerequisites & Installation

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** (required for local application development and production; backend tests use an isolated in-memory MongoDB instance)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/DevTrack.git
cd DevTrack
```

---

### Step 2: Configure & Start the Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables and set MONGODB_URI for your MongoDB instance
cp .env.example .env

# Start development server (development mode reconciles demo data)
npm run dev
```

---

### Step 3: Configure & Start the Frontend

In a separate terminal:

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start Vite development server (runs on port 5173)
npm run dev
```

Open your browser at **`http://localhost:5173`**.

### Environment variables

Backend reads `backend/.env`: `NODE_ENV`, `PORT` (default `5000`), `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (comma-separated exact origins), `ENABLE_LOCAL_SNAPSHOTS` (opt-in, development only), and `ALLOW_DEMO_SEED` (explicit production override for the standalone demo seeder). Production requires `MONGODB_URI`, a `JWT_SECRET` of at least 32 characters, and `CLIENT_URL`. Frontend reads `VITE_API_URL` when provided; otherwise the Vite development proxy targets `http://localhost:5000/api`. Keep production secrets in your deployment provider's secret store.

### Screenshots and deployment

No screenshots are checked into this repository. Capture genuine screenshots from a running local environment if preparing a release. For deployment, build the frontend with `cd frontend && npm ci && npm run build` and publish `frontend/dist`; run the API with `cd backend && npm ci && npm start` against managed MongoDB. Set `NODE_ENV=production`, `MONGODB_URI`, a randomly generated `JWT_SECRET` (at least 32 characters), and `CLIENT_URL` to the deployed frontend origin(s). Configure TLS and a health-check against `/health`. Public registration creates developer accounts only; provision the initial administrator through a controlled database/deployment operation before launch. Password reset is unavailable in production until email delivery is integrated. Do not run the demo seeder against production unless demo content is explicitly intended.

---

## 🧪 Automated Testing

DevTrack features comprehensive automated test suites covering authentication, role-based authorization, CRUD operations, Kanban components, and UI modals:

### Backend Tests (Jest + Supertest)
```bash
cd backend
npm test
```
*See the current CI run for verified results; backend tests include authentication, role/project access, projects, tasks, bugs, comments, and persistence checks.*

### Frontend Tests (Vitest + React Testing Library)
```bash
cd frontend
npm test
```
*Frontend tests cover authentication views, common components, Kanban cards, and task/bug modals.*

### Production Build Verification
```bash
cd frontend
npm run build
```
*Build the frontend as part of CI; optimized output is written to `frontend/dist/`.*

---

## 📁 Repository Structure

```
DevTrack/
├── docs/                       # Comprehensive engineering documentation
│   ├── requirements.md         # System Requirements Specification (FR & NFR)
│   ├── architecture.md         # System Architecture & Mermaid Diagrams
│   ├── api.md                  # RESTful API Endpoint Reference
│   ├── database.md             # Schema Design, Indexes & Data Dictionary
│   └── testing.md              # Testing Strategy and Verification Guide
├── backend/                    # Node.js / Express REST API
│   ├── src/
│   │   ├── config/             # Environment & resilient MongoDB connector
│   │   ├── controllers/        # Request handling and HTTP responses
│   │   ├── middleware/         # Auth, RBAC, Error, and Validation guards
│   │   ├── models/             # Mongoose schemas (User, Project, Task, Bug, etc.)
│   │   ├── routes/             # REST API routes
│   │   ├── seeds/              # Database seeder with realistic test data
│   │   ├── services/           # Activity logging and notification services
│   │   ├── validators/         # Input validation schemas (express-validator)
│   │   ├── app.js              # Express application assembly
│   │   └── server.js           # Server entry point
│   ├── tests/                  # Jest + Supertest integration test suites
│   ├── .env.example
│   └── package.json
├── frontend/                   # React 18 + Vite Single Page Application
│   ├── src/
│   │   ├── components/         # Reusable UI, Kanban, Task, Bug, and Layout components
│   │   ├── context/            # Auth, Theme, Toast, and Notification providers
│   │   ├── pages/              # Routed pages (Dashboard, Kanban, Tasks, Bugs, etc.)
│   │   ├── routes/             # App routing with ProtectedRoute and RoleRoute
│   │   ├── services/           # Axios API clients
│   │   ├── tests/              # Vitest + React Testing Library suites
│   │   ├── utils/              # Pure utility and date formatting functions
│   │   ├── App.jsx             # Root React component
│   │   └── main.jsx            # React DOM bootstrap
│   ├── .env.example
│   ├── tailwind.config.js      # Custom theme and dark mode tokens
│   ├── vite.config.js          # Vite config with manual chunk splitting
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🗺️ Product Roadmap

- [x] Multi-tier Role-Based Access Control (Admin, PM, Developer)
- [x] Drag-and-drop Kanban board with optimistic state updates
- [x] Dedicated defect tracking system with reproduction steps & resolution logs
- [x] Interactive data visualizations (Recharts)
- [x] In-app notifications & activity audit stream
- [x] Light / Dark mode UI themes
- [x] MongoDB persistence with fail-fast connection behavior
- [x] CI linting, automated tests, and frontend production build
- [ ] WebSocket-driven real-time multi-user cursor collaboration
- [ ] GitHub / GitLab webhook integration for automatic commit-to-task linking
- [ ] Automated PDF sprint summary reports export
- [ ] Slack & Discord notification webhooks

---

## 📄 License & Attribution

This project is open-source and available under the [MIT License](LICENSE). Built with clean architecture, enterprise security patterns, and modern web standards.
