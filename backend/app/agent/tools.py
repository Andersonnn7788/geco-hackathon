"""
Agent tools for the room booking assistant.
These tools allow the AI to interact with the booking system.
"""
from datetime import datetime, date
from typing import Optional, List
from langchain_core.tools import tool
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.space import Space
from app.models.booking import Booking, BookingStatus
from app.models.user import User


def get_agent_tools(db: AsyncSession, user: Optional[User] = None):
    """Create tools with database session and user context injected."""

    @tool
    async def search_spaces(
        space_type: Optional[str] = None,
        location: Optional[str] = None,
        min_capacity: Optional[int] = None,
        max_price_per_hour: Optional[float] = None,
    ) -> str:
        """
        Search for available coworking spaces.
        
        Args:
            space_type: Type of space - 'hot_desk', 'private_office', 'meeting_room', 'event_space', or 'phone_booth'
            location: Location filter - 'KL Eco City' or 'Bangsar South'
            min_capacity: Minimum number of people the space should accommodate
            max_price_per_hour: Maximum price per hour in RM
            
        Returns:
            List of matching spaces with their details
        """
        query = select(Space).where(Space.is_active == True)

        if space_type:
            query = query.where(Space.type == space_type)
        if location:
            query = query.where(Space.location.ilike(f"%{location}%"))
        if min_capacity:
            query = query.where(Space.capacity >= min_capacity)
        if max_price_per_hour:
            query = query.where(Space.price_per_hour <= max_price_per_hour)

        result = await db.execute(query.order_by(Space.price_per_hour))
        spaces = result.scalars().all()

        if not spaces:
            return "No spaces found matching your criteria. Try adjusting your filters."

        response = f"Found {len(spaces)} space(s):\n\n"
        for space in spaces:
            response += f"- **{space.name}** (ID: {space.id})\n"
            response += f"  Type: {space.type.replace('_', ' ').title()}\n"
            response += f"  Location: {space.location}"
            if space.floor:
                response += f", {space.floor}"
            response += f"\n  Capacity: {space.capacity} {'person' if space.capacity == 1 else 'people'}\n"
            response += f"  Price: RM{space.price_per_hour}/hour"
            if space.price_per_day:
                response += f", RM{space.price_per_day}/day"
            response += "\n\n"

        return response

    @tool
    async def check_availability(
        space_id: int,
        check_date: str,
    ) -> str:
        """
        Check availability of a specific space on a given date.
        
        Args:
            space_id: The ID of the space to check
            check_date: Date to check in YYYY-MM-DD format
            
        Returns:
            Available time slots for the space on that date
        """
        # Validate space exists
        result = await db.execute(select(Space).where(Space.id == space_id))
        space = result.scalar_one_or_none()

        if not space:
            return f"Space with ID {space_id} not found."

        try:
            target_date = datetime.strptime(check_date, "%Y-%m-%d").date()
        except ValueError:
            return "Invalid date format. Please use YYYY-MM-DD format."

        if target_date < date.today():
            return "Cannot check availability for past dates."

        # Get existing bookings for this space on the date
        start_of_day = datetime.combine(target_date, datetime.min.time())
        end_of_day = datetime.combine(target_date, datetime.max.time())

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

        # Generate available slots (9 AM to 9 PM)
        available_slots = []
        booked_slots = []

        for hour in range(9, 21):
            slot_start = datetime.combine(target_date, datetime.min.time().replace(hour=hour))
            slot_end = datetime.combine(target_date, datetime.min.time().replace(hour=hour + 1))

            is_booked = False
            for booking in bookings:
                book_start = booking.start_time.replace(tzinfo=None)
                book_end = booking.end_time.replace(tzinfo=None)
                if not (slot_end <= book_start or slot_start >= book_end):
                    is_booked = True
                    break

            slot_str = f"{hour:02d}:00 - {hour + 1:02d}:00"
            if is_booked:
                booked_slots.append(slot_str)
            else:
                available_slots.append(slot_str)

        response = f"Availability for **{space.name}** on {check_date}:\n\n"
        
        if available_slots:
            response += "Available slots:\n"
            for slot in available_slots:
                response += f"  - {slot}\n"
        else:
            response += "No available slots on this date.\n"

        if booked_slots:
            response += f"\nBooked slots: {', '.join(booked_slots)}"

        response += f"\n\nPrice: RM{space.price_per_hour}/hour"

        return response

    @tool
    async def create_booking(
        space_id: int,
        booking_date: str,
        start_hour: int,
        end_hour: int,
        notes: Optional[str] = None,
    ) -> str:
        """
        Create a booking for a space.
        
        Args:
            space_id: The ID of the space to book
            booking_date: Date of booking in YYYY-MM-DD format
            start_hour: Start hour (24-hour format, e.g., 9 for 9 AM, 14 for 2 PM)
            end_hour: End hour (24-hour format, must be after start_hour)
            notes: Optional notes for the booking
            
        Returns:
            Confirmation of the booking or error message
        """
        if not user:
            return "You need to be logged in to create a booking. Please sign in first."

        # Validate space
        result = await db.execute(select(Space).where(Space.id == space_id))
        space = result.scalar_one_or_none()

        if not space:
            return f"Space with ID {space_id} not found."

        if not space.is_active:
            return "This space is currently not available for booking."

        # Validate date and time
        try:
            target_date = datetime.strptime(booking_date, "%Y-%m-%d").date()
        except ValueError:
            return "Invalid date format. Please use YYYY-MM-DD format."

        if target_date < date.today():
            return "Cannot book for past dates."

        if start_hour < 9 or end_hour > 21 or start_hour >= end_hour:
            return "Invalid time range. Hours must be between 9 (9 AM) and 21 (9 PM), and start must be before end."

        start_time = datetime.combine(target_date, datetime.min.time().replace(hour=start_hour))
        end_time = datetime.combine(target_date, datetime.min.time().replace(hour=end_hour))

        # Check for conflicts
        result = await db.execute(
            select(Booking).where(
                and_(
                    Booking.space_id == space_id,
                    Booking.status.in_([BookingStatus.confirmed, BookingStatus.pending]),
                    Booking.start_time < end_time,
                    Booking.end_time > start_time,
                )
            )
        )
        conflict = result.scalar_one_or_none()

        if conflict:
            return f"Sorry, this time slot is already booked. Please check availability and choose a different time."

        # Calculate price
        duration_hours = end_hour - start_hour
        total_price = float(space.price_per_hour) * duration_hours

        # Create booking
        booking = Booking(
            user_id=user.id,
            space_id=space_id,
            start_time=start_time,
            end_time=end_time,
            total_price=total_price,
            notes=notes,
            status=BookingStatus.confirmed,
        )

        db.add(booking)
        await db.commit()
        await db.refresh(booking)

        return (
            f"Booking confirmed!\n\n"
            f"**Booking Details:**\n"
            f"- Booking ID: #{booking.id}\n"
            f"- Space: {space.name}\n"
            f"- Location: {space.location}\n"
            f"- Date: {booking_date}\n"
            f"- Time: {start_hour:02d}:00 - {end_hour:02d}:00 ({duration_hours} hour{'s' if duration_hours > 1 else ''})\n"
            f"- Total: RM{total_price:.2f}\n\n"
            f"You can view this booking in your 'My Bookings' page."
        )

    @tool
    async def get_user_bookings(
        upcoming_only: bool = True,
    ) -> str:
        """
        Get the current user's bookings.
        
        Args:
            upcoming_only: If True, only show future bookings. If False, show all bookings.
            
        Returns:
            List of user's bookings
        """
        if not user:
            return "You need to be logged in to view your bookings. Please sign in first."

        query = select(Booking).where(Booking.user_id == user.id)

        if upcoming_only:
            query = query.where(Booking.start_time >= datetime.utcnow())

        result = await db.execute(query.order_by(Booking.start_time))
        bookings = result.scalars().all()

        if not bookings:
            if upcoming_only:
                return "You don't have any upcoming bookings."
            return "You don't have any bookings yet."

        # Get space details
        space_ids = [b.space_id for b in bookings]
        result = await db.execute(select(Space).where(Space.id.in_(space_ids)))
        spaces = {s.id: s for s in result.scalars().all()}

        response = f"Your {'upcoming ' if upcoming_only else ''}bookings:\n\n"
        for booking in bookings:
            space = spaces.get(booking.space_id)
            space_name = space.name if space else f"Space #{booking.space_id}"
            
            start = booking.start_time
            end = booking.end_time
            
            response += f"- **Booking #{booking.id}** - {booking.status.value.title()}\n"
            response += f"  Space: {space_name}\n"
            response += f"  Date: {start.strftime('%Y-%m-%d')}\n"
            response += f"  Time: {start.strftime('%H:%M')} - {end.strftime('%H:%M')}\n"
            response += f"  Total: RM{booking.total_price:.2f}\n\n"

        return response

    @tool
    async def cancel_booking(
        booking_id: int,
    ) -> str:
        """
        Cancel an existing booking.
        
        Args:
            booking_id: The ID of the booking to cancel
            
        Returns:
            Confirmation of cancellation or error message
        """
        if not user:
            return "You need to be logged in to cancel a booking. Please sign in first."

        result = await db.execute(
            select(Booking).where(Booking.id == booking_id)
        )
        booking = result.scalar_one_or_none()

        if not booking:
            return f"Booking #{booking_id} not found."

        if booking.user_id != user.id:
            return "You can only cancel your own bookings."

        if booking.status == BookingStatus.cancelled:
            return f"Booking #{booking_id} is already cancelled."

        if booking.start_time < datetime.utcnow():
            return "Cannot cancel a booking that has already started or passed."

        booking.status = BookingStatus.cancelled
        await db.commit()

        return f"Booking #{booking_id} has been cancelled successfully."

    return [search_spaces, check_availability, create_booking, get_user_bookings, cancel_booking]

