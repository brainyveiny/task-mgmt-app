# @file utils.py
# @description Core utility library for cryptographic operations, token lifecycle management, and logging
import logging
import sys
import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

# Configure system-wide logging with synchronized stdout stream
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("task_mgmt_app")
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=10)


def hash_password(password: str) -> str:
# Generates a secure salted hash for raw password storage
    return password_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
# Validates a plain-text password against a known cryptographic hash
    return password_context.verify(plain_password, hashed_password)

# Mandatory environment configuration with strict production enforcement
JWT_SECRET_KEY = os.getenv("SECRET_KEY")
if not JWT_SECRET_KEY:
    logger.critical("SECRET_KEY environment variable is MISSING. Application cannot start securely.")
    raise RuntimeError("SECRET_KEY environment variable is required.")

JWT_ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
# Generates a signed JWT with a configurable expiration window
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token


def decode_access_token(token: str) -> Optional[dict]:
# Decodes and validates a JWT signature using the system secret key
    try:
        token_payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return token_payload
    except JWTError as e:
        logger.error(f"JWT decoding error: {str(e)}")
        return None
