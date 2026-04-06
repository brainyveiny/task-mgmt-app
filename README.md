# Task Management Application

> A modern full-stack task management system with secure authentication, real-time task handling, and production-aware architecture.

---

## Highlights

- **Secure JWT Authentication** (with per-IP rate limiting)
- **Complete Task Management** (CRUD + filtering + search)
- **Angular 17 + FastAPI** full-stack architecture
- **Strong validation** with Pydantic v2 + bcrypt hashing
- **Async test suite** with isolated in-memory database
- Production-aware design with clean separation of concerns

---

## Links

| Platform | URL |
|----------|-----|
| GitHub | https://github.com/brainyveiny/task-mgmt-app |
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

---

## Project Status

| Area | Status |
|---|---|
| Core functionality | Complete |
| Authentication | JWT + rate limiting |
| Test suite | Async API tests |
| Submission ready | Yes |

> **Production notes (not required for submission):**
> JWT is stored in `localStorage` (fine for academic). For production: use `HttpOnly` cookies, Redis rate limiting, and Alembic migrations.

---

## Overview

A centralized platform where users can register, authenticate, and manage personal tasks through a clean and responsive dashboard.

Built to demonstrate real-world architecture with secure authentication, validation, and structured API design.

---

## Features

### Authentication
- Register with username, email, and password
- Login using email
- JWT access token with configurable expiry
- Rate limiting per IP on login and registration
- bcrypt password hashing (10 rounds)

### Task Management
- Create, update, and delete tasks
- Fields: title, description, status, priority, due date
- Filter by status (`TODO`, `IN_PROGRESS`, `DONE`)
- Search by title (server-side `ILIKE`)
- Pagination via `limit` / `offset`
- Drag-and-drop status changes (Angular CDK)

### UI & Experience
- Responsive dashboard with task columns
- Inline form validation with error messages
- Debounced search (400ms)
- Loading state indicators
- Lazy-loaded routes for fast initial load

---

## How It Works

1. **Register** — Username, email, and password validated + bcrypt-hashed on backend
2. **Login** — Credentials verified; signed JWT returned and stored in browser
3. **Requests** — Every API call auto-injects `Authorization: Bearer <token>` via Angular interceptor
4. **Tasks** — All CRUD operations are scoped strictly to the authenticated user
5. **Session** — On 401 response, token is cleared and user is redirected to login

---

## Tech Stack

**Frontend**
- Angular 17 (Standalone Components)
- Angular HttpClient + Route Guards
- Angular CDK (drag and drop)
- Custom CSS (responsive layout)

**Backend**
- FastAPI (Python) — async REST API
- SQLAlchemy ORM — database abstraction
- Pydantic v2 — schema validation
- python-jose + passlib — JWT + bcrypt

**Database**
- PostgreSQL (production)
- SQLite in-memory (tests only)

**Testing**
- pytest + httpx (async API tests)

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT |
| `GET` | `/auth/me` | Get current user profile |
| `GET` | `/tasks` | List tasks (filter, search, paginate) |
| `GET` | `/tasks/{id}` | Get single task |
| `POST` | `/tasks` | Create task |
| `PUT` | `/tasks/{id}` | Update task |
| `DELETE` | `/tasks/{id}` | Delete task |
| `GET` | `/health` | Health check |

---

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/task_mgmt_db
SECRET_KEY=your_strong_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

```bash
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## Running Tests

```bash
cd backend
pytest
```

Tests use an isolated in-memory SQLite database — clean state per test, no file artifacts.

---

## Security

| Concern | Approach |
|---|---|
| Passwords | bcrypt (10 rounds) via passlib |
| Tokens | JWT signed with `SECRET_KEY` from `.env` |
| Token storage | `localStorage` (academic scope) |
| Secret management | Environment variables only — nothing hardcoded |
| Rate limiting | Per-IP sliding window on auth + mutation endpoints |
| CORS | Restricted to `localhost:4200` only |
| Error responses | Global handler — no stack traces exposed |

---

## Architecture

```
┌─────────────────────────┐
│   Angular 17 Frontend   │
│   Standalone · CDK      │
│   JWT via localStorage  │
└────────────┬────────────┘
             │ HTTP REST (Bearer Token)
             ▼
┌─────────────────────────┐
│   FastAPI Backend       │
│   JWT · Rate Limiting   │
│   Pydantic Validation   │
└────────────┬────────────┘
             │ SQLAlchemy ORM
             ▼
┌─────────────────────────┐
│   PostgreSQL (prod)     │
│   SQLite (tests)        │
└─────────────────────────┘
```

---

## Screenshots

> Screenshots can be added here (Dashboard + Task Form)

---

## Future Improvements

| Area | Improvement |
|---|---|
| Security | Move to `HttpOnly` cookie-based JWT storage |
| Scalability | Replace in-memory rate limiter with Redis |
| Database | Add Alembic for schema migration management |
| Testing | Add cross-user isolation + frontend unit tests |
| API | Add versioning (`/api/v1/`) |
| UX | Add pagination controls for large task lists |

---

## Author

- **Developer:** Vamshi
- **Institution:** Saksoft
- **Focus:** Clean architecture · JWT auth · RESTful API design · Angular 17

---

> Built with **Angular 17 · FastAPI · PostgreSQL · JWT · SQLAlchemy**
> Submission-ready academic project demonstrating production-aware full-stack development.
