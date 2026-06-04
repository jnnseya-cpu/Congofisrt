'use client';

import { MapPin, Users, TrendingUp, Star } from 'lucide-react';
import { DRC_PROVINCES } from '@/lib/provinces';
import type { Province } from '@/lib/types';

interface ProvinceMapProps {
  selectedProvince?: string;
  onSelectProvince?: (province: Province) => void;
  compact?: boolean;
}

export default function ProvinceMap({ selectedProvince, onSelectProvince, compact = false }: ProvinceMapProps) {
  const sorted = [...DRC_PROVINCES].sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
  const maxMembers = Math.max(...DRC_PROVINCES.map(p => p.memberCount || 0));

  if (compact) {
    return (
      <div className="space-y-2">
        {sorted.slice(0, 8).map(province => {
          const pct = ((province.memberCount || 0) / maxMembers) * 100;
          const isSelected = selectedProvince === province.id;
          return (
            <div
              key={province.id}
              className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                isSelected ? 'bg-green-50 border border-drc-green' : 'hover:bg-gray-50 border border-transparent'
              }`}
              onClick={() => onSelectProvince?.(province)}
            >
              <MapPin className="w-3.5 h-3.5 text-drc-green shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 truncate">{province.name}</span>
                  <span className="text-xs font-bold text-drc-green ml-2">{(province.memberCount || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-drc-green transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        <p className="text-xs text-gray-400 text-center pt-1">Affichage Top 8 provinces</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map(province => {
          const pct = ((province.memberCount || 0) / maxMembers) * 100;
          const activePct = province.memberCount
            ? Math.round(((province.activeContributors || 0) / province.memberCount) * 100)
            : 0;
          const isSelected = selectedProvince === province.id;

          return (
            <div
              key={province.id}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-green-50 border-drc-green shadow-md'
                  : 'bg-white border-gray-100 hover:border-drc-green hover:shadow-sm'
              }`}
              onClick={() => onSelectProvince?.(province)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{province.name}</h4>
                  <p className="text-xs text-gray-400">{province.capital}</p>
                </div>
                {province.electionReadiness && province.electionReadiness >= 65 && (
                  <Star className="w-4 h-4 text-drc-yellow fill-drc-yellow" />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Membres
                  </span>
                  <span className="font-bold text-drc-green">{(province.memberCount || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-drc-green"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Actifs
                  </span>
                  <span className={`font-bold ${activePct >= 70 ? 'text-green-600' : activePct >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                    {activePct}%
                  </span>
                </div>

                {province.electionReadiness && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Préparation élec.</span>
                    <span className={`font-bold ${province.electionReadiness >= 60 ? 'text-green-600' : 'text-orange-500'}`}>
                      {province.electionReadiness}%
                    </span>
                  </div>
                )}

                {province.leaderName && (
                  <div className="text-xs text-gray-400 truncate">
                    <span className="font-medium text-gray-600">Coord: </span>{province.leaderName}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
