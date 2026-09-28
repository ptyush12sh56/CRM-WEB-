from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas, models
from app.database import get_db
from app.deps import get_current_user

router = APIRouter(prefix="/contacts", tags=["contacts"])


def _get_owned_contact_or_404(db: Session, user: models.User, contact_id: int) -> models.Contact:
    contact = crud.get_contact(db, owner_id=user.id, contact_id=contact_id)
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
    return contact


@router.get("", response_model=list[schemas.ContactOut])
def list_contacts(
    search: str | None = None,
    stage: models.Stage | None = None,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return crud.list_contacts(db, owner_id=user.id, search=search, stage=stage)


@router.post("", response_model=schemas.ContactOut, status_code=status.HTTP_201_CREATED)
def create_contact(
    data: schemas.ContactCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return crud.create_contact(db, owner_id=user.id, data=data)


@router.get("/{contact_id}", response_model=schemas.ContactOut)
def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    return _get_owned_contact_or_404(db, user, contact_id)


@router.put("/{contact_id}", response_model=schemas.ContactOut)
def update_contact(
    contact_id: int,
    data: schemas.ContactUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    contact = _get_owned_contact_or_404(db, user, contact_id)
    return crud.update_contact(db, contact, data)


@router.patch("/{contact_id}/stage", response_model=schemas.ContactOut)
def update_stage(
    contact_id: int,
    data: schemas.StageUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """Lightweight endpoint for Kanban drag-and-drop moves."""
    contact = _get_owned_contact_or_404(db, user, contact_id)
    contact.stage = data.stage
    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    contact = _get_owned_contact_or_404(db, user, contact_id)
    crud.delete_contact(db, contact)
