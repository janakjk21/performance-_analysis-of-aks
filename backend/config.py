from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Openverse Media Search API"
    PROJECT_DESCRIPTION: str = "API for searching open-license media with user account management"
    PROJECT_VERSION: str = "1.0.0"
    
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    OPENVERSE_API_URL: str = "https://api.openverse.org/v1/"
    
    ALLOWED_ORIGINS: list = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    
    class Config:
        env_file = ".env"

settings = Settings()