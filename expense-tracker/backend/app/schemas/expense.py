from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID


class ExpenseBase(BaseModel):
    amount: float = Field(..., gt=0, description="Expense amount")
    currency: str = Field(default="IDR", max_length=3, description="Currency code")
    description: str = Field(..., min_length=1, max_length=500, description="Expense description")
    category_id: Optional[UUID] = Field(None, description="Category ID")
    date: date = Field(..., description="Expense date")
    tags: Optional[List[str]] = Field(default_factory=list, description="Tags")
    payment_method: str = Field(..., description="Payment method")
    receipt_url: Optional[str] = Field(None, description="Receipt image URL")
    location: Optional[str] = Field(None, max_length=200, description="Location")
    notes: Optional[str] = Field(None, description="Additional notes")
    is_recurring: bool = Field(default=False, description="Is recurring expense")


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=3)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    category_id: Optional[UUID] = None
    date: Optional[date] = None
    tags: Optional[List[str]] = None
    payment_method: Optional[str] = None
    receipt_url: Optional[str] = None
    location: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = None
    is_recurring: Optional[bool] = None


class ExpenseResponse(ExpenseBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
