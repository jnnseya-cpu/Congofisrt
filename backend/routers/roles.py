"""CDP-AI OS — Roles Router"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from database import get_db
from models.models import Role

router = APIRouter()

PARTY_ROLES = [
    {"id": "r-national-coord", "title": "Coordinateur National", "level": "National", "description": "Responsable de la coordination nationale du parti"},
    {"id": "r-provincial-coord", "title": "Coordinateur Provincial", "level": "Provincial", "description": "Responsable d'une des 26 provinces"},
    {"id": "r-territory-leader", "title": "Leader de Territoire", "level": "Territory", "description": "Responsable d'un territoire ou ville"},
    {"id": "r-local-cell", "title": "Chef de Cellule Locale", "level": "Local", "description": "Responsable d'une cellule locale"},
    {"id": "r-youth-wing", "title": "Leader Aile Jeunesse", "level": "National", "description": "Coordinateur national de la jeunesse CDP"},
    {"id": "r-women-wing", "title": "Leader Aile Féminine", "level": "National", "description": "Coordinatrice nationale des femmes CDP"},
]

ELECTORAL_ROLES = [
    {"id": "er-president", "title": "Président de la République", "level": "National"},
    {"id": "er-national-deputy", "title": "Député National", "level": "National"},
    {"id": "er-provincial-deputy", "title": "Député Provincial", "level": "Provincial"},
    {"id": "er-mayor", "title": "Maire", "level": "City"},
    {"id": "er-commune-chief", "title": "Bourgmestre", "level": "Commune"},
    {"id": "er-sector-chief", "title": "Chef de Secteur", "level": "Sector"},
]


@router.get("/roles/party")
async def get_party_roles():
    return {"roles": PARTY_ROLES}


@router.get("/roles/electoral")
async def get_electoral_roles():
    return {"roles": ELECTORAL_ROLES}


@router.get("/roles/all")
async def get_all_roles():
    return {
        "partyRoles": PARTY_ROLES,
        "electoralRoles": ELECTORAL_ROLES,
    }
