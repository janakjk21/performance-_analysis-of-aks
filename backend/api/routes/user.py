from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from schemas.user import UserOut
from utils.tokens import get_current_user
from database.db import get_db  # or however you get a session
from models.user import User as UserModel  # your ORM model

router = APIRouter()

@router.get("/me", response_model=UserOut)
def read_my_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # current_user might be a dict {"username": "..."}
    user = db.query(UserModel).filter_by(username=current_user["username"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
