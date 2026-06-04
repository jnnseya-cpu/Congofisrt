"""CDP-AI OS — Members CRUD Router"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid

from database import get_db
from models.models import Member, MemberCV

router = APIRouter()

class MemberCreate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: str = "Congolais(e)"
    phone: str
    email: str
    country: str
    continent: str
    province_name: Optional[str] = None
    territory_id: Optional[str] = None
    commune_id: Optional[str] = None
    village_id: Optional[str] = None
    member_role: str = "Member"
    language_preference: str = "fr"

class MemberResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone: str
    member_role: str
    contribution_status: str
    province_name: Optional[str]
    country: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


@router.get("/members", response_model=List[MemberResponse])
async def list_members(
    skip: int = 0,
    limit: int = 50,
    province: Optional[str] = Query(None),
    contribution_status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Member)
    if province:
        query = query.filter(Member.province_name == province)
    if contribution_status:
        query = query.filter(Member.contribution_status == contribution_status)
    return query.offset(skip).limit(limit).all()


@router.get("/members/{member_id}", response_model=MemberResponse)
async def get_member(member_id: str, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Membre non trouvé")
    return member


@router.post("/members", response_model=MemberResponse)
async def create_member(data: MemberCreate, db: Session = Depends(get_db)):
    # Check duplicate
    existing = db.query(Member).filter(
        (Member.email == data.email) | (Member.phone == data.phone)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email ou téléphone déjà enregistré")

    member = Member(
        id=str(uuid.uuid4()),
        first_name=data.first_name,
        last_name=data.last_name,
        date_of_birth=data.date_of_birth,
        gender=data.gender,
        nationality=data.nationality,
        phone=data.phone,
        email=data.email,
        country=data.country,
        continent=data.continent,
        province_name=data.province_name,
        territory_id=data.territory_id,
        commune_id=data.commune_id,
        village_id=data.village_id,
        member_role=data.member_role,
        language_preference=data.language_preference,
        membership_number=f"CDP-{datetime.now().year}-{str(uuid.uuid4())[:8].upper()}",
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.put("/members/{member_id}")
async def update_member(member_id: str, data: dict, db: Session = Depends(get_db)):
    member = db.query(Member).filter(Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Membre non trouvé")
    for key, value in data.items():
        if hasattr(member, key):
            setattr(member, key, value)
    db.commit()
    return {"message": "Membre mis à jour"}


@router.get("/stats/overview")
async def get_overview_stats(db: Session = Depends(get_db)):
    total = db.query(Member).count()
    active_contributors = db.query(Member).filter(
        Member.contribution_status == "Active"
    ).count()
    by_province = {}
    members = db.query(Member.province_name).all()
    for (province,) in members:
        if province:
            by_province[province] = by_province.get(province, 0) + 1

    return {
        "totalMembers": total,
        "activeContributors": active_contributors,
        "monthlyRevenue": active_contributors * 5,
        "byProvince": by_province,
    }
