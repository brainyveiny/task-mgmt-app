# @file auth.py
# @description Authentication controller managing user identity, registration, and session authorization
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_database_session
from models import User
from schemas import UserCreate, UserLogin, UserResponse, Token
from utils import hash_password, verify_password, create_access_token, decode_access_token, logger
router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()
def get_current_user(
    authorization_credentials: HTTPAuthorizationCredentials = Depends(security),
    database_session: Session = Depends(get_database_session),
) -> User:
# Dependency for extracting and validating the user identity from the JWT bearer token
    token = authorization_credentials.credentials
# Parse and verify cryptographic signature
    token_payload = decode_access_token(token)
    if not token_payload or not token_payload.get("sub"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials.", headers={"WWW-Authenticate": "Bearer"})
    try:
        user_identifier = int(token_payload.get("sub"))
    except (TypeError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials.", headers={"WWW-Authenticate": "Bearer"})
# Fetch persistent identity from registry
    user = database_session.query(User).filter(User.id == user_identifier).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials.", headers={"WWW-Authenticate": "Bearer"})
    return user
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, database_session: Session = Depends(get_database_session)):
# Orchestrates new user registration with unique email and username enforcement
    if database_session.query(User).filter(User.email == user_data.email).first():
        logger.warning("Registration attempt with existing email.")
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists.")
    if database_session.query(User).filter(User.username == user_data.username).first():
        logger.warning("Registration attempt with existing username.")
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken.")
    new_user = User(username=user_data.username, email=user_data.email, hashed_password=hash_password(user_data.password))
    database_session.add(new_user)
    database_session.commit()
    database_session.refresh(new_user)
    logger.info(f"New user registered: username={new_user.username}")
    return new_user
@router.post("/login", response_model=Token)
def login(user_data: UserLogin, database_session: Session = Depends(get_database_session)):
# Authenticates credentials against the user registry and issues a signed access token
    user = database_session.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        logger.warning("Failed login attempt.")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    token = create_access_token(data={"sub": str(user.id)})
    logger.info(f"User logged in: user_id={user.id}")
    return Token(access_token=token)
