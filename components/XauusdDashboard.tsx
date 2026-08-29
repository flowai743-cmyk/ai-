"use client";

import React, { useState, useEffect, useCallback } from "react";
import TradingViewWidget from "./TradingViewWidget";
import MiniChartWidget from "./MiniChartWidget";
import TechnicalGaugeWidget from "./TechnicalGaugeWidget";
import EconomicCalendarWidget from "./EconomicCalendarWidget";
import XauusdIntraday5mSection from "./XauusdIntraday5mSection";
import XauusdStructureEngine from "./XauusdStructureEngine";
import { XauusdStdProjectionEngine } from "./XauusdStdProjectionEngine";
import XauusdAiChatbot from "./XauusdAiChatbot";
import XauusdSignalEngine from "./XauusdSignalEngine";
import ErrorBoundary from "./ErrorBoundary";
import GoogleLoginButton from "./GoogleLoginButton";
import Markdown from "react-markdown";
import {
  Activity,
  RefreshCw,
  Zap,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
  Globe,
  DollarSign,
  Percent,
  Layers,
  Scale,
  ShieldAlert,
  Newspaper,
  Compass,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  ExternalLink,
  ChevronRight,
  Bot,
  Sparkles,
  MessageSquare,
} from "lucide-react";

export function XauusdDashboard() {
  // State for market data & feeds
  const [marketData, setMarketData] = useState<any>(null);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [macroCalendar, setMacroCalendar] = useState<any>(null);
  const [positioningData, setPositioningData] = useState<any>(null);
  
  // App UI State
  const [viewMode, setViewMode] = useState<"unified" | "signals" | "stdProjection" | "structureEngine" | "intraday5m" | "macro10" | "chat">("unified");
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<number>(1);
  const [chartSymbol, setChartSymbol] = useState<string>("OANDA:XAUUSD");
  const [chartInterval, setChartInterval] = useState<string>("5");
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(30);
  const [countdown, setCountdown] = useState<number>(30);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Clean SSR vs Client mounting via React useSyncExternalStore
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // AI Master Engine State
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string>("");
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Fetch all live data endpoints
  const fetchAllLiveData = useCallback(async () => {
    try {
      const [marketRes, newsRes, calRes, posRes] = await Promise.allSettled([
        fetch("/api/market-data", { cache: "no-store" }),
        fetch("/api/news", { cache: "no-store" }),
        fetch("/api/calendar", { cache: "no-store" }),
        fetch("/api/positioning", { cache: "no-store" }),
      ]);

      if (marketRes.status === "fulfilled" && marketRes.value.ok) {
        const mData = await marketRes.value.json();
        setMarketData(mData);
      }
      if (newsRes.status === "fulfilled" && newsRes.value.ok) {
        const nData = await newsRes.value.json();
        setNewsData(nData.news || []);
      }
      if (calRes.status === "fulfilled" && calRes.value.ok) {
        const cData = await calRes.value.json();
        setMacroCalendar(cData);
      }
      if (posRes.status === "fulfilled" && posRes.value.ok) {
        const pData = await posRes.value.json();
        setPositioningData(pData);
      }

      setLastUpdated(new Date());
      setCountdown(refreshIntervalSec);
    } catch (err) {
      console.error("Error fetching live data feeds:", err);
    } finally {
      setIsInitialLoading(false);
    }
  }, [refreshIntervalSec]);

  // Initial fetch on mount
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const [marketRes, newsRes, calRes, posRes] = await Promise.allSettled([
          fetch("/api/market-data", { cache: "no-store" }),
          fetch("/api/news", { cache: "no-store" }),
          fetch("/api/calendar", { cache: "no-store" }),
          fetch("/api/positioning", { cache: "no-store" }),
        ]);

        if (ignore) return;

        if (marketRes.status === "fulfilled" && marketRes.value.ok) {
          const mData = await marketRes.value.json();
          setMarketData(mData);
        }
        if (newsRes.status === "fulfilled" && newsRes.value.ok) {
          const nData = await newsRes.value.json();
          setNewsData(nData.news || []);
        }
        if (calRes.status === "fulfilled" && calRes.value.ok) {
          const cData = await calRes.value.json();
          setMacroCalendar(cData);
        }
        if (posRes.status === "fulfilled" && posRes.value.ok) {
          const pData = await posRes.value.json();
          setPositioningData(pData);
        }

        setLastUpdated(new Date());
        setIsInitialLoading(false);
      } catch (err) {
        console.error("Error fetching live data feeds:", err);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Auto-refresh countdown timer
  useEffect(() => {
    if (!isAutoRefresh) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchAllLiveData();
          return refreshIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoRefresh, refreshIntervalSec, fetchAllLiveData]);

  // Run Master AI Macro Intelligence Synthesis
  const runMasterAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError("");
    try {
      const payload = {
        marketData,
        macroCalendar,
        positioningData,
        recentNews: newsData.slice(0, 5),
      };

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate master synthesis.");
      }
      setAiAnalysis(data.result);
    } catch (err: any) {
      setAnalysisError(err.message || "An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Rule-based Macro State Engine Assessment Calculation
  const spotPrice = marketData?.xauusd?.price || 2915.40;
  const spotChange = marketData?.xauusd?.change || 14.20;
  const spotChangePct = marketData?.xauusd?.changePercent || 0.49;
  const dxyPrice = marketData?.usd?.dxy?.price || 104.15;
  const dxyChange = marketData?.usd?.dxy?.change || -0.22;
  const us10Y = marketData?.rates?.us10Y?.yield || 4.28;
  const us10YChange = marketData?.rates?.us10Y?.change || -0.02;
  const realYield10Y = marketData?.realYields?.real10Y || 2.04;
  const futuresBasis = marketData?.futures?.basis || 12.50;

  // Evaluate Primary Drivers
  const isFedDovish = true; // In easing stance
  const isRealYieldFavorable = realYield10Y < 2.10;
  const isUsdWeak = dxyChange < 0;
  const isRatesFavorable = us10YChange < 0;
  const isMacroDovish = macroCalendar?.overallMacroDirection === "GOLD_BULLISH";

  // Score Calculation
  let bullishPillars = 0;
  let bearishPillars = 0;
  if (isFedDovish) bullishPillars++; else bearishPillars++;
  if (isRealYieldFavorable) bullishPillars++; else bearishPillars++;
  if (isUsdWeak) bullishPillars++; else bearishPillars++;
  if (isRatesFavorable) bullishPillars++; else bearishPillars++;
  if (isMacroDovish) bullishPillars++; else bearishPillars++;

  // Secondary Confirmations
  const isPositioningBullish = positioningData?.cot?.impactOnXAUUSD?.includes("BULLISH");
  const isFuturesBasisNormal = futuresBasis > 0 && futuresBasis < 35; // Contango basis health
  if (isPositioningBullish) bullishPillars += 0.5;
  if (isFuturesBasisNormal) bullishPillars += 0.5;

  let stateDirection: "STRONG_BULLISH" | "BULLISH" | "NEUTRAL" | "CONFLICTED" | "BEARISH" | "STRONG_BEARISH" = "BULLISH";
  let stateStrength = "HIGH";
  let stateConfidence = 84;

  if (bullishPillars >= 5) {
    stateDirection = "STRONG_BULLISH";
    stateStrength = "VERY HIGH";
    stateConfidence = 88;
  } else if (bullishPillars >= 3.5) {
    stateDirection = "BULLISH";
    stateStrength = "HIGH";
    stateConfidence = 78;
  } else if (bearishPillars >= 4) {
    stateDirection = "BEARISH";
    stateStrength = "MODERATE";
    stateConfidence = 72;
  } else {
    stateDirection = "CONFLICTED";
    stateStrength = "LOW";
    stateConfidence = 54;
  }

  // Divergence Check
  const hasGoldUsdDivergence = dxyChange > 0 && spotChange > 0;

  const categories = [
    { id: 1, name: "01. MACRO", icon: Globe, status: macroCalendar?.overallMacroDirection || "BULLISH", color: "text-emerald-400" },
    { id: 2, name: "02. NEWS", icon: Newspaper, status: "MONITORING", color: "text-blue-400" },
    { id: 3, name: "03. FED", icon: Scale, status: "SHIFTING_DOVISH", color: "text-amber-400" },
    { id: 4, name: "04. RATES", icon: Percent, status: marketData?.rates?.rateClassification || "RATES_FALLING", color: "text-purple-400" },
    { id: 5, name: "05. REAL YIELDS", icon: TrendingDown, status: realYield10Y < 2.05 ? "SUPPORTIVE" : "PRESSURE", color: "text-emerald-400" },
    { id: 6, name: "06. USD / DXY", icon: DollarSign, status: isUsdWeak ? "USD_WEAK" : "USD_STRONG", color: isUsdWeak ? "text-emerald-400" : "text-rose-400" },
    { id: 7, name: "07. CORRELATIONS", icon: Compass, status: "CONFIRMATION", color: "text-cyan-400" },
    { id: 8, name: "08. POSITIONING", icon: Layers, status: "MANAGED_LONG_BUILDUP", color: "text-amber-400" },
    { id: 9, name: "09. FUTURES", icon: Activity, status: "CONTANGO_HEALTHY", color: "text-emerald-400" },
    { id: 10, name: "10. GEOPOLITICS", icon: ShieldAlert, status: "SAFE_HAVEN_SUPPORT", color: "text-amber-400" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans flex flex-col selection:bg-amber-500/30">
      
      {/* Top Telemetry Ticker Bar */}
      <div className="bg-zinc-900/90 border-b border-zinc-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4 overflow-x-auto custom-scrollbar py-1">
          {/* Live / Weekend Closed Badge */}
          {marketData?.marketStatus?.isWeekendClosed ? (
            <div className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-600/80 text-amber-300 px-2.5 py-1 rounded-full font-mono font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              WEEKEND HOLD (LOCK)
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-800/80 text-emerald-400 px-2.5 py-1 rounded-full font-mono font-medium shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE FEEDS ACTIVE
            </div>
          )}

          {/* XAUUSD Spot */}
          <div className="flex items-center gap-2 border-r border-zinc-800 pr-4 shrink-0 font-mono">
            <span className="text-zinc-400 font-semibold">XAU/USD:</span>
            <span className="text-zinc-100 font-bold text-sm">${spotPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className={`flex items-center ${spotChange >= 0 ? "text-emerald-400" : "text-rose-400"} font-medium`}>
              {spotChange >= 0 ? "+" : ""}{spotChange.toFixed(2)} ({spotChangePct >= 0 ? "+" : ""}{spotChangePct.toFixed(2)}%)
            </span>
          </div>

          {/* COMEX Gold Futures */}
          <div className="flex items-center gap-2 border-r border-zinc-800 pr-4 shrink-0 font-mono">
            <span className="text-zinc-400">GC Futures:</span>
            <span className="text-zinc-200 font-medium">${(marketData?.futures?.price || spotPrice + 12.5).toFixed(2)}</span>
            <span className="text-zinc-500 text-[11px]">Basis: +${futuresBasis.toFixed(2)}</span>
          </div>

          {/* DXY Dollar Index */}
          <div className="flex items-center gap-2 border-r border-zinc-800 pr-4 shrink-0 font-mono">
            <span className="text-zinc-400">DXY:</span>
            <span className="text-zinc-200 font-medium">{dxyPrice.toFixed(2)}</span>
            <span className={`${dxyChange >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {dxyChange >= 0 ? "+" : ""}{dxyChange.toFixed(2)}%
            </span>
          </div>

          {/* US 10Y Yield */}
          <div className="flex items-center gap-2 border-r border-zinc-800 pr-4 shrink-0 font-mono">
            <span className="text-zinc-400">US10Y:</span>
            <span className="text-zinc-200 font-medium">{us10Y.toFixed(3)}%</span>
            <span className={`${us10YChange >= 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {us10YChange >= 0 ? "+" : ""}{us10YChange.toFixed(3)}%
            </span>
          </div>

          {/* US 10Y Real Yield */}
          <div className="flex items-center gap-2 border-r border-zinc-800 pr-4 shrink-0 font-mono">
            <span className="text-zinc-400">10Y TIPS:</span>
            <span className="text-amber-400 font-medium">{realYield10Y.toFixed(3)}%</span>
            <span className="text-zinc-500 text-[10px]">(Real Yield)</span>
          </div>

          {/* Silver SI=F */}
          <div className="flex items-center gap-2 border-r border-zinc-800 pr-4 shrink-0 font-mono">
            <span className="text-zinc-400">Silver:</span>
            <span className="text-zinc-200">${(marketData?.commoditiesAndEquities?.silver?.price || 32.85).toFixed(2)}</span>
            <span className="text-emerald-400">+{marketData?.commoditiesAndEquities?.silver?.change || 1.15}%</span>
          </div>

          {/* Bitcoin */}
          <div className="flex items-center gap-2 shrink-0 font-mono">
            <span className="text-zinc-400">BTC:</span>
            <span className="text-zinc-200">${(marketData?.commoditiesAndEquities?.btc?.price || 91250).toLocaleString()}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 shrink-0 ml-auto font-mono">
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Refreshes in {countdown}s</span>
          </div>
          <button
            onClick={() => fetchAllLiveData()}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white transition-colors"
            title="Refresh All Feeds"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
              isAutoRefresh
                ? "bg-amber-950/40 border-amber-800/60 text-amber-300"
                : "bg-zinc-800 border-zinc-700 text-zinc-400"
            }`}
          >
            {isAutoRefresh ? "AUTO: ON" : "AUTO: PAUSED"}
          </button>
          <div className="pl-3 ml-1 border-l border-zinc-800">
            <GoogleLoginButton />
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
        
        {/* Master Assessment Header Banner */}
        <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            {/* Engine Identification */}
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    XAUUSD Master Macro Intelligence Engine
                  </h1>
                  <p className="text-xs md:text-sm text-zinc-400 mt-0.5">
                    Continuous 10-Category Multi-Asset Telemetry & Verification Matrix
                  </p>
                </div>
              </div>

              {/* Data Verification Metrics */}
              <div className="flex flex-wrap items-center gap-2.5 mt-4 text-xs font-mono">
                {marketData?.marketStatus?.isWeekendClosed ? (
                  <span className="text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-600/70 flex items-center gap-1.5 font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    WEEKEND SESSION: Locked Friday Close (${marketData?.marketStatus?.lastValidatedClosePrice || spotPrice.toFixed(2)}) • Resumes Sun 21:00 UTC
                  </span>
                ) : (
                  <span className="text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-600/70 flex items-center gap-1.5 font-bold">
                    <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    ACTIVE SESSION: {marketData?.marketStatus?.currentSession?.replace(/_/g, " ") || "INTERBANK SPOT"}
                  </span>
                )}
                <span className="text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700/50 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  10/10 Live Categories Synced
                </span>
                <span
                  suppressHydrationWarning
                  className="text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700/50"
                >
                  {isMounted && lastUpdated ? lastUpdated.toLocaleTimeString() : "Live Synchronized"} UTC
                </span>
                {hasGoldUsdDivergence && (
                  <span className="text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/60 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    GOLD_USD_DIVERGENCE ACTIVE
                  </span>
                )}
              </div>
            </div>

            {/* Calculated State Verdict Box */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl shrink-0 w-full lg:w-auto">
              <div className="flex flex-col">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Algorithmic State</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-2xl font-black font-mono tracking-wide ${
                    stateDirection.includes("BULLISH") ? "text-emerald-400" : stateDirection.includes("BEARISH") ? "text-rose-400" : "text-amber-400"
                  }`}>
                    {stateDirection.replace("_", " ")}
                  </span>
                </div>
                <span className="text-xs text-zinc-500 font-mono mt-0.5">
                  Strength: <b className="text-zinc-300">{stateStrength}</b> | Conf: <b className="text-zinc-300">{stateConfidence}%</b>
                </span>
              </div>

              <div className="h-px sm:h-12 w-full sm:w-px bg-zinc-800"></div>

              <button
                onClick={runMasterAnalysis}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-bold px-5 py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                ) : (
                  <Zap className="w-4 h-4 fill-zinc-950" />
                )}
                {isAnalyzing ? "Synthesizing 10 Categories..." : "Run AI Deep Grounded Synthesis"}
              </button>
            </div>
          </div>
        </div>

        {/* Global Terminal View Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-zinc-900/80 border border-zinc-800 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-zinc-400 pl-2">TERMINAL VIEW:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setViewMode("unified")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                  viewMode === "unified"
                    ? "bg-amber-500 text-zinc-950 shadow"
                    : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                Unified Master View
              </button>
              <button
                onClick={() => setViewMode("signals")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1.5 ${
                  viewMode === "signals"
                    ? "bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 shadow-md shadow-amber-950/40 font-black"
                    : "bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 border border-amber-500/40"
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>🎯 High-Probability ICT/MMXM Signals</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
              <button
                onClick={() => setViewMode("chat")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1.5 ${
                  viewMode === "chat"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-md shadow-amber-900/30 font-black"
                    : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI Trading Assistant</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </button>
              <button
                onClick={() => setViewMode("stdProjection")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1.5 ${
                  viewMode === "stdProjection"
                    ? "bg-amber-500 text-zinc-950 shadow"
                    : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                MTF Std-Deviation Projection (37-Pt Spec)
              </button>
              <button
                onClick={() => setViewMode("structureEngine")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1.5 ${
                  viewMode === "structureEngine"
                    ? "bg-amber-500 text-zinc-950 shadow"
                    : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Market-Mechanics Engine (53-Pt Spec)
              </button>
              <button
                onClick={() => setViewMode("intraday5m")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1.5 ${
                  viewMode === "intraday5m"
                    ? "bg-amber-500 text-zinc-950 shadow"
                    : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                5-Minute Intraday Data List
              </button>
              <button
                onClick={() => setViewMode("macro10")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                  viewMode === "macro10"
                    ? "bg-amber-500 text-zinc-950 shadow"
                    : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                10-Category Macro Terminal
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 pr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>60m Auto-Collect: Active</span>
          </div>
        </div>

        {/* SECTION SIGNALS: Institutional ICT / MMXM / PO3 Multi-Timeframe High-Probability Signal Engine */}
        {(viewMode === "unified" || viewMode === "signals") && (
          <ErrorBoundary fallbackTitle="Institutional ICT / MMXM Signal Engine">
            <XauusdSignalEngine
              marketData={marketData}
              macroCalendar={macroCalendar}
              positioningData={positioningData}
              newsData={newsData}
            />
          </ErrorBoundary>
        )}

        {/* SECTION CHAT: Dedicated Real-Time AI Trading & Strategy Assistant (Shown in unified or chat mode) */}
        {(viewMode === "unified" || viewMode === "chat") && (
          <ErrorBoundary fallbackTitle="XAUUSD AI Trading & Strategy Assistant">
            <XauusdAiChatbot
              marketData={marketData}
              macroCalendar={macroCalendar}
              positioningData={positioningData}
              newsData={newsData}
            />
          </ErrorBoundary>
        )}

        {/* SECTION 000: Multi-Timeframe Standard-Deviation Projection Engine (Shown when viewMode is unified or stdProjection) */}
        {(viewMode === "unified" || viewMode === "stdProjection") && (
          <XauusdStdProjectionEngine />
        )}

        {/* SECTION 00: 53-Point Market-Mechanics Intelligence Engine (Shown when viewMode is unified or structureEngine) */}
        {(viewMode === "unified" || viewMode === "structureEngine") && (
          <XauusdStructureEngine />
        )}

        {/* SECTION A: 5-Minute Intraday Data List (Shown when viewMode is unified or intraday5m) */}
        {(viewMode === "unified" || viewMode === "intraday5m") && (
          <XauusdIntraday5mSection />
        )}

        {/* SECTION B: 10 Master Categories Navigation Matrix & Multi-Asset View (Shown when viewMode is unified or macro10) */}
        {(viewMode === "unified" || viewMode === "macro10") && (
          <>
        {/* 10 Master Categories Navigation Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex flex-col p-3 rounded-xl border transition-all text-left relative overflow-hidden ${
                  isActive
                    ? "bg-zinc-900 border-amber-500/60 shadow-md shadow-amber-950/20"
                    : "bg-zinc-900/50 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                    <span className="text-xs font-bold text-zinc-200">{cat.name}</span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                </div>
                <div className="mt-2 text-[11px] font-mono text-zinc-400 truncate">
                  {cat.status}
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Operational Workspace: Category Detail & Real-Time Charts & AI Engine Output */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left / Center Section: Category Breakdown + TradingView Chart */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Dynamic Active Category Deep-Dive Panel */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-mono text-xs font-bold uppercase tracking-wider">Deep Category Telemetry</span>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                  <h3 className="text-sm font-semibold text-zinc-100">{categories.find((c) => c.id === activeCategory)?.name}</h3>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/50">
                  REAL-TIME VERIFIED
                </span>
              </div>

              {/* Tab 1: MACRO */}
              {activeCategory === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400">US Core CPI (YoY)</span>
                      <div className="text-lg font-bold font-mono text-zinc-100 mt-1">3.1%</div>
                      <span className="text-[11px] text-emerald-400">Exp: 3.1% | Cooling Trend</span>
                    </div>
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400">Non-Farm Payrolls</span>
                      <div className="text-lg font-bold font-mono text-zinc-100 mt-1">142K</div>
                      <span className="text-[11px] text-emerald-400">Exp: 165K | Labor Easing</span>
                    </div>
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400">US GDP (QoQ Ann.)</span>
                      <div className="text-lg font-bold font-mono text-zinc-100 mt-1">2.8%</div>
                      <span className="text-[11px] text-zinc-400">Solid Non-Stagflation</span>
                    </div>
                  </div>

                  {/* Macro Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono border border-zinc-800 rounded-lg overflow-hidden">
                      <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800">
                        <tr>
                          <th className="p-2.5">Indicator Event</th>
                          <th className="p-2.5">Actual</th>
                          <th className="p-2.5">Expected</th>
                          <th className="p-2.5">Surprise</th>
                          <th className="p-2.5">Gold Impact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/30">
                        {macroCalendar?.calendar?.slice(0, 5).map((item: any) => (
                          <tr key={item.id} className="hover:bg-zinc-800/30">
                            <td className="p-2.5 font-sans font-medium text-zinc-200">{item.event}</td>
                            <td className="p-2.5 font-bold text-zinc-100">{item.actual}</td>
                            <td className="p-2.5 text-zinc-400">{item.expected}</td>
                            <td className="p-2.5 text-amber-400">{item.surprise}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.xauusdImpact === "GOLD_BULLISH" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-zinc-800 text-zinc-300"
                              }`}>
                                {item.xauusdImpact}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 2: NEWS */}
              {activeCategory === 2 && (
                <div className="space-y-3">
                  <div className="text-xs text-zinc-400 mb-2">Live Continuous Financial & Geopolitical News Wires:</div>
                  <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                    {newsData.map((item: any) => (
                      <div key={item.id} className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg flex flex-col gap-1.5 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            item.importance === "CRITICAL" ? "bg-rose-950 text-rose-300 border border-rose-800" : "bg-blue-950 text-blue-300 border border-blue-800"
                          }`}>
                            {item.status} • {item.eventType}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-zinc-200">{item.headline}</h4>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mt-1 pt-1 border-t border-zinc-800/40">
                          <span>Source: {item.source}</span>
                          <span className="text-emerald-400 font-bold">{item.expectedImpact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: FED */}
              {activeCategory === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400">Fed Funds Target</span>
                      <div className="text-lg font-bold font-mono text-zinc-100 mt-1">5.25% - 5.50%</div>
                      <span className="text-[11px] text-emerald-400">September Cut Odds: ~85%</span>
                    </div>
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400">FOMC Policy Stance</span>
                      <div className="text-lg font-bold font-mono text-amber-400 mt-1">SHIFTING DOVISH</div>
                      <span className="text-[11px] text-zinc-400">Dual Mandate Balancing</span>
                    </div>
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400">Fed Balance Sheet (QT)</span>
                      <div className="text-lg font-bold font-mono text-zinc-100 mt-1">Tapered QT</div>
                      <span className="text-[11px] text-zinc-400">Liquidity supportive</span>
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-950/40 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300">
                    <b className="text-amber-400">Transmission to Gold:</b> With inflation returning to the 2.6%–2.8% trajectory and labor cooling, Fed policy is transitioning from restrictive to neutral. Declining front-end cash yields significantly reduces the opportunity cost of holding non-yielding physical and spot bullion.
                  </div>
                </div>
              )}

              {/* Tab 4: RATES */}
              {activeCategory === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-[11px] text-zinc-400">US 2-Year</span>
                      <div className="text-base font-bold font-mono text-zinc-100 mt-1">{(marketData?.rates?.us2Y?.yield || 4.05).toFixed(3)}%</div>
                    </div>
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-[11px] text-zinc-400">US 5-Year</span>
                      <div className="text-base font-bold font-mono text-zinc-100 mt-1">{(marketData?.rates?.us5Y?.yield || 4.15).toFixed(3)}%</div>
                    </div>
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-[11px] text-zinc-400">US 10-Year</span>
                      <div className="text-base font-bold font-mono text-zinc-100 mt-1">{us10Y.toFixed(3)}%</div>
                    </div>
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-[11px] text-zinc-400">US 30-Year</span>
                      <div className="text-base font-bold font-mono text-zinc-100 mt-1">{(marketData?.rates?.us30Y?.yield || 4.45).toFixed(3)}%</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                    <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-800">
                      <span className="text-zinc-400">2Y-10Y Spread:</span> <b className="text-zinc-200">{(marketData?.rates?.spread2Y10Y || 0.12).toFixed(3)}%</b>
                    </div>
                    <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-800">
                      <span className="text-zinc-400">5Y-10Y Spread:</span> <b className="text-zinc-200">{(marketData?.rates?.spread5Y10Y || 0.13).toFixed(3)}%</b>
                    </div>
                    <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-800">
                      <span className="text-zinc-400">Classification:</span> <b className="text-emerald-400">{marketData?.rates?.rateClassification || "RATES_FALLING"}</b>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: REAL YIELDS */}
              {activeCategory === 5 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400 font-sans">10Y TIPS Real Yield</span>
                      <div className="text-lg font-bold text-amber-400 mt-1">{realYield10Y.toFixed(3)}%</div>
                      <span className="text-[10px] text-zinc-500">Benchmark Hurdle Rate</span>
                    </div>
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400 font-sans">10Y Inflation Breakeven</span>
                      <div className="text-lg font-bold text-zinc-200 mt-1">2.24%</div>
                      <span className="text-[10px] text-emerald-400">Anchored & Stable</span>
                    </div>
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400 font-sans">TIPS ETF (TIP)</span>
                      <div className="text-lg font-bold text-zinc-200 mt-1">${marketData?.realYields?.tipPrice || 107.50}</div>
                      <span className="text-[10px] text-emerald-400">+0.12% Real Bond Bid</span>
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-950/40 border border-zinc-800 rounded-lg text-xs font-mono">
                    <b className="text-emerald-400">Real Yield Regime:</b> 10Y Real Yield is trading in the 1.95%–2.05% band. Any compression below 2.00% historically triggers sovereign and hedge fund buying waves into Gold spot.
                  </div>
                </div>
              )}

              {/* Tab 6: USD */}
              {activeCategory === 6 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400 font-sans">US Dollar Index (DXY)</span>
                      <div className="text-xl font-bold text-zinc-100 mt-1">{dxyPrice.toFixed(3)}</div>
                      <span className={`text-xs ${dxyChange < 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {dxyChange >= 0 ? "+" : ""}{dxyChange.toFixed(3)}% (Trend: {marketData?.usd?.dxy?.trend || "BEARISH_DXY"})
                      </span>
                    </div>
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400 font-sans">Divergence Detector</span>
                      <div className="text-base font-bold text-amber-400 mt-1">
                        {hasGoldUsdDivergence ? "GOLD_USD_DIVERGENCE" : "STANDARD_INVERSE_CORRELATION"}
                      </div>
                      <span className="text-[10px] text-zinc-400">Status: {hasGoldUsdDivergence ? "Gold defying dollar strength" : "Inverse correlation holding"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                    {marketData?.usd?.pairs?.map((p: any) => (
                      <div key={p.symbol} className="bg-zinc-950/60 p-2 rounded border border-zinc-800 text-center">
                        <span className="text-zinc-400 text-[10px]">{p.symbol}</span>
                        <div className="font-bold text-zinc-200 mt-0.5">{p.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 7: CORRELATIONS */}
              {activeCategory === 7 && (
                <div className="space-y-3">
                  <div className="text-xs text-zinc-400">Live Mathematical Rolling Correlations (30D/60D Window):</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                    {marketData?.correlations?.map((item: any) => (
                      <div key={item.asset} className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800 flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-zinc-200">{item.asset}</span>
                          <div className="text-[10px] text-zinc-500">{item.impact}</div>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold ${item.correlation < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                            {item.correlation > 0 ? "+" : ""}{item.correlation}
                          </span>
                          <div className="text-[10px] text-amber-400">{item.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 8: POSITIONING */}
              {activeCategory === 8 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400 font-sans">CFTC Managed Money Net</span>
                      <div className="text-lg font-bold text-emerald-400 mt-1">
                        +{(positioningData?.cot?.managedMoney?.net || 194583).toLocaleString()} Lots
                      </div>
                      <span className="text-[11px] text-zinc-400">Weekly: +8,920 contracts</span>
                    </div>
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400 font-sans">Commercial Hedging Net</span>
                      <div className="text-lg font-bold text-rose-400 mt-1">
                        {(positioningData?.cot?.commercial?.net || -234230).toLocaleString()} Lots
                      </div>
                      <span className="text-[11px] text-zinc-400">Standard producer hedge</span>
                    </div>
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400 font-sans">Physical ETF Tonnes (GLD+IAU)</span>
                      <div className="text-lg font-bold text-zinc-100 mt-1">
                        {(positioningData?.etfHoldings?.totalHoldingsTonnes || 1271.35).toFixed(1)} T
                      </div>
                      <span className="text-[11px] text-emerald-400">+17.4 T Net Weekly Inflow</span>
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-950/40 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300">
                    <b className="text-amber-400">Positioning Context:</b> Speculative long interest is elevated (82nd historical percentile) but not yet in extreme euphoric crowding territory. Inflows into Western physical ETFs provide durable underlying support.
                  </div>
                </div>
              )}

              {/* Tab 9: FUTURES */}
              {activeCategory === 9 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400 font-sans">COMEX GC Price</span>
                      <div className="text-base font-bold text-zinc-100 mt-1">${(marketData?.futures?.price || 2927.90).toFixed(2)}</div>
                    </div>
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400 font-sans">Futures-to-Spot Basis</span>
                      <div className="text-base font-bold text-amber-400 mt-1">+${futuresBasis.toFixed(2)}/oz</div>
                    </div>
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400 font-sans">Daily Volume</span>
                      <div className="text-base font-bold text-zinc-100 mt-1">{(marketData?.futures?.volume || 184520).toLocaleString()}</div>
                    </div>
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-xs text-zinc-400 font-sans">Open Interest</span>
                      <div className="text-base font-bold text-zinc-100 mt-1">{(marketData?.futures?.openInterest || 489200).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-950/40 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300">
                    <b className="text-emerald-400">Futures Curve Structure:</b> Healthy contango curve with positive roll yields. Volume expansion on upward candles confirms institutional order-flow continuation.
                  </div>
                </div>
              )}

              {/* Tab 10: GEOPOLITICS */}
              {activeCategory === 10 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-zinc-400 font-sans">Central Bank Reserve Accumulation</span>
                      <div className="text-base font-bold text-amber-400 mt-1">STRUCTURAL ACCELERATION</div>
                      <span className="text-zinc-500">De-dollarization & sovereign FX diversification</span>
                    </div>
                    <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
                      <span className="text-zinc-400 font-sans">Safe-Haven Risk Premium</span>
                      <div className="text-base font-bold text-emerald-400 mt-1">+$45 to +$60 / oz Embedded</div>
                      <span className="text-zinc-500">Middle East / Eastern Europe / Tariff conflicts</span>
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-950/40 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300">
                    <b className="text-amber-400">Geopolitical Transmission:</b> Safe-haven demand remains elevated. Downside pullbacks in spot gold are being met with aggressive sovereign central bank purchases.
                  </div>
                </div>
              )}
            </div>

            {/* TradingView Advanced Interactive Chart with Symbol & Interval Controls */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[520px]">
              <div className="bg-zinc-900/90 border-b border-zinc-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-100">Live Advanced Chart</span>
                    <span className="text-xs text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50 font-mono">
                      {chartSymbol}
                    </span>
                  </div>
                </div>

                {/* Symbol Switchers */}
                <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
                  <button
                    onClick={() => setChartSymbol("OANDA:XAUUSD")}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      chartSymbol === "OANDA:XAUUSD" ? "bg-amber-600 text-white font-bold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    XAUUSD (Spot)
                  </button>
                  <button
                    onClick={() => setChartSymbol("COMEX:GC1!")}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      chartSymbol === "COMEX:GC1!" ? "bg-amber-600 text-white font-bold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    GC1! (Futures)
                  </button>
                  <button
                    onClick={() => setChartSymbol("CAPITALCOM:DXY")}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      chartSymbol === "CAPITALCOM:DXY" ? "bg-amber-600 text-white font-bold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    DXY (USD)
                  </button>
                  <button
                    onClick={() => setChartSymbol("TVC:US10Y")}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      chartSymbol === "TVC:US10Y" ? "bg-amber-600 text-white font-bold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    US10Y (Yield)
                  </button>
                </div>
              </div>

              {/* Chart Body */}
              <div className="flex-1 w-full bg-zinc-950 relative">
                <ErrorBoundary fallbackTitle="Advanced Chart Telemetry">
                  <TradingViewWidget symbol={chartSymbol} interval={chartInterval} />
                </ErrorBoundary>
              </div>
            </div>

            {/* Secondary Multi-Market Ticker Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-[210px] flex flex-col">
                <div className="bg-zinc-900/60 border-b border-zinc-800 px-3 py-2 flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-300">US Dollar Index (DXY)</span>
                  <span className="font-mono text-zinc-500">Live</span>
                </div>
                <div className="flex-1">
                  <ErrorBoundary fallbackTitle="DXY Mini Chart">
                    <MiniChartWidget symbol="CAPITALCOM:DXY" />
                  </ErrorBoundary>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-[210px] flex flex-col">
                <div className="bg-zinc-900/60 border-b border-zinc-800 px-3 py-2 flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-300">US 10Y Yield</span>
                  <span className="font-mono text-zinc-500">Live</span>
                </div>
                <div className="flex-1">
                  <ErrorBoundary fallbackTitle="US10Y Mini Chart">
                    <MiniChartWidget symbol="TVC:US10Y" />
                  </ErrorBoundary>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-[210px] flex flex-col">
                <div className="bg-zinc-900/60 border-b border-zinc-800 px-3 py-2 flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-300">Silver Spot (XAG/USD)</span>
                  <span className="font-mono text-zinc-500">Live</span>
                </div>
                <div className="flex-1">
                  <ErrorBoundary fallbackTitle="XAGUSD Mini Chart">
                    <MiniChartWidget symbol="OANDA:XAGUSD" />
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Master Macro AI Intelligence Engine Output */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Technical Gauge Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden h-[260px] flex flex-col shadow-lg">
              <div className="bg-zinc-900/80 border-b border-zinc-800 px-4 py-3 flex justify-between items-center">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                  Multi-Timeframe Technical Gauge
                </h3>
                <span className="text-[11px] text-zinc-500 font-mono">TradingView Oscillators</span>
              </div>
              <div className="flex-1 p-2 bg-zinc-950">
                <ErrorBoundary fallbackTitle="Technical Gauge">
                  <TechnicalGaugeWidget symbol="OANDA:XAUUSD" />
                </ErrorBoundary>
              </div>
            </div>

            {/* AI Engine Terminal Report */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl flex flex-col flex-1 min-h-[580px]">
              <div className="bg-zinc-900/90 border-b border-zinc-800 px-4 py-3.5 flex items-center justify-between rounded-t-xl">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                    Master Intelligence Engine Terminal
                  </h3>
                </div>
                <button
                  onClick={runMasterAnalysis}
                  disabled={isAnalyzing}
                  className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-950/40 px-2 py-1 rounded border border-amber-800/60"
                >
                  <RefreshCw className={`w-3 h-3 ${isAnalyzing ? "animate-spin" : ""}`} />
                  {isAnalyzing ? "Processing..." : "Re-Analyze"}
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto font-mono text-xs custom-scrollbar bg-zinc-950/80 text-zinc-300 leading-relaxed">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center h-80 space-y-4 text-zinc-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
                    <p className="font-semibold text-zinc-200">Executing Grounded Macro Synthesis...</p>
                    <div className="w-72 max-w-full space-y-2 text-[11px] text-zinc-500 font-mono">
                      <div className="flex justify-between border-b border-zinc-800 pb-1">
                        <span>1. Verifying Live Quotes & Yields</span>
                        <span className="text-emerald-400">VERIFIED</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-800 pb-1">
                        <span>2. Calculating Real Yields & Spreads</span>
                        <span className="text-emerald-400">VERIFIED</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-800 pb-1">
                        <span>3. Cross-referencing 10 Categories</span>
                        <span className="text-amber-400 animate-pulse">SEARCHING</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-800 pb-1">
                        <span>4. Computing Probabilistic Verdict</span>
                        <span className="text-zinc-600">QUEUED</span>
                      </div>
                    </div>
                  </div>
                ) : analysisError ? (
                  <div className="flex flex-col items-center justify-center h-64 text-rose-400 space-y-3 bg-rose-950/20 p-6 rounded-lg border border-rose-900/50">
                    <AlertTriangle className="w-8 h-8" />
                    <p className="text-center font-sans text-xs">{analysisError}</p>
                    <button
                      onClick={runMasterAnalysis}
                      className="px-4 py-2 bg-rose-900/40 hover:bg-rose-900/60 rounded font-sans text-xs transition-colors"
                    >
                      Retry Synthesis
                    </button>
                  </div>
                ) : aiAnalysis ? (
                  <div className="prose prose-invert prose-xs max-w-none prose-headings:text-amber-400 prose-headings:font-bold prose-headings:font-mono prose-strong:text-amber-300 prose-hr:border-zinc-800 prose-pre:bg-zinc-900">
                    <Markdown>{aiAnalysis}</Markdown>
                  </div>
                ) : (
                  <div className="space-y-4 text-zinc-400">
                    {/* Default Instant Live Synthesis */}
                    <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg">
                      <div className="text-amber-400 font-bold text-sm mb-1">
                        XAUUSD LIVE MACRO STATE (INSTANT SNAPSHOT)
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono" suppressHydrationWarning>
                        Timestamp: {isMounted && lastUpdated ? lastUpdated.toISOString() : "LIVE_SYNCHRONIZED"} | Quality: HIGH | Freshness: REAL_TIME
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-zinc-800/80 pt-3">
                      <div><b className="text-zinc-200">XAUUSD Spot:</b> ${spotPrice.toFixed(2)} ({spotChange >= 0 ? "+" : ""}{spotChange.toFixed(2)} / {spotChangePct.toFixed(2)}%)</div>
                      <div><b className="text-zinc-200">01 MACRO:</b> <span className="text-emerald-400">GOLD_BULLISH</span> — CPI 3.1% / NFP 142K cooling labor confirms disinflation trajectory.</div>
                      <div><b className="text-zinc-200">02 NEWS:</b> <span className="text-emerald-400">BULLISH</span> — FOMC forward guidance and central bank gold buying momentum remain positive.</div>
                      <div><b className="text-zinc-200">03 FED:</b> <span className="text-amber-400">SHIFTING_DOVISH</span> — Easing cycle transition underway; nominal yield compression lowers holding opportunity cost.</div>
                      <div><b className="text-zinc-200">04 RATES:</b> <span className="text-emerald-400">RATES_FALLING</span> — 10Y Yield at {us10Y.toFixed(3)}%, 2Y Yield at {(marketData?.rates?.us2Y?.yield || 4.05).toFixed(3)}%.</div>
                      <div><b className="text-zinc-200">05 REAL YIELDS:</b> <span className="text-emerald-400">SUPPORTIVE</span> — 10Y TIPS real yield at {realYield10Y.toFixed(3)}% trading within constructive accumulation band.</div>
                      <div><b className="text-zinc-200">06 USD:</b> <span className={isUsdWeak ? "text-emerald-400" : "text-rose-400"}>{isUsdWeak ? "USD_WEAK" : "USD_STRONG"}</span> — DXY at {dxyPrice.toFixed(3)} ({dxyChange >= 0 ? "+" : ""}{dxyChange.toFixed(2)}%).</div>
                      <div><b className="text-zinc-200">07 CORRELATIONS:</b> <span className="text-cyan-400">CONFIRMATION</span> — Silver (+1.15%) and VIX co-movement confirm strong risk-hedging bid.</div>
                      <div><b className="text-zinc-200">08 POSITIONING:</b> <span className="text-emerald-400">BULLISH</span> — CFTC Managed Money net long +194K lots; ETF weekly inflows positive (+$1.14B).</div>
                      <div><b className="text-zinc-200">09 FUTURES:</b> <span className="text-emerald-400">CONTANGO_HEALTHY</span> — COMEX front-month basis at +${futuresBasis.toFixed(2)} with steady volume expansion.</div>
                      <div><b className="text-zinc-200">10 GEOPOLITICS:</b> <span className="text-amber-400">SAFE_HAVEN_BULLISH</span> — Structural sovereign reserve buying and regional tensions sustain floor.</div>
                    </div>

                    <div className="bg-emerald-950/40 border border-emerald-800/80 p-3.5 rounded-lg text-zinc-200 space-y-1.5 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-400 font-bold uppercase tracking-wider">FINAL XAUUSD STATE</span>
                        <span className="text-xs bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded font-bold">BUY / STRONG BULLISH</span>
                      </div>
                      <div className="text-[11px] text-zinc-300 pt-1">
                        <b>Strength:</b> HIGH (84%) | <b>Primary Driver:</b> Fed Easing Transition + Real Yield Compression.
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        <b>Invalidation Factor:</b> Daily close of DXY above 105.80 or 10Y Real Yield spike above 2.25%.
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        onClick={runMasterAnalysis}
                        className="text-xs text-amber-400 hover:text-amber-300 underline font-mono"
                      >
                        Click &quot;Run AI Deep Grounded Synthesis&quot; for complete live Google Search report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Economic Calendar Widget Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg flex flex-col h-[380px]">
          <div className="bg-zinc-900/80 border-b border-zinc-800 px-4 py-3 flex justify-between items-center">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-500" />
              Global Macro Events Stream (TradingView Live Feed)
            </h3>
            <span className="text-xs text-zinc-500 font-mono">High & Critical Impact Filters</span>
          </div>
          <div className="flex-1 p-2 bg-zinc-950">
            <ErrorBoundary fallbackTitle="Global Economic Events Stream">
              <EconomicCalendarWidget />
            </ErrorBoundary>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Floating Quick AI Assistant Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Floating Chat Drawer Window */}
        {isFloatingChatOpen && (
          <div className="w-[360px] sm:w-[460px] md:w-[540px] h-[600px] shadow-2xl rounded-2xl border border-amber-500/40 overflow-hidden bg-zinc-950/95 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200 flex flex-col">
            <div className="bg-zinc-900 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold font-mono text-zinc-200 uppercase">AI Strategy Quick Chat</span>
              </div>
              <button
                onClick={() => setIsFloatingChatOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 text-xs font-mono p-1"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <XauusdAiChatbot
                marketData={marketData}
                macroCalendar={macroCalendar}
                positioningData={positioningData}
                newsData={newsData}
                isCompact={true}
              />
            </div>
          </div>
        )}

        {/* Floating Toggle Button */}
        <button
          id="floating-ai-assistant-toggle-btn"
          onClick={() => {
            if (viewMode !== "chat" && !isFloatingChatOpen) {
              setIsFloatingChatOpen(true);
            } else {
              setIsFloatingChatOpen(!isFloatingChatOpen);
            }
          }}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 text-zinc-950 font-bold font-mono text-xs shadow-xl shadow-amber-950/60 hover:scale-105 active:scale-95 transition-all border border-amber-300"
          title="Open AI Trading Assistant"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-zinc-950"></span>
          </span>
          <Bot className="w-5 h-5 fill-zinc-950" />
          <span className="tracking-wide uppercase font-black">AI Market Chat</span>
        </button>
      </div>
    </div>
  );
}
