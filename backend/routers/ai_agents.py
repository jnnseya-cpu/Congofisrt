"""
CDP-AI OS — AI Agent Endpoints (12 agents)
"""

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os

router = APIRouter()

class AgentRequest(BaseModel):
    payload: Dict[str, Any] = {}
    context: Optional[str] = ""
    language: Optional[str] = "fr"


def get_ai_result(agent_type: str, context: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """Run an AI agent, falling back to mock if no API key."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    if api_key:
        try:
            from ai.agents import run_agent
            return run_agent(agent_type, context, payload)
        except Exception as e:
            print(f"AI error: {e}")
    
    # Mock fallback
    return {
        "agentType": agent_type,
        "result": f"[Démo] Agent {agent_type} activé. Connectez l'API Anthropic pour des réponses réelles.",
        "confidence": 0.75,
        "generatedAt": "2024-11-15T10:00:00Z",
        "tokensUsed": 0,
    }


@router.post("/registration")
async def registration_agent(req: AgentRequest):
    """Agent 1: Member Registration Agent"""
    return get_ai_result("registration", req.context or "", req.payload)


@router.post("/mapping")
async def mapping_agent(req: AgentRequest):
    """Agent 2: Administrative Mapping Agent"""
    return get_ai_result("mapping", req.context or "", req.payload)


@router.post("/cv-analysis")
async def cv_analysis_agent(req: AgentRequest):
    """Agent 3: CV Intelligence Agent"""
    return get_ai_result("cv-analysis", req.context or "", req.payload)


@router.post("/candidate-selection")
async def candidate_selection_agent(req: AgentRequest):
    """Agent 4: Candidate Selection Agent — returns Top 3"""
    return get_ai_result("candidate-selection", req.context or "", req.payload)


@router.post("/role-matching")
async def role_matching_agent(req: AgentRequest):
    """Agent 5: Role Matching Agent"""
    return get_ai_result("role-matching", req.context or "", req.payload)


@router.post("/policy")
async def policy_agent(req: AgentRequest):
    """Agent 6: Policy Intelligence Agent"""
    return get_ai_result("policy", req.context or "", req.payload)


@router.post("/infrastructure")
async def infrastructure_agent(req: AgentRequest):
    """Agent 7: Infrastructure Intelligence Agent"""
    return get_ai_result("infrastructure", req.context or "", req.payload)


@router.post("/finance")
async def finance_agent(req: AgentRequest):
    """Agent 8: Finance and Contribution Agent"""
    return get_ai_result("finance", req.context or "", req.payload)


@router.post("/training")
async def training_agent(req: AgentRequest):
    """Agent 9: Training Academy Agent"""
    return get_ai_result("training", req.context or "", req.payload)


@router.post("/ethics")
async def ethics_agent(req: AgentRequest):
    """Agent 10: Ethics and Discipline Agent"""
    return get_ai_result("ethics", req.context or "", req.payload)


@router.post("/communication")
async def communication_agent(req: AgentRequest):
    """Agent 11: Communication Agent — 5 languages"""
    return get_ai_result("communication", req.context or "", req.payload)


@router.post("/election-readiness")
async def election_readiness_agent(req: AgentRequest):
    """Agent 12: Election Readiness Agent"""
    return get_ai_result("election-readiness", req.context or "", req.payload)
