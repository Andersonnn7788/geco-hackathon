from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin_user
from app.models.space import Space
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.schemas.space import SpaceCreate, SpaceUpdate, SpaceResponse, SpaceAvailability

router = APIRouter(prefix="/spaces", tags=["Spaces"])


@router.get("", response_model=List[SpaceResponse])
async def list_spaces(
    type: Optional[str] = Query(None, description="Filter by space type"),
    location: Optional[str] = Query(None, description="Filter by location"),
    min_capacity: Optional[int] = Query(None, description="Minimum capacity"),
    max_price: Optional[float] = Query(None, description="Maximum price per hour"),
    db: AsyncSession = Depends(get_db)
):
    query = select(Space).where(Space.is_active == True)

    if type:
        query = query.where(Space.type == type)
    if location:
        query = query.where(Space.location.ilike(f"%{location}%"))
    if min_capacity:
        query = query.where(Space.capacity >= min_capacity)
    if max_price:
        query = query.where(Space.price_per_hour <= max_price)

    result = await db.execute(query.order_by(Space.name))
    spaces = result.scalars().all()
    return spaces


@router.get("/{space_id}", response_model=SpaceResponse)
async def get_space(space_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Space).where(Space.id == space_id))
    space = result.scalar_one_or_none()

    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found"
        )

    return space


@router.get("/{space_id}/availability", response_model=SpaceAvailability)
async def get_space_availability(
    space_id: int,
    date: date = Query(..., description="Date to check availability (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_db)
):
    # Check if space exists
    result = await db.execute(select(Space).where(Space.id == space_id))
    space = result.scalar_one_or_none()

    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found"
        )

    # Get all bookings for this space on the given date
    start_of_day = datetime.combine(date, datetime.min.time())
    end_of_day = datetime.combine(date, datetime.max.time())

    result = await db.execute(
        select(Booking).where(
            and_(
                Booking.space_id == space_id,
                Booking.start_time >= start_of_day,
                Booking.end_time <= end_of_day,
                Booking.status.in_([BookingStatus.confirmed, BookingStatus.pending])
            )
        ).order_by(Booking.start_time)
    )
    bookings = result.scalars().all()

    # Generate time slots (9 AM to 9 PM, hourly)
    slots = []
    for hour in range(9, 21):  # 9 AM to 9 PM
        slot_start = f"{hour:02d}:00"
        slot_end = f"{hour + 1:02d}:00"

        # Check if this slot overlaps with any booking
        slot_start_dt = datetime.combine(date, datetime.strptime(slot_start, "%H:%M").time())
        slot_end_dt = datetime.combine(date, datetime.strptime(slot_end, "%H:%M").time())

        is_available = True
        for booking in bookings:
            # Check for overlap
            if not (slot_end_dt <= booking.start_time.replace(tzinfo=None) or 
                    slot_start_dt >= booking.end_time.replace(tzinfo=None)):
                is_available = False
                break

        slots.append({
            "start": slot_start,
            "end": slot_end,
            "available": is_available
        })

    return SpaceAvailability(
        space_id=space_id,
        date=str(date),
        available_slots=slots
    )


# Admin endpoints
@router.post("", response_model=SpaceResponse, status_code=status.HTTP_201_CREATED)
async def create_space(
    space_data: SpaceCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    space = Space(**space_data.model_dump())
    db.add(space)
    await db.commit()
    await db.refresh(space)
    return space


@router.put("/{space_id}", response_model=SpaceResponse)
async def update_space(
    space_id: int,
    space_data: SpaceUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    result = await db.execute(select(Space).where(Space.id == space_id))
    space = result.scalar_one_or_none()

    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found"
        )

    update_data = space_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(space, field, value)

    await db.commit()
    await db.refresh(space)
    return space


@router.delete("/{space_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_space(
    space_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    result = await db.execute(select(Space).where(Space.id == space_id))
    space = result.scalar_one_or_none()

    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found"
        )

    # Soft delete - just deactivate
    space.is_active = False
    await db.commit()

