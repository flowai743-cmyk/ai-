"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  StructureIntelligenceReport,
  MultiTimeframeRow,
  LiquidityPool,
  FvgZone,
  OrderBlockZone,
  SwingPoint,
} from "@/app/api/structure-intelligence/route";
import Markdown from "react-markdown";
import {
  Layers,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Compass,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Crosshair,
  Shield,
  Activity,
  Sliders,
  Maximize2,
  Copy,
  Check,
  BarChart2,
  Lock,
  GitCommit,
  GitBranch,
} from "lucide-react";

export default function XauusdStructureEngine() {
  const [data, setData] = useState<StructureIntelligenceReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDeepAnalyzing, setIsDeepAnalyzing] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [activeSectionTab, setActiveSectionTab] = useState<"overview" | "matrix" | "liquidity_fvg" | "state_path" | "raw_report">("overview");

  // Fetch Structure Intelligence Data
  const fetchStructureData = useCallback(async (runAi = false) => {
    try {
      if (runAi) setIsDeepAnalyzing(true);
      else setIsRefreshing(true);

      const res = await fetch("/api/structure-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runAiDeep: runAi }),
        cache: "no-store",
      });

      if (res.ok) {
        const json: StructureIntelligenceReport = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load Structure Intelligence:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setIsDeepAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const executeFetch = async () => {
      try {
        const res = await fetch("/api/structure-intelligence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runAiDeep: false }),
          cache: "no-store",
        });

        if (res.ok && isSubscribed) {
          const json: StructureIntelligenceReport = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load Structure Intelligence:", err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    executeFetch();
    const interval = setInterval(executeFetch, 20000); // 20s live auto-refresh
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  const handleCopyReport = () => {
    if (!data?.structuredTextOutput) return;
    navigator.clipboard.writeText(data.structuredTextOutput);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  if (loading && !data) {
    return (
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
        <div className="space-y-1">
          <p className="text-zinc-200 font-bold text-lg">Initializing XAUUSD Structure Intelligence Engine</p>
          <p className="text-zinc-500 text-xs font-mono">
            Calibrating W1/D1/H4/H1/M15/M5/M1 multi-timeframe swings, FVG imbalances, order blocks & liquidity pools...
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Engine Header & Primary Verdict */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-amber-500/30 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    XAUUSD Market Structure Intelligence Engine
                  </h2>
                  <span className="bg-amber-950/80 border border-amber-800/80 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                    SPECIFICATION V2.0
                  </span>
                </div>
                <p className="text-xs md:text-sm text-zinc-400 mt-1">
                  Algorithmic multi-timeframe swing classification, BOS/CHOCH verification, liquidity & FVG telemetry
                </p>
              </div>
            </div>

            {/* Live Data Integrity Metrics */}
            <div className="flex flex-wrap items-center gap-2.5 mt-4 text-xs font-mono">
              {data.marketStatus?.isWeekendClosed ? (
                <span className="text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/50 flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  WEEKEND HOLD • VERIFIED FRIDAY CLOSE (${data.currentPrice.toFixed(2)})
                </span>
              ) : (
                <span className="text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/50 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Price: REAL DATA (${data.currentPrice.toFixed(2)})
                </span>
              )}
              <span className="text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/50 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                M5 ATR: ${data.volatility?.m5Atr?.toFixed(2) || "4.80"} | Z-Score: {data.standardDeviation?.zScore > 0 ? "+" : ""}{data.standardDeviation?.zScore}σ
              </span>
              <span className="text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-md border border-purple-800/50 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Rule 12: DOM Absorption Checked
              </span>
            </div>
          </div>

          {/* Action & Master State Badge */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
            <div className="bg-zinc-950/90 border border-zinc-800 p-3.5 rounded-xl flex flex-col justify-center min-w-[170px]">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-semibold">Current Market State</span>
              <span className="text-lg font-black font-mono text-amber-400 tracking-wider">
                {data.marketState.currentState}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Confidence: <b className="text-zinc-200">{data.marketState.confidenceScore}%</b>
              </span>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button
                onClick={() => fetchStructureData(false)}
                disabled={isRefreshing}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs px-4 py-2 rounded-lg border border-zinc-700 flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
                {isRefreshing ? "Calculating Math..." : "Recalculate Structure"}
              </button>

              <button
                onClick={() => fetchStructureData(true)}
                disabled={isDeepAnalyzing}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-mono font-bold text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition shadow-md shadow-amber-950/30"
              >
                <Zap className={`w-3.5 h-3.5 ${isDeepAnalyzing ? "animate-pulse" : "fill-zinc-950"}`} />
                {isDeepAnalyzing ? "AI Deep Grounding..." : "Run AI Deep Synthesis"}
              </button>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-zinc-800/80 overflow-x-auto custom-scrollbar">
          {[
            { id: "overview", label: "01-06. Structure & Swings" },
            { id: "matrix", label: "15. Multi-Timeframe Matrix" },
            { id: "liquidity_fvg", label: "07-10. Liquidity, FVG & OB" },
            { id: "state_path", label: "16-19. State Machine & Path Flow" },
            { id: "raw_report", label: "20. Section 20 Standard Report" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSectionTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition ${
                activeSectionTab === tab.id
                  ? "bg-amber-500 text-zinc-950 shadow"
                  : "bg-zinc-950/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW (01. Raw Data, 02. Swings, 03. Market Structure, 04. BOS, 05/06. CHOCH) */}
      {activeSectionTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Structure State & Swing Point Engine */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 03. Structure Core Card */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-zinc-200">03. Real-Time Market Structure</span>
                </div>
                <span className="text-xs font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                  {data.marketStructure.currentTrend}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase">Current Trend</span>
                  <span className="text-emerald-400 font-bold text-sm mt-0.5 block">
                    {data.marketStructure.currentTrend.includes("BULLISH") ? "BULLISH (HH+HL)" : "BEARISH (LL+LH)"}
                  </span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase">Protected High</span>
                  <span className="text-rose-400 font-bold text-sm mt-0.5 block">
                    ${data.marketStructure.protectedHigh.toFixed(2)}
                  </span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase">Protected Low</span>
                  <span className="text-emerald-400 font-bold text-sm mt-0.5 block">
                    ${data.marketStructure.protectedLow.toFixed(2)}
                  </span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px] uppercase">Internal State</span>
                  <span className="text-amber-400 font-bold text-sm mt-0.5 block">
                    {data.marketStructure.internalStructure}
                  </span>
                </div>
              </div>

              {/* 04. BOS & 05. CHOCH Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400 font-bold">04. Break of Structure (BOS)</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      data.bosEvents.length > 0 ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {data.bosEvents.length > 0 ? "CONFIRMED BOS" : "NO ACTIVE BOS"}
                    </span>
                  </div>
                  {data.bosEvents.length > 0 ? (
                    <div className="text-xs font-mono space-y-1 text-zinc-300">
                      <p>Direction: <b className="text-emerald-400">{data.bosEvents[0].direction}</b></p>
                      <p>Broken Level: <b className="text-zinc-200">${data.bosEvents[0].brokenLevel.toFixed(2)}</b></p>
                      <p>Distance: <b className="text-amber-400">{data.bosEvents[0].breakDistanceAtr} ATR</b> (${data.bosEvents[0].breakDistance})</p>
                      <p>Acceptance: <b className="text-zinc-200">{data.bosEvents[0].acceptanceStatus}</b></p>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 font-mono">Price compressing within defined swing boundaries.</p>
                  )}
                </div>

                <div className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400 font-bold">05/06. CHOCH / MSS Shift</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      data.chochEvents.length > 0 ? "bg-amber-950 text-amber-300 border border-amber-800" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {data.chochEvents.length > 0 ? data.chochEvents[0].status : "STRUCTURE INTACT"}
                    </span>
                  </div>
                  {data.chochEvents.length > 0 ? (
                    <div className="text-xs font-mono space-y-1 text-zinc-300">
                      <p>Shift: <b className="text-amber-400">{data.chochEvents[0].direction}</b></p>
                      <p>Displacement: <b className="text-zinc-200">{data.chochEvents[0].displacementLevel}</b></p>
                      <p>Retest: <b className="text-zinc-200">{data.chochEvents[0].retestConfirmation ? "CONFIRMED" : "AWAITING"}</b></p>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 font-mono">No change of character detected on M5/H1. Trend continuation favored.</p>
                  )}
                </div>
              </div>
            </div>

            {/* 02. Swing-Point Engine List */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-zinc-200">02. Validated Algorithmic Swing Points</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">ATR-Normalized Multi-Bar Validation</span>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-zinc-950 text-zinc-500 text-[11px] uppercase border-b border-zinc-800">
                    <tr>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">TF</th>
                      <th className="py-2 px-3">Price</th>
                      <th className="py-2 px-3">Class</th>
                      <th className="py-2 px-3">Strength</th>
                      <th className="py-2 px-3">ATR Dist</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {data.swings.slice(0, 7).map((sw) => (
                      <tr key={sw.id} className="hover:bg-zinc-800/40">
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sw.type === "SWING_HIGH" ? "bg-rose-950/80 text-rose-300 border border-rose-800/60" : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                          }`}>
                            {sw.type === "SWING_HIGH" ? "SWING HIGH" : "SWING LOW"}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-zinc-300">{sw.timeframe}</td>
                        <td className="py-2 px-3 font-bold text-zinc-100">${sw.price.toFixed(2)}</td>
                        <td className="py-2 px-3 text-zinc-400">{sw.classification}</td>
                        <td className="py-2 px-3 text-amber-400">{sw.strength}</td>
                        <td className="py-2 px-3 text-zinc-400">{sw.atrNormalizedDistance}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Displacement, Volatility & Absorption Checks */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* 11. Displacement & 14. Volatility */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-zinc-200">11. Displacement & Volatility Gauge</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  data.displacement.rating === "EXTREME" || data.displacement.rating === "STRONG"
                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                    : "bg-zinc-800 text-zinc-300"
                }`}>
                  {data.displacement.rating}
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400">Candle Range / ATR:</span>
                  <span className="text-zinc-200 font-bold">{data.displacement.candleRangeToAtrRatio}x ATR</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400">Body-to-Range Ratio:</span>
                  <span className="text-zinc-200 font-bold">{data.displacement.bodyToRangeRatioPct}%</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400">Relative Volume vs 20 SMA:</span>
                  <span className="text-zinc-200 font-bold">{data.displacement.relativeVolumeRatio}x</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400">Standard Deviation Z-Score:</span>
                  <span className="text-amber-400 font-bold">{data.standardDeviation.zScore > 0 ? "+" : ""}{data.standardDeviation.zScore}σ ({data.standardDeviation.regime})</span>
                </div>
              </div>
            </div>

            {/* 12. Rule 12: Absorption & Order Flow Audit */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-zinc-200">12. Order Flow & Absorption Engine</span>
                </div>
                <span className="text-[10px] font-mono bg-purple-950/80 border border-purple-800/80 text-purple-300 px-2 py-0.5 rounded">
                  RULE 12 ENFORCED
                </span>
              </div>

              <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Order Flow Delta:</span>
                  <span className={`font-bold ${data.absorption.deltaVolume >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {data.absorption.deltaVolume >= 0 ? "+" : ""}{data.absorption.deltaVolume} contracts
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Cumulative Delta:</span>
                  <span className={`font-bold ${data.absorption.cumulativeDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {data.absorption.cumulativeDelta >= 0 ? "+" : ""}{data.absorption.cumulativeDelta} contracts
                  </span>
                </div>
                <div className="pt-2 border-t border-zinc-800/60 text-zinc-400 text-[11px] leading-relaxed">
                  <p className="text-amber-400 font-semibold mb-1">Specification Mandate 12:</p>
                  <p>{data.absorption.note}</p>
                </div>
              </div>
            </div>

            {/* 13. Volume Profile Math */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="font-bold text-zinc-200">13. Volume Profile & Value Area</span>
                <span className="text-emerald-400 font-bold">{data.volumeProfile.currentPriceLocation}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">VAL (70%)</span>
                  <span className="text-zinc-200 font-bold">${data.volumeProfile.val.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-zinc-950 rounded-lg border border-amber-500/40">
                  <span className="text-[10px] text-amber-400 block font-bold">POC</span>
                  <span className="text-amber-300 font-bold text-sm">${data.volumeProfile.poc.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">VAH (70%)</span>
                  <span className="text-zinc-200 font-bold">${data.volumeProfile.vah.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: MULTI-TIMEFRAME MATRIX (Section 15) */}
      {activeSectionTab === "matrix" && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-400" />
                15. Multi-Timeframe Structural Relationship Matrix
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Simultaneous comparison across W1, D1, H4, H1, M15, M5, and M1 with conflict resolution
              </p>
            </div>
            <div className="bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800 text-xs font-mono text-amber-300">
              {data.multiTimeframeSynthesis}
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-zinc-950 text-zinc-500 text-[11px] uppercase border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-3">Timeframe</th>
                  <th className="py-3 px-3">Trend</th>
                  <th className="py-3 px-3">Structure</th>
                  <th className="py-3 px-3">Latest BOS</th>
                  <th className="py-3 px-3">Nearest Liquidity</th>
                  <th className="py-3 px-3">FVG Status</th>
                  <th className="py-3 px-3">Order Block</th>
                  <th className="py-3 px-3">Bias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {data.multiTimeframeMatrix.map((row) => (
                  <tr key={row.timeframe} className="hover:bg-zinc-800/40">
                    <td className="py-3 px-3 font-bold text-zinc-100">
                      <span className="bg-zinc-800 px-2 py-1 rounded border border-zinc-700">{row.timeframe}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-bold ${
                        row.trend.includes("BULLISH") ? "text-emerald-400" : row.trend.includes("BEARISH") ? "text-rose-400" : "text-zinc-400"
                      }`}>
                        {row.trend}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-300">{row.structure}</td>
                    <td className="py-3 px-3 text-zinc-400 truncate max-w-[150px]">{row.latestBos}</td>
                    <td className="py-3 px-3 text-amber-300 font-bold">{row.nearestLiquidity}</td>
                    <td className="py-3 px-3 text-zinc-400 truncate max-w-[140px]">{row.fvgState}</td>
                    <td className="py-3 px-3 text-zinc-300 truncate max-w-[140px]">{row.orderBlockState}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.bias === "BULLISH" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : row.bias === "BEARISH" ? "bg-rose-950 text-rose-300 border border-rose-800" : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {row.bias}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LIQUIDITY, FVG & ORDER BLOCKS (Sections 07 - 10) */}
      {activeSectionTab === "liquidity_fvg" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 07 & 08. Liquidity Pools & Sweeps */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-rose-400" />
                07. Liquidity Pools (BSL / SSL)
              </span>
              <span className="text-xs font-mono text-zinc-500">{data.liquidityPools.length} Pools Tracked</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {data.liquidityPools.map((pool) => (
                <div key={pool.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-200 font-bold">{pool.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pool.type === "BUY_SIDE" ? "bg-rose-950/80 text-rose-300 border border-rose-800/60" : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                    }`}>
                      {pool.type === "BUY_SIDE" ? "BSL (BUY-SIDE)" : "SSL (SELL-SIDE)"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Price: <b className="text-zinc-100">${pool.price.toFixed(2)}</b></span>
                    <span>Distance: <b className="text-amber-400">${pool.distanceDollars}</b> ({pool.distancePips} pips)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Class: {pool.classification}</span>
                    <span>Status: <b className="text-zinc-300">{pool.status}</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 09. Fair Value Gaps (FVG) */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                09. Fair Value Gaps (3-Bar Imbalance)
              </span>
              <span className="text-xs font-mono text-zinc-500">{data.fairValueGaps.length} Gaps Active</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {data.fairValueGaps.map((fvg) => (
                <div key={fvg.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-200 font-bold">{fvg.timeframe} Imbalance</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      fvg.direction === "BULLISH_FVG" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60" : "bg-rose-950/80 text-rose-300 border border-rose-800/60"
                    }`}>
                      {fvg.direction === "BULLISH_FVG" ? "BULLISH FVG" : "BEARISH FVG"}
                    </span>
                  </div>
                  <div className="text-zinc-300 text-xs">
                    Range: <b className="text-amber-300">${fvg.bottomBoundary.toFixed(2)}</b> → <b className="text-amber-300">${fvg.topBoundary.toFixed(2)}</b>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Midpoint: ${fvg.midpoint.toFixed(2)}</span>
                    <span>Size: ${fvg.gapSizeDollars} ({fvg.atrNormalizedSize} ATR)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/60">
                    <span>Status: <b className="text-zinc-300">{fvg.status}</b></span>
                    <span>Mitigation: {fvg.mitigationPercentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 10. Order Blocks */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                10. Institutional Order Blocks
              </span>
              <span className="text-xs font-mono text-zinc-500">{data.orderBlocks.length} Blocks</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {data.orderBlocks.map((ob) => (
                <div key={ob.id} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-200 font-bold">{ob.timeframe} Order Block</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ob.direction === "BULLISH_OB" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60" : "bg-rose-950/80 text-rose-300 border border-rose-800/60"
                    }`}>
                      {ob.direction === "BULLISH_OB" ? "DEMAND BLOCK" : "SUPPLY BLOCK"}
                    </span>
                  </div>
                  <div className="text-zinc-300 text-xs">
                    Zone: <b className="text-cyan-300">${ob.low.toFixed(2)}</b> – <b className="text-cyan-300">${ob.high.toFixed(2)}</b>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Validation: {ob.status}</span>
                    <span>Vol Expansion: {ob.volumeExpansionRatio}x</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/60">
                    Triggered: {ob.causedStructureEvent}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: STATE MACHINE, PROBABILITY & PRICE PATH FLOW (Sections 16 - 19) */}
      {activeSectionTab === "state_path" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: 18. Probability Model & 16. State Machine */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* 18. Probability Score Matrix */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  18. Scenario Probability Engine
                </span>
                <span className="text-xs text-amber-400 font-bold">
                  Primary: {data.probabilities.primaryScenario}
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Continuation", score: data.probabilities.continuationScore, color: "bg-emerald-500" },
                  { label: "FVG / OB Refill", score: data.probabilities.refillScore, color: "bg-cyan-500" },
                  { label: "Deep Pullback", score: data.probabilities.pullbackScore, color: "bg-amber-500" },
                  { label: "Structural Reversal", score: data.probabilities.reversalScore, color: "bg-rose-500" },
                  { label: "Balanced Range", score: data.probabilities.rangeScore, color: "bg-purple-500" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-zinc-300">
                      <span>{item.label}</span>
                      <span className="font-bold">{item.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invalidation Rules */}
            <div className="bg-zinc-900/90 border border-rose-900/40 rounded-2xl p-5 shadow-lg space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-rose-400 font-bold border-b border-rose-900/40 pb-2">
                <AlertTriangle className="w-4 h-4" />
                Structural Invalidation Mandate
              </div>
              <p className="text-zinc-300 leading-relaxed">
                {data.finalBias.invalidationCondition}
              </p>
              <div className="p-2.5 bg-rose-950/40 rounded-lg border border-rose-800/40 text-rose-300">
                Invalidation Level: <b className="font-bold">${data.finalBias.invalidationLevel.toFixed(2)}</b>
              </div>
            </div>

          </div>

          {/* Right Column: 19. Sequential Price Path Flow */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-5 font-mono">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <GitCommit className="w-5 h-5 text-emerald-400" />
                  19. Sequential High-Probability Price Path Flow
                </h3>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs px-2.5 py-1 rounded-lg">
                  {data.pricePathFlow.type}
                </span>
              </div>

              <div className="space-y-4">
                {data.pricePathFlow.steps.map((step, idx) => (
                  <div key={step.stepNumber} className="flex items-start gap-4 relative">
                    {idx < data.pricePathFlow.steps.length - 1 && (
                      <div className="absolute left-4 top-9 w-0.5 h-12 bg-zinc-800" />
                    )}
                    <div className="w-8 h-8 rounded-full bg-zinc-950 border border-amber-500/60 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 z-10">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-zinc-100">{step.title}</span>
                        <span className="text-amber-400 font-bold text-sm">${step.targetPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-zinc-400">Trigger: {step.triggerCondition}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: SECTION 20 STANDARD TEXT REPORT & AI DEEP GROUNDED SYNTHESIS */}
      {activeSectionTab === "raw_report" && (
        <div className="flex flex-col gap-6">
          
          {/* AI Grounded Deep Breakdown (if run) */}
          {data.aiGroundedDeepAnalysis && (
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-zinc-800 pb-3">
                <Zap className="w-5 h-5 fill-amber-400" />
                Gemini Grounded Structural Intelligence Synthesis
              </div>
              <div className="prose prose-invert max-w-none text-zinc-300 text-xs font-mono leading-relaxed">
                <Markdown>{data.aiGroundedDeepAnalysis}</Markdown>
              </div>
            </div>
          )}

          {/* Raw Structured Output according to Specification Section 20 */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-amber-400" />
                  20. Specification Standard Output Report
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Institutional output ready for algorithmic execution, webhooks, and terminal logging
                </p>
              </div>
              <button
                onClick={handleCopyReport}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs px-3 py-1.5 rounded-lg border border-zinc-700 flex items-center gap-1.5 transition"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedReport ? "Copied!" : "Copy Report"}
              </button>
            </div>

            <pre className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto custom-scrollbar whitespace-pre-wrap leading-relaxed">
              {data.structuredTextOutput}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
