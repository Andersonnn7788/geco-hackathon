from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class SpaceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    type: str = Field(min_length=1, max_length=100)  # hot_desk, private_office, meeting_room
    description: Optional[str] = None
    capacity: int = Field(gt=0)
    price_per_hour: float = Field(gt=0)
    price_per_day: Optional[float] = None
    price_per_month: Optional[float] = None
    location: str = Field(min_length=1, max_length=255)
    floor: Optional[str] = None
    amenities: List[str] = []
    image_url: Optional[str] = None


class SpaceUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    type: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = None
    capacity: Optional[int] = Field(default=None, gt=0)
    price_per_hour: Optional[float] = Field(default=None, gt=0)
    price_per_day: Optional[float] = None
    price_per_month: Optional[float] = None
    location: Optional[str] = Field(default=None, min_length=1, max_length=255)
    floor: Optional[str] = None
    amenities: Optional[List[str]] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class SpaceResponse(BaseModel):
    id: int
    name: str
    type: str
    description: Optional[str]
    capacity: int
    price_per_hour: float
    price_per_day: Optional[float]
    price_per_month: Optional[float]
    location: str
    floor: Optional[str]
    amenities: List[str]
    image_url: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SpaceAvailability(BaseModel):
    space_id: int
    date: str
    available_slots: List[dict]  # [{"start": "09:00", "end": "10:00", "available": True}]

