from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a legacy JWT token (kept for backwards compatibility)"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def decode_supabase_token(token: str) -> Optional[dict]:
    """Decode and verify a Supabase JWT token"""
    try:
        # Supabase uses HS256 algorithm with the JWT secret
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=[settings.algorithm],
            options={"verify_aud": False}  # Supabase doesn't always set audience
        )
        return payload
    except JWTError:
        return None


def decode_token(token: str) -> Optional[dict]:
    """Decode token - tries Supabase first, then legacy"""
    # Try Supabase token first
    payload = decode_supabase_token(token)
    if payload:
        return payload
    
    # Fall back to legacy token
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    """Get current user from Supabase JWT token"""
    from app.models.user import User
    from sqlalchemy import select

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    payload = decode_token(token)
    if payload is None:
        raise credentials_exception

    # Supabase tokens have 'sub' as UUID and 'email' field
    # Legacy tokens have 'sub' as user ID
    email = payload.get("email")
    sub = payload.get("sub")
    
    if not email and not sub:
        raise credentials_exception

    # Try to find user by email (Supabase) or ID (legacy)
    if email:
        result = await db.execute(select(User).where(User.email == email))
    else:
        try:
            result = await db.execute(select(User).where(User.id == int(sub)))
        except (ValueError, TypeError):
            # sub might be a UUID from Supabase
            result = await db.execute(select(User).where(User.email == email if email else False))

    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )

    return user


async def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    """Get current user if authenticated, otherwise return None"""
    if not token:
        return None
    
    try:
        return await get_current_user(token, db)
    except HTTPException:
        return None


async def get_current_admin_user(current_user=Depends(get_current_user)):
    """Require admin role"""
    from app.models.user import UserRole
    
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
