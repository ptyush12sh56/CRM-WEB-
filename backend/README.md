# Mini CRM — Backend (FastAPI)

## Setup
```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit SECRET_KEY at minimum
```

## Run
```bash
uvicorn app.main:app --reload
```
API docs (Swagger UI): http://localhost:8000/docs

## Endpoints
- `POST /auth/signup` — {name, email, password}
- `POST /auth/login` — form fields `username` (email) + `password` → JWT
- `GET  /auth/me` — current user
- `GET  /contacts?search=&stage=` — list/search/filter (auth required)
- `POST /contacts` — create
- `GET  /contacts/{id}` — fetch one
- `PUT  /contacts/{id}` — update
- `PATCH /contacts/{id}/stage` — move stage only (for Kanban drag-drop)
- `DELETE /contacts/{id}` — delete
- `POST /contacts/{id}/draft-email` — AI follow-up draft (uses `ANTHROPIC_API_KEY` if set, else a stage-based template)

## Notes
- Every contact is scoped to its owner (JWT user) — no cross-account leakage.
- Errors return a consistent shape: `{"error": {"message": ..., "status": ...}}`.
- Default DB is SQLite (`crm.db`); set `DATABASE_URL` to a Postgres URL for production, e.g.
  `postgresql://user:pass@localhost:5432/crm`.
