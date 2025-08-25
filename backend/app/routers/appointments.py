from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, timezone

from ..database import get_db
from ..models.appointment import Appointment
from ..utils.security import get_current_user

router = APIRouter()

from pydantic import BaseModel


class AppointmentCreate(BaseModel):
    doctor_name: str
    appointment_date: datetime
    reason: str

@router.post("/")
async def create_appointment(
    payload: AppointmentCreate,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check for conflicts
    result = await db.execute(
        select(Appointment)
        .where(
            and_(
                Appointment.user_id == current_user.id,
                Appointment.appointment_date == payload.appointment_date,
                Appointment.status != "cancelled"
            )
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(status_code=400, detail="Time slot already booked")
    
    appointment = Appointment(
        user_id=current_user.id,
        doctor_name=payload.doctor_name,
        appointment_date=payload.appointment_date,
        reason=payload.reason
    )
    
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)
    
    return {"message": "Appointment scheduled successfully", "id": appointment.id}

@router.get("/")
async def get_appointments(
    include_past: bool = False,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Appointment).where(Appointment.user_id == current_user.id)
    
    if not include_past:
        query = query.where(Appointment.appointment_date >= datetime.now(timezone.utc))
    
    result = await db.execute(query.order_by(Appointment.appointment_date))
    appointments = result.scalars().all()
    
    return [
        {
            "id": apt.id,
            "doctor_name": apt.doctor_name,
            "appointment_date": apt.appointment_date,
            "reason": apt.reason,
            "status": apt.status
        }
        for apt in appointments
    ]

@router.get("/optimize") 
async def optimize_appointments(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get upcoming appointments
    result = await db.execute(
        select(Appointment)
        .where(
            and_(
                Appointment.user_id == current_user.id,
                Appointment.appointment_date >= datetime.now(timezone.utc),
                Appointment.status == "scheduled"
            )
        )
        .order_by(Appointment.appointment_date)
    )
    appointments = result.scalars().all()
    
    # Simple optimization: suggest combining appointments on same day
    suggestions = []
    appointments_by_date = {}
    
    for apt in appointments:
        date_key = apt.appointment_date.date()
        if date_key not in appointments_by_date:
            appointments_by_date[date_key] = []
        appointments_by_date[date_key].append(apt)
    
    for date, apts in appointments_by_date.items():
        if len(apts) > 1:
            suggestions.append({
                "date": date,
                "appointments": [
                    {"doctor": apt.doctor_name, "time": apt.appointment_date.time()}
                    for apt in apts
                ],
                "suggestion": "Consider combining these appointments to save time"
            })
    
    return {"optimization_suggestions": suggestions}