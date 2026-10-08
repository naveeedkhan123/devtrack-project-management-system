# DevTrack RESTful API Reference

## 1. Overview & Conventions

The DevTrack API conforms strictly to REST architectural constraints:
- **Base URL:** `http://localhost:5001/api` (default development port)
- **Transport Security:** JSON over HTTP/HTTPS
- **Authentication:** Bearer token transmitted in the `Authorization` request header:
  ```http
  Authorization: Bearer <jwt_token>
  ```
- **Standard Date Format:** ISO 8601 strings (e.g. `2026-10-08T12:00:00.000Z`)

### 1.1 Standard Response Envelope
All API responses follow a uniform JSON structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional contextual message",
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

### 1.2 Standard Error Schema
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [
    {
      "field": "email",
      "message": "Please include a valid email address"
    }
  ],
  "statusCode": 400
}
```

### 1.3 Common HTTP Status Codes
| Code | Meaning | Description |
| :--- | :--- | :--- |
| `200 OK` | Success | Request succeeded with returned body. |
| `201 Created` | Created | Resource successfully created. |
| `400 Bad Request` | Validation Error | Payload failed validation rules. |
| `401 Unauthorized` | Auth Failure | Missing, invalid, or expired JWT. |
| `403 Forbidden` | RBAC Denied | Caller lacks necessary role permission. |
| `404 Not Found` | Resource Missing | Targeted ID does not exist. |
| `500 Server Error` | Internal Failure | Unhandled server exception. |

---

## 2. Authentication & Identity (`/api/auth`)

### `POST /api/auth/register`
Creates a new user account.
- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "Sarah Connor",
    "email": "sarah@cyberdyne.io",
    "password": "Password123!",
    "role": "developer",
    "title": "Systems Engineer",
    "department": "Infrastructure"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6705...",
      "name": "Sarah Connor",
      "email": "sarah@cyberdyne.io",
      "role": "developer",
      "title": "Systems Engineer"
    }
  }
  ```

### `POST /api/auth/login`
Authenticates user credentials and issues a signed JWT.
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@devtrack.io",
    "password": "Admin123!"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "67054f1...",
      "name": "Alex Mercer",
      "email": "admin@devtrack.io",
      "role": "admin",
      "title": "Engineering Director",
      "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    }
  }
  ```

### `GET /api/auth/me`
Retrieves authenticated user profile based on Bearer token.
- **Access:** Authenticated (Any role)
- **Response `200 OK`:** Returns current user profile object.

### `PUT /api/auth/profile`
Updates personal user information.
- **Access:** Authenticated (Any role)
- **Request Body:**
  ```json
  {
    "name": "Alex Mercer",
    "title": "VP of Engineering",
    "bio": "Leading distributed cloud infrastructure teams."
  }
  ```

### `PUT /api/auth/change-password`
Safely rotates account password.
- **Access:** Authenticated (Any role)
- **Request Body:**
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword123!"
  }
  ```

---

## 3. Dashboard & Executive Analytics (`/api/dashboard`)

### `GET /api/dashboard/stats`
Retrieves consolidated statistical metrics.
- **Access:** Authenticated
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "counts": {
        "projects": 4,
        "tasks": 16,
        "bugs": 8,
        "developers": 3
      },
      "tasksByStatus": {
        "TODO": 4,
        "IN_PROGRESS": 6,
        "IN_REVIEW": 3,
        "DONE": 3
      },
      "bugsBySeverity": {
        "LOW": 1,
        "MEDIUM": 2,
        "HIGH": 3,
        "CRITICAL": 2
      },
      "velocity": [
        { "name": "Sprint 1", "completed": 12, "target": 15 },
        { "name": "Sprint 2", "completed": 18, "target": 16 }
      ]
    }
  }
  ```

### `GET /api/dashboard/overview`
Retrieves upcoming deadlines and recent high-priority activity streams.
- **Access:** Authenticated

---

## 4. Projects Management (`/api/projects`)

### `GET /api/projects`
Retrieves all projects with computed task completion rates and bug counts.
- **Access:** Authenticated
- **Query Params:** `status`, `search`
- **Response `200 OK`:** Array of populated project documents.

### `POST /api/projects`
Creates a new project.
- **Access:** Admin, Project Manager
- **Request Body:**
  ```json
  {
    "name": "Cloud Native Gateway",
    "key": "CNG",
    "description": "High-throughput API gateway with distributed rate-limiting.",
    "priority": "HIGH",
    "status": "ACTIVE",
    "startDate": "2026-10-01",
    "endDate": "2026-12-15",
    "repositoryUrl": "https://github.com/devtrack/cng"
  }
  ```

### `GET /api/projects/:id`
Retrieves single project details including member profiles and progress metrics.
- **Access:** Authenticated

### `PUT /api/projects/:id`
Updates project metadata.
- **Access:** Admin, Project Manager

### `DELETE /api/projects/:id`
Deletes a project and cascades cleanup.
- **Access:** Admin, Project Manager

### `POST /api/projects/:id/members`
Adds a member to the project team roster.
- **Access:** Admin, Project Manager
- **Request Body:** `{ "userId": "67054f1..." }`

### `DELETE /api/projects/:id/members/:userId`
Removes a member from the project roster.
- **Access:** Admin, Project Manager

---

## 5. Agile Task Management & Kanban (`/api/tasks`)

### `GET /api/tasks`
Lists tasks with multi-dimensional filtering.
- **Access:** Authenticated
- **Query Params:** `project`, `status`, `priority`, `assignee`, `search`
- **Response `200 OK`:** Array of tasks with populated project and assignee entities.

### `POST /api/tasks`
Creates a new engineering task.
- **Access:** Admin, Project Manager, Developer
- **Request Body:**
  ```json
  {
    "title": "Implement Redis Cluster Caching",
    "description": "Deploy Redis cluster on AWS ElastiCache for session caching.",
    "project": "6705...",
    "status": "TODO",
    "priority": "HIGH",
    "estimatedHours": 16,
    "dueDate": "2026-10-25",
    "assignee": "6705...",
    "tags": ["backend", "cache", "performance"]
  }
  ```

### `GET /api/tasks/:id`
Retrieves a task by its unique identifier.
- **Access:** Authenticated

### `PATCH /api/tasks/:id/status`
Updates task status lane (used by Kanban drag-and-drop).
- **Access:** Authenticated
- **Request Body:**
  ```json
  {
    "status": "IN_PROGRESS"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Task status updated successfully",
    "data": { ... }
  }
  ```

### `PUT /api/tasks/:id`
Full update of task attributes.
- **Access:** Authenticated

### `DELETE /api/tasks/:id`
Deletes a task.
- **Access:** Admin, Project Manager

---

## 6. Defect & Bug Tracking (`/api/bugs`)

### `GET /api/bugs`
Retrieves defects with filtering.
- **Access:** Authenticated
- **Query Params:** `project`, `status`, `severity`, `assignee`, `search`

### `POST /api/bugs`
Submits a new defect report.
- **Access:** Authenticated
- **Request Body:**
  ```json
  {
    "title": "JWT Token Refresh Race Condition",
    "description": "Concurrent API requests trigger 401 when token expires.",
    "project": "6705...",
    "severity": "CRITICAL",
    "environment": "Production",
    "reproductionSteps": "1. Set access token expiration to 5s.\n2. Trigger 5 parallel fetch calls.",
    "expectedBehavior": "Single refresh call executes; parallel requests wait for new token.",
    "actualBehavior": "Multiple refresh calls dispatched; token invalidation race.",
    "assignee": "6705..."
  }
  ```

### `GET /api/bugs/:id`
Retrieves single defect report details.
- **Access:** Authenticated

### `PUT /api/bugs/:id`
Updates defect details, including status transitions and `resolutionNotes`.
- **Access:** Authenticated

### `DELETE /api/bugs/:id`
Deletes a defect report.
- **Access:** Admin, Project Manager

---

## 7. Comments & Discussions (`/api/comments`)

### `GET /api/comments/:itemType/:itemId`
Fetches all comments attached to a `Task` or `Bug`.
- **Access:** Authenticated
- **Parameters:** `itemType` (`Task` | `Bug`), `itemId` (`ObjectId`)

### `POST /api/comments`
Posts a comment to an item.
- **Access:** Authenticated
- **Request Body:**
  ```json
  {
    "content": "Reviewed the logs. The Redis node connection timed out during failover.",
    "itemType": "Bug",
    "itemId": "6705..."
  }
  ```

### `DELETE /api/comments/:id`
Deletes a comment (restricted to comment author or Admin).
- **Access:** Authenticated

---

## 8. In-App Notifications (`/api/notifications`)

### `GET /api/notifications`
Retrieves notifications for the current authenticated user.
- **Access:** Authenticated
- **Query Params:** `unreadOnly` (boolean), `limit` (number)

### `PATCH /api/notifications/:id/read`
Marks a specific notification as read.
- **Access:** Authenticated

### `PATCH /api/notifications/read-all`
Marks all notifications for current user as read.
- **Access:** Authenticated

### `DELETE /api/notifications/:id`
Deletes a notification.
- **Access:** Authenticated

---

## 9. User Governance & Administration (`/api/users`)

### `GET /api/users`
Lists active team directory members.
- **Access:** Authenticated

### `GET /api/users/stats`
Calculates workload statistics per developer (assigned tasks, active bugs, completed items).
- **Access:** Authenticated

### `GET /api/users/admin/all`
Full user roster with security status.
- **Access:** Admin Only

### `PUT /api/users/:id/role`
Updates a user's organizational role.
- **Access:** Admin Only
- **Request Body:** `{ "role": "project_manager" }`

### `PATCH /api/users/:id/status`
Toggles user active / deactivated status.
- **Access:** Admin Only

### `DELETE /api/users/:id`
Permanently deletes a user account.
- **Access:** Admin Only
