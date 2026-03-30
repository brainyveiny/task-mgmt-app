# Task Management Application

A full-stack task management application built with Angular and FastAPI. Users can register, log in, and manage their tasks through a clean dashboard interface.

---

## Features

- User registration and login
- JWT-based authentication
- Create, update, and delete tasks
- Task status tracking: To Do, In Progress, Done
- Task priority levels: Low, Medium, High
- Dashboard view with task organization

---

## Tech Stack

| Layer          | Technology          |
|----------------|---------------------|
| Frontend       | Angular 17          |
| Backend        | FastAPI (Python)    |
| Database       | PostgreSQL / SQLite |
| Authentication | JWT (Bearer Token)  |

---

## How to Run

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

> Make sure to create a `.env` file in the `backend/` folder with the following variables:
> ```
> DATABASE_URL=postgresql://user:password@localhost:5432/task_mgmt_db
> SECRET_KEY=your_secret_key
> ALGORITHM=HS256
> ACCESS_TOKEN_EXPIRE_MINUTES=60
> ```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## Application URLs

| Service  | URL                      |
|----------|--------------------------|
| Frontend | http://localhost:4200    |
| Backend  | http://localhost:8000    |
| API Docs | http://localhost:8000/docs |

---

## How It Works

1. **Register** — User creates an account with a username, email, and password.
2. **Login** — User logs in with their credentials.
3. **Token Issued** — A JWT access token is issued and stored in the browser.
4. **Manage Tasks** — User can create, edit, update status, and delete tasks.
5. **Dashboard** — All tasks are displayed and organized by status.

---

## Screens

| Screen    | Description                              |
|-----------|------------------------------------------|
| Register  | Create a new account                     |
| Login     | Sign in with email or username           |
| Dashboard | View and manage all tasks by status      |

---

## Notes

- Requires **Node.js** and **Python 3.10+**
- All APIs follow REST conventions
- Runs fully locally — no cloud services required
- Environment variables must be configured before starting the backend
