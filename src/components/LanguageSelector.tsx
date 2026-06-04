'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import type { Language } from '@/lib/translations';
import { LANGUAGE_NAMES } from '@/lib/translations';

interface LanguageSelectorProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const FLAG_EMOJI: Record<Language, string> = {
  fr: '🇫🇷',
  ln: '🇨🇩',
  kg: '🇨🇩',
  ts: '🇨🇩',
  sw: '🇰🇪',
};

export default function LanguageSelector({ language, setLanguage }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const langs = Object.entries(LANGUAGE_NAMES) as [Language, string][];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-drc-green bg-gray-50 hover:bg-green-50 border border-gray-200 rounded-lg px-3 py-2 transition-all"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{FLAG_EMOJI[language]} {LANGUAGE_NAMES[language]}</span>
        <span className="sm:hidden">{FLAG_EMOJI[language]}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Langue / Language</p>
          </div>
          {langs.map(([code, name]) => (
            <button
              key={code}
              onClick={() => { setLanguage(code); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-green-50 transition-colors ${
                language === code ? 'text-drc-green font-semibold bg-green-50' : 'text-gray-700'
              }`}
            >
              <span className="text-base">{FLAG_EMOJI[code]}</span>
              <span>{name}</span>
              {language === code && <span className="ml-auto text-drc-green text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
