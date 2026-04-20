import asyncio
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

from ..database import get_db
from ..models.health_data import HealthData, MedicineRecord
from ..services.prediction_service import PredictionService
from ..utils.security import get_current_user, get_authenticated_user

router = APIRouter()

# In-memory storage for guest data (use Redis in production)
guest_health_data: dict = {}
guest_medicine_data: dict = {}
_guest_lock = asyncio.Lock()


class HealthDataCreate(BaseModel):
    heart_rate: Optional[float] = None
    blood_pressure_systolic: Optional[float] = None
    blood_pressure_diastolic: Optional[float] = None
    temperature: Optional[float] = None
    weight: Optional[float] = None
    blood_sugar: Optional[float] = None
    symptoms: Optional[str] = None


class MedicineCreate(BaseModel):
    medicine_name: str
    dosage: str
    frequency: str
    start_date: datetime
    end_date: Optional[datetime] = None


@router.post("/health-data")
async def add_health_data(
    data: HealthDataCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Handle guest users - store in memory
    if current_user.get("is_guest"):
        guest_id = current_user["username"]
        async with _guest_lock:
            bucket = guest_health_data.setdefault(guest_id, [])
            record_id = len(bucket) + 1
            bucket.append(
                {
                    "id": record_id,
                    "timestamp": datetime.now(timezone.utc),
                    **data.model_dump(),
                }
            )
        return {"message": "Health data recorded successfully (guest session)"}
    
    # Handle registered users - store in database
    user_id = current_user.get("id")
    health_data = HealthData(
        user_id=user_id,
        heart_rate=data.heart_rate,
        blood_pressure_systolic=data.blood_pressure_systolic,
        blood_pressure_diastolic=data.blood_pressure_diastolic,
        temperature=data.temperature,
        weight=data.weight,
        blood_sugar=data.blood_sugar,
        symptoms=data.symptoms
    )
    
    db.add(health_data)
    await db.commit()
    
    return {"message": "Health data recorded successfully"}


@router.get("/health-data")
async def get_health_data(
    days: int = Query(30, ge=1, le=365),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    since_date = datetime.now(timezone.utc) - timedelta(days=days)

    # Handle guest users
    if current_user.get("is_guest"):
        guest_id = current_user["username"]
        records = guest_health_data.get(guest_id, [])
        filtered = [r for r in records if r["timestamp"] >= since_date]
        filtered.sort(key=lambda r: r["timestamp"], reverse=True)
        return filtered[offset : offset + limit]

    # Handle registered users
    user_id = current_user.get("id")

    result = await db.execute(
        select(HealthData)
        .where(HealthData.user_id == user_id)
        .where(HealthData.timestamp >= since_date)
        .order_by(desc(HealthData.timestamp))
        .limit(limit)
        .offset(offset)
    )
    health_records = result.scalars().all()
    
    return [
        {
            "id": record.id,
            "timestamp": record.timestamp,
            "heart_rate": record.heart_rate,
            "blood_pressure_systolic": record.blood_pressure_systolic,
            "blood_pressure_diastolic": record.blood_pressure_diastolic,
            "temperature": record.temperature,
            "weight": record.weight,
            "blood_sugar": record.blood_sugar,
            "symptoms": record.symptoms
        }
        for record in health_records
    ]


@router.get("/health-trends")
async def get_health_trends(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Handle guest users
    if current_user.get("is_guest"):
        guest_id = current_user["username"]
        records = guest_health_data.get(guest_id, [])
        
        if not records:
            return {"message": "No data available for trends", "data": []}
        
        health_data = [
            {
                "timestamp": record["timestamp"],
                "heart_rate": record.get("heart_rate"),
                "blood_pressure_systolic": record.get("blood_pressure_systolic"),
                "weight": record.get("weight")
            }
            for record in records
        ]
        
        prediction_service = PredictionService()
        predictions = await prediction_service.predict_health_trends(health_data)
        
        return predictions
    
    # Handle registered users
    user_id = current_user.get("id")
    since_date = datetime.now(timezone.utc) - timedelta(days=30)
    
    result = await db.execute(
        select(HealthData)
        .where(HealthData.user_id == user_id)
        .where(HealthData.timestamp >= since_date)
        .order_by(HealthData.timestamp)
    )
    health_records = result.scalars().all()
    
    health_data = [
        {
            "timestamp": record.timestamp,
            "heart_rate": record.heart_rate,
            "blood_pressure_systolic": record.blood_pressure_systolic,
            "weight": record.weight
        }
        for record in health_records
    ]
    
    prediction_service = PredictionService()
    predictions = await prediction_service.predict_health_trends(health_data)
    
    return predictions


@router.post("/medicines")
async def add_medicine(
    data: MedicineCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Handle guest users
    if current_user.get("is_guest"):
        guest_id = current_user["username"]
        async with _guest_lock:
            bucket = guest_medicine_data.setdefault(guest_id, [])
            record_id = len(bucket) + 1
            bucket.append({"id": record_id, **data.model_dump()})
        return {"message": "Medicine record added successfully (guest session)"}
    
    # Handle registered users
    user_id = current_user.get("id")
    medicine = MedicineRecord(
        user_id=user_id,
        medicine_name=data.medicine_name,
        dosage=data.dosage,
        frequency=data.frequency,
        start_date=data.start_date,
        end_date=data.end_date
    )
    
    db.add(medicine)
    await db.commit()
    
    return {"message": "Medicine record added successfully"}


@router.get("/medicines")
async def get_medicines(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Handle guest users
    if current_user.get("is_guest"):
        guest_id = current_user["username"]
        return guest_medicine_data.get(guest_id, [])
    
    # Handle registered users
    user_id = current_user.get("id")
    result = await db.execute(
        select(MedicineRecord)
        .where(MedicineRecord.user_id == user_id)
        .order_by(desc(MedicineRecord.start_date))
    )
    medicines = result.scalars().all()
    
    return [
        {
            "id": med.id,
            "medicine_name": med.medicine_name,
            "dosage": med.dosage,
            "frequency": med.frequency,
            "start_date": med.start_date,
            "end_date": med.end_date
        }
        for med in medicines
    ]


@router.delete("/clear-guest-data")
async def clear_guest_data(current_user: dict = Depends(get_current_user)):
    """Clear all guest data - only for guest users"""
    if not current_user.get("is_guest"):
        raise HTTPException(
            status_code=400,
            detail="This endpoint is only for guest users"
        )
    
    guest_id = current_user["username"]

    async with _guest_lock:
        guest_health_data.pop(guest_id, None)
        guest_medicine_data.pop(guest_id, None)
    
    return {"message": "Guest data cleared successfully"}