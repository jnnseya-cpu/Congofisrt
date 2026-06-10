import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { agentName, message } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 503 }
      );
    }

    const systemPrompt = `Tu es ${agentName}, un agent IA spécialisé du système Le Congo D'Abord du parti politique "Le Congo D'Abord" en République Démocratique du Congo.

Le parti est fondé par Mr Justin Nseya, Président et Fondateur. Il est le premier parti politique congolais assisté par intelligence artificielle.

Contexte du parti:
- 26 provinces couvertes
- ~35,000 membres inscrits
- Cotisation mensuelle obligatoire: $5 USD
- 12 agents IA spécialisés
- Formule de scoring candidats: Education (15%) + Expérience (20%) + Crédibilité locale (15%) + Leadership (15%) + Cotisation (10%) + Formation (10%) + Intégrité (10%) + Langue (5%)
- Règle inviolable: Sans cotisation à jour = pas d'éligibilité à la sélection

Réponds en français par défaut, sauf si demandé autrement. Sois précis, professionnel et ancré dans le contexte de la RDC.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return NextResponse.json({ error: 'AI service error' }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data.content?.[0]?.text || 'Désolé, je ne peux pas répondre pour le moment.';

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
