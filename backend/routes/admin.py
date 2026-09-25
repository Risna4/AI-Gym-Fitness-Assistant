from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from models.workout import Workout
from dependencies import get_current_user


router = APIRouter()


def check_admin(current_user: User):
    if current_user.is_admin is not True:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )


@router.get("/")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_admin(current_user)

    total_users = db.query(User).count()

    total_workouts = db.query(Workout).count()

    users = (
        db.query(User)
        .order_by(User.id)
        .all()
    )

    user_list = []

    for user in users:
        workout_count = (
            db.query(Workout)
            .filter(
                Workout.user_id == user.id
            )
            .count()
        )

        user_list.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "age": user.age,
            "fitness_goal": (
                user.fitness_goal
                or "Not provided"
            ),
            "workout_count": workout_count
        })

    return {
        "total_users": total_users,
        "total_workouts": total_workouts,
        "users": user_list
    }