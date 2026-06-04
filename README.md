# CDP-AI OS — Congo D'Abord AI Party Operating System

**Le premier parti politique congolais dirigé par des citoyens, renforcé par l'intelligence artificielle**

## Fondateur & Président

**Mr Justin Nseya**

---

## À propos / About

**FR:** Congo D'Abord (CDP) est un parti politique de la République Démocratique du Congo qui utilise l'intelligence artificielle pour moderniser la gestion partisane, sélectionner les meilleurs candidats sur la base du mérite, et servir le peuple congolais avec transparence.

**EN:** Congo D'Abord (CDP) is a political party of the Democratic Republic of Congo that uses artificial intelligence to modernize party management, select the best candidates based on merit, and serve the Congolese people with transparency.

**LN:** Congo D'Abord ezali parti ya politiki ya Kongo oyo esalisi intelligence artificielle mpo na koswana bato oyo bazali malamu mpo na botamboli ya mboka.

**SW:** Congo D'Abord ni chama cha kisiasa cha Jamhuri ya Kidemokrasia ya Kongo kinachotumia akili bandia kuimarisha usimamizi wa chama na kuchagua wagombezi bora.

---

## Architecture

```
cdp-ai-os/
├── src/                          # Next.js Frontend
│   ├── app/                      # App Router pages
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout
│   │   ├── register/             # Member registration
│   │   ├── dashboard/            # Dashboards (national/provincial/local)
│   │   ├── candidates/           # AI candidate recommendations
│   │   ├── contributions/        # Contribution tracking
│   │   ├── training/             # Political Academy
│   │   ├── policy/               # Policy Intelligence
│   │   ├── infrastructure/       # Infrastructure needs
│   │   └── ethics/               # Ethics & discipline
│   ├── components/               # Reusable React components
│   └── lib/                      # Utilities, types, data
├── backend/                      # FastAPI Python backend
│   ├── main.py                   # App entry point
│   ├── models/                   # SQLAlchemy models
│   ├── routers/                  # API endpoints
│   └── ai/                       # Claude AI agents
├── database/                     # PostgreSQL schema
└── docker-compose.yml            # Full stack deployment
```

## 12 Agents IA / 12 AI Agents

| # | Agent | Description |
|---|-------|-------------|
| 1 | Inscription | Member registration & validation |
| 2 | Cartographie | Administrative mapping (26 provinces) |
| 3 | Analyse CV | Profile evaluation & scoring |
| 4 | Sélection Candidats | Top 3 recommendation per role |
| 5 | Matching Rôles | Role assignment optimization |
| 6 | Intelligence Politique | Policy generation & analysis |
| 7 | Infrastructure | Infrastructure needs mapping |
| 8 | Finance | Contribution tracking & transparency |
| 9 | Académie | Training recommendations |
| 10 | Éthique | Ethics monitoring & discipline |
| 11 | Communication | Multilingual content (5 languages) |
| 12 | Élections | Election readiness index |

## Formule de Scoring Candidats

```
Score Total = (Éducation × 0.15) + (Expérience × 0.20) + (Crédibilité locale × 0.15)
            + (Leadership × 0.15) + (Cotisation × 0.10) + (Formation × 0.10)
            + (Intégrité × 0.10) + (Langue × 0.05)
```

## Installation Rapide / Quick Start

```bash
# 1. Clone and setup
cp .env.example .env.local
# Fill in ANTHROPIC_API_KEY and other values

# 2. Start with Docker
docker-compose up -d

# 3. Or run locally
npm install && npm run dev          # Frontend: http://localhost:3000
cd backend && pip install -r requirements.txt && python main.py  # Backend: http://localhost:8000
```

## Stack Technique

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 16
- **AI**: Anthropic Claude claude-sonnet-4-6
- **Auth**: NextAuth.js
- **Charts**: Recharts

## 26 Provinces de la RDC

Kinshasa • Kongo Central • Kwango • Kwilu • Mai-Ndombe • Équateur • Mongala • Nord-Ubangi • Sud-Ubangi • Tshuapa • Kasaï • Kasaï-Central • Kasaï-Oriental • Lomami • Sankuru • Maniema • Sud-Kivu • Nord-Kivu • Ituri • Haut-Uele • Bas-Uele • Tshopo • Tanganyika • Haut-Lomami • Lualaba • Haut-Katanga

## Cotisation / Membership Fee

- **$5 USD / mois** par membre
- Sans cotisation à jour = aucune éligibilité à la sélection (règle inviolable)
- Statuts: Actif · Période de grâce · Suspendu · Inéligible · Exempté · En examen

---

*"Le Congo d'abord, toujours le Congo !"*

© 2025 Congo D'Abord — CDP-AI OS. Tous droits réservés.
