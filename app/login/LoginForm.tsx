'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

const DEMO_ACCOUNTS = [
  { label: 'Platform Super Admin', email: 'admin@veryx.io', target: '/admin' },
  { label: 'Enterprise Business Owner', email: 'owner@nseya-digital.com', target: '/business' },
  { label: 'Programme Director (Projects)', email: 'pm@nseya-digital.com', target: '/projects' },
];

export function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState('Veryx!2026');
  const [error, setError] = useState<string | null>(null);

  const submit = (targetEmail?: string) =>
    startTransition(async () => {
      setError(null);
      const useEmail = targetEmail ?? email;
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: useEmail, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message ?? 'Sign-in failed');
        return;
      }
      const role: string = json.data.user.role;
      const target =
        role === 'super_admin' ? '/admin' : role === 'team_member' ? '/projects' : '/business';
      router.push(target);
      router.refresh();
    });

  return (
    <div className="mt-5 space-y-4">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div>
          <label className="vx-label">Email</label>
          <input
            className="vx-input mt-1"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="vx-label">Password</label>
          <input
            className="vx-input mt-1"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error && <p className="text-xs text-status-high">{error}</p>}
        <button className="vx-btn-primary w-full justify-center !py-2.5" disabled={pending}>
          {pending ? 'Authenticating…' : 'Sign in'}
        </button>
      </form>

      <div className="border-t border-veryx-border pt-4">
        <p className="vx-label mb-2">Quick access — demo roles</p>
        <div className="space-y-1.5">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              className="vx-btn w-full justify-between"
              disabled={pending}
              onClick={() => {
                setEmail(acc.email);
                submit(acc.email);
              }}
            >
              <span>{acc.label}</span>
              <span className="text-veryx-muted">{acc.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
