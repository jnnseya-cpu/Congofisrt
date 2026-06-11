'use client';

import { useState } from 'react';

const FLAGS = [
  { key: 'workflow_engine', label: 'Workflow Automation Engine', scope: 'All tiers', on: true },
  { key: 'bitripay_live', label: 'BitriPay Production Rails', scope: 'Enterprise+', on: false },
  { key: 'agent_marketplace', label: 'Agent Marketplace (beta)', scope: 'Experimental', on: false },
  { key: 'finance_pack', label: 'Industry Pack — Finance', scope: 'Business+', on: true },
  { key: 'legal_pack', label: 'Industry Pack — Legal', scope: 'Business+', on: false },
  { key: 'healthcare_pack', label: 'Industry Pack — Healthcare', scope: 'Enterprise', on: false },
  { key: 'voice_interface', label: 'Voice Agent Interface', scope: 'Experimental', on: false },
];

export function FeatureFlagToggles() {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(FLAGS.map((f) => [f.key, f.on]))
  );
  return (
    <div className="space-y-2.5">
      {FLAGS.map((f) => {
        const on = !!state[f.key];
        return (
          <div key={f.key} className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-white">{f.label}</div>
              <div className="text-[11px] text-veryx-muted">{f.scope}</div>
            </div>
            <button
              role="switch"
              aria-checked={on}
              onClick={() => setState((s) => ({ ...s, [f.key]: !on }))}
              className={`relative h-5 w-9 shrink-0 rounded-full transition ${on ? 'bg-gold-400' : 'bg-white/15'}`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                  on ? 'left-[18px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
