'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

/** Live UTC clock for the global header (§23A.1). */
export function UtcClock() {
  const [now, setNow] = useState<string>('');
  useEffect(() => {
    const tick = () => setNow(new Date().toISOString().slice(11, 19));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono tabular-nums text-slate-300" suppressHydrationWarning>
      {now} UTC
    </span>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="vx-btn !px-2"
      title="Sign out"
      onClick={async () => {
        await fetch('/api/v1/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
      }}
    >
      <LogOut className="h-3.5 w-3.5" />
    </button>
  );
}

/** Generic PATCH action button that refreshes the page data on success. */
export function ActionButton({
  label,
  href,
  body,
  variant = 'default',
  doneLabel,
}: {
  label: string;
  href: string;
  body: Record<string, unknown>;
  variant?: 'default' | 'primary' | 'danger';
  doneLabel?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const cls =
    variant === 'primary'
      ? 'vx-btn-primary'
      : variant === 'danger'
        ? 'vx-btn !border-status-high/40 !text-status-high hover:!bg-status-high/10'
        : 'vx-btn';
  return (
    <button
      className={cls}
      disabled={pending || done}
      onClick={() =>
        startTransition(async () => {
          const res = await fetch(href, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (res.ok) {
            setDone(true);
            router.refresh();
          }
        })
      }
    >
      {pending ? '…' : done && doneLabel ? doneLabel : label}
    </button>
  );
}

/** Execute an agent and surface its output inline (§6.5 agent management). */
export function AgentRunner({ agentType, acuCost }: { agentType: string; acuCost: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [output, setOutput] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        className="vx-btn-primary"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await fetch(`/api/v1/agents/${agentType}/execute`, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ input: { invoked_from: 'command_centre' } }),
            });
            const json = await res.json();
            if (!res.ok) {
              setError(json?.error?.message ?? 'Execution failed');
              return;
            }
            setOutput(json.data.output);
            router.refresh();
          })
        }
      >
        {pending ? 'Executing…' : `Run · ${acuCost} ACU`}
      </button>
      {error && <p className="mt-2 text-xs text-status-high">{error}</p>}
      {output && (
        <pre className="mt-2 max-h-48 overflow-auto rounded-lg border border-veryx-border bg-navy-950/80 p-2.5 text-[11px] leading-relaxed text-gold-100">
          {JSON.stringify(output, null, 2)}
        </pre>
      )}
    </div>
  );
}

/** ACU tier purchase button (§12.2 purchase tiers). */
export function AcuPurchaseButton({ units, priceGbp }: { units: number; priceGbp: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  return (
    <button
      className="vx-btn-primary w-full justify-center"
      disabled={pending || done}
      onClick={() =>
        startTransition(async () => {
          const res = await fetch('/api/v1/acu/purchase', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ units }),
          });
          if (res.ok) {
            setDone(true);
            router.refresh();
            setTimeout(() => setDone(false), 2500);
          }
        })
      }
    >
      {pending ? 'Processing…' : done ? 'Credited ✓' : `Buy ${units.toLocaleString()} · £${priceGbp.toLocaleString()}`}
    </button>
  );
}

/** Demo payment trigger for the payments screen (BitriPay sandbox). */
export function DemoPaymentButton({
  channel,
  amount,
  currency,
}: {
  channel: string;
  amount: number;
  currency: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      className="vx-btn"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await fetch('/api/v1/payments/initiate', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              amount,
              currency,
              channel,
              gateway: 'bitripay',
              customer_ref: 'demo-customer',
              idempotency_key: `demo-${channel}-${Date.now()}`,
            }),
          });
          router.refresh();
        })
      }
    >
      {pending ? '…' : `Simulate ${currency} ${amount.toLocaleString()} via ${channel}`}
    </button>
  );
}
