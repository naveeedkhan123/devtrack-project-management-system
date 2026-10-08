# DevTrack Testing Strategy & Verification Guide

## 1. Testing Philosophy & Test Pyramid

DevTrack adopts a comprehensive multi-layered automated testing strategy adhering to the classic Testing Pyramid principles:
1. **Unit & Component Testing:** Fast, isolated testing of pure functions, utility modules, and atomic UI components without network overhead.
2. **Integration Testing:** Verification of HTTP API endpoints, request validators, database persistence, and cross-component React contexts.
3. **End-to-End User Flow Simulation:** End-to-end verification of authentication lifecycles, role-based access restrictions, and drag-and-drop state modifications.

```
       /\
      /  \    E2E & Flow Tests (Role routing, Auth lifecycle)
     /----\
    / Inte- \   Integration Tests (Supertest API endpoints + MongoMemoryServer)
   /  gration\
  /------------\
 /  Unit/Comp   \ Component & Unit Tests (Vitest + RTL + Jest)
/----------------\
```

---

## 2. Backend Automated Test Suite (Jest & Supertest)

Backend tests run in an isolated in-memory MongoDB environment, executing without dependencies on external database daemons or network infrastructure.

### 2.1 Test Suites Breakdown

| Test Suite | File Location | Tests | Focus Areas |
| :--- | :--- | :---: | :--- |
| **Authentication & Profile** | `backend/tests/auth.test.js` | 4 | User registration, JWT issuing, password verification, duplicate email rejection, `/auth/me` identity retrieval. |
| **RBAC & Authorization** | `backend/tests/rbac.test.js` | 3 | Role enforcement (`admin`, `project_manager`, `developer`), `403 Forbidden` verification on privileged endpoints. |
| **Project Management** | `backend/tests/project.test.js` | 3 | Project creation, unique key collision handling, member roster updates, project deletion. |
| **Task Management** | `backend/tests/task.test.js` | 3 | Task lifecycle, assignee population, Kanban status lane transitions (`/status`). |
| **Bug & Defect Tracking** | `backend/tests/bug.test.js` | 2 | Defect creation with reproduction steps, severity filtering, status resolution. |

**Total Backend Tests:** **15 / 15 Passed (100%)**

### 2.2 Running Backend Tests
Execute the test runner from the `backend/` directory:

```bash
cd backend
npm test
```

To run with coverage reporting:
```bash
npm test -- --coverage
```

To run a specific test suite:
```bash
npx jest tests/rbac.test.js
```

---

## 3. Frontend Automated Test Suite (Vitest & React Testing Library)

Frontend tests utilize Vitest configured with `jsdom`, simulating browser DOM APIs, user interaction events, and simulated network mocks.

### 3.1 Test Suites Breakdown

| Test Suite | File Location | Tests | Focus Areas |
| :--- | :--- | :---: | :--- |
| **Authentication Views** | `frontend/src/tests/LoginPage.test.jsx` | 3 | Form rendering, Quick-fill demo account buttons (Admin/PM/Dev), login submission handler. |
| **Common UI Components** | `frontend/src/tests/CommonComponents.test.jsx` | 3 | Button variants & loading spinners, Badge color tokens, Modal open/close behavior. |
| **Kanban Board** | `frontend/src/tests/KanbanCard.test.jsx` | 2 | Card rendering, priority badges, drag-and-drop handles. |
| **Task & Bug Modals** | `frontend/src/tests/TaskAndBugModals.test.jsx` | 2 | Form controls, accessibility `label` to `input` linking, submission payloads. |

**Total Frontend Tests:** **10 / 10 Passed (100%)**

### 3.2 Running Frontend Tests
Execute the test runner from the `frontend/` directory:

```bash
cd frontend
npm test
```

To run in interactive UI mode:
```bash
npx vitest --ui
```

---

## 4. Verification & Production Build Pipeline

Prior to production deployments or merging pull requests, the following pipeline ensures zero regressions:

```bash
# 1. Run all backend tests
cd backend && npm test -- --runInBand

# 2. Run all frontend tests
cd ../frontend && npm test

# 3. Compile frontend production bundle
npm run build
```

Expected result: Zero linting errors, 25/25 automated tests passed, and optimized production bundle generated in `frontend/dist/`.
