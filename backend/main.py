import time
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables
from utils import logger
import auth
import tasks


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Task Management API...")
    create_tables()
    logger.info("Application ready.")
    yield


app = FastAPI(title="Task Management API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = round((time.time() - start_time) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration}ms)")
    return response


app.include_router(auth.router)
app.include_router(tasks.router)


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return FileResponse(os.path.join(os.path.dirname(__file__), "favicon.png"), media_type="image/png")
