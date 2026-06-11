# Le Congo D'Abord — Backend

FastAPI backend with 12 Claude-powered AI agents.

## Quick Start

```bash
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://lcd_user:lcd_password@localhost:5432/lcd_ai_os
export ANTHROPIC_API_KEY=sk-ant-...

uvicorn main:app --reload    # http://localhost:8000
# API docs: http://localhost:8000/docs
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/members` | List members |
| POST | `/api/members` | Register member |
| GET | `/api/candidates/top3` | AI top 3 candidates |
| POST | `/api/agents/{type}` | Run AI agent |
| GET | `/health` | Health check |

## 12 AI Agents
`registration` · `mapping` · `cv-analysis` · `candidate-selection` · `role-matching` · `policy` · `infrastructure` · `finance` · `training` · `ethics` · `communication` · `election-readiness`
