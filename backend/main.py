from fastapi import FastAPI
from database.db import Base, engine
from api.routes.auth import router as auth_router


# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FastAPI Authentication")

# Include auth routes
app.include_router(auth_router, prefix="/auth", tags=["auth"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI Authentication API!"}