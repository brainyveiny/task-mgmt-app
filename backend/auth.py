# @file auth.py
# @description Authentication controller managing user identity, registration, and session authorization

# --- Standard Library ---
import time

# --- Third-Party ---
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# --- Local ---
from database import get_database_session
from models import User
from schemas import UserCreate, UserResponse, Token
from utils import hash_password, verify_password, create_access_token, decode_access_token, logger

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Simple in-memory rate limiter for authentication attempts
# Prevents rapid brute-force attacks on login and registration endpoints
_auth_rate_limit = {}

def check_rate_limit(client_id: str, limit: int = 5, window: int = 60):
    now = time.time()
    timestamps = _auth_rate_limit.get(client_id, [])
    timestamps = [t for t in timestamps if now - t < window]
    _auth_rate_limit[client_id] = timestamps
    if len(timestamps) >= limit:
        logger.warning(f"Rate limit exceeded for client: {client_id}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication attempts. Please try again later."
        )
    _auth_rate_limit[client_id].append(now)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(request: Request, user_data: UserCreate, database_session: Session = Depends(get_database_session)):
    # Registers a new user while enforcing identity uniqueness and security constraints
    # Rate limited per IP to prevent automation-based account creation
    check_rate_limit(request.client.host, limit=10)
    existing_by_username = database_session.query(User).filter(User.username == user_data.username).first()
    if existing_by_username:
        logger.info("Registration attempt with duplicate username.")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists."
        )
    existing_by_email = database_session.query(User).filter(User.email == user_data.email).first()
    if existing_by_email:
        logger.info("Registration attempt with duplicate email.")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists."
        )

    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password)
    )

    database_session.add(new_user)
    database_session.commit()
    database_session.refresh(new_user)

    logger.info("New user registered successfully.")
    return new_user

@router.post("/login", response_model=Token)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    database_session: Session = Depends(get_database_session)
):
    # Authenticates user credentials and issues a secure JWT access token
    # Rate limited per IP to prevent brute-force credential stuffing
    check_rate_limit(request.client.host)
    user = database_session.query(User).filter(
        (User.email == form_data.username) | (User.username == form_data.username)
    ).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        # Sanitize logs by removing explicit credential info (PII)
        logger.warning("Failed login attempt detected.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    logger.info("User authenticated successfully.")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_current_user(
    request: Request,
    database_session: Session = Depends(get_database_session)
):
    # Decodes the Bearer token and returns the authenticated user's full profile
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth_header.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = database_session.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    logger.info("Current user profile retrieved successfully.")
    return user
