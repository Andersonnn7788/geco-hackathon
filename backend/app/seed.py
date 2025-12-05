"""
Seed script to populate initial data for development/demo purposes.
Run with: python -m app.seed
"""
import asyncio
from sqlalchemy import select

from app.core.database import async_session_maker, create_tables
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.space import Space


async def seed_data():
    await create_tables()

    async with async_session_maker() as db:
        # Check if data already exists
        result = await db.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            print("Database already seeded. Skipping...")
            return

        print("Seeding database...")

        # Create admin user
        admin = User(
            email="admin@infinity8.my",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            role=UserRole.admin,
        )
        db.add(admin)

        # Create demo user
        demo_user = User(
            email="user@demo.com",
            hashed_password=get_password_hash("user123"),
            full_name="Demo User",
            role=UserRole.user,
        )
        db.add(demo_user)

        # Create spaces
        spaces = [
            Space(
                name="Private Office A1",
                type="private_office",
                description="Fully furnished private office with natural lighting, perfect for small teams.",
                capacity=4,
                price_per_hour=50.00,
                price_per_day=350.00,
                price_per_month=4500.00,
                location="KL Eco City",
                floor="Level 15",
                amenities=["wifi", "air_conditioning", "whiteboard", "tv_screen", "phone_booth"],
                image_url="/images/private-office-1.jpg",
            ),
            Space(
                name="Private Office B2",
                type="private_office",
                description="Spacious corner office with panoramic city views, ideal for growing teams.",
                capacity=8,
                price_per_hour=80.00,
                price_per_day=550.00,
                price_per_month=7500.00,
                location="KL Eco City",
                floor="Level 18",
                amenities=["wifi", "air_conditioning", "whiteboard", "tv_screen", "phone_booth", "standing_desk"],
                image_url="/images/private-office-2.jpg",
            ),
            Space(
                name="Hot Desk Zone A",
                type="hot_desk",
                description="Flexible hot desk in our vibrant open workspace area.",
                capacity=1,
                price_per_hour=15.00,
                price_per_day=80.00,
                price_per_month=800.00,
                location="Bangsar South",
                floor="Level 8",
                amenities=["wifi", "air_conditioning", "locker", "printing"],
                image_url="/images/hot-desk-1.jpg",
            ),
            Space(
                name="Hot Desk Zone B",
                type="hot_desk",
                description="Quiet zone hot desk for focused work with ergonomic setup.",
                capacity=1,
                price_per_hour=18.00,
                price_per_day=95.00,
                price_per_month=950.00,
                location="KL Eco City",
                floor="Level 12",
                amenities=["wifi", "air_conditioning", "locker", "printing", "standing_desk"],
                image_url="/images/hot-desk-2.jpg",
            ),
            Space(
                name="Meeting Room - Boardroom",
                type="meeting_room",
                description="Executive boardroom with premium AV equipment for important meetings.",
                capacity=12,
                price_per_hour=120.00,
                price_per_day=800.00,
                price_per_month=None,
                location="KL Eco City",
                floor="Level 20",
                amenities=["wifi", "air_conditioning", "whiteboard", "tv_screen", "video_conferencing", "catering"],
                image_url="/images/boardroom.jpg",
            ),
            Space(
                name="Meeting Room - Brainstorm",
                type="meeting_room",
                description="Creative meeting space with writable walls and flexible furniture.",
                capacity=6,
                price_per_hour=60.00,
                price_per_day=400.00,
                price_per_month=None,
                location="Bangsar South",
                floor="Level 5",
                amenities=["wifi", "air_conditioning", "whiteboard", "tv_screen", "writable_walls"],
                image_url="/images/brainstorm-room.jpg",
            ),
            Space(
                name="Event Space",
                type="event_space",
                description="Large event space perfect for workshops, seminars, and networking events.",
                capacity=50,
                price_per_hour=300.00,
                price_per_day=2000.00,
                price_per_month=None,
                location="KL Eco City",
                floor="Level 3",
                amenities=["wifi", "air_conditioning", "projector", "sound_system", "catering", "stage"],
                image_url="/images/event-space.jpg",
            ),
            Space(
                name="Phone Booth 1",
                type="phone_booth",
                description="Soundproof phone booth for private calls and video meetings.",
                capacity=1,
                price_per_hour=20.00,
                price_per_day=None,
                price_per_month=None,
                location="KL Eco City",
                floor="Level 15",
                amenities=["wifi", "air_conditioning", "video_conferencing"],
                image_url="/images/phone-booth.jpg",
            ),
        ]

        for space in spaces:
            db.add(space)

        await db.commit()
        print("Database seeded successfully!")
        print("Admin login: admin@infinity8.my / admin123")
        print("Demo user login: user@demo.com / user123")


if __name__ == "__main__":
    asyncio.run(seed_data())


