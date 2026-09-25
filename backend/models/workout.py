from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey

from database.connection import Base


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    exercise_name = Column(
        String,
        nullable=False
    )

    sets = Column(
        Integer,
        nullable=True
    )

    reps = Column(
        Integer,
        nullable=True
    )

    duration = Column(
        Float,
        nullable=True
    )

    calories_burned = Column(
        Float,
        nullable=True
    )

    workout_date = Column(
        Date,
        nullable=False
    )