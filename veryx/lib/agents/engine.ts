import { randomUUID } from 'crypto';
import { db } from '../db';
import { audit } from '../audit';
import { ACU_COSTS, consumeAcu, InsufficientAcuError } from '../acu';
import { agentByType, type AgentDefinition } from './registry';

// ── Agent execution engine ───────────────────────────────────────────────────
// Implements the inference pipeline of Blueprint §9.5: route → bill ACU →
// execute → persist trace → audit. Runs in deterministic simulation mode by
// default; if ANTHROPIC_API_KEY is set, reasoning is delegated to a live LLM.

export interface ExecuteResult {
  executionId: string;
  status: 'completed' | 'failed';
  output: Record<string, unknown> | null;
  acuConsumed: number;
  durationMs: number;
  error?: string;
}

async function liveLlmReasoning(
  agent: AgentDefinition,
  input: Record<string, unknown>
): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: `You are the VERYX ${agent.name} (${agent.category}). ${agent.description} Respond with concise, actionable business intelligence as JSON with a "summary" field plus structured findings.`,
        messages: [{ role: 'user', content: JSON.stringify(input ?? {}) }],
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      return { summary: text };
    }
  } catch {
    return null; // graceful fallback to simulation
  }
}

export async function executeAgent(opts: {
  tenantId: string;
  agentType: string;
  input?: Record<string, unknown>;
  triggerType?: 'scheduled' | 'event' | 'user_invoked' | 'agent_chain';
  actorId?: string;
}): Promise<ExecuteResult> {
  const agent = agentByType(opts.agentType);
  if (!agent) throw new Error(`Unknown agent type: ${opts.agentType}`);

  const acuCost = ACU_COSTS[agent.acuAction];
  const traceId = randomUUID();
  const started = Date.now();

  // ACU is deducted on queue (Blueprint §11.3).
  await consumeAcu({
    tenantId: opts.tenantId,
    amount: acuCost,
    reason: `agent.${agent.type}`,
    refType: 'execution',
    refId: traceId,
  });

  const execution = await db.agentExecution.create({
    data: {
      tenantId: opts.tenantId,
      agentType: agent.type,
      triggerType: opts.triggerType ?? 'user_invoked',
      status: 'running',
      inputPayload: JSON.stringify(opts.input ?? {}),
      acuConsumed: acuCost,
      traceId,
    },
  });

  try {
    const live = await liveLlmReasoning(agent, opts.input ?? {});
    const output = live ?? agent.simulate(opts.input ?? {});
    const durationMs = Date.now() - started;

    await db.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: 'completed',
        outputPayload: JSON.stringify(output),
        modelUsed: live ? 'claude-sonnet-4-6' : 'veryx-sim-1',
        durationMs,
        completedAt: new Date(),
      },
    });
    await audit({
      tenantId: opts.tenantId,
      actorId: opts.actorId,
      actorType: 'agent',
      action: `agent.executed.${agent.type}`,
      resourceType: 'agent_execution',
      resourceId: execution.id,
    });
    return { executionId: execution.id, status: 'completed', output, acuConsumed: acuCost, durationMs };
  } catch (e) {
    const durationMs = Date.now() - started;
    const message = e instanceof Error ? e.message : 'execution failed';
    await db.agentExecution.update({
      where: { id: execution.id },
      data: { status: 'failed', errorMessage: message, durationMs, completedAt: new Date() },
    });
    return {
      executionId: execution.id,
      status: 'failed',
      output: null,
      acuConsumed: acuCost,
      durationMs,
      error: message,
    };
  }
}

export { InsufficientAcuError };
