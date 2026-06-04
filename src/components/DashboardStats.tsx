'use client';

import { Users, TrendingUp, Globe, AlertTriangle, Shield, BookOpen, Map, DollarSign } from 'lucide-react';

interface StatCard {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
  trend?: string;
}

interface DashboardStatsProps {
  stats: {
    totalMembers: number;
    membersInDRC: number;
    diasporaMembers: number;
    activeContributors: number;
    monthlyRevenue: number;
    electionReadiness: number;
    integrityAlerts: number;
    trainingCompletion: number;
    provincesCovered: number;
    infrastructureNeeds: number;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const cards: StatCard[] = [
    {
      label: 'Membres au total',
      value: stats.totalMembers.toLocaleString(),
      sub: `dont ${stats.diasporaMembers.toLocaleString()} diaspora`,
      icon: Users,
      color: 'text-drc-green',
      bg: 'bg-green-50',
      trend: '+12% ce mois',
    },
    {
      label: 'Membres en RDC',
      value: stats.membersInDRC.toLocaleString(),
      sub: 'dans les 26 provinces',
      icon: Map,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Cotisants actifs',
      value: stats.activeContributors.toLocaleString(),
      sub: `${Math.round((stats.activeContributors / stats.totalMembers) * 100)}% des membres`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Recettes mensuelles',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      sub: 'USD / mois',
      icon: DollarSign,
      color: 'text-yellow-700',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Provinces couvertes',
      value: `${stats.provincesCovered}/26`,
      sub: 'entités provinciales',
      icon: Globe,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Indice élections',
      value: `${stats.electionReadiness}%`,
      sub: 'préparation nationale',
      icon: Shield,
      color: 'text-drc-green',
      bg: 'bg-green-50',
    },
    {
      label: 'Taux de formation',
      value: `${stats.trainingCompletion}%`,
      sub: 'modules complétés',
      icon: BookOpen,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Alertes intégrité',
      value: stats.integrityAlerts,
      sub: 'cas en cours',
      icon: AlertTriangle,
      color: stats.integrityAlerts > 5 ? 'text-drc-red' : 'text-orange-500',
      bg: stats.integrityAlerts > 5 ? 'bg-red-50' : 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight">{card.label}</p>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
            {card.sub && <p className="text-xs text-gray-400">{card.sub}</p>}
            {card.trend && (
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {card.trend}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
