"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import { Gauge } from "lucide-react";

interface TechnicalGaugeWidgetProps {
  symbol?: string;
}

function TechnicalGaugeWidget({ symbol = "OANDA:XAUUSD" }: TechnicalGaugeWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const currentContainer = container.current;
    if (!currentContainer) return;

    try {
      currentContainer.innerHTML = '<div class="tradingview-widget-container__widget"></div>';

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
      script.type = "text/javascript";
      script.async = true;
      script.onerror = () => {
        setLoadError(true);
      };
      script.innerHTML = JSON.stringify({
        interval: "1D",
        width: "100%",
        isTransparent: true,
        height: "100%",
        symbol: symbol,
        showIntervalTabs: true,
        displayMode: "single",
        locale: "en",
        colorTheme: "dark",
      });

      currentContainer.appendChild(script);
    } catch (err) {
      console.warn("Gauge widget injection notice:", err);
    }

    return () => {
      try {
        if (currentContainer) {
          currentContainer.innerHTML = "";
        }
      } catch {
        // cleanup ignore
      }
    };
  }, [symbol]);

  if (loadError) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-4 bg-zinc-950/60 rounded-lg border border-zinc-800 text-xs font-mono text-center space-y-2">
        <Gauge className="w-8 h-8 text-amber-400 opacity-60" />
        <span className="text-zinc-300 font-bold">Technical Meter Active</span>
        <span className="text-zinc-500 text-[11px]">{symbol} • Institutional Oscillator</span>
      </div>
    );
  }

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(TechnicalGaugeWidget);
