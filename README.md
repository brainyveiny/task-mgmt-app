# Task Management App

A full-stack task management application built with **FastAPI** (backend) and **Angular** (frontend). Users can register, log in, and manage their personal tasks on a Kanban-style board.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, SQLAlchemy, PostgreSQL, Pydantic, python-jose, Passlib (bcrypt) |
| Frontend | Angular 19, Angular CDK, RxJS, Angular Reactive Forms |
| Auth | JWT (HS256), bcrypt password hashing |
| Dev Tools | Uvicorn, Angular CLI, python-dotenv |

---

## Features

- User registration and login with JWT-based authentication
- Create, view, edit, and delete personal tasks
- Kanban board with drag-and-drop to change task status
- Filter tasks by status (To Do / In Progress / Done)
- Search tasks by title (debounced, case-insensitive)
- Priority levels: Low, Medium, High
- Due date with past-date validation
- Global alert notifications (auto-dismiss after 3 seconds)
- Request logging with duration tracking on the backend

---

## Architecture Overview

```
Angular (localhost:4200)  ←→  FastAPI (localhost:8000)  ←→  PostgreSQL
```

**Auth Flow:**
1. User logs in → FastAPI verifies password → returns JWT
2. Angular stores token in `localStorage`
3. Every HTTP request → `authInterceptor` injects `Authorization: Bearer <token>` header
4. FastAPI's `get_current_user` dependency decodes token and authorizes the request
5. On 401 (non-auth routes) → interceptor clears token → redirects to `/login`

---

## Backend Structure

```
backend/
├── main.py        # App entry point, CORS config, router registration, request logging
├── database.py    # SQLAlchemy engine, session factory, get_db dependency
├── models.py      # ORM models: User, Task (with Enums for status and priority)
├── schemas.py     # Pydantic schemas for validation and response serialization
├── auth.py        # /auth/register and /auth/login endpoints, get_current_user dependency
├── tasks.py       # CRUD endpoints for tasks (/tasks)
├── utils.py       # bcrypt helpers, JWT create/decode, centralized logger
└── .env           # Environment config (DATABASE_URL, SECRET_KEY, token expiry)
```

---

## Frontend Structure

```
frontend/src/app/
├── feature/
│   ├── login/
│   │   ├── components/login-component/   # Login form (email + password)
│   │   └── service/auth-service.ts       # login(), register(), logout(), isLoggedIn()
│   ├── register/
│   │   └── components/register-component/ # Registration form
│   ├── dashboard/
│   │   └── components/dashboard-component/ # Kanban board, search, filter, drag-drop
│   └── task-form/
│       ├── components/task-form-component/ # Unified create/edit form
│       └── service/task-service.ts        # getTasks(), createTask(), updateTask(), deleteTask()
├── interceptors/
│   └── auth.interceptor.ts   # Attaches Bearer token; handles 401 redirect
└── shared/
    ├── alert.service.ts       # BehaviorSubject-based global alert (3s auto-dismiss)
    └── alert.component.ts     # Displays alert messages
```

---

## API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|---|
| `POST` | `/auth/register` | No | Register new user |
| `POST` | `/auth/login` | No | Login and receive JWT |
| `GET` | `/tasks` | Yes | Get all tasks (supports `task_status`, `search` query params) |
| `GET` | `/tasks/{id}` | Yes | Get task by ID |
| `POST` | `/tasks` | Yes | Create a new task |
| `PUT` | `/tasks/{id}` | Yes | Update task (partial update supported) |
| `DELETE` | `/tasks/{id}` | Yes | Delete task (returns 204) |

---

## Validation Rules

| Field | Rule |
|---|---|
| `username` | Min 3 characters, alphanumeric + underscore only |
| `email` | Must match `@saksoft.com` or `@gmail.com` |
| `password` | Min 8, max 72 characters, alphanumeric + `_.@` |
| `task title` | Required, must not be blank or whitespace |
| `due_date` | Cannot be in the past (validated on backend) |
| `status` | Enum: `TODO`, `IN_PROGRESS`, `DONE` |
| `priority` | Enum: `LOW`, `MEDIUM`, `HIGH` |

---

## Database Schema

**Users**

| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | Auto-increment |
| `username` | String(50) | Unique, indexed |
| `email` | String(100) | Unique, indexed |
| `hashed_password` | String(255) | bcrypt hash |
| `created_at` | DateTime | Auto-set by server |

**Tasks**

| Column | Type | Notes |
|---|---|---|
| `id` | Integer PK | Auto-increment |
| `title` | String(200) | Required |
| `description` | Text | Nullable |
| `status` | Enum | `TODO` / `IN_PROGRESS` / `DONE` |
| `priority` | Enum | `LOW` / `MEDIUM` / `HIGH` |
| `due_date` | DateTime | Nullable, timezone-aware |
| `user_id` | FK → users.id | Cascade delete |
| `created_at` | DateTime | Server-set |
| `updated_at` | DateTime | Auto-updated on change |

**Relationship:** One User → Many Tasks. Deleting a user cascades and deletes all their tasks.

---

## Key Implementation Details

- **Logging**: Every HTTP request is logged with method, path, status code, and response time in ms
- **Auth dependency**: `get_current_user` is a reusable FastAPI `Depends()` used on all task routes
- **Partial update**: `PUT /tasks/{id}` uses `model_dump(exclude_unset=True)` so only sent fields are updated
- **Drag-and-drop**: Dropping a card to a new column calls `PUT /tasks/{id}` with the updated status only
- **Search debounce**: Search input fires API only after 400ms of no typing (RxJS `debounceTime`)
- **Task isolation**: All task queries filter by `Task.user_id == current_user.id` — users only see their own tasks
- **bcrypt rounds**: Set to `6` (down from default `12`) for faster login without sacrificing security meaningfully

---

## Error Handling

| Status Code | Scenario |
|---|---|
| `201 Created` | Successful register or task creation |
| `204 No Content` | Successful task deletion |
| `400 Bad Request` | due_date is in the past |
| `401 Unauthorized` | Invalid/expired/missing JWT |
| `409 Conflict` | Email or username already exists |
| `422 Unprocessable Entity` | Pydantic validation failure |
| `404 Not Found` | Task ID does not exist or belongs to another user |

- Frontend 401 errors on protected routes → interceptor auto-redirects to `/login`
- Auth endpoint 401 errors → passed through to display "Invalid email or password"
- All errors show inline message in components via `err.error?.detail`

---

## How to Run

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (running locally)

### Backend

```bash
cd backend
.\venv\Scripts\activate       # Windows
pip install -r requirements.txt
# Update .env with your DATABASE_URL
uvicorn main:app --reload
```

API will be available at: `http://localhost:8000`  
Swagger docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm start
```

App will be available at: `http://localhost:4200`

---

## Git Workflow

- Feature work done on branches: `refactor/backend-frontend-fixes`, `refactor-dashboard-template`, `fix-page-title`
- Final production-ready code merged into `main`
