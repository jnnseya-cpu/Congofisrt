import { Pill } from './ui';
import { ActionButton } from './client';
import { severityColor } from '@/lib/utils';
import { Sparkles, ShieldAlert } from 'lucide-react';
import type { Recommendation, ThreatAlert } from '@prisma/client';

/** VERYX Insight Card Format (§23 intro): every AI recommendation card. */
export function InsightCard({ rec }: { rec: Recommendation }) {
  const tone = rec.severity === 'high' ? 'high' : rec.severity === 'medium' ? 'warn' : 'info';
  return (
    <div className="vx-card flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold-300" />
          <h4 className="text-sm font-semibold text-white">{rec.title}</h4>
        </div>
        <Pill tone={tone}>{rec.severity.toUpperCase()}</Pill>
      </div>
      <p className="text-xs leading-relaxed text-slate-300">{rec.detail}</p>
      {rec.impact && (
        <p className="text-xs text-veryx-muted">
          <span className="font-medium text-slate-300">Impact:</span> {rec.impact}
        </p>
      )}
      <div className="mt-1 flex items-center justify-between">
        <span className="text-[11px] text-veryx-muted">
          {rec.agentType ? rec.agentType.replace(/_/g, ' ') : 'AI engine'}
          {typeof rec.confidence === 'number' ? ` · ${rec.confidence}% confidence` : ''}
        </span>
        <div className="flex gap-1.5">
          <ActionButton
            label="Dismiss"
            href={`/api/v1/recommendations/${rec.id}`}
            body={{ status: 'dismissed' }}
          />
          <ActionButton
            label={rec.action ?? 'Act now'}
            href={`/api/v1/recommendations/${rec.id}`}
            body={{ status: 'actioned' }}
            variant="primary"
            doneLabel="Actioned ✓"
          />
        </div>
      </div>
    </div>
  );
}

/** Threat card with severity, impact, owner, time, and Act Now pathway (§23A.6). */
export function ThreatCard({ threat }: { threat: ThreatAlert }) {
  return (
    <div className={`vx-card border-l-2 p-4 ${severityColor(threat.severity)} !bg-veryx-card/80`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          <h4 className="text-sm font-semibold text-white">{threat.type}</h4>
        </div>
        <Pill tone={threat.severity === 'HIGH' ? 'high' : threat.severity === 'MEDIUM' ? 'warn' : 'info'}>
          {threat.severity}
        </Pill>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-300">
        <span className="font-medium text-slate-200">Estimated impact:</span> {threat.impact}
      </p>
      <p className="mt-1 text-xs text-veryx-muted">
        Detected {threat.detectedAt.toISOString().slice(0, 16).replace('T', ' ')} UTC · owner:{' '}
        {threat.owner}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] text-veryx-muted">{threat.action}</span>
        <div className="flex shrink-0 gap-1.5">
          <ActionButton
            label="Review"
            href={`/api/v1/threats/${threat.id}`}
            body={{ status: 'reviewing' }}
          />
          <ActionButton
            label="Act Now"
            href={`/api/v1/threats/${threat.id}`}
            body={{ status: 'resolved' }}
            variant="primary"
            doneLabel="Resolved ✓"
          />
        </div>
      </div>
    </div>
  );
}
