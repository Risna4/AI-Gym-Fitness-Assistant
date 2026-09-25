from sqlalchemy import Column, Integer, String, Float, Boolean

from database.connection import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)

    age = Column(Integer, nullable=True)
    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    fitness_goal = Column(String, nullable=True)

    is_admin = Column(
        Boolean,
        default=False,
        nullable=False
    )