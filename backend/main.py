# @file main.py
# @description Application entry point orchestrating middleware, routing, and lifecycle events

# --- Standard Library ---
import os
import time
from contextlib import asynccontextmanager

# --- Third-Party ---
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

load_dotenv()

# --- Local ---
import auth
import tasks
from database import create_tables
from utils import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Manages system startup and shutdown sequences including schema initialization
    logger.info("Starting Task Management API...")
    create_tables()
    logger.info("Application ready.")
    yield

app = FastAPI(title="Task Management API", lifespan=lifespan)

# Global Exception Handler to capture unhandled runtime failures gracefully
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )

# Configure cross-origin resource sharing for the Angular frontend
# NOTE: Restrict origins, methods, and headers in production.
# NOTE: HTTPS is required in production for secure token transmission.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Intersects and logs all incoming HTTP requests with performance timing metrics
    start_time = time.time()
    response = await call_next(request)
    duration = round((time.time() - start_time) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration}ms)")
    return response

# Integrate feature-specific controller modules
app.include_router(auth.router)
app.include_router(tasks.router)

@app.get("/health", tags=["Health"])
def health_check():
    # Returns service liveness status for uptime monitoring and load balancer health checks
    return {"status": "ok"}

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    # Serves the static favicon asset for browser compatibility
    return FileResponse(os.path.join(os.path.dirname(__file__), "favicon.png"), media_type="image/png")
