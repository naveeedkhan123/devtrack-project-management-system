# DevTrack Database Schema Design & Data Dictionary

## 1. Architecture & Persistence Strategy

DevTrack uses **MongoDB** as its primary document store, managed through the **Mongoose ODM**. The schema design balances relational normalization (using ObjectIds and references for integrity) with document aggregation performance (embedded arrays for lightweight metadata, indexed lookups for high-velocity reads).

### 1.1 Resilient Dual-Connection Strategy
The database connector (`backend/src/config/db.js`) implements a dual-mode initialization protocol:
1. **Primary Cluster:** Attempts connection to the MongoDB instance specified in `MONGODB_URI`.
2. **Autonomous In-Memory Fallback:** If `MONGODB_URI` is unreachable or unconfigured, the system dynamically spins up a high-performance in-memory MongoDB instance using `mongodb-memory-server`. This ensures zero configuration hurdles for reviewers, automated CI pipelines, and sandboxed test environments.

---

## 2. Data Dictionary & Collections

### 2.1 Collection: `users`
Stores identity credentials, RBAC roles, and professional profiles.

| Field | Type | Required | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Primary Key | Unique user identifier. |
| `name` | `String` | Yes | Trimmed, 2–100 chars | Full name of the user. |
| `email` | `String` | Yes | Unique, lowercase, indexed | User email and primary login handle. |
| `password` | `String` | Yes | Hashed with bcrypt | Irreversible hashed password (excluded by default). |
| `role` | `String` | Yes | Enum: `admin`, `project_manager`, `developer` (Default: `developer`) | RBAC system permission level. |
| `title` | `String` | No | Default: `Software Engineer` | Professional role title. |
| `department` | `String` | No | Default: `Engineering` | Organizational department. |
| `avatar` | `String` | No | Default: Initials avatar | Image URL for user avatar. |
| `bio` | `String` | No | Max 500 chars | Short user biography. |
| `phone` | `String` | No | — | Contact telephone number. |
| `isActive` | `Boolean` | Yes | Default: `true` | Admin-controlled access toggle. |
| `lastLogin` | `Date` | No | — | Timestamp of most recent authentication. |
| `createdAt` | `Date` | Auto | Mongoose timestamp | Record creation date. |
| `updatedAt` | `Date` | Auto | Mongoose timestamp | Record last update date. |

**Indexes:**
- `{ email: 1 }` (Unique)
- `{ role: 1 }`

---

### 2.2 Collection: `projects`
Manages software engineering initiatives and team boundaries.

| Field | Type | Required | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Primary Key | Unique project identifier. |
| `name` | `String` | Yes | Trimmed, 2–100 chars | Name of the project. |
| `key` | `String` | Yes | Unique, uppercase, 2–10 chars | Short prefix identifier (e.g. `DEV`, `AUTH`). |
| `description`| `String` | No | Max 2000 chars | Project scope and description. |
| `status` | `String` | Yes | Enum: `PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `CANCELLED` (Default: `ACTIVE`) | Current lifecycle state. |
| `priority` | `String` | Yes | Enum: `LOW`, `MEDIUM`, `HIGH`, `URGENT` (Default: `MEDIUM`) | Strategic priority level. |
| `owner` | `ObjectId` | Yes | Ref: `User` | Project creator or principal manager. |
| `members` | `[ObjectId]`| No | Ref: `User` | Array of participating team members. |
| `startDate` | `Date` | No | — | Scheduled commencement date. |
| `endDate` | `Date` | No | — | Scheduled completion deadline. |
| `repositoryUrl`| `String` | No | Valid URL | Source code repository link. |
| `createdAt` | `Date` | Auto | Mongoose timestamp | Project creation date. |
| `updatedAt` | `Date` | Auto | Mongoose timestamp | Project last update date. |

**Indexes:**
- `{ key: 1 }` (Unique)
- `{ status: 1 }`
- `{ owner: 1 }`
- `{ members: 1 }`

---

### 2.3 Collection: `tasks`
Tracks agile backlog items and Kanban cards.

| Field | Type | Required | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Primary Key | Unique task identifier. |
| `title` | `String` | Yes | Trimmed, 3–200 chars | Brief title of the task. |
| `description`| `String` | No | Markdown supported | Detailed specification or criteria. |
| `project` | `ObjectId` | Yes | Ref: `Project`, Indexed | Parent project. |
| `status` | `String` | Yes | Enum: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE` (Default: `TODO`) | Kanban workflow lane. |
| `priority` | `String` | Yes | Enum: `LOW`, `MEDIUM`, `HIGH`, `URGENT` (Default: `MEDIUM`) | Task priority. |
| `assignee` | `ObjectId` | No | Ref: `User`, Indexed | Assigned developer. |
| `reporter` | `ObjectId` | Yes | Ref: `User` | User who authored the task. |
| `estimatedHours` | `Number` | No | Min: 0 (Default: 0) | Story points or time estimation. |
| `loggedHours` | `Number` | No | Min: 0 (Default: 0) | Time spent so far. |
| `dueDate` | `Date` | No | — | Target completion date. |
| `tags` | `[String]` | No | Lowercase, trimmed | Categorical labels (e.g. `frontend`, `auth`). |
| `order` | `Number` | No | Default: 0 | Display sequence within status lane. |
| `createdAt` | `Date` | Auto | Mongoose timestamp | Creation date. |
| `updatedAt` | `Date` | Auto | Mongoose timestamp | Last update date. |

**Indexes:**
- `{ project: 1, status: 1 }` (Compound index for rapid Kanban rendering)
- `{ assignee: 1 }`
- `{ status: 1 }`
- `{ dueDate: 1 }`

---

### 2.4 Collection: `bugs`
Dedicated defect records with reproduction and triage criteria.

| Field | Type | Required | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Primary Key | Unique bug report identifier. |
| `title` | `String` | Yes | Trimmed, 3–200 chars | Defect title summary. |
| `description`| `String` | Yes | — | Defect summary and symptoms. |
| `project` | `ObjectId` | Yes | Ref: `Project`, Indexed | Impacted project. |
| `status` | `String` | Yes | Enum: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED` (Default: `OPEN`) | Triage lifecycle status. |
| `severity` | `String` | Yes | Enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` (Default: `MEDIUM`) | Defect severity impact. |
| `environment`| `String` | Yes | Enum: `Development`, `Staging`, `Production`, `All` (Default: `Development`) | Environment where bug manifested. |
| `reproductionSteps` | `String` | No | — | Step-by-step reproduction guide. |
| `expectedBehavior` | `String` | No | — | Expected functional behavior. |
| `actualBehavior` | `String` | No | — | Observed buggy behavior. |
| `resolutionNotes` | `String` | No | — | Root-cause analysis and fix documentation. |
| `assignee` | `ObjectId` | No | Ref: `User`, Indexed | Developer investigating/fixing bug. |
| `reporter` | `ObjectId` | Yes | Ref: `User` | QA tester or engineer reporting bug. |
| `createdAt` | `Date` | Auto | Mongoose timestamp | Creation date. |
| `updatedAt` | `Date` | Auto | Mongoose timestamp | Last update date. |

**Indexes:**
- `{ project: 1, severity: 1 }`
- `{ status: 1 }`
- `{ assignee: 1 }`

---

### 2.5 Collection: `comments`
Polymorphic discussion threads attached to tasks or bugs.

| Field | Type | Required | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Primary Key | Unique comment identifier. |
| `content` | `String` | Yes | 1–5000 chars | Text content of comment. |
| `author` | `ObjectId` | Yes | Ref: `User` | User who posted comment. |
| `itemType` | `String` | Yes | Enum: `Task`, `Bug` | Polymorphic parent model name. |
| `itemId` | `ObjectId` | Yes | Indexed | Foreign Key referencing `Task` or `Bug`. |
| `createdAt` | `Date` | Auto | Mongoose timestamp | Creation date. |

**Indexes:**
- `{ itemType: 1, itemId: 1, createdAt: 1 }` (Fast chronologically-ordered thread fetch)

---

### 2.6 Collection: `notifications`
In-app alerts delivered to users.

| Field | Type | Required | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Primary Key | Unique notification identifier. |
| `recipient` | `ObjectId` | Yes | Ref: `User`, Indexed | Target recipient user. |
| `sender` | `ObjectId` | No | Ref: `User` | Triggering user (if applicable). |
| `title` | `String` | Yes | Max 150 chars | Alert headline. |
| `message` | `String` | Yes | Max 500 chars | Detailed notification text. |
| `type` | `String` | Yes | Enum: `TASK_ASSIGNED`, `BUG_REPORTED`, `STATUS_CHANGED`, `COMMENT_ADDED`, `PROJECT_UPDATE` | Categorical notification type. |
| `isRead` | `Boolean` | Yes | Default: `false`, Indexed | Read state indicator. |
| `link` | `String` | No | URL path | Deep-link to affected entity. |
| `createdAt` | `Date` | Auto | Mongoose timestamp | Creation date. |

**Indexes:**
- `{ recipient: 1, isRead: 1, createdAt: -1 }` (Unread badge counts & inbox queries)

---

### 2.7 Collection: `activitylogs`
Immutable audit logs recording engineering activity.

| Field | Type | Required | Constraints / Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Yes | Primary Key | Unique log entry identifier. |
| `user` | `ObjectId` | Yes | Ref: `User` | Actor who performed the action. |
| `action` | `String` | Yes | e.g. `CREATED_TASK`, `MOVED_KANBAN`, `RESOLVED_BUG` | Standardized event identifier. |
| `entityType` | `String` | Yes | Enum: `Project`, `Task`, `Bug`, `User` | Type of affected entity. |
| `entityId` | `ObjectId` | Yes | — | Identifier of affected entity. |
| `project` | `ObjectId` | No | Ref: `Project`, Indexed | Scoped project context. |
| `details` | `Object` | No | Flexible key-value | Payload delta (e.g. `{ from: "TODO", to: "IN_PROGRESS" }`). |
| `createdAt` | `Date` | Auto | Mongoose timestamp | Timestamp of occurrence. |

**Indexes:**
- `{ project: 1, createdAt: -1 }`
- `{ createdAt: -1 }`

---

## 3. Referential Integrity & Cascade Semantics

- **Project Deletion:** When a project is removed, associated tasks, bugs, and activity logs are safely queried and handled to prevent orphan records.
- **User Removal:** When a user is deleted, their existing tasks and bugs remain intact with `assignee` set to `null` to preserve historical integrity, while personal notifications are purged.
