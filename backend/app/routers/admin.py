from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_admin_user
from app.models.space import Space
from app.models.booking import Booking, BookingStatus
from app.models.user import User, UserRole
from app.schemas.booking import BookingResponse, BookingUpdate
from app.schemas.user import UserResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    today = date.today()
    start_of_today = datetime.combine(today, datetime.min.time())
    end_of_today = datetime.combine(today, datetime.max.time())
    start_of_month = datetime(today.year, today.month, 1)

    # Total spaces
    total_spaces = await db.execute(select(func.count(Space.id)).where(Space.is_active == True))
    total_spaces = total_spaces.scalar()

    # Total users
    total_users = await db.execute(select(func.count(User.id)).where(User.role == UserRole.user))
    total_users = total_users.scalar()

    # Bookings today
    bookings_today = await db.execute(
        select(func.count(Booking.id)).where(
            and_(
                Booking.start_time >= start_of_today,
                Booking.start_time <= end_of_today,
                Booking.status == BookingStatus.confirmed
            )
        )
    )
    bookings_today = bookings_today.scalar()

    # Revenue this month
    revenue_month = await db.execute(
        select(func.sum(Booking.total_price)).where(
            and_(
                Booking.created_at >= start_of_month,
                Booking.status.in_([BookingStatus.confirmed, BookingStatus.completed])
            )
        )
    )
    revenue_month = revenue_month.scalar() or 0

    # Recent bookings count
    recent_bookings = await db.execute(
        select(func.count(Booking.id)).where(
            Booking.created_at >= datetime.utcnow() - timedelta(days=7)
        )
    )
    recent_bookings = recent_bookings.scalar()

    return {
        "total_spaces": total_spaces,
        "total_users": total_users,
        "bookings_today": bookings_today,
        "revenue_this_month": float(revenue_month),
        "bookings_last_7_days": recent_bookings,
    }


@router.get("/bookings", response_model=List[BookingResponse])
async def get_all_bookings(
    status: Optional[BookingStatus] = Query(None),
    space_id: Optional[int] = Query(None),
    user_id: Optional[int] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    query = select(Booking).options(
        selectinload(Booking.space),
        selectinload(Booking.user)
    )

    if status:
        query = query.where(Booking.status == status)
    if space_id:
        query = query.where(Booking.space_id == space_id)
    if user_id:
        query = query.where(Booking.user_id == user_id)
    if date_from:
        query = query.where(Booking.start_time >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        query = query.where(Booking.start_time <= datetime.combine(date_to, datetime.max.time()))

    result = await db.execute(
        query.order_by(Booking.start_time.desc()).limit(limit).offset(offset)
    )
    bookings = result.scalars().all()
    return bookings


@router.put("/bookings/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: int,
    booking_data: BookingUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    result = await db.execute(
        select(Booking).options(selectinload(Booking.space)).where(Booking.id == booking_id)
    )
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    update_data = booking_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(booking, field, value)

    await db.commit()
    await db.refresh(booking)
    return booking


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    role: Optional[UserRole] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    query = select(User)

    if role:
        query = query.where(User.role == role)

    result = await db.execute(
        query.order_by(User.created_at.desc()).limit(limit).offset(offset)
    )
    users = result.scalars().all()
    return users


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role: UserRole,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.role = role
    await db.commit()
    await db.refresh(user)

    return {"message": f"User role updated to {role.value}"}

