from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()

# Mock user data
mock_user = {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "credits": 10
}

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_token(token: str = Depends(oauth2_scheme)):
    """
    Mock token verification. Replace with real logic.
    """
    if token != "valid_token":  # Replace with actual token validation
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/me", tags=["user"])
def get_user_profile(token: str = Depends(verify_token)):
    """
    Returns user details and current credit balance.
    """
    return {
        "id": mock_user["id"],
        "name": mock_user["name"],
        "email": mock_user["email"],
        "credits": mock_user["credits"]
    }

@router.get("/me/credits", tags=["user"])
def get_user_credits(token: str = Depends(verify_token)):
    """
    Returns the user's current credit balance.
    """
    return {"credits": mock_user["credits"]}