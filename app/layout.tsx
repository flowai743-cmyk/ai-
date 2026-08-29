import type {Metadata} from 'next';
import './globals.css'; // Global styles
import ScriptGuard from '@/components/ScriptGuard';

export const metadata: Metadata = {
  title: 'XAUUSD Live Macro Intelligence Engine',
  description: 'Real-time XAUUSD intraday market-mechanics intelligence engine and 10-category macro terminal analyzing multi-timeframe structure, continuous liquidity maps, volume profiles, and auction order flow with zero data fabrication.',
  openGraph: {
    title: 'XAUUSD Live Macro Intelligence Engine',
    description: 'Real-time XAUUSD intraday market-mechanics intelligence engine and 10-category macro terminal analyzing multi-timeframe structure, continuous liquidity maps, volume profiles, and auction order flow with zero data fabrication.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XAUUSD Live Macro Intelligence Engine',
    description: 'Real-time XAUUSD intraday market-mechanics intelligence engine and 10-category macro terminal analyzing multi-timeframe structure, continuous liquidity maps, volume profiles, and auction order flow with zero data fabrication.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ScriptGuard />
        {children}
      </body>
    </html>
  );
}
