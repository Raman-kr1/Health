from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import os

from ..database import get_db
from ..models.user import User
from ..config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# Set auto_error=False to allow optional authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token", auto_error=False)

GUEST_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours for guests


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def create_guest_token() -> dict:
    """Create a temporary guest session token"""
    guest_id = f"guest_{uuid.uuid4().hex[:12]}"
    expires_delta = timedelta(minutes=GUEST_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": guest_id, "is_guest": True},
        expires_delta=expires_delta
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "guest_id": guest_id,
        "is_guest": True,
        "expires_in": GUEST_TOKEN_EXPIRE_MINUTES * 60
    }


def decode_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[dict]:
    """Get current user - returns None for unauthenticated users"""
    if not token:
        return None
    
    payload = decode_token(token)
    if not payload:
        return None
    
    username: str = payload.get("sub")
    is_guest: bool = payload.get("is_guest", False)
    
    if username is None:
        return None
    
    if is_guest:
        return {
            "id": None,
            "username": username,
            "is_guest": True
        }
    
    # For registered users, fetch from database
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    
    if user is None:
        return None
    
    return {
        "id": user.id,
        "username": user.username,
        "is_guest": False,
        "user": user
    }


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    """Get current user - allows guests but requires some form of authentication"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
    
    payload = decode_token(token)
    if not payload:
        raise credentials_exception
    
    username: str = payload.get("sub")
    is_guest: bool = payload.get("is_guest", False)
    
    if username is None:
        raise credentials_exception
    
    # For guest users, return guest info
    if is_guest:
        return {
            "id": None,
            "username": username,
            "is_guest": True
        }
    
    # For registered users, fetch from database
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    
    return {
        "id": user.id,
        "username": user.username,
        "is_guest": False,
        "user": user
    }


async def get_authenticated_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    """Get current user - requires full authentication (no guests allowed)"""
    user_info = await get_current_user(token, db)
    
    if user_info.get("is_guest"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This feature requires a registered account. Please sign up to access."
        )
    
    return user_info.get("user")