# Task Management App

A full-stack task management application built with FastAPI and Angular.

**Stack:**
- Backend: Python, FastAPI, SQLAlchemy, PostgreSQL, JWT
- Frontend: Angular 19 (standalone components), TypeScript, RxJS, Angular CDK (drag-drop)

---

## Features

- User registration and login with JWT authentication
- Create, edit, delete tasks (title, description, status, priority, due date)
- Kanban board grouped by status: To Do / In Progress / Done
- Drag and drop tasks between columns
- Filter tasks by status
- Search tasks by title (debounced)
- Route-level auth guard — protected pages redirect to login
- JWT attached to all API requests via HTTP interceptor
- Global alert toasts for every user action (3s auto-dismiss)

---

## Project Structure

```
backend/
├── main.py          # FastAPI app, CORS, request logging middleware
├── database.py      # SQLAlchemy engine, session, table creation
├── models.py        # User and Task models with enums
├── schemas.py       # Pydantic schemas with field validators
├── auth.py          # /auth/register, /auth/login, get_current_user
├── tasks.py         # Task CRUD endpoints
├── utils.py         # bcrypt hashing, JWT encode/decode, logger
├── requirements.txt
└── .env

frontend/src/app/
├── feature/
│   ├── login/           # Login form + AuthService (stores JWT in localStorage)
│   ├── register/        # Register form
│   ├── dashboard/       # Kanban board, drag-drop, filter, search
│   └── task-form/       # Create / edit task form + TaskService
├── shared/
│   ├── alert.service.ts  # Global BehaviorSubject-based alert (NgZone + 3s timeout)
│   └── alert.component.ts
├── interceptors/
│   └── auth.interceptor.ts  # Adds Bearer token, handles 401 (skips auth endpoints)
├── app.routes.ts        # Routes with inline authGuard (checks localStorage token)
├── app.config.ts        # provideHttpClient with interceptor
└── app.ts               # Root component, includes <app-alert>
```

---

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL — create a database named `task_mgmt_db`

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Runs on: `http://localhost:8000`  
Swagger docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
ng serve
```

Runs on: `http://localhost:4200`

---

## Environment Variables

Create `backend/.env`:

```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/task_mgmt_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

## API Endpoints

| Method | Endpoint       | Description        | Auth |
|--------|----------------|--------------------|------|
| POST   | /auth/register | Register user      | No   |
| POST   | /auth/login    | Login → JWT token  | No   |
| GET    | /tasks         | List user tasks    | Yes  |
| GET    | /tasks/{id}    | Get task by ID     | Yes  |
| POST   | /tasks         | Create task        | Yes  |
| PUT    | /tasks/{id}    | Update task        | Yes  |
| DELETE | /tasks/{id}    | Delete task        | Yes  |

**GET /tasks query params:**
- `?task_status=TODO` — filter by `TODO`, `IN_PROGRESS`, or `DONE`
- `?search=keyword` — case-insensitive title search

---

## Validation

### Registration (`/auth/register`)
- `username` — min 3 chars, alphanumeric + underscore only
- `email` — must end with `@saksoft.com` or `@gmail.com`
- `password` — min 8, max 72 chars; letters, digits, `_`, `.`, `@`
- Duplicate email → `409 Email already exists.`
- Duplicate username → `409 Username already taken.`

### Tasks
- `title` — required, min 3, max 200 chars
- `due_date` — optional; rejected if in the past

---

## Authentication Flow

1. User registers → password hashed with bcrypt (rounds=6)
2. User logs in → JWT token returned and saved in `localStorage`
3. All task requests include `Authorization: Bearer <token>` (via interceptor)
4. Backend decodes JWT, looks up user, rejects expired/invalid tokens with `401`
5. Frontend interceptor catches `401` on protected routes → clears token → redirects to login
6. Auth endpoints (`/auth/login`, `/auth/register`) are excluded from the redirect on `401`

---

## Database Schema

### users
| Column          | Type                      |
|-----------------|---------------------------|
| id              | INTEGER (PK, indexed)     |
| username        | VARCHAR(50), unique       |
| email           | VARCHAR(100), unique      |
| hashed_password | VARCHAR(255)              |
| created_at      | TIMESTAMP WITH TIMEZONE   |

### tasks
| Column      | Type                            |
|-------------|---------------------------------|
| id          | INTEGER (PK, indexed)           |
| title       | VARCHAR(200)                    |
| description | TEXT (nullable)                 |
| status      | ENUM (TODO, IN_PROGRESS, DONE)  |
| priority    | ENUM (LOW, MEDIUM, HIGH)        |
| due_date    | TIMESTAMP WITH TIMEZONE (nullable) |
| created_at  | TIMESTAMP WITH TIMEZONE         |
| updated_at  | TIMESTAMP WITH TIMEZONE         |
| user_id     | INTEGER (FK → users.id, CASCADE DELETE, indexed) |

**Relationship:** One user → many tasks (cascade delete on user removal)

---

## Key Implementation Details

- All requests are logged with method, path, status code, and duration (ms)
- Tasks are scoped per user — users only see and modify their own tasks
- `updated_at` is auto-updated by the database on every row change
- CORS is restricted to `localhost:4200` only
- Frontend uses `ChangeDetectorRef.detectChanges()` to force immediate error rendering
- Search input is debounced 400ms before triggering API call
