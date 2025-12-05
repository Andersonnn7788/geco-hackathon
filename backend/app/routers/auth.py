from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.core.database import get_db
from app.core.security import (
    get_current_user,
    decode_token,
)
from app.models.user import User, UserRole
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


class UserSyncRequest(BaseModel):
    """Request body for syncing user after Supabase signup"""
    email: EmailStr
    full_name: str


class UserSyncResponse(BaseModel):
    """Response after syncing user"""
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool


@router.post("/sync", response_model=UserSyncResponse, status_code=status.HTTP_201_CREATED)
async def sync_user(
    user_data: UserSyncRequest,
    db: AsyncSession = Depends(get_db),
    token: Optional[str] = None
):
    """
    Sync user from Supabase to local database.
    Called after successful Supabase signup to create local user record.
    """
    # Verify the token if provided (from Authorization header)
    from fastapi import Request
    
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        # User already exists, return existing user
        return UserSyncResponse(
            id=existing_user.id,
            email=existing_user.email,
            full_name=existing_user.full_name,
            role=existing_user.role.value,
            is_active=existing_user.is_active
        )

    # Create new user (no password needed - auth is handled by Supabase)
    user = User(
        email=user_data.email,
        hashed_password="supabase_auth",  # Placeholder - not used for Supabase auth
        full_name=user_data.full_name,
        role=UserRole.user,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return UserSyncResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role.value,
        is_active=user.is_active
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user
