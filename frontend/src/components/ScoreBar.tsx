'use client';

import { getScoreColor, getScoreLabel } from '@/lib/scoring';

interface ScoreBarProps {
  label: string;
  score: number;
  weight?: number;
  showLabel?: boolean;
  compact?: boolean;
}

export default function ScoreBar({ label, score, weight, showLabel = true, compact = false }: ScoreBarProps) {
  const color = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-24 shrink-0 truncate">{label}</span>
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{ width: `${score}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xs font-bold w-8 text-right" style={{ color }}>{score}</span>
      </div>
    );
  }

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">
          {label}{weight ? <span className="text-gray-400 ml-1">({Math.round(weight * 100)}%)</span> : ''}
        </span>
        <div className="flex items-center gap-1.5">
          {showLabel && (
            <span className="text-xs font-medium" style={{ color }}>{scoreLabel}</span>
          )}
          <span className="text-sm font-bold" style={{ color }}>{score}/100</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className="h-2.5 rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
