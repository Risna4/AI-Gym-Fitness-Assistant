from datetime import date
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database.connection import get_db
from models.workout import Workout
from models.user import User
from dependencies import get_current_user

router = APIRouter()

class WorkoutCreateSchema(BaseModel):
    exercise_name: str
    sets: Optional[int] = 1
    reps: Optional[int] = 0
    duration: Optional[float] = 0.0
    calories_burned: Optional[float] = 0.0
    workout_date: Optional[date] = None

# Add a new workout
@router.post("/")
def add_workout(
    payload: Optional[WorkoutCreateSchema] = Body(None),
    exercise_name: Optional[str] = Query(None),
    sets: Optional[int] = Query(1),
    reps: Optional[int] = Query(None),
    duration: Optional[float] = Query(None),
    calories_burned: Optional[float] = Query(None),
    workout_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    name = (payload.exercise_name if payload else exercise_name) or "Workout"
    final_sets = (payload.sets if payload and payload.sets is not None else sets) or 1
    final_reps = (payload.reps if payload and payload.reps is not None else reps) or 0
    final_duration = (payload.duration if payload and payload.duration is not None else duration) or 0.0
    final_calories = (payload.calories_burned if payload and payload.calories_burned is not None else calories_burned) or 0.0
    final_date = (payload.workout_date if payload and payload.workout_date else workout_date) or date.today()

    new_workout = Workout(
        user_id=current_user.id,
        exercise_name=name,
        sets=final_sets,
        reps=final_reps,
        duration=final_duration,
        calories_burned=final_calories,
        workout_date=final_date
    )

    db.add(new_workout)
    db.commit()
    db.refresh(new_workout)

    return {
        "message": "Workout added successfully",
        "workout_id": new_workout.id
    }

# Get current user's workouts
@router.get("/")
def get_workouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Workout)
        .filter(Workout.user_id == current_user.id)
        .order_by(Workout.workout_date.desc(), Workout.id.desc())
        .all()
    )

# Clear workout history for the logged-in user
@router.delete("/clear-history")
def clear_workout_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Workout).filter(Workout.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Workout history cleared successfully"}