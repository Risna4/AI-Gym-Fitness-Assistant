from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from datetime import datetime
from database.connection import Base

class WorkoutStreak(Base):
    __tablename__ = "workout_streaks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(DateTime, default=datetime.utcnow)
    completed = Column(Boolean, default=True)