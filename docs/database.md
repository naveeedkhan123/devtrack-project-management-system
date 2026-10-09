# DevTrack Database Guide

## Persistence

MongoDB is the application's durable store and Mongoose defines its schemas and indexes. Set `MONGODB_URI` to a reachable MongoDB database. Startup fails when MongoDB is unavailable; there is no in-memory fallback. Jest integration tests use `mongodb-memory-server` in an isolated test environment.

JSON snapshot restore is disabled by default and may be enabled only for local development with `ENABLE_LOCAL_SNAPSHOTS=true`. Snapshots include user data and password hashes. Restore skips a database containing any records; it is not a production backup or migration mechanism.

## Collections and relationships

| Collection | Main references and purpose | Important indexes |
|---|---|---|
| `users` | Accounts, bcrypt password hashes, roles (`admin`, `project_manager`, `developer`), profile and status fields. | Unique email; role |
| `projects` | Project key, status, priority, deadline, required manager and creator, member IDs. | Unique key; status; priority; manager |
| `tasks` | Project, optional assignee, creator, status, priority, order, due date, labels and comment count. | Project; assignee; priority/status/order; `{ project, status, order }`; `{ project, dueDate, status }` |
| `bugs` | Project, reporter, optional assignee, status, severity, environment, reproduction/expected/actual details, resolution notes. | Project; reporter; assignee; status; `{ project, status }`; `{ project, severity }` |
| `comments` | Author plus polymorphic `entityType` (`task` or `bug`) and `entityId`. | Author; entity type; entity ID; `{ entityType, entityId, createdAt }` |
| `notifications` | Required recipient, optional sender, message, read state and deep-link. | Recipient; read state; `{ recipient, isRead, createdAt: -1 }` |
| `activitylogs` | Actor, action, entity, optional project, details and timestamp. | Actor; entity type; project; `{ project, createdAt: -1 }`; `{ createdAt: -1 }` |

User/project/task/bug relationships are stored as MongoDB ObjectId references. MongoDB does not enforce referential integrity, so controllers perform project-membership checks and explicit cleanup on deletes. Removing a project removes its tasks, bugs, comments, and project-scoped activity records. Removing a task or bug removes its comments. A user who manages a project cannot be deleted until management is transferred; otherwise project memberships and task/bug assignments are cleared and their notifications are cleaned up.

## Validation and list endpoints

Mongoose schema constraints and request validators enforce required fields, enums, and bounded values. List endpoints for projects, tasks, and bugs use validated pagination with a default page size of 25 and a maximum of 100; search input is escaped before regex use. Task queries support overdue filtering, which excludes completed tasks.

## Seed data

Development startup reconciles an additive demo catalog by stable email addresses, project keys, and project-scoped task/bug titles; it does not clear existing records. Production startup skips this seeding. The standalone seed command refuses to run in production unless `ALLOW_DEMO_SEED=true` is explicitly set. Do not enable it against a production database unless demo accounts and content are intentionally wanted.

The seed credentials are for local development only; see the [README](../README.md). Disable or remove them before exposing a development environment publicly.
