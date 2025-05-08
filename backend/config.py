# backend/config.py
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env into os.environ
load_dotenv()

class Settings(BaseSettings):
    # these names are snake_case, Pydantic will pull from UPPER_CASE env vars
    secret_key: str                  # ← SECRET_KEY
    algorithm: str                   # ← ALGORITHM
    access_token_expire_minutes: int # ← ACCESS_TOKEN_EXPIRE_MINUTES
    database_url: str                # ← DATABASE_URL
    deepseek_api_key: str            # ← DEEPSEEK_API_KEY
    deepseek_api_url: str            # ← DEEPSEEK_API_URL
    github_token: str                # ← GITHUB_TOKEN

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"            # ignore any other vars you don’t declare

# This is the singleton you import everywhere
settings = Settings()
