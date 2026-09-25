from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from models.workout import Workout
from models.user import User
from dependencies import get_current_user


router = APIRouter()


@router.get("/")
def get_habit_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()

    # Get all workouts for the logged-in user
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

    # Last 7 days
    week_start = today - timedelta(days=6)

    weekly_workouts = [
        workout
        for workout in workouts
        if workout.workout_date >= week_start
    ]

    weekly_count = len(weekly_workouts)

    # Find unique workout dates
    workout_dates = set(
        workout.workout_date
        for workout in workouts
    )

    # Days active during the last 7 days
    active_days = sum(
        1
        for day in range(7)
        if today - timedelta(days=day)
        in workout_dates
    )

    consistency_percentage = round(
        (active_days / 7) * 100
    )

    # Current streak
    streak = 0
    check_date = today

    while check_date in workout_dates:
        streak += 1
        check_date -= timedelta(days=1)

    # Last workout
    last_workout = None

    if workouts:
        last_workout = {
            "exercise_name":
                workouts[0].exercise_name,
            "date":
                str(workouts[0].workout_date)
        }

    # Basic habit insight
    if weekly_count == 0:
        insight = (
            "No workouts have been recorded "
            "during the last 7 days."
        )

    elif weekly_count < 3:
        insight = (
            "You have recorded a few workouts "
            "this week. Keeping a regular routine "
            "can help build consistency."
        )

    else:
        insight = (
            "You have recorded several workouts "
            "this week. Your activity shows "
            "good consistency."
        )

    return {
        "weekly_workouts": weekly_count,
        "active_days": active_days,
        "consistency_percentage":
            consistency_percentage,
        "current_streak": streak,
        "last_workout": last_workout,
        "insight": insight
    }