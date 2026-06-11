# Le Congo D'Abord — Frontend

Next.js 14 frontend for the Le Congo D'Abord AI Party OS.

## Quick Start

```bash
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local

npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Demo Login
- Email: `admin@congodabord.cd`
- Password: `cdp2024`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes (for AI) | Claude API key |
| `NEXTAUTH_SECRET` | Yes | Any random string |
| `NEXTAUTH_URL` | Yes | App URL (e.g. http://localhost:3000) |
| `NEXT_PUBLIC_API_URL` | No | Backend URL (default: http://localhost:8000) |
