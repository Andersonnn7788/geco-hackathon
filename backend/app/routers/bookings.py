from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.space import Space
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingUpdate, BookingResponse

router = APIRouter(prefix="/bookings", tags=["Bookings"])


async def check_availability(
    db: AsyncSession,
    space_id: int,
    start_time: datetime,
    end_time: datetime,
    exclude_booking_id: Optional[int] = None
) -> bool:
    """Check if a space is available for the given time range"""
    query = select(Booking).where(
        and_(
            Booking.space_id == space_id,
            Booking.status.in_([BookingStatus.confirmed, BookingStatus.pending]),
            # Check for overlap: NOT (new_end <= existing_start OR new_start >= existing_end)
            Booking.start_time < end_time,
            Booking.end_time > start_time,
        )
    )

    if exclude_booking_id:
        query = query.where(Booking.id != exclude_booking_id)

    result = await db.execute(query)
    conflicting_booking = result.scalar_one_or_none()
    return conflicting_booking is None


def calculate_price(space: Space, start_time: datetime, end_time: datetime) -> float:
    """Calculate total price based on duration"""
    duration_hours = (end_time - start_time).total_seconds() / 3600
    return round(float(space.price_per_hour) * duration_hours, 2)


@router.get("/me", response_model=List[BookingResponse])
async def get_my_bookings(
    status: Optional[BookingStatus] = Query(None),
    upcoming_only: bool = Query(False, description="Only show future bookings"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Booking).options(
        selectinload(Booking.space)
    ).where(Booking.user_id == current_user.id)

    if status:
        query = query.where(Booking.status == status)

    if upcoming_only:
        query = query.where(Booking.start_time >= datetime.utcnow())

    result = await db.execute(query.order_by(Booking.start_time.desc()))
    bookings = result.scalars().all()
    return bookings


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if space exists
    result = await db.execute(select(Space).where(Space.id == booking_data.space_id))
    space = result.scalar_one_or_none()

    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found"
        )

    if not space.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Space is not available"
        )

    # Check availability
    is_available = await check_availability(
        db, booking_data.space_id, booking_data.start_time, booking_data.end_time
    )

    if not is_available:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Space is not available for the selected time slot"
        )

    # Calculate price
    total_price = calculate_price(space, booking_data.start_time, booking_data.end_time)

    # Create booking
    booking = Booking(
        user_id=current_user.id,
        space_id=booking_data.space_id,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        total_price=total_price,
        notes=booking_data.notes,
        status=BookingStatus.confirmed,
    )

    db.add(booking)
    await db.commit()
    await db.refresh(booking)

    # Load space relationship
    result = await db.execute(
        select(Booking).options(selectinload(Booking.space)).where(Booking.id == booking.id)
    )
    booking = result.scalar_one()

    return booking


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Booking).options(
            selectinload(Booking.space)
        ).where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Check if user owns this booking or is admin
    if booking.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this booking"
        )

    return booking


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # Check if user owns this booking
    if booking.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this booking"
        )

    if booking.status == BookingStatus.cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is already cancelled"
        )

    booking.status = BookingStatus.cancelled
    await db.commit()

