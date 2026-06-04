'use client';

import { User, MapPin, Briefcase, BookOpen, Phone, Mail } from 'lucide-react';
import ContributionBadge from './ContributionBadge';
import type { Member } from '@/lib/types';

interface MemberCardProps {
  member: Member;
  compact?: boolean;
  onView?: (member: Member) => void;
}

export default function MemberCard({ member, compact = false, onView }: MemberCardProps) {
  const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors cursor-pointer" onClick={() => onView?.(member)}>
        <div className="w-10 h-10 rounded-full bg-drc-green text-white flex items-center justify-center font-bold text-sm shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{member.firstName} {member.lastName}</p>
          <p className="text-xs text-gray-500 truncate">{member.role}</p>
        </div>
        <ContributionBadge status={member.contributionStatus} showIcon={false} size="sm" />
      </div>
    );
  }

  return (
    <div className="card-hover overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-drc-green to-drc-green-dark p-4 -m-6 mb-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-drc-yellow text-drc-green-dark flex items-center justify-center font-black text-xl shrink-0 shadow-md">
          {initials}
        </div>
        <div>
          <h3 className="font-bold text-white text-lg leading-tight">{member.firstName} {member.lastName}</h3>
          <p className="text-green-200 text-sm">{member.role}</p>
          <ContributionBadge status={member.contributionStatus} size="sm" />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-drc-green shrink-0" />
          <span className="truncate">
            {[member.location.commune, member.location.territory, member.location.province].filter(Boolean).join(', ') || member.location.country}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Briefcase className="w-4 h-4 text-drc-green shrink-0" />
          <span className="truncate">{member.work.jobTitle || 'Non renseigné'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <BookOpen className="w-4 h-4 text-drc-green shrink-0" />
          <span>{member.education.level} {member.education.field ? `— ${member.education.field}` : ''}</span>
        </div>
        {member.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-drc-green shrink-0" />
            <span className="truncate">{member.email}</span>
          </div>
        )}
        {member.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-drc-green shrink-0" />
            <span>{member.phone}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <User className="w-3 h-3" />
          <span>Membre depuis {new Date(member.memberSince).getFullYear()}</span>
        </div>
        {onView && (
          <button
            onClick={() => onView(member)}
            className="text-xs text-drc-green font-semibold hover:underline"
          >
            Voir le profil →
          </button>
        )}
      </div>
    </div>
  );
}
