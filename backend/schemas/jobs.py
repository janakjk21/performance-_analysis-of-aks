# backend/schemas/jobs.py

from pydantic import BaseModel

class JobCreate(BaseModel):
    # make sure this class is really here
    title: str
    description: str

class JobStatusResponse(BaseModel):
    # and this one too
    job_id: str
    status: str
