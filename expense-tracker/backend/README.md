# Expense Tracker Backend

Backend API for the Expense Tracker application built with FastAPI.

## Setup

1. Install dependencies using Poetry:
```bash
poetry install
```

2. Run database migrations:
```bash
poetry run alembic upgrade head
```

3. Seed the database with default categories and sample data:
```bash
poetry run python scripts/seed_data.py
```

4. Start the development server:
```bash
poetry run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- Interactive API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── app/
│   ├── api/          # API route handlers
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business logic
│   ├── database.py   # Database configuration
│   └── main.py       # FastAPI application
├── alembic/          # Database migrations
├── scripts/          # Utility scripts
└── uploads/          # Uploaded files (receipts)
```

## Environment Variables

- `DATABASE_URL`: Database connection string (default: SQLite)
  - Development: `sqlite:///./expense_tracker.db`
  - Production: PostgreSQL connection string

## API Endpoints

All endpoints are prefixed with `/api/v1/`

- **Expenses**: `/expenses` (GET, POST, PUT, DELETE)
- **Categories**: `/categories` (GET, POST, PUT, DELETE)
- **Budgets**: `/budgets` (GET, POST, PUT, DELETE)
- **Reports**: `/reports/summary`, `/reports/trends`, `/reports/category-breakdown`
- **Export**: `/export/csv`, `/export/excel`, `/export/pdf`
- **Tags**: `/tags/suggestions`
- **Upload**: `/upload/receipt`
- **Backup**: `/backup/create`, `/backup/list`
