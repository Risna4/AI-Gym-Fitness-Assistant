from fastapi import APIRouter, Depends

from models.user import User
from dependencies import get_current_user


router = APIRouter()


@router.get("/")
def get_trainer_info(
    current_user: User = Depends(get_current_user)
):
    return {
        "message": "AI Trainer is ready.",
        "user": current_user.name,
        "fitness_goal": (
            current_user.fitness_goal
            or "general fitness"
        ),
        "supported_exercises": [
            "Squats",
            "Bicep Curls",
            "Jumping Jacks"
        ]
    }


@router.post("/analyze")
def analyze_exercise(
    exercise: str,
    reps: int,
    form_score: float,
    current_user: User = Depends(get_current_user)
):
    exercise_name = exercise.strip()

    if not exercise_name:
        exercise_name = "Exercise"

    form_score = max(
        0,
        min(100, form_score)
    )

    if form_score >= 85:
        feedback = "Good form. Keep your movement controlled."
    elif form_score >= 70:
        feedback = "Form is acceptable. Focus on controlled movement."
    else:
        feedback = "Focus on maintaining proper posture and controlled movement."

    return {
        "user": current_user.name,
        "exercise": exercise_name,
        "reps": max(0, reps),
        "form_score": form_score,
        "performance_score": form_score,
        "feedback": feedback
    }