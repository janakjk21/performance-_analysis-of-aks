# schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    disabled: bool
    
    class Config:
        from_attributes = True

class MediaItem(BaseModel):
    id: str
    title: str
    creator: str
    license: str
    url: Optional[str]
    thumbnail: Optional[str]
    created_date: Optional[datetime]

class MediaSearchResult(BaseModel):
    count: int
    next_page: Optional[str]
    previous_page: Optional[str]
    results: List[MediaItem]

class SavedSearchBase(BaseModel):
    query: str
    filters: dict

class SavedSearchCreate(SavedSearchBase):
    pass

class SavedSearch(SavedSearchBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True