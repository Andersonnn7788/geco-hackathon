from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, model_validator

from app.models.booking import BookingStatus
from app.schemas.space import SpaceResponse
from app.schemas.user import UserResponse


class BookingCreate(BaseModel):
    space_id: int
    start_time: datetime
    end_time: datetime
    notes: Optional[str] = None

    @model_validator(mode="after")
    def validate_times(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class BookingUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[BookingStatus] = None
    notes: Optional[str] = None


class BookingResponse(BaseModel):
    id: int
    user_id: int
    space_id: int
    start_time: datetime
    end_time: datetime
    status: BookingStatus
    total_price: float
    notes: Optional[str]
    created_at: datetime
    space: Optional[SpaceResponse] = None
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True


