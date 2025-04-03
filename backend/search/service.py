import requests
from fastapi import HTTPException, status
from app.config import settings
from app.schemas import MediaSearchResult, MediaItem
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import SavedSearch
from app.schemas import SavedSearchCreate

class OpenverseService:
    BASE_URL = settings.OPENVERSE_API_URL
    
    async def search_media(
        self,
        query: str,
        license_type: Optional[str] = None,
        media_type: Optional[str] = None,
        page: int = 1,
        page_size: int = 10
    ) -> MediaSearchResult:
        params = {
            "q": query,
            "page": page,
            "page_size": page_size,
            "license_type": license_type,
            "license": "cc0,cc-by,cc-by-sa",  # Default to common open licenses
        }
        
        if media_type:
            params["mimetype"] = media_type
        
        try:
            response = requests.get(f"{self.BASE_URL}images/", params=params)
            response.raise_for_status()
            return self._transform_response(response.json())
        except requests.RequestException as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Openverse API is currently unavailable"
            )
    
    def _transform_response(self, response_data: dict) -> MediaSearchResult:
        """Transform Openverse API response to our schema"""
        results = [
            MediaItem(
                id=item["id"],
                title=item.get("title", "Untitled"),
                creator=item.get("creator", "Unknown"),
                license=item.get("license", "Unknown"),
                url=item.get("url"),
                thumbnail=item.get("thumbnail"),
                created_date=datetime.strptime(item["created_on"], "%Y-%m-%dT%H:%M:%S") if item.get("created_on") else None
            )
            for item in response_data.get("results", [])
        ]
        
        return MediaSearchResult(
            count=response_data.get("result_count", 0),
            next_page=response_data.get("next"),
            previous_page=response_data.get("previous"),
            results=results
        )

class SavedSearchService:
    async def save_search(
        self,
        db: Session,
        user_id: int,
        search: SavedSearchCreate
    ) -> SavedSearch:
        db_search = SavedSearch(
            query=search.query,
            filters=search.filters,
            user_id=user_id
        )
        db.add(db_search)
        db.commit()
        db.refresh(db_search)
        return db_search
    
    async def get_user_saved_searches(
        self,
        db: Session,
        user_id: int
    ) -> List[SavedSearch]:
        return db.query(SavedSearch).filter(SavedSearch.user_id == user_id).all()
    
    async def delete_saved_search(
        self,
        db: Session,
        search_id: int,
        user_id: int
    ) -> bool:
        search = db.query(SavedSearch).filter(
            SavedSearch.id == search_id,
            SavedSearch.user_id == user_id
        ).first()
        
        if not search:
            return False
        
        db.delete(search)
        db.commit()
        return True