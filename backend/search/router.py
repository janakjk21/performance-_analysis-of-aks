from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    MediaSearchResult,
    SavedSearchCreate,
    SavedSearch,
    MediaSearchParams
)
from app.auth.service import get_current_active_user
from app.schemas import User
from app.search.service import OpenverseService, SavedSearchService
from app.config import settings

router = APIRouter()
openverse_service = OpenverseService()
saved_search_service = SavedSearchService()

@router.get("/media", response_model=MediaSearchResult)
async def search_media(
    query: str = Query(..., min_length=1),
    license_type: Optional[str] = Query(None),
    media_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user)
):
    """
    Search for open-license media using the Openverse API
    """
    return await openverse_service.search_media(
        query=query,
        license_type=license_type,
        media_type=media_type,
        page=page,
        page_size=page_size
    )

@router.post("/saved", response_model=SavedSearch)
async def save_search(
    search: SavedSearchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Save a search query with filters for the current user
    """
    return await saved_search_service.save_search(
        db=db,
        user_id=current_user.id,
        search=search
    )

@router.get("/saved", response_model=List[SavedSearch])
async def get_saved_searches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all saved searches for the current user
    """
    return await saved_search_service.get_user_saved_searches(
        db=db,
        user_id=current_user.id
    )

@router.delete("/saved/{search_id}")
async def delete_saved_search(
    search_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a saved search for the current user
    """
    success = await saved_search_service.delete_saved_search(
        db=db,
        search_id=search_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Search not found or not owned by user"
        )
    
    return {"message": "Search deleted successfully"}