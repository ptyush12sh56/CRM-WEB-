import os

import httpx
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.deps import get_current_user
from app.routers.contacts import _get_owned_contact_or_404

router = APIRouter(prefix="/contacts", tags=["ai"])

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")

_TEMPLATES = {
    models.Stage.new: "Hi {first_name},\n\nThanks for connecting. I wanted to follow up and see if you had "
    "any questions — happy to set up a quick call whenever suits you.\n\nBest,\n{sender}",
    models.Stage.contacted: "Hi {first_name},\n\nFollowing up on our last conversation about {company}. "
    "Let me know a good time to walk through next steps.\n\nBest,\n{sender}",
    models.Stage.qualified: "Hi {first_name},\n\nGreat speaking with you. As discussed, I'm attaching the "
    "details for {company}'s order — let me know if the numbers work.\n\nBest,\n{sender}",
    models.Stage.won: "Hi {first_name},\n\nWelcome aboard! Excited to have {company} on board. Our onboarding "
    "lead will be in touch shortly.\n\nBest,\n{sender}",
    models.Stage.lost: "Hi {first_name},\n\nThanks again for considering us. If anything changes down the "
    "line, I'd love the chance to work together.\n\nBest,\n{sender}",
}


def _template_draft(contact: models.Contact, sender: str) -> schemas.EmailDraftOut:
    body = _TEMPLATES[contact.stage].format(
        first_name=contact.name.split(" ")[0],
        company=contact.company or "your team",
        sender=sender,
    )
    return schemas.EmailDraftOut(
        subject=f"Following up, {contact.name.split(' ')[0]}",
        body=body,
        generated_by="template",
    )


async def _ai_draft(contact: models.Contact, sender: str) -> schemas.EmailDraftOut | None:
    if not ANTHROPIC_API_KEY:
        return None

    prompt = (
        f"Write a short, friendly follow-up sales email to {contact.name} at {contact.company}. "
        f"Deal stage: {contact.stage.value}. Notes: {contact.notes or 'none'}. "
        f"Sign it from {sender}. Respond ONLY as JSON: {{\"subject\": ..., \"body\": ...}}"
    )
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": ANTHROPIC_MODEL,
                    "max_tokens": 400,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
        resp.raise_for_status()
        data = resp.json()
        text = "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text")
        import json as _json

        parsed = _json.loads(text)
        return schemas.EmailDraftOut(subject=parsed["subject"], body=parsed["body"], generated_by="ai")
    except Exception:
        return None


@router.post("/{contact_id}/draft-email", response_model=schemas.EmailDraftOut)
async def draft_email(
    contact_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    contact = _get_owned_contact_or_404(db, user, contact_id)
    ai_result = await _ai_draft(contact, sender=user.name)
    return ai_result or _template_draft(contact, sender=user.name)
