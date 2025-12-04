from app.routers.auth import router as auth_router
from app.routers.spaces import router as spaces_router
from app.routers.bookings import router as bookings_router
from app.routers.admin import router as admin_router
from app.routers.chat import router as chat_router

__all__ = ["auth_router", "spaces_router", "bookings_router", "admin_router", "chat_router"]

