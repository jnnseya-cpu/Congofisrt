'use client';

import { CheckCircle, Clock, XCircle, AlertCircle, MinusCircle, Search } from 'lucide-react';
import type { ContributionStatus } from '@/lib/types';

interface ContributionBadgeProps {
  status: ContributionStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<ContributionStatus, {
  label: string;
  labelFr: string;
  className: string;
  icon: React.FC<{ className?: string }>;
}> = {
  'Active': {
    label: 'Active',
    labelFr: 'Actif',
    className: 'badge-active',
    icon: CheckCircle,
  },
  'Grace Period': {
    label: 'Grace Period',
    labelFr: 'Période de grâce',
    className: 'badge-grace',
    icon: Clock,
  },
  'Suspended': {
    label: 'Suspended',
    labelFr: 'Suspendu',
    className: 'badge-suspended',
    icon: XCircle,
  },
  'Ineligible': {
    label: 'Ineligible',
    labelFr: 'Inéligible',
    className: 'badge-ineligible',
    icon: MinusCircle,
  },
  'Exempted': {
    label: 'Exempted',
    labelFr: 'Exempté',
    className: 'badge-exempted',
    icon: AlertCircle,
  },
  'Under Review': {
    label: 'Under Review',
    labelFr: 'En examen',
    className: 'badge-grace',
    icon: Search,
  },
};

export default function ContributionBadge({ status, showIcon = true, size = 'sm' }: ContributionBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const sizeClass = size === 'lg' ? 'text-sm px-3 py-1.5' : size === 'md' ? 'text-xs px-2.5 py-1' : 'text-xs px-2 py-0.5';

  return (
    <span className={`${config.className} ${sizeClass} inline-flex items-center gap-1 rounded-full font-semibold`}>
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />}
      {config.labelFr}
    </span>
  );
}
