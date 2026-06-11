import Link from 'next/link';
import { LoginForm } from './LoginForm';

export const metadata = { title: 'Sign in — VERYX' };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400 font-mono font-bold text-navy-950">
            VX
          </span>
          <div className="leading-tight">
            <div className="text-lg font-bold tracking-wide text-white">VERYX</div>
            <div className="text-[10px] uppercase tracking-widest text-veryx-muted">
              AI Infrastructure OS
            </div>
          </div>
        </Link>
        <div className="vx-card p-6">
          <h1 className="text-lg font-semibold text-white">Sign in to your Command Centre</h1>
          <p className="mt-1 text-xs text-veryx-muted">
            JWT sessions · 15-minute access tokens · role-routed dashboards
          </p>
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-[11px] text-veryx-muted">
          Demo environment — seeded accounts use the password <code className="text-gold-300">Veryx!2026</code>
        </p>
      </div>
    </div>
  );
}
