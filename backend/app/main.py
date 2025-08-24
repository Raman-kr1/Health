from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from contextlib import asynccontextmanager

from .database import engine, Base
from .routers import auth, health, chat, appointments

# Create tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Intelligent Health Monitoring System",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["appointments"])

@app.get("/")
async def root():
    return {"message": "Health Monitoring System API", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}