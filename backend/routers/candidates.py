"""CDP-AI OS — Candidate Recommendation Router"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import os

from database import get_db
from models.models import Member

router = APIRouter()


def score_member(member: Member) -> float:
    """Calculate total CDP candidate score for a member."""
    contrib_scores = {
        "Active": 100, "Grace Period": 60, "Exempted": 80,
        "Under Review": 40, "Suspended": 0, "Ineligible": 0,
    }
    contrib_score = contrib_scores.get(member.contribution_status, 0)

    edu_score = 50  # Default; ideally from MemberCV
    work_score = 50
    lang_score = 50

    if member.cv:
        edu_score = member.cv.education_score or 50
        work_score = member.cv.work_score or 50
        lang_count = len(member.cv.languages_spoken or [])
        lang_score = min(100, (lang_count / 5) * 100)

    total = (
        edu_score * 0.15 +
        work_score * 0.20 +
        (member.local_credibility_score or 50) * 0.15 +
        (member.leadership_score or 50) * 0.15 +
        contrib_score * 0.10 +
        (member.training_completion or 0) * 0.10 +
        (member.integrity_score or 100) * 0.10 +
        lang_score * 0.05
    )
    return round(total, 1)


@router.get("/candidates/top3")
async def get_top3_candidates(
    province: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get top 3 AI-recommended candidates for a given role/province."""
    query = db.query(Member).filter(
        Member.contribution_status.in_(["Active", "Exempted"])
    )
    if province:
        query = query.filter(Member.province_name == province)

    members = query.all()
    if not members:
        return {"message": "Aucun candidat éligible trouvé", "candidates": []}

    scored = [(m, score_member(m)) for m in members]
    scored.sort(key=lambda x: x[1], reverse=True)
    top3 = scored[:3]

    return {
        "role": role or "Non spécifié",
        "province": province or "National",
        "candidates": [
            {
                "rank": i + 1,
                "id": m.id,
                "name": f"{m.first_name} {m.last_name}",
                "province": m.province_name,
                "contributionStatus": m.contribution_status,
                "totalScore": score,
            }
            for i, (m, score) in enumerate(top3)
        ],
    }
