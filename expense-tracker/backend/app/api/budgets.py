from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models.budget import Budget
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse

router = APIRouter()


@router.get("/budgets", response_model=List[BudgetResponse])
async def get_budgets(
    period: Optional[str] = Query(None),
    category_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all budgets with optional filters"""
    query = db.query(Budget)
    
    if period:
        query = query.filter(Budget.period == period)
    
    if category_id:
        query = query.filter(Budget.category_id == category_id)
    
    budgets = query.order_by(Budget.created_at.desc()).all()
    return budgets


@router.get("/budgets/{budget_id}", response_model=BudgetResponse)
async def get_budget(
    budget_id: UUID,
    db: Session = Depends(get_db)
):
    """Get a specific budget by ID"""
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    return budget


@router.post("/budgets", response_model=BudgetResponse, status_code=201)
async def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db)
):
    """Create a new budget"""
    db_budget = Budget(**budget.model_dump())
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget


@router.put("/budgets/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: UUID,
    budget_update: BudgetUpdate,
    db: Session = Depends(get_db)
):
    """Update a budget"""
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    update_data = budget_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(budget, field, value)
    
    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/budgets/{budget_id}", status_code=204)
async def delete_budget(
    budget_id: UUID,
    db: Session = Depends(get_db)
):
    """Delete a budget"""
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    db.delete(budget)
    db.commit()
    return None
