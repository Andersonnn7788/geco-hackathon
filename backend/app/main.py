from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import create_tables
from app.routers import auth_router, spaces_router, bookings_router, admin_router, chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    await create_tables()
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title="Infinity8 API",
    description="Coworking Space Booking Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://frontend:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(spaces_router)
app.include_router(bookings_router)
app.include_router(admin_router)
app.include_router(chat_router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {
        "message": "Welcome to Infinity8 Coworking Space API",
        "docs": "/docs",
        "health": "/health"
    }
