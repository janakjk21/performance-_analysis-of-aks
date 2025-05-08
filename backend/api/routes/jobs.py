import os
import asyncio
import requests
from uuid import uuid4
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from schemas.jobs import JobCreate, JobStatusResponse
from database.db import get_db
from models.user import User
from utils.tokens import get_current_user
from config import settings

DEEPSEEK_API_KEY = settings.deepseek_api_key
DEEPSEEK_API_URL = settings.deepseek_api_url


router = APIRouter(tags=["Jobs"])

# In-memory job store
jobs_store = {}

@router.post("/submit")
async def submit_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.credits <= 0:
        raise HTTPException(status_code=403, detail="Insufficient credits.")

    # Create job record
    job_id = str(uuid4())
    jobs_store[job_id] = {
        "task_type": job.task_type,
        "input_data": job.input_data,
        "status": "queued",
        "output": None,
        "user_id": current_user.id,
    }

    # Trigger background job
    asyncio.create_task(call_deepseek_api(job_id, job.input_data, db))

    return {"job_id": job_id}


async def call_deepseek_api(job_id: str, user_input: str, db: Session):
    try:
        jobs_store[job_id]["status"] = "in_progress"

        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": user_input}],
            "temperature": 0.7,
            "max_tokens": 1024
        }

        response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload)

        if response.status_code == 200:
            result = response.json()["choices"][0]["message"]["content"]
            jobs_store[job_id]["output"] = result
            jobs_store[job_id]["status"] = "completed"

            # Deduct credit from user in DB
            user_id = jobs_store[job_id]["user_id"]
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.credits = max(0, user.credits - 1)
                db.commit()

        else:
            jobs_store[job_id]["output"] = f"Error: {response.text}"
            jobs_store[job_id]["status"] = "failed"

    except Exception as e:
        jobs_store[job_id]["output"] = str(e)
        jobs_store[job_id]["status"] = "failed"


@router.get("/{job_id}/status", response_model=JobStatusResponse)
async def check_job_status(job_id: str):
    job = jobs_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return JobStatusResponse(status=job["status"], output=job["output"])


@router.get("/credits")
async def get_user_credits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {"credits": current_user.credits}
