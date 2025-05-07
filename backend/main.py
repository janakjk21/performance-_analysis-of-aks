from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes.auth import router as auth_router
from api.routes.history import router as history_router

app = FastAPI()

# ✅ CORS setup – Add both local and production frontend origins
origins = [
    "http://localhost:5173",  # local dev
    "https://my-fastapi-app-3389.azurewebsites.net",  # production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Register routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(history_router, prefix="/history", tags=["history"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI app!"}
