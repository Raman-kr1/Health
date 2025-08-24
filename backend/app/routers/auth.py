from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta

from ..database import get_db
from ..models.user import User
from ..utils.security import verify_password, get_password_hash, create_access_token
from ..config import get_settings

router = APIRouter()
settings = get_settings()

@router.post("/register")
async def register(
    username: str,
    email: str,
    password: str,
    db: AsyncSession = Depends(get_db)
):
    # Check if user exists
    result = await db.execute(
        select(User).where((User.email == email) | (User.username == username))
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="Username or email already registered"
        )
    
    # Create new user
    user = User(
        username=username,
        email=email,
        hashed_password=get_password_hash(password)
    )
    
    db.add(user)
    await db.commit()
    
    return {"message": "User registered successfully"}

@router.post("/token")
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
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}