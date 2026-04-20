from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, Text, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class HealthData(Base):
    __tablename__ = "health_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Vital signs
    heart_rate = Column(Float)
    blood_pressure_systolic = Column(Float)
    blood_pressure_diastolic = Column(Float)
    temperature = Column(Float)
    weight = Column(Float)
    blood_sugar = Column(Float)

    # Symptoms
    symptoms = Column(Text)

    user = relationship("User")

    __table_args__ = (
        Index("ix_health_data_user_timestamp", "user_id", "timestamp"),
    )


class MedicineRecord(Base):
    __tablename__ = "medicine_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    medicine_name = Column(String)
    dosage = Column(String)
    frequency = Column(String)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))

    user = relationship("User")
