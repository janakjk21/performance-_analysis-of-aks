from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database.db import Base  # Import Base from your database module

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    history = relationship("History", back_populates="user")