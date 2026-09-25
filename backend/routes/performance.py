from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from models.workout import Workout
from models.user import User
from dependencies import get_current_user


router = APIRouter()


@router.get("/")
def get_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    workouts = (
        db.query(Workout)
        .filter(
            Workout.user_id == current_user.id
        )
        .order_by(
            Workout.workout_date.desc()
        )
        .all()
    )

    # No workouts
    if not workouts:
        return {
            "total_workouts": 0,
            "total_reps": 0,
            "total_duration": 0,
            "average_reps": 0,
            "performance_score": 0,
            "recent_workouts": []
        }

    # Total workouts
    total_workouts = len(workouts)

    # Total repetitions
    total_reps = sum(
        workout.reps or 0
        for workout in workouts
    )

    # Total duration
    total_duration = sum(
        workout.duration or 0
        for workout in workouts
    )

    # Average repetitions
    average_reps = (
        total_reps / total_workouts
        if total_workouts > 0
        else 0
    )

    # --------------------------------
    # Basic performance score
    # --------------------------------
    #
    # This is a simple consistency-based
    # score for now. Later we can replace
    # this with the AI form/performance
    # model.
    #
    workout_score = min(
        total_workouts * 10,
        40
    )

    rep_score = min(
        total_reps,
        40
    )

    duration_score = min(
        total_duration,
        20
    )

    performance_score = (
        workout_score
        + rep_score
        + duration_score
    )

    performance_score = min(
        round(performance_score),
        100
    )

    # --------------------------------
    # Recent workouts
    # --------------------------------

    recent_workouts = []

    for workout in workouts[:10]:

        recent_workouts.append({
            "id": workout.id,
            "exercise_name":
                workout.exercise_name,
            "sets": workout.sets,
            "reps": workout.reps,
            "duration": workout.duration,
            "calories_burned":
                workout.calories_burned,
            "workout_date":
                str(workout.workout_date)
        })

    return {
        "total_workouts":
            total_workouts,

        "total_reps":
            total_reps,

        "total_duration":
            round(total_duration, 2),

        "average_reps":
            round(average_reps, 2),

        "performance_score":
            performance_score,

        "recent_workouts":
            recent_workouts
    }