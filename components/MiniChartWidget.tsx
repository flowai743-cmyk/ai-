"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import { TrendingUp } from "lucide-react";

interface MiniChartProps {
  symbol: string;
}

function MiniChartWidget({ symbol }: MiniChartProps) {
  const container = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const currentContainer = container.current;
    if (!currentContainer) return;

    try {
      currentContainer.innerHTML = '<div class="tradingview-widget-container__widget"></div>';

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
      script.type = "text/javascript";
      script.async = true;
      script.onerror = () => {
        setLoadError(true);
      };
      script.innerHTML = JSON.stringify({
        symbol: symbol,
        width: "100%",
        height: "100%",
        locale: "en",
        dateRange: "1M",
        colorTheme: "dark",
        isTransparent: true,
        autosize: true,
        largeChartUrl: "",
      });

      currentContainer.appendChild(script);
    } catch (err) {
      console.warn("Mini chart injection notice:", err);
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
      <div className="h-full w-full flex items-center justify-between p-3 bg-zinc-950/60 rounded-lg border border-zinc-800 text-xs font-mono">
        <span className="text-zinc-400">{symbol}</span>
        <span className="text-amber-400 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" /> Streaming
        </span>
      </div>
    );
  }

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(MiniChartWidget);
