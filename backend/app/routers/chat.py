from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timedelta

from ..database import get_db
from ..models.health_data import HealthData
from ..services.gemini_service import GeminiService
from ..utils.security import get_current_user

router = APIRouter()

@router.post("/symptoms")
async def analyze_symptoms(
    symptoms: str,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get recent health data for context
    since_date = datetime.now() - timedelta(days=7)
    
    result = await db.execute(
        select(HealthData)
        .where(HealthData.user_id == current_user.id)
        .where(HealthData.timestamp >= since_date)
        .order_by(desc(HealthData.timestamp))
        .limit(5)
    )
    recent_data = result.scalars().all()
    
    health_history = {}
    if recent_data:
        latest = recent_data[0]
        health_history = {
            "heart_rate": latest.heart_rate,
            "blood_pressure": f"{latest.blood_pressure_systolic}/{latest.blood_pressure_diastolic}",
            "temperature": latest.temperature,
            "weight": latest.weight
        }
    
    gemini_service = GeminiService()
    analysis = await gemini_service.analyze_symptoms(symptoms, health_history)
    
    return {
        "analysis": analysis,
        "timestamp": datetime.now()
    }

@router.post("/medicine-check")
async def check_medicine_interactions(
    medicines: list[str],
    current_user = Depends(get_current_user)
):
    if len(medicines) < 2:
        return {"message": "Please provide at least 2 medicines to check interactions"}
    
    gemini_service = GeminiService()
    interaction_check = await gemini_service.check_medicine_interaction(medicines)
    
    return {
        "medicines": medicines,
        "interaction_analysis": interaction_check,
        "timestamp": datetime.now()
    }