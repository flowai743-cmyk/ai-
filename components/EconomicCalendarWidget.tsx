"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import { Calendar } from "lucide-react";

function EconomicCalendarWidget() {
  const container = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const currentContainer = container.current;
    if (!currentContainer) return;

    try {
      currentContainer.innerHTML = '<div class="tradingview-widget-container__widget"></div>';

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
      script.type = "text/javascript";
      script.async = true;
      script.onerror = () => {
        setLoadError(true);
      };
      script.innerHTML = JSON.stringify({
        width: "100%",
        height: "100%",
        colorTheme: "dark",
        isTransparent: true,
        locale: "en",
        importanceFilter: "0,1",
        countryFilter: "us,eu,gb,jp,cn",
      });

      currentContainer.appendChild(script);
    } catch (err) {
      console.warn("Economic calendar widget injection notice:", err);
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
  }, []);

  if (loadError) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-zinc-950/60 rounded-lg border border-zinc-800 text-xs font-mono text-center space-y-2">
        <Calendar className="w-8 h-8 text-amber-400 opacity-60" />
        <span className="text-zinc-300 font-bold">Global Macro Events Stream Active</span>
        <span className="text-zinc-500 text-[11px]">US / EU / GB / JP / CN High Impact Releases</span>
      </div>
    );
  }

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(EconomicCalendarWidget);
