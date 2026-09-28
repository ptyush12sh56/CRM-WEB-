import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.database import Base


class Stage(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    qualified = "qualified"
    won = "won"
    lost = "lost"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    contacts = relationship("Contact", back_populates="owner", cascade="all, delete-orphan")


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    name = Column(String(120), nullable=False)
    company = Column(String(120), default="")
    email = Column(String(255), nullable=False)
    phone = Column(String(40), default="")
    notes = Column(Text, default="")
    stage = Column(Enum(Stage), default=Stage.new, nullable=False, index=True)
    deal_value = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="contacts")
