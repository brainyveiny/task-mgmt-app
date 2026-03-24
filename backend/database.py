# @file database.py
# @description Database engine configuration and session management for SQLAlchemy
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
load_dotenv()
# Initialize core database components using environment configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/task_mgmt_db")
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
