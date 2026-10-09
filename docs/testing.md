# DevTrack Testing Guide

## Test coverage

Backend integration tests use Jest, Supertest, and `mongodb-memory-server`. The 7 suites cover authentication and password validation, role and project-scoped authorization, comments, project APIs, task persistence and overdue/pagination behavior, bug workflows, and safe snapshot restoration.

Frontend tests use Vitest, jsdom, and React Testing Library to exercise login views, API URL configuration, shared UI components, Kanban cards, and task/bug forms. These are component and interaction tests; the repository does not currently include browser-driven end-to-end tests.

## Run the checks

Run from the repository root:

```bash
npm --prefix backend run lint
npm --prefix backend test
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run build
```

Backend coverage can be measured with:

```bash
npm --prefix backend run test:coverage
```

CI runs backend and frontend lint and tests on pushes and pull requests, and builds the frontend.

## Latest local verification

The latest verified run passed **29 backend tests across 7 suites** and **13 frontend tests across 5 suites**. The frontend production build passed. Backend coverage is measured separately and is not a fixed target. Coverage is not collected for the frontend. A valid-account browser sign-in against the production deployment remains unverified because its backend URL is not configured or provided.

Dependency audit was run separately from test status. Production dependencies had no reported vulnerabilities. The full audit reported 7 development-dependency advisories for the frontend (5 high and 2 moderate, primarily Tailwind CSS 3's build chain) and 22 for the backend (3 high and 19 moderate, in development/test tooling). These are not included in the shipped application bundle; re-run `npm audit` in each package before deployment and schedule compatible toolchain upgrades.
