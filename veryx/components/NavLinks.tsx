'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Bot,
  Boxes,
  CircuitBoard,
  ClipboardList,
  Coins,
  Cpu,
  FileText,
  Gauge,
  LayoutDashboard,
  Link2,
  ScrollText,
  Settings,
  ShieldAlert,
  TrendingUp,
  Users,
  Wallet,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  performance: BarChart3,
  ai: Cpu,
  acu: Coins,
  users: Users,
  risk: ShieldAlert,
  system: CircuitBoard,
  predictive: TrendingUp,
  audit: ScrollText,
  workflow: Workflow,
  agents: Bot,
  wallet: Wallet,
  reports: FileText,
  integrations: Link2,
  settings: Settings,
  domains: Boxes,
  schedule: Gauge,
  packages: ClipboardList,
  activity: Activity,
};

export interface PlainNavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
}

export function NavLinks({ items }: { items: PlainNavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
      {items.map((item) => {
        const isActive =
          item.href === pathname ||
          (item.href.split('/').length > 2 && pathname.startsWith(`${item.href}/`));
        const Icon = ICONS[item.icon] ?? LayoutDashboard;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition ${
              isActive
                ? 'bg-gold-400/15 font-semibold text-gold-300'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
