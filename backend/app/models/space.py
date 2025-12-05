from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, Numeric, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Space(Base):
    __tablename__ = "spaces"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False)  # hot_desk, private_office, meeting_room
    description: Mapped[str] = mapped_column(Text, nullable=True)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    price_per_hour: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    price_per_day: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    price_per_month: Mapped[float] = mapped_column(Numeric(10, 2), nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=False)  # e.g., "KL Eco City", "Bangsar South"
    floor: Mapped[str] = mapped_column(String(50), nullable=True)
    amenities: Mapped[dict] = mapped_column(JSON, default=list, nullable=False)  # ["wifi", "projector", "whiteboard"]
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="space")

    def __repr__(self) -> str:
        return f"<Space {self.name} ({self.type})>"


