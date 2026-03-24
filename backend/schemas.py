# @file schemas.py
# @description Pydantic models for request validation, response serialization, and type safety
import re
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from models import TaskStatus, TaskPriority
class UserCreate(BaseModel):
# Schema for validating user registration payloads with domain email constraints
    username: str
    email: str
    password: str
    @field_validator("email")
    @classmethod
    def email_must_be_valid(class_type, value: str) -> str:
# Enforces domain-specific email constraints (saksoft.com or gmail.com)
        pattern = r'^[a-zA-Z0-9._%+-]+@(saksoft\.com|gmail\.com)$'
        if not re.match(pattern, value):
            raise ValueError("Invalid email")
        return value
    @field_validator("username")
    @classmethod
    def username_must_be_valid(class_type, value: str) -> str:
# Ensures username meets minimum length requirements post-stripping
        value = value.strip()
        if len(value) < 3:
            raise ValueError("username must be at least 3 characters long")
        return value
    @field_validator("password")
    @classmethod
    def password_min_length(class_type, value: str) -> str:
# Enforces minimum complexity through password length validation
        if len(value) < 8:
            raise ValueError("password must be at least 8 characters long")
        return value
class UserLogin(BaseModel):
# Schema for validating user authentication attempts
    email: str
    password: str
class UserResponse(BaseModel):
# API response schema for user data with ORM compatibility enabled
    id: int
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
    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(class_type, value: str) -> str:
# Ensures the task title provides meaningful identifying information
        if not value or not value.strip():
            raise ValueError("title must not be empty or whitespace")
        return value
class TaskUpdate(BaseModel):
# Schema for validating partial task updates with conditional title validation
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(class_type, value: Optional[str]) -> Optional[str]:
# Validates title content only when provided in the update payload
        if value is not None and not value.strip():
            raise ValueError("title must not be empty or whitespace")
        return value
class TaskResponse(BaseModel):
# Comprehensive API response schema for task data with ORM attribute mapping
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
