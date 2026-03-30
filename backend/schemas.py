# @file schemas.py
# @description Pydantic models for request validation, response serialization, and type safety
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from models import TaskStatus, TaskPriority


class UserCreate(BaseModel):
# Schema for validating user registration payloads with email format enforcement
    username: str
    email: EmailStr
    password: str

    @field_validator("username", "password", mode="before")
    @classmethod
    def strip_strings(class_type, value):
# Strips all incoming string inputs to prevent whitespace-only entries
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("username")
    @classmethod
    def username_not_empty(class_type, value: str) -> str:
# Ensures the username provides a non-blank identity and minimum readable length
        if not value:
            raise ValueError("username must not be empty")
        if len(value) < 3:
            raise ValueError("username must be at least 3 characters long")
        return value

    @field_validator("password")
    @classmethod
    def password_min_length(class_type, value: str) -> str:
# Enforces minimum complexity through password length validation
# bcrypt silently truncates beyond 72 characters — cap enforced here to prevent DoS
        if len(value) < 8:
            raise ValueError("password must be at least 8 characters long")
        if len(value) > 72:
            raise ValueError("password must not exceed 72 characters")
        return value


# UserLogin removed — login endpoint uses OAuth2PasswordRequestForm directly


class UserResponse(BaseModel):
# API response schema for user data with ORM compatibility enabled
# Standardized to exclude sensitive internal identifiers from public payloads
    username: str
    email: str
    created_at: datetime
    class Config:
        from_attributes = True


class Token(BaseModel):
# Schema for JWT access token responses
    access_token: str
    token_type: str = "bearer"


class TaskCreate(BaseModel):
# Schema for validating task creation payloads with title presence enforcement
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None

    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_task_strings(class_type, value):
# Strips all incoming string inputs to prevent whitespace-only entries
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(class_type, value: str) -> str:
# Ensures the task title provides meaningful identifying information with minimum readable length
        if not value:
            raise ValueError("title must not be empty")
        if len(value) < 3:
            raise ValueError("title must be at least 3 characters long")
        return value

    @field_validator("description")
    @classmethod
    def description_max_length(class_type, value: Optional[str]) -> Optional[str]:
# Enforces maximum description length to prevent oversized payloads
        if value and len(value) > 1000:
            raise ValueError("description must not exceed 1000 characters")
        return value


class TaskUpdate(BaseModel):
# Schema for validating partial task updates with conditional title validation
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None

    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_update_strings(class_type, value):
# Strips all incoming string inputs to prevent whitespace-only entries
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(class_type, value: Optional[str]) -> Optional[str]:
# Validates title content only when provided in the update payload
        if value is not None and not value:
            raise ValueError("title must not be empty")
        return value

    @field_validator("description")
    @classmethod
    def description_max_length(class_type, value: Optional[str]) -> Optional[str]:
# Enforces maximum description length to prevent oversized payloads
        if value and len(value) > 1000:
            raise ValueError("description must not exceed 1000 characters")
        return value


class TaskResponse(BaseModel):
# Comprehensive API response schema for task data with ORM attribute mapping
# Standardized to provide a clean and consistent data structure
    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True
