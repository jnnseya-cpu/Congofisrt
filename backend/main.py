"""
CDP-AI OS — FastAPI Backend
Congo D'Abord AI Party Operating System
Founder & President: Mr Justin Nseya
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

load_dotenv()

# Import routers
from routers import members, contributions, candidates, roles, ai_agents

app = FastAPI(
    title="CDP-AI OS API",
    description="Congo D'Abord AI Party Operating System — Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(members.router, prefix="/api", tags=["Members"])
app.include_router(contributions.router, prefix="/api", tags=["Contributions"])
app.include_router(candidates.router, prefix="/api", tags=["Candidates"])
app.include_router(roles.router, prefix="/api", tags=["Roles"])
app.include_router(ai_agents.router, prefix="/api/agents", tags=["AI Agents"])

@app.get("/")
async def root():
    return {
        "system": "CDP-AI OS",
        "party": "Congo D'Abord",
        "version": "1.0.0",
        "founder": "Mr Justin Nseya",
        "status": "operational",
        "agents": 12,
        "provinces": 26,
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "CDP-AI OS Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
