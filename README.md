# Task Management App

A simple full-stack task management application.

- **Backend:** Python, FastAPI, PostgreSQL, SQLAlchemy
- **Frontend:** Angular, TypeScript
- **Auth:** JWT (python-jose), bcrypt (passlib)

## Features

- User registration and login with JWT authentication
- Create, update, delete tasks
- Filter tasks by status
- Search tasks by title
- Drag and drop tasks between columns
- Task priority and due date support

## Project Structure

```
backend/
├── main.py          # App setup, CORS, middleware
├── database.py      # DB connection and session
├── models.py        # User and Task models
├── schemas.py       # Request/response schemas
├── auth.py          # Register, login, JWT
├── tasks.py         # Task CRUD endpoints
├── utils.py         # Hashing, JWT helpers, logging
├── requirements.txt
└── .env

frontend/src/app/
├── feature/
│   ├── login/       # Login page + AuthService
│   ├── register/    # Registration page
│   ├── dashboard/   # Task board (grouped by status)
│   └── task-form/   # Create/edit task + TaskService
├── interceptors/    # JWT interceptor
├── app.routes.ts    # Routes with auth guard
├── app.config.ts    # App config
└── app.ts           # Root component
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL (create a database called `task_mgmt_db`)

## How to Run

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

Runs on http://localhost:8000

### Frontend

```bash
cd frontend
npm install
ng serve
```

Runs on http://localhost:4200

## API Endpoints

| Method | Endpoint          | Description       | Auth Required |
|--------|-------------------|-------------------|---------------|
| POST   | /auth/register    | Register user     | No            |
| POST   | /auth/login       | Login, get token  | No            |
| GET    | /tasks            | Get all tasks     | Yes           |
| GET    | /tasks/{id}       | Get task by id    | Yes           |
| POST   | /tasks            | Create task       | Yes           |
| PUT    | /tasks/{id}       | Update task       | Yes           |
| DELETE | /tasks/{id}       | Delete task       | Yes           |

**Query params for GET /tasks:**
- `?task_status=TODO` — filter by status (TODO, IN_PROGRESS, DONE)
- `?search=report` — search by title

## Environment Variables

Create a `.env` file in the `backend/` folder:

```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/task_mgmt_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

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
| Column      | Type                          |
|-------------|-------------------------------|
| id          | INTEGER (PK)                  |
| title       | VARCHAR(200)                  |
| description | TEXT                          |
| status      | ENUM (TODO, IN_PROGRESS, DONE)|
| priority    | ENUM (LOW, MEDIUM, HIGH)      |
| due_date    | TIMESTAMP                     |
| created_at  | TIMESTAMP                     |
| updated_at  | TIMESTAMP                     |
| user_id     | INTEGER (FK → users.id)       |

## Improvements Made

- Added backend validation (password, username, title, due date)
- Improved security by removing weak defaults and handling JWT errors
- Added index on user_id for better performance
- Cleaned and simplified frontend code with proper comments
