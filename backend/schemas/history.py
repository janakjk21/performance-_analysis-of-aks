from pydantic import BaseModel

class HistoryBase(BaseModel):
    text: str

class HistoryCreate(HistoryBase):
    pass

class HistoryUpdate(HistoryBase):
    pass

class HistoryResponse(HistoryBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True