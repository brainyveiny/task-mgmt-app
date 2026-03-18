# Task Management App

A full-stack task management application built for learning backend and frontend concepts at a trainee level.

- **Backend:** Python, FastAPI, PostgreSQL, SQLAlchemy, JWT
- **Frontend:** Angular 19, TypeScript, RxJS
- **Auth:** JWT (python-jose), bcrypt (passlib)

---

## Features

- User registration and login with JWT authentication
- Create, edit, delete tasks
- Filter tasks by status (To Do / In Progress / Done)
- Search tasks by title
- Drag and drop tasks between columns
- Task priority (LOW / MEDIUM / HIGH) and due date support
- Global alert toasts for all user actions
- Google Material icons

---

## Project Structure

```
backend/
├── main.py          # App entry point, CORS, logging middleware
├── database.py      # PostgreSQL connection and session (uses .env)
├── models.py        # User and Task SQLAlchemy models
├── schemas.py       # Pydantic request/response schemas
├── auth.py          # Register, login, JWT token, get_current_user
├── tasks.py         # Task CRUD endpoints
├── utils.py         # Password hashing, JWT helpers, logger
├── requirements.txt
└── .env             # Environment variables (not committed)

frontend/src/app/
├── feature/
│   ├── login/           # Login page + AuthService
│   ├── register/        # Register page
│   ├── dashboard/       # Kanban board (grouped by status, drag-drop)
│   └── task-form/       # Create / edit task form + TaskService
├── shared/
│   ├── alert.service.ts  # Global alert toast service (3s auto-vanish)
│   └── alert.component.ts
├── interceptors/
│   └── auth.interceptor.ts  # Attaches JWT to requests, handles 401
├── app.routes.ts        # Routes with auth guard
├── app.config.ts        # App config, HTTP client with interceptor
└── app.ts               # Root component (includes global alert)
```

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL — create a database called `task_mgmt_db`

---

## How to Run

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Runs on: http://localhost:8000  
API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
ng serve
```

Runs on: http://localhost:4200

---

## Environment Variables

Create a `.env` file in the `backend/` folder:

```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/task_mgmt_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

## API Endpoints

| Method | Endpoint       | Description          | Auth |
|--------|----------------|----------------------|------|
| POST   | /auth/register | Register new user    | No   |
| POST   | /auth/login    | Login, get JWT token | No   |
| GET    | /tasks         | Get all user tasks   | Yes  |
| GET    | /tasks/{id}    | Get task by ID       | Yes  |
| POST   | /tasks         | Create task          | Yes  |
| PUT    | /tasks/{id}    | Update task          | Yes  |
| DELETE | /tasks/{id}    | Delete task          | Yes  |

**Query params for GET /tasks:**
- `?task_status=TODO` — filter by status (`TODO`, `IN_PROGRESS`, `DONE`)
- `?search=report` — search tasks by title

---

## Validation Rules

### Registration
- Username: min 3 chars, alphanumeric + underscore only
- Email: must be `@saksoft.com` or `@gmail.com`
- Password: min 8 chars, max 72 chars, letters/numbers/`_`/`.`/`@`

### Tasks
- Title: min 3 chars, max 200 chars
- Due date: cannot be in the past

---

## Database Schema

### users
| Column          | Type         |
|-----------------|--------------|
| id              | INTEGER (PK) |
| username        | VARCHAR(50)  |
| email           | VARCHAR(100) |
| hashed_password | VARCHAR(255) |
| created_at      | TIMESTAMP    |

### tasks
| Column      | Type                            |
|-------------|---------------------------------|
| id          | INTEGER (PK)                    |
| title       | VARCHAR(200)                    |
| description | TEXT                            |
| status      | ENUM (TODO, IN_PROGRESS, DONE)  |
| priority    | ENUM (LOW, MEDIUM, HIGH)        |
| due_date    | TIMESTAMP                       |
| created_at  | TIMESTAMP                       |
| updated_at  | TIMESTAMP                       |
| user_id     | INTEGER (FK → users.id)         |
