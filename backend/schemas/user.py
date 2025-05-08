# backend/schemas/user.py
from pydantic import BaseModel, EmailStr

# Data needed at registration
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

# Data needed at login
class UserLogin(BaseModel):
    username: str
    password: str

# Data returned in auth responses
class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        orm_mode = True
