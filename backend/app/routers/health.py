from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from datetime import datetime, timedelta

from ..database import get_db
from ..models.health_data import HealthData, MedicineRecord
from ..services.prediction_service import PredictionService
from ..utils.security import get_current_user

router = APIRouter()

@router.post("/health-data")
async def add_health_data(
    heart_rate: float = None,
    blood_pressure_systolic: float = None,
    blood_pressure_diastolic: float = None,
    temperature: float = None,
    weight: float = None,
    blood_sugar: float = None,
    symptoms: str = None,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    health_data = HealthData(
        user_id=current_user.id,
        heart_rate=heart_rate,
        blood_pressure_systolic=blood_pressure_systolic,
        blood_pressure_diastolic=blood_pressure_diastolic,
        temperature=temperature,
        weight=weight,
        blood_sugar=blood_sugar,
        symptoms=symptoms
    )
    
    db.add(health_data)
    await db.commit()
    
    return {"message": "Health data recorded successfully