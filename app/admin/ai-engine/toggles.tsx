'use client';

import { useState } from 'react';

// §23A.7 — engine mode controls. Local-state toggles in the demo environment;
// each switch represents a platform-level routing policy.
const MODES = [
  { key: 'force_cheaper', label: 'Force Cheaper Model', desc: 'Route all non-priority requests to lowest-cost provider' },
  { key: 'max_performance', label: 'Max Performance Mode', desc: 'Route everything to highest-capability provider regardless of cost' },
  { key: 'cost_protection', label: 'Cost Protection Toggle', desc: 'Cap AI spend at daily ceiling — auto-fallback when reached' },
  { key: 'provider_lockout', label: 'Provider Lockout', desc: 'Disable a specific provider for all routing' },
  { key: 'acu_override', label: 'ACU Pricing Override', desc: 'Temporarily adjust ACU multiplier for cost exposure events' },
  { key: 'emergency_shutdown', label: 'Emergency Shutdown', desc: 'Halt all AI processing platform-wide (critical incidents only)', danger: true },
] as const;

export function EngineModeToggles() {
  const [state, setState] = useState<Record<string, boolean>>({ cost_protection: true });
  return (
    <div className="space-y-2.5">
      {MODES.map((m) => {
        const on = !!state[m.key];
        return (
          <div key={m.key} className="flex items-center justify-between gap-3">
            <div>
              <div className={`text-xs font-medium ${'danger' in m && m.danger ? 'text-status-high' : 'text-white'}`}>
                {m.label}
              </div>
              <div className="text-[11px] text-veryx-muted">{m.desc}</div>
            </div>
            <button
              role="switch"
              aria-checked={on}
              onClick={() => {
                if ('danger' in m && m.danger && !on) {
                  if (!confirm('Emergency Shutdown halts ALL AI processing platform-wide. Confirm?')) return;
                }
                setState((s) => ({ ...s, [m.key]: !on }));
              }}
              className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                on ? ('danger' in m && m.danger ? 'bg-status-high' : 'bg-gold-400') : 'bg-white/15'
              }`}
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
