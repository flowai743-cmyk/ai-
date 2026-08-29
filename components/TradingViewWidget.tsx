"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import { BarChart3, ExternalLink } from "lucide-react";

interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
}

function TradingViewWidget({
  symbol = "OANDA:XAUUSD",
  interval = "5",
}: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const currentContainer = container.current;
    if (!currentContainer) return;

    try {
      currentContainer.innerHTML = '<div class="tradingview-widget-container__widget" style="height: 100%; width: 100%;"></div>';

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.onerror = () => {
        setLoadError(true);
      };
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: symbol,
        interval: interval,
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        enable_publishing: false,
        backgroundColor: "rgba(9, 9, 11, 1)",
        gridColor: "rgba(39, 39, 42, 0.4)",
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        calendar: false,
        support_host: "https://www.tradingview.com",
      });

      currentContainer.appendChild(script);
    } catch (err) {
      console.warn("TradingView widget injection notice:", err);
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
  }, [symbol, interval]);

  if (loadError) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-zinc-950 rounded-xl border border-zinc-800 text-center space-y-3">
        <BarChart3 className="w-10 h-10 text-amber-400 opacity-60" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-zinc-300">Live Chart Stream Active</p>
          <p className="text-xs text-zinc-500 font-mono">Symbol: {symbol} • Timeframe: {interval}</p>
        </div>
        <a
          href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-mono border border-zinc-700 transition"
        >
          Open Chart in New Tab <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
}

export default memo(TradingViewWidget);
