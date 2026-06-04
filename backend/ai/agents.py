"""
CDP-AI OS — 12 AI Agents Implementation
Powered by Anthropic Claude (claude-sonnet-4-6)
"""

import anthropic
import os
from datetime import datetime
from typing import Optional, Dict, Any, List

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
MODEL = "claude-sonnet-4-6"

PARTY_SYSTEM_CONTEXT = """Tu es un agent IA du CDP-AI OS, le système d'exploitation du parti politique
"Congo D'Abord" en République Démocratique du Congo (RDC).

Fondateur & Président: Mr Justin Nseya
Tagline: "Le premier parti politique congolais dirigé par des citoyens, renforcé par l'intelligence artificielle"

Contexte RDC:
- 26 provinces: Kinshasa, Kongo Central, Kwango, Kwilu, Mai-Ndombe, Équateur, Mongala, Nord-Ubangi, 
  Sud-Ubangi, Tshuapa, Kasaï, Kasaï-Central, Kasaï-Oriental, Lomami, Sankuru, Maniema, Sud-Kivu, 
  Nord-Kivu, Ituri, Haut-Uele, Bas-Uele, Tshopo, Tanganyika, Haut-Lomami, Lualaba, Haut-Katanga
- 5 langues officielles: Français, Lingala, Kikongo, Tshiluba, Kiswahili
- Population: ~100 millions d'habitants

Formule de scoring candidats (total sur 100):
- Éducation: 15% | Expérience: 20% | Crédibilité locale: 15% | Leadership: 15%
- Cotisation: 10% | Formation: 10% | Intégrité: 10% | Langue: 5%

RÈGLE INVIOLABLE: Sans cotisation ($5/mois) à jour = AUCUNE éligibilité à la sélection.

Cotisation:
- Active: éligible à tout
- Période de grâce: éligible avec restriction
- Suspendu/Inéligible: aucune sélection possible

Réponds toujours en français par défaut. Sois précis, professionnel et ancré dans le contexte congolais.
L'IA propose, les humains décident. Ne prends jamais de décisions finales."""


def run_agent(agent_type: str, context: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """Generic agent runner using Claude claude-sonnet-4-6."""
    
    agent_configs = {
        "registration": {
            "name": "Agent d'Inscription",
            "description": "Valide et guide l'inscription des nouveaux membres",
            "instruction": "Analyse le profil d'inscription soumis et fournis: 1) validation des données, 2) suggestions de complétion, 3) positionnement suggéré dans la structure, 4) prochaines étapes recommandées.",
        },
        "mapping": {
            "name": "Agent de Cartographie Administrative",
            "description": "Mappe les membres dans la structure administrative de la RDC",
            "instruction": "Identifie et mappe précisément la localisation administrative du membre (province, territoire, commune, secteur, village) dans la hiérarchie CDP. Si diaspora, identifie le bureau diaspora le plus proche.",
        },
        "cv-analysis": {
            "name": "Agent d'Analyse CV",
            "description": "Évalue les profils éducatifs et professionnels",
            "instruction": "Analyse le profil fourni selon les 8 critères de scoring CDP. Pour chaque critère, donne un score numérique (0-100) et une justification. Calcule le score total pondéré. Identifie les forces et lacunes.",
        },
        "candidate-selection": {
            "name": "Agent de Sélection de Candidats",
            "description": "Recommande les Top 3 candidats pour chaque rôle",
            "instruction": "Parmi les candidats fournis, sélectionne et classifie les 3 meilleurs pour le rôle spécifié. Vérifie d'abord le statut de cotisation (éliminatoire). Pour chaque candidat sélectionné: score détaillé, justification, forces, risques, et recommandation finale.",
        },
        "role-matching": {
            "name": "Agent de Matching des Rôles",
            "description": "Associe les membres aux rôles selon leurs compétences",
            "instruction": "Analyse les compétences du membre et suggère les 3 rôles qui correspondent le mieux à son profil dans la structure CDP. Pour chaque rôle suggéré: niveau d'adéquation, compétences à développer, délai estimé avant maturité.",
        },
        "policy": {
            "name": "Agent Intelligence Politique",
            "description": "Génère et analyse des propositions de politiques publiques",
            "instruction": "Génère une proposition de politique publique structurée incluant: contexte, problème identifié, solution proposée, bénéficiaires, budget estimé, timeline, indicateurs de succès, risques et mitigations. Base-toi sur les meilleures pratiques africaines.",
        },
        "infrastructure": {
            "name": "Agent Infrastructure",
            "description": "Identifie et priorise les besoins d'infrastructure",
            "instruction": "Analyse les besoins d'infrastructure soumis et produis: classification par sévérité (Critique/Élevé/Moyen/Faible), population affectée, coût estimé, délai de résolution recommandé, et propositions de solutions pragmatiques pour le contexte congolais.",
        },
        "finance": {
            "name": "Agent Finance et Cotisations",
            "description": "Gère la transparence financière et le suivi des cotisations",
            "instruction": "Analyse les données financières soumises et produis: état des cotisations, taux de recouvrement, membres à risque de suspension, projection de revenus, recommandations pour améliorer le taux de cotisation.",
        },
        "training": {
            "name": "Agent Académie Politique",
            "description": "Recommande des parcours de formation personnalisés",
            "instruction": "En fonction du profil du membre et de ses objectifs politiques, génère un parcours de formation personnalisé: modules prioritaires, ordre recommandé, ressources complémentaires, timeline réaliste, et impact attendu sur le score de sélection.",
        },
        "ethics": {
            "name": "Agent Éthique et Discipline",
            "description": "Analyse les cas d'éthique et recommande des sanctions",
            "instruction": "Analyse le cas d'éthique soumis et produis: classification du type de violation, évaluation de la gravité, précédents similaires dans d'autres partis africains, sanctions recommandées proportionnelles, impact sur le score d'intégrité, mesures préventives futures.",
        },
        "communication": {
            "name": "Agent Communication",
            "description": "Génère des communications partisanes en 5 langues",
            "instruction": "Crée le message de communication demandé et traduis-le dans les 5 langues nationales de la RDC (Français, Lingala, Kikongo, Tshiluba, Kiswahili). Adapte le registre et le style culturel à chaque langue.",
        },
        "election-readiness": {
            "name": "Agent Préparation Électorale",
            "description": "Calcule l'indice de préparation électorale",
            "instruction": "Calcule et présente l'indice de préparation électorale global et par province basé sur: couverture géographique, taux de cotisation, nombre de candidats qualifiés, taux de formation, présence de leadership à tous niveaux. Donne un score sur 100 et un plan d'action pour les zones faibles.",
        },
    }

    config = agent_configs.get(agent_type, {
        "name": f"Agent {agent_type}",
        "description": "Agent générique CDP-AI",
        "instruction": "Analyse le contexte fourni et donne des recommandations pertinentes pour le parti Congo D'Abord.",
    })

    user_message = f"""
AGENT: {config['name']}
TÂCHE: {config['instruction']}

CONTEXTE SOUMIS:
{context}

DONNÉES:
{str(payload)}

Génère une réponse structurée, précise et actionnable.
"""

    response = client.messages.create(
        model=MODEL,
        max_tokens=2000,
        system=PARTY_SYSTEM_CONTEXT,
        messages=[{"role": "user", "content": user_message}],
    )

    return {
        "agentType": agent_type,
        "agentName": config["name"],
        "result": response.content[0].text,
        "confidence": 0.85,
        "generatedAt": datetime.utcnow().isoformat(),
        "tokensUsed": response.usage.input_tokens + response.usage.output_tokens,
    }


def calculate_candidate_scores(member_data: Dict[str, Any]) -> Dict[str, float]:
    """Calculate CDP scoring formula for a member."""
    education_score = member_data.get("education_score", 50)
    work_score = member_data.get("work_score", 50)
    local_credibility = member_data.get("local_credibility_score", 50)
    leadership_score = member_data.get("leadership_score", 50)
    contribution_status = member_data.get("contribution_status", "Ineligible")
    training_completion = member_data.get("training_completion", 0)
    integrity_score = member_data.get("integrity_score", 100)
    languages = member_data.get("languages_spoken", [])

    # Contribution status score
    contrib_scores = {
        "Active": 100, "Grace Period": 60, "Exempted": 80,
        "Under Review": 40, "Suspended": 0, "Ineligible": 0,
    }
    contribution_score = contrib_scores.get(contribution_status, 0)

    # Language score
    language_score = min(100, (len(languages) / 5) * 100)

    # Weighted total
    total = (
        education_score * 0.15 +
        work_score * 0.20 +
        local_credibility * 0.15 +
        leadership_score * 0.15 +
        contribution_score * 0.10 +
        training_completion * 0.10 +
        integrity_score * 0.10 +
        language_score * 0.05
    )

    return {
        "education": round(education_score, 1),
        "workExperience": round(work_score, 1),
        "localCredibility": round(local_credibility, 1),
        "leadership": round(leadership_score, 1),
        "contributionStatus": round(contribution_score, 1),
        "trainingCompletion": round(training_completion, 1),
        "integrityScore": round(integrity_score, 1),
        "languageAbility": round(language_score, 1),
        "total": round(total, 1),
    }


def generate_candidate_recommendation(
    candidates: List[Dict[str, Any]],
    role: str,
    constituency: str,
    language: str = "fr"
) -> Dict[str, Any]:
    """Use AI to generate top 3 candidate recommendations."""
    
    # First filter by contribution status
    eligible = [c for c in candidates if c.get("contribution_status") == "Active" 
                or c.get("contribution_status") == "Exempted"]
    
    if not eligible:
        return {"error": "Aucun candidat éligible (cotisation requise)"}

    # Score all candidates
    scored = []
    for candidate in eligible:
        scores = calculate_candidate_scores(candidate)
        scored.append({"candidate": candidate, "scores": scores})

    # Sort by total score
    scored.sort(key=lambda x: x["scores"]["total"], reverse=True)
    top3 = scored[:3]

    # Generate AI justification
    candidates_summary = "\n".join([
        f"- {c['candidate'].get('first_name', '')} {c['candidate'].get('last_name', '')}: "
        f"Score total {c['scores']['total']}/100 "
        f"(Éducation:{c['scores']['education']}, Expérience:{c['scores']['workExperience']}, "
        f"Crédibilité:{c['scores']['localCredibility']}, Leadership:{c['scores']['leadership']}, "
        f"Intégrité:{c['scores']['integrityScore']})"
        for c in top3
    ])

    prompt = f"""Pour le rôle de {role} dans la circonscription de {constituency}, 
voici les 3 candidats sélectionnés par l'algorithme CDP-AI:

{candidates_summary}

Pour chaque candidat, génère une justification concise (2-3 phrases) expliquant pourquoi 
ce candidat est recommandé pour ce rôle spécifique. Base-toi sur leurs scores et le contexte local congolais."""

    response = client.messages.create(
        model=MODEL,
        max_tokens=800,
        system=PARTY_SYSTEM_CONTEXT,
        messages=[{"role": "user", "content": prompt}],
    )

    return {
        "role": role,
        "constituency": constituency,
        "recommendations": [
            {
                "rank": i + 1,
                "member": top3[i]["candidate"],
                "scores": top3[i]["scores"],
            }
            for i in range(len(top3))
        ],
        "aiJustification": response.content[0].text,
        "generatedAt": datetime.utcnow().isoformat(),
    }
