from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.connection import Base, engine

from models.user import User
from models.workout import Workout

from routes.auth import router as auth_router
from routes.workout import router as workout_router
from routes.performance import router as performance_router
from routes.habit import router as habit_router
from routes.diet import router as diet_router
from routes.buddy import router as buddy_router
from routes.planner import router as planner_router
from routes.admin import router as admin_router
from routes.smart_gym import router as smart_gym_router
from routes import trainer


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Gym & Fitness Assistant",
    version="1.0.0"
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Authentication
app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)


# Workout tracking
app.include_router(
    workout_router,
    prefix="/workouts",
    tags=["Workouts"]
)


# Performance Analyzer
app.include_router(
    performance_router,
    prefix="/performance",
    tags=["Performance"]
)


# Habit Tracker
app.include_router(
    habit_router,
    prefix="/habit",
    tags=["Habit Tracker"]
)


# AI Dietician
app.include_router(
    diet_router,
    prefix="/diet",
    tags=["AI Dietician"]
)


# Virtual Gym Buddy
app.include_router(
    buddy_router,
    prefix="/buddy",
    tags=["Virtual Gym Buddy"]
)


# Gym Planner
app.include_router(
    planner_router,
    prefix="/planner",
    tags=["Gym Planner"]
)
app.include_router(
    smart_gym_router,
    prefix="/smart-gym",
    tags=["Smart Gym"]
)
app.include_router(
    admin_router,
    prefix="/admin",
    tags=["Admin Dashboard"]
)
app.include_router(
    trainer.router,
    prefix="/trainer",
    tags=["AI Trainer"]
)


@app.get("/")
def home():
    return {
        "message": "AI Gym & Fitness Assistant API is running"
    }