# @file tasks.py
# @description Task management controller facilitating CRUD operations and filter logic
import time
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException, Request, status
from sqlalchemy.orm import Session
from database import get_database_session
from models import Task, TaskStatus, User
from schemas import TaskCreate, TaskUpdate, TaskResponse
from utils import logger
from dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["Task Management"])

# Simple in-memory rate limiter for task mutation endpoints
_task_rate_limit = {}


def check_task_rate_limit(client_ip: str, limit: int = 20, window: int = 60):
    now = time.time()
    timestamps = _task_rate_limit.get(client_ip, [])
    timestamps = [t for t in timestamps if now - t < window]
    _task_rate_limit[client_ip] = timestamps
    if len(timestamps) >= limit:
        logger.warning(f"Task rate limit exceeded for IP: {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later."
        )
    _task_rate_limit[client_ip].append(now)


@router.get("", response_model=List[TaskResponse])
def get_tasks(
    task_status: Optional[TaskStatus] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    database_session: Session = Depends(get_database_session),
    current_user: User = Depends(get_current_user)
):
# Retrieves a paginated, filtered collection of tasks owned by the current user session
# Enforces strict ownership boundaries in the query layer
    query = database_session.query(Task).filter(Task.user_id == current_user.id)
    if task_status:
        query = query.filter(Task.status == task_status)
    if search:
        query = query.filter(Task.title.ilike(f"%{search}%"))
    return query.order_by(Task.created_at.desc()).offset(offset).limit(limit).all()


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    database_session: Session = Depends(get_database_session),
    current_user: User = Depends(get_current_user)
):
# Fetches a singular task record verified by the owner identity
    task = database_session.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        logger.warning(f"Task access denied or not found: {task_id} (User: {current_user.id})")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task could not be found or access is restricted."
        )
    return task


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    request: Request,
    task_data: TaskCreate,
    database_session: Session = Depends(get_database_session),
    current_user: User = Depends(get_current_user)
):
# Provisions a new task entry in the registry for the authenticated session user
# Validates temporal constraints such as due dates
    check_task_rate_limit(request.client.host)
    if task_data.due_date and task_data.due_date < datetime.now():
        logger.warning(f"Task creation blocked: Past due date (User: {current_user.id})")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Due date cannot reside in the past."
        )
    new_task = Task(**task_data.model_dump(), user_id=current_user.id)
    database_session.add(new_task)
    database_session.commit()
    database_session.refresh(new_task)
    logger.info(f"Task successfully registered for user_id: {current_user.id}")
    return new_task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    request: Request,
    task_id: int,
    task_data: TaskUpdate,
    database_session: Session = Depends(get_database_session),
    current_user: User = Depends(get_current_user)
):
# Performs a partial or complete update of an existing task's attributes if owned by the user
    check_task_rate_limit(request.client.host)

    # Safety check — ensure task exists and belongs to the current user
    task = database_session.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        logger.warning(f"Task update rejected: Access denied or not found (Task: {task_id}, User: {current_user.id})")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Handle due_date safely — parse and validate before assigning
    if task_data.due_date:
        try:
            due_date_str = task_data.due_date.isoformat().replace("Z", "+00:00")
            task.due_date = datetime.fromisoformat(due_date_str)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid due_date format"
            )

    # Update individual fields explicitly if provided
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.status is not None:
        task.status = task_data.status
    if task_data.priority is not None:
        task.priority = task_data.priority

    database_session.commit()
    database_session.refresh(task)
    logger.info(f"Task updated successfully for user_id: {current_user.id}")
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    request: Request,
    task_id: int,
    database_session: Session = Depends(get_database_session),
    current_user: User = Depends(get_current_user)
):
# Permanently removes a task record from persistent storage for the authenticated user
    check_task_rate_limit(request.client.host)
    task = database_session.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        logger.warning(f"Task deletion rejected: Access denied or not found (Task: {task_id}, User: {current_user.id})")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task could not be found for removal."
        )
    database_session.delete(task)
    database_session.commit()
    logger.info(f"Task removed from registry for user_id: {current_user.id}")
    return None
