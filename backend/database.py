# @file database.py
# @description Database engine configuration and session management for SQLAlchemy

# --- Standard Library ---
import os

# --- Third-Party ---
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
# NOTE: Use Alembic for database migrations in production environments.
# DEV ONLY: Set DATABASE_URL in your .env file before starting the application.
# Example: DATABASE_URL=postgresql://user:password@localhost:5432/task_mgmt_db
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is required. "
        "Set it in your .env file before starting the application."
    )
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_database_session():
    # Provides a transactional database session context with automatic rollback on failure
    database_session = SessionLocal()
    try:
        yield database_session
    except Exception:
        database_session.rollback()
        raise
    finally:
        database_session.close()

def create_tables():
    # Orchestrates the creation of all defined SQL tables in the connected database
    import models
    Base.metadata.create_all(bind=engine)
