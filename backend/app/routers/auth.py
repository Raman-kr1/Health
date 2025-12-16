from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
from pydantic import BaseModel
import os

from ..database import get_db
from ..models.user import User
from ..utils.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    create_guest_token,
    get_current_user
)
from ..config import get_settings

router = APIRouter()
settings = get_settings()


# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    is_guest: bool = False
    guest_id: str | None = None
    expires_in: int | None = None


class GuestInfo(BaseModel):
    allowed: bool
    features: dict
    limitations: list


@router.post("/register")
async def register(
    user: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    # Check if user exists
    result = await db.execute(
        select(User).where((User.email == user.email) | (User.username == user.username))
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="Username or email already registered"
        )
    
    # Create new user
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password)
    )
    
    db.add(new_user)
    await db.commit()
    
    return {"message": "User registered successfully"}


@router.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).where(User.username == form_data.username)
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id, "is_guest": False},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_guest": False
    }


@router.post("/guest", response_model=Token)
async def create_guest_session():
    """Create a guest session for trying the app without registration"""
    allow_guest = os.getenv("ALLOW_GUEST_ACCESS", "true").lower() == "true"
    
    if not allow_guest:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Guest access is currently disabled"
        )
    
    return create_guest_token()


@router.get("/guest/info", response_model=GuestInfo)
async def get_guest_info():
    """Get information about guest access features and limitations"""
    return {
        "allowed": os.getenv("ALLOW_GUEST_ACCESS", "true").lower() == "true",
        "features": {
            "health_tracking": True,
            "ai_symptom_analysis": True,
            "medicine_checker": True,
            "health_charts": True,
            "appointments": False,
            "data_persistence": False,
            "export_data": False
        },
        "limitations": [
            "Data is stored temporarily and will be lost after session expires",
            "Cannot schedule real appointments",
            "Cannot export health records",
            "Session expires after 24 hours"
        ]
    }


@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {
        "username": current_user.get("username"),
        "is_guest": current_user.get("is_guest", False),
        "user_id": current_user.get("id")
    }