# @file dependencies.py
# @description Centralized FastAPI dependencies for authentication and authorization logic

# --- Third-Party ---
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

# --- Local ---
from database import get_database_session
from models import User
from utils import decode_access_token, logger

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    database_session: Session = Depends(get_database_session),
) -> User:
    # Dependency for extracting and validating the user identity from the JWT bearer token
    token_payload = decode_access_token(token)
    if not token_payload:
        logger.warning("Token decoding failed or token expired.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    subject = token_payload.get("sub")
    if not subject:
        logger.warning("Token payload missing 'sub' claim.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        user_identifier = int(subject)
    except (TypeError, ValueError) as e:
        logger.error(f"Invalid user identifier format in token: {subject} - {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = database_session.query(User).filter(User.id == user_identifier).first()
    if not user:
        logger.warning(f"User not found in registry: id={user_identifier}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
