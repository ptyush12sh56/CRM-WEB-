from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.models import Stage


# ---------- Auth ----------

class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Contacts ----------

class ContactBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    company: str = Field(default="", max_length=120)
    email: EmailStr
    phone: str = Field(default="", max_length=40)
    notes: str = Field(default="", max_length=4000)
    stage: Stage = Stage.new
    deal_value: float = Field(default=0.0, ge=0)


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    company: Optional[str] = Field(default=None, max_length=120)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=40)
    notes: Optional[str] = Field(default=None, max_length=4000)
    stage: Optional[Stage] = None
    deal_value: Optional[float] = Field(default=None, ge=0)


class StageUpdate(BaseModel):
    stage: Stage


class ContactOut(ContactBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime


# ---------- AI ----------

class EmailDraftOut(BaseModel):
    subject: str
    body: str
    generated_by: str  # "template" or "ai"
