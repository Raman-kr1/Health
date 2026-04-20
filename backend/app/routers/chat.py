from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from typing import List

from ..database import get_db
from ..models.health_data import HealthData
from ..services.gemini_service import GeminiService
from ..utils.security import get_current_user

router = APIRouter()


class SymptomRequest(BaseModel):
    symptoms: str


class MedicineRequest(BaseModel):
    medicines: List[str]


@router.post("/symptoms")
async def analyze_symptoms(
    payload: SymptomRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    health_history: dict = {}
    user_id = current_user.get("id")

    if user_id is not None:
        since_date = datetime.now(timezone.utc) - timedelta(days=7)
        result = await db.execute(
            select(HealthData)
            .where(HealthData.user_id == user_id)
            .where(HealthData.timestamp >= since_date)
            .order_by(desc(HealthData.timestamp))
            .limit(5)
        )
        recent_data = result.scalars().all()

        if recent_data:
            latest = recent_data[0]
            health_history = {
                "heart_rate": latest.heart_rate,
                "blood_pressure": f"{latest.blood_pressure_systolic}/{latest.blood_pressure_diastolic}",
                "temperature": latest.temperature,
                "weight": latest.weight,
            }

    analysis = await GeminiService().analyze_symptoms(payload.symptoms, health_history)

    return {"analysis": analysis, "timestamp": datetime.now(timezone.utc)}


@router.post("/medicine-check")
async def check_medicine_interactions(
    payload: MedicineRequest,
    current_user: dict = Depends(get_current_user),
):
    if len(payload.medicines) < 2:
        return {"message": "Please provide at least 2 medicines to check interactions"}

    interaction_check = await GeminiService().check_medicine_interaction(payload.medicines)

    return {
        "medicines": payload.medicines,
        "interaction_analysis": interaction_check,
        "timestamp": datetime.now(timezone.utc),
    }
