from pydantic import BaseModel


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    age: int | None = None
    weight: float | None = None
    height: float | None = None
    fitness_goal: str | None = None


class UserLogin(BaseModel):
    email: str
    password: str