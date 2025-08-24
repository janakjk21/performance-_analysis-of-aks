import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from api.routes.auth import router as auth_router
from api.routes.history import router as history_router
from api.routes.jobs import router as jobs_router
from api.routes.user import router as user_router
from database.db import Base, engine

# Leave ROOT_PATH empty unless you intentionally mount the app under /api.
# If you later set ROOT_PATH="/api" in k8s, remember to also update probes/ServiceMonitor paths.
ROOT_PATH = os.getenv("ROOT_PATH", "")
app = FastAPI(root_path=ROOT_PATH)

# Expose Prometheus metrics at /metrics (or /api/metrics if ROOT_PATH="/api")
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# CORS (usually not needed in prod if Ingress serves FE+BE on same host)
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(history_router, prefix="/history", tags=["history"])
app.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
app.include_router(user_router, prefix="/user", tags=["user"])

@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI app!"}

@app.on_event("startup")
def on_startup():
    # If you’re not using Alembic yet, create tables automatically
    Base.metadata.create_all(bind=engine)
