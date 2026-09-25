from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from datetime import datetime
from database.connection import Base

class PerformanceScore(Base):
    __tablename__ = "performance_scores"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    week_start = Column(DateTime)
    score = Column(Float)      # 0-100 composite score
    created_at = Column(DateTime, default=datetime.utcnow)