'use client';

import './globals.css';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import type { Language } from '@/lib/translations';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  return (
    <html lang={language}>
      <head>
        <title>Congo D&apos;Abord — CDP-AI OS</title>
        <meta name="description" content="Le premier parti politique congolais renforcé par l'intelligence artificielle" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23006400'/><text x='50%25' y='60%25' font-size='18' text-anchor='middle' fill='%23FCD116' font-family='serif' font-weight='bold'>C</text></svg>" />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <Navbar language={language} setLanguage={setLanguage} />
        <main>{children}</main>
        <footer className="bg-drc-blue-dark text-white mt-16">
          <div className="flag-stripe" />
          <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-drc-yellow font-bold text-lg mb-3">Congo D&apos;Abord</h3>
              <p className="text-blue-200 text-sm leading-relaxed">
                Le premier parti politique congolais dirigé par des citoyens,
                renforcé par l&apos;intelligence artificielle.
              </p>
              <p className="text-blue-300 text-xs mt-3 font-semibold">CDP-AI OS v1.0</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-200">Direction Nationale</h4>
              <p className="text-blue-300 text-sm">Fondateur &amp; Président</p>
              <p className="text-white font-bold text-sm">Mr Justin Nseya</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-blue-200">Contact</h4>
              <p className="text-blue-300 text-sm">contact@congodabord.cd</p>
              <p className="text-blue-300 text-sm mt-1">Kinshasa, RD Congo</p>
            </div>
          </div>
          <div className="border-t border-green-800 text-center py-4 text-blue-300 text-xs">
            © 2025 Congo D&apos;Abord — CDP-AI OS. Tous droits réservés.
          </div>
        </footer>
      </body>
    </html>
  );
}
