# Task Management Application

> A full-stack task management system built with Angular 17 and FastAPI — designed for secure, real-time task creation, tracking, and collaboration.

---

## Overview

Most teams struggle with scattered task tracking across emails, chats, and spreadsheets. This application provides a centralized platform where users can register, log in, and manage their personal tasks through a clean and responsive dashboard.

**Purpose:** Demonstrate a production-aware full-stack architecture with proper authentication, validation, and separation of concerns across the frontend and backend.

---

## System Architecture

```
┌───────────────────────────────┐
│     Angular 17 (Frontend)     │
│  Standalone Components · CDK  │
│  JWT via localStorage         │
└──────────────┬────────────────┘
               │ HTTP REST (Bearer Token)
               ▼
┌───────────────────────────────┐
│     FastAPI (Backend)         │
│  JWT Auth · Rate Limiting     │
│  Pydantic Validation          │
└──────────────┬────────────────┘
               │ SQLAlchemy ORM
               ▼
┌───────────────────────────────┐
│  PostgreSQL (Production DB)   │
│  SQLite (Test DB — in-memory) │
└───────────────────────────────┘
```

---

## How It Works

1. **Register** — User submits username, email, and password. Backend validates and stores a bcrypt-hashed password.
2. **Login** — Credentials are verified. A signed JWT access token is returned and stored in the browser.
3. **Authenticated Requests** — Every API call includes the JWT in the `Authorization: Bearer` header via an Angular HTTP interceptor.
4. **Task Management** — User creates, updates, filters, and deletes tasks. All operations are scoped to the authenticated user.
5. **Dashboard** — Tasks are fetched on load and organized into columns: `To Do`, `In Progress`, and `Done`. Supports search and drag-and-drop reordering.
6. **Session Expiry** — Token expiry is decoded client-side. On 401 responses, the interceptor clears the token and redirects to login.

---

## Features

### Authentication
- User registration with username, email, and password
- Login with email **or** username
- JWT access tokens with configurable expiry
- Per-IP rate limiting on login and registration endpoints
- Secure bcrypt password hashing (10 rounds)

### Task Management
- Create tasks with title, description, priority, status, and due date
- Update any task field individually
- Delete tasks with confirmation prompt
- Filter tasks by status (`TODO`, `IN_PROGRESS`, `DONE`)
- Search tasks by title (server-side `ILIKE` query)
- Pagination support (`limit` / `offset`)
- Drag-and-drop status changes via Angular CDK

### UI & Experience
- Responsive dashboard with task columns
- Loading state indicators
- Form validation with inline error messages
- Lazy-loaded routes for faster initial page load
- Debounced search input (400ms) to reduce API calls

---

## Tech Stack

| Layer          | Technology                  | Purpose                          |
|----------------|-----------------------------|----------------------------------|
| Frontend       | Angular 17 (Standalone)     | SPA with routing and components  |
| Styling        | CSS (custom)                | Responsive UI layout             |
| HTTP Client    | Angular HttpClient          | REST API communication           |
| Auth Guard     | Angular Route Guard         | Protects dashboard and task routes |
| Backend        | FastAPI (Python)            | REST API with async support      |
| ORM            | SQLAlchemy                  | Database abstraction layer       |
| Validation     | Pydantic v2                 | Request/response schema enforcement |
| Auth           | python-jose · passlib       | JWT creation and bcrypt hashing  |
| Database       | PostgreSQL (prod)           | Relational data storage          |
| Test DB        | SQLite (in-memory)          | Isolated unit test environment   |
| Testing        | pytest · httpx              | Async API test suite             |

---

## API Integration

The Angular frontend communicates with the FastAPI backend exclusively through REST APIs.

### Auth Interceptor
Every outgoing HTTP request is automatically enriched with the JWT token:
```
Authorization: Bearer <token>
```
On receiving a `401 Unauthorized` response, the interceptor:
- Clears the stored token
- Redirects the user to `/login`
- Skips this behavior for `/auth/login` and `/auth/register` endpoints

### Key Endpoints

| Method | Endpoint             | Description                        |
|--------|----------------------|------------------------------------|
| POST   | `/auth/register`     | Register a new user                |
| POST   | `/auth/login`        | Login and receive JWT token        |
| GET    | `/auth/me`           | Get current authenticated user     |
| GET    | `/tasks`             | List tasks (filter, search, paginate) |
| GET    | `/tasks/{id}`        | Get a single task                  |
| POST   | `/tasks`             | Create a new task                  |
| PUT    | `/tasks/{id}`        | Update an existing task            |
| DELETE | `/tasks/{id}`        | Delete a task                      |
| GET    | `/health`            | Health check for uptime monitoring |

---

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL (for production) — or use the default SQLite for testing

---

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/task_mgmt_db
SECRET_KEY=your_strong_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Start the server:

```bash
uvicorn main:app --reload
```

---

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## Application URLs

| Service        | URL                              |
|----------------|----------------------------------|
| Frontend App   | http://localhost:4200            |
| Backend API    | http://localhost:8000            |
| Swagger UI     | http://localhost:8000/docs       |
| ReDoc          | http://localhost:8000/redoc      |
| Health Check   | http://localhost:8000/health     |

---

## Validation & Security

### Backend
- **Password:** Min 8 chars, max 72 chars (bcrypt limit enforced at schema level)
- **Username:** Min 3 characters, whitespace stripped
- **Task title:** Min 3 characters enforced server-side
- **Description:** Max 1000 characters
- **Due date:** Validated to prevent past dates; safe ISO 8601 parsing to avoid timezone errors
- **Rate limiting:** Per-IP sliding-window rate limiter on auth and task mutation endpoints
- **CORS:** Restricted to `localhost:4200` only; explicit methods (`GET`, `POST`, `PUT`, `DELETE`) and headers (`Authorization`, `Content-Type`)
- **Error handling:** Global exception handler returns safe 500 messages — no stack traces exposed

### Frontend
- Route guard blocks unauthenticated access to dashboard and task pages
- Angular `Validators.email` enforced on login and registration forms
- Pattern validation on password fields
- HTTP interceptor centralizes token management — no scattered `localStorage` access across components

---

## Running Tests

```bash
cd backend
pytest
```

Tests use an **in-memory SQLite database** with full table isolation per test — no file artifacts created.

---

## Future Improvements

| Area               | Improvement                                              |
|--------------------|----------------------------------------------------------|
| Security           | Replace localStorage with HttpOnly cookie-based auth     |
| Scalability        | Replace in-memory rate limiter with Redis                |
| Database           | Introduce Alembic for schema migration management        |
| API Design         | Add API versioning (`/api/v1/`)                         |
| Performance        | Add composite index on `(user_id, status)` for queries   |
| UX                 | Add pagination controls on dashboard for >50 tasks       |
| Testing            | Add frontend unit tests and cross-user isolation tests    |
| Monitoring         | Integrate APM (e.g., Sentry, Datadog) for error tracking |

---

## Summary

This project delivers a production-aware full-stack task management application with:

- ✅ Secure JWT authentication with rate limiting
- ✅ Full CRUD task management with validation
- ✅ Angular 17 standalone component architecture with lazy loading
- ✅ FastAPI backend with Pydantic v2 schema enforcement
- ✅ Role-aware API with strict per-user data isolation
- ✅ In-memory test database for clean, repeatable test runs
- ✅ Clean codebase with consistent logging and structured error handling

> **Status:** Submission-ready. Suitable for demo, staging, and further production hardening.

---

*Stack: Angular 17 · FastAPI · PostgreSQL · JWT · SQLAlchemy · pytest*
