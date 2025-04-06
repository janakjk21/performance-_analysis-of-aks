from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.db import get_db
from models.history import History
from schemas.history import HistoryCreate, HistoryUpdate
from utils.tokens import get_current_user
from models.user import User

router = APIRouter()

# Create a new history entry
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_history(
    history: HistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_history = History(user_id=current_user.id, text=history.text)
    db.add(new_history)
    db.commit()
    db.refresh(new_history)
    return {"message": "History created successfully", "history": new_history}

# Get all history entries for the current user
@router.get("/", status_code=status.HTTP_200_OK)
def get_all_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    history_entries = db.query(History).filter(History.user_id == current_user.id).all()
    return {"history": history_entries}

# Update a specific history entry
@router.put("/{history_id}", status_code=status.HTTP_200_OK)
def update_history(
    history_id: int,
    history_update: HistoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    history_entry = db.query(History).filter(
        History.id == history_id, History.user_id == current_user.id
    ).first()
    if not history_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History entry not found"
        )
    history_entry.text = history_update.text
    db.commit()
    db.refresh(history_entry)
    return {"message": "History updated successfully", "history": history_entry}

# Delete a specific history entry
@router.delete("/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    history_entry = db.query(History).filter(
        History.id == history_id, History.user_id == current_user.id
    ).first()
    if not history_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History entry not found"
        )
    db.delete(history_entry)
    db.commit()
    return {"message": "History deleted successfully"}