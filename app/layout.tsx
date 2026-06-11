import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'VERYX — AI Infrastructure Operating System',
  description:
    'Self-sovereign, production-grade AI Infrastructure OS: 80+ AI agents, ACU billing, BitriPay African payment rails, 10 enterprise domain modules and 3 command centres.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${mono.variable} font-sans`}>{children}</body>
    </html>
  );
}
