# @file tasks.py
# @description Task management controller facilitating CRUD operations and filter logic
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from database import get_database_session
from models import Task, TaskStatus, User
from schemas import TaskCreate, TaskUpdate, TaskResponse
from auth import get_current_user
from utils import logger
router = APIRouter(prefix="/tasks", tags=["Tasks"])
@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_data: TaskCreate, database_session: Session = Depends(get_database_session), current_user: User = Depends(get_current_user)):
# Persists a new task unit for the authenticated user context
    if task_data.due_date and task_data.due_date.replace(tzinfo=None) < datetime.now(timezone.utc).replace(tzinfo=None):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="due_date cannot be in the past.")
    task = Task(**task_data.model_dump(), user_id=current_user.id)
    database_session.add(task)
    database_session.commit()
    database_session.refresh(task)
    logger.info(f"Task created: id={task.id}, user_id={current_user.id}")
    return task
@router.get("", response_model=List[TaskResponse])
def get_tasks(task_status: Optional[TaskStatus] = Query(None), search: Optional[str] = Query(None), database_session: Session = Depends(get_database_session), current_user: User = Depends(get_current_user)):
# Retrieves a filtered collection of tasks owned by the current user
# Filter dataset by ownership
    query = database_session.query(Task).filter(Task.user_id == current_user.id)
    if task_status:
        query = query.filter(Task.status == task_status)
    if search:
        query = query.filter(Task.title.ilike(f"%{search}%"))
    return query.order_by(Task.created_at.desc()).all()
@router.get("/{task_identifier}", response_model=TaskResponse)
def get_task(task_identifier: int, database_session: Session = Depends(get_database_session), current_user: User = Depends(get_current_user)):
# Fetches a singular task record verified by owner identifier
    task = database_session.query(Task).filter(Task.id == task_identifier, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Task with id {task_identifier} not found.")
    return task
@router.put("/{task_identifier}", response_model=TaskResponse)
def update_task(task_identifier: int, task_data: TaskUpdate, database_session: Session = Depends(get_database_session), current_user: User = Depends(get_current_user)):
# Modifies an existing task record with partial or full attribute updates
    task = database_session.query(Task).filter(Task.id == task_identifier, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Task with id {task_identifier} not found.")
    if task_data.due_date and task_data.due_date.replace(tzinfo=None) < datetime.now(timezone.utc).replace(tzinfo=None):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="due_date cannot be in the past.")
# Apply partial updates via attribute mapping
    for key, value in task_data.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    database_session.commit()
    database_session.refresh(task)
    logger.info(f"Task updated: id={task_identifier}, user_id={current_user.id}")
    return task
@router.delete("/{task_identifier}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_identifier: int, database_session: Session = Depends(get_database_session), current_user: User = Depends(get_current_user)):
# Permanently deletes a task record from the user's registry
    task = database_session.query(Task).filter(Task.id == task_identifier, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Task with id {task_identifier} not found.")
    database_session.delete(task)
    database_session.commit()
    logger.info(f"Task deleted: id={task_identifier}, user_id={current_user.id}")
