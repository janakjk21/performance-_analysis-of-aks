from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database.db import Base  # ✅ THIS FIXES THE ERROR

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    credits = Column(Integer, default=10)

    # Relationship to History
    history = relationship("History", back_populates="user")
    jobs = relationship("Job", back_populates="user")
    # Add any other fields you need for the User model
