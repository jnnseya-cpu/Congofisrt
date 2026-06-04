"""CDP-AI OS — Contributions Router"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

from database import get_db
from models.models import Contribution, Member

router = APIRouter()

class ContributionCreate(BaseModel):
    member_id: str
    amount: float = 5.0
    currency: str = "USD"
    month: int
    year: int
    payment_method: str
    notes: Optional[str] = None


@router.get("/contributions")
async def list_contributions(
    member_id: Optional[str] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Contribution)
    if member_id:
        query = query.filter(Contribution.member_id == member_id)
    if year:
        query = query.filter(Contribution.year == year)
    return query.order_by(Contribution.created_at.desc()).limit(200).all()


@router.post("/contributions")
async def create_contribution(data: ContributionCreate, db: Session = Depends(get_db)):
    # Check member exists
    member = db.query(Member).filter(Member.id == data.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Membre non trouvé")

    receipt = f"CDP-{data.year}-{str(data.month).zfill(2)}-{str(uuid.uuid4())[:8].upper()}"
    contribution = Contribution(
        id=str(uuid.uuid4()),
        member_id=data.member_id,
        amount=data.amount,
        currency=data.currency,
        month=data.month,
        year=data.year,
        payment_method=data.payment_method,
        payment_status="Confirmed",
        receipt_number=receipt,
        notes=data.notes,
    )
    db.add(contribution)

    # Update member contribution status
    member.contribution_status = "Active"
    db.commit()

    return {"message": "Cotisation enregistrée", "receipt": receipt}


@router.get("/contributions/summary/{member_id}")
async def get_contribution_summary(member_id: str, db: Session = Depends(get_db)):
    contributions = db.query(Contribution).filter(
        Contribution.member_id == member_id,
        Contribution.payment_status == "Confirmed"
    ).all()

    total_paid = sum(c.amount for c in contributions)
    months_active = len(contributions)

    return {
        "memberId": member_id,
        "totalPaid": total_paid,
        "monthsActive": months_active,
        "lastPayment": contributions[-1].created_at.isoformat() if contributions else None,
        "contributions": [
            {
                "id": c.id,
                "amount": c.amount,
                "month": c.month,
                "year": c.year,
                "status": c.payment_status,
                "receipt": c.receipt_number,
            }
            for c in contributions
        ],
    }
