from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, model_validator


class BlockCreate(BaseModel):
    start_time: datetime
    end_time: datetime
    work_performed: Optional[str] = None

    @model_validator(mode="after")
    def end_after_start(self) -> BlockCreate:
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class BlockUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    work_performed: Optional[str] = None


class BlockResponse(BaseModel):
    id: int
    start_time: datetime
    end_time: Optional[datetime]
    duration: Optional[float]
    work_performed: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
