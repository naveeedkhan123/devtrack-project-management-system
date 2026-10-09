# DevTrack Testing Guide

## Test coverage

Backend integration tests use Jest, Supertest, and `mongodb-memory-server`. The 7 suites cover authentication and password validation, role and project-scoped authorization, comments, project APIs, task persistence and overdue/pagination behavior, bug workflows, and safe snapshot restoration.

Frontend tests use Vitest, jsdom, and React Testing Library to exercise login views, shared UI components, Kanban cards, and task/bug forms. These are component and interaction tests; the repository does not currently include browser-driven end-to-end tests.

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

The latest verified backend run passed **26 tests across 7 suites**. Backend coverage was **50.88% statements, 29.30% branches, 37.39% functions, and 53.01% lines**. Coverage is not collected for the frontend. The latest frontend run passed **10 tests across 4 suites**, and the production build completed successfully without test failures.

Dependency audit was run separately from test status. Production dependencies had no reported vulnerabilities. The full audit reported 7 development-dependency advisories for the frontend (5 high and 2 moderate, primarily Tailwind CSS 3's build chain) and 22 for the backend (3 high and 19 moderate, in development/test tooling). These are not included in the shipped application bundle; re-run `npm audit` in each package before deployment and schedule compatible toolchain upgrades.
