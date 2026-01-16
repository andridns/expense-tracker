# Expense Tracker

A comprehensive full-stack expense tracking application built with FastAPI (Python) backend and React frontend.

## Features

- **Expense Management**: Track expenses with detailed information including amount, description, category, tags, payment method, receipt photos, location, notes, and recurring flag
- **Multi-Currency Support**: Support for IDR (primary) and other currencies
- **Indonesian Payment Methods**: Cash, Debit Card, Credit Card, GoPay, OVO, DANA, LinkAja, ShopeePay
- **Budget Tracking**: Set and track both category budgets and total monthly/yearly budgets
- **Comprehensive Dashboard**: View summaries, charts, and budget progress
- **Advanced Filtering**: Filter expenses by category, date range, tags, payment method, amount range, and search
- **Reports & Analytics**: Monthly/yearly summaries, category breakdowns, and spending trends
- **Export**: Export data to CSV, Excel, or PDF
- **PWA Support**: Progressive Web App with offline viewing capability
- **Material Design**: Modern, elegant UI with green color scheme

## Project Structure

```
expense-tracker/
├── backend/          # FastAPI backend
├── frontend/         # React frontend
└── README.md
```

## Quick Start

### Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies with Poetry:
```bash
poetry install
```

3. Run database migrations:
```bash
poetry run alembic upgrade head
```

4. Seed the database:
```bash
poetry run python scripts/seed_data.py
```

5. Start the server:
```bash
poetry run uvicorn app.main:app --reload
```

Backend API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Technology Stack

### Backend
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- Pydantic (data validation)
- Alembic (database migrations)
- Poetry (dependency management)
- PostgreSQL (production) / SQLite (development)

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Query (data fetching)
- Chart.js (visualizations)
- React Router (routing)
- React Hot Toast (notifications)
- Vite PWA Plugin (PWA support)

## Development

### Backend Development

- API endpoints are versioned: `/api/v1/`
- Database models are in `backend/app/models/`
- API routes are in `backend/app/api/`
- Pydantic schemas are in `backend/app/schemas/`

### Frontend Development

- Components are in `frontend/src/components/`
- Pages are in `frontend/src/pages/`
- API client is in `frontend/src/services/api.ts`
- Types are in `frontend/src/types/`

## Environment Variables

### Backend
- `DATABASE_URL`: Database connection string (default: SQLite)

## License

MIT
