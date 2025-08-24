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
    
    return {"message": "Health data recorded successfully"}

@router.get("/health-data")
async def get_health_data(
    days: int = 30,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    since_date = datetime.utcnow() - timedelta(days=days)
    
    result = await db.execute(
        select(HealthData)
        .where(HealthData.user_id == current_user.id)
        .where(HealthData.timestamp >= since_date)
        .order_by(desc(HealthData.timestamp))
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
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get last 30 days of data
    since_date = datetime.utcnow() - timedelta(days=30)
    
    result = await db.execute(
        select(HealthData)
        .where(HealthData.user_id == current_user.id)
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
    medicine_name: str,
    dosage: str,
    frequency: str,
    start_date: datetime,
    end_date: datetime = None,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    medicine = MedicineRecord(
        user_id=current_user.id,
        medicine_name=medicine_name,
        dosage=dosage,
        frequency=frequency,
        start_date=start_date,
        end_date=end_date
    )
    
    db.add(medicine)
    await db.commit()
    
    return {"message": "Medicine record added successfully"}

@router.get("/medicines")
async def get_medicines(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(MedicineRecord)
        .where(MedicineRecord.user_id == current_user.id)
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