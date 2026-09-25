from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from schemas.user import UserCreate, UserLogin
from security import (
    hash_password,
    verify_password,
    create_access_token
)
from dependencies import get_current_user


router = APIRouter()


@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        return {
            "message": "Email already registered"
        }

    hashed_password = hash_password(
        user.password
    )

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        age=user.age,
        weight=user.weight,
        height=user.height,
        fitness_goal=user.fitness_goal,
        is_admin=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id
    }


@router.post("/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if not existing_user:
        return {
            "message": "Invalid email or password"
        }

    password_valid = verify_password(
        user.password,
        existing_user.password
    )

    if not password_valid:
        return {
            "message": "Invalid email or password"
        }

    access_token = create_access_token(
        existing_user.id
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": existing_user.id,
        "name": existing_user.name,
        "is_admin": existing_user.is_admin
    }


@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "age": current_user.age,
        "weight": current_user.weight,
        "height": current_user.height,
        "fitness_goal": current_user.fitness_goal,
        "is_admin": current_user.is_admin
    }