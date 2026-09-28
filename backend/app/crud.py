from sqlalchemy.orm import Session
from sqlalchemy import or_

from app import models, schemas
from app.security import hash_password


# ---------- Users ----------

def get_user_by_email(db: Session, email: str) -> models.User | None:
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, data: schemas.UserCreate) -> models.User:
    user = models.User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ---------- Contacts ----------

def get_contact(db: Session, owner_id: int, contact_id: int) -> models.Contact | None:
    return (
        db.query(models.Contact)
        .filter(models.Contact.id == contact_id, models.Contact.owner_id == owner_id)
        .first()
    )


def list_contacts(
    db: Session,
    owner_id: int,
    search: str | None = None,
    stage: models.Stage | None = None,
) -> list[models.Contact]:
    query = db.query(models.Contact).filter(models.Contact.owner_id == owner_id)
    if stage:
        query = query.filter(models.Contact.stage == stage)
    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                models.Contact.name.ilike(like),
                models.Contact.company.ilike(like),
                models.Contact.email.ilike(like),
            )
        )
    return query.order_by(models.Contact.created_at.desc()).all()


def create_contact(db: Session, owner_id: int, data: schemas.ContactCreate) -> models.Contact:
    contact = models.Contact(owner_id=owner_id, **data.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def update_contact(
    db: Session, contact: models.Contact, data: schemas.ContactUpdate
) -> models.Contact:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(contact, field, value)
    db.commit()
    db.refresh(contact)
    return contact


def delete_contact(db: Session, contact: models.Contact) -> None:
    db.delete(contact)
    db.commit()
