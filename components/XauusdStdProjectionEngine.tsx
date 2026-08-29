"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Activity,
  Layers,
  Target,
  Compass,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Crosshair,
  BarChart3,
  Sliders,
  Sparkles,
  Search,
} from "lucide-react";
import type { StdProjectionEngineResponse, TimeframeStdProjection, ProjectionCluster } from "../app/api/std-projection/route";

export function XauusdStdProjectionEngine() {
  const [data, setData] = useState<StdProjectionEngineResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedTf, setSelectedTf] = useState<"W1" | "D1" | "H4" | "H1" | "M15" | "M5" | "M1">("M15");
  const [activeWindow, setActiveWindow] = useState<"short20" | "medium50" | "long100">("medium50");
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchProjectionData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch("/api/std-projection", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: StdProjectionEngineResponse = await res.json();
      setData(json);
      setError("");
    } catch (err: any) {
      console.error("StdProjectionEngine fetch error:", err);
      setError(err.message || "Failed to load multi-timeframe standard deviation projections.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadInitial = async () => {
      try {
        const res = await fetch("/api/std-projection", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: StdProjectionEngineResponse = await res.json();
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to load multi-timeframe standard deviation projections.");
          setLoading(false);
        }
      }
    };

    loadInitial();

    if (!autoRefresh) return () => { isMounted = false; };
    const interval = setInterval(() => {
      fetchProjectionData(false);
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchProjectionData, autoRefresh]);

  const activeTfData: TimeframeStdProjection | null = useMemo(() => {
    if (!data?.projections) return null;
    return data.projections[selectedTf] || null;
  }, [data, selectedTf]);

  const windowData = useMemo(() => {
    if (!activeTfData) return null;
    return activeTfData.windows[activeWindow];
  }, [activeTfData, activeWindow]);

  const copyStandardOutput = () => {
    if (!data) return;
    const output = `=====================================================
XAUUSD MULTI-TIMEFRAME STANDARD-DEVIATION PROJECTION
Timestamp: ${data.timestamp} | Spot Price: $${data.currentPrice.toFixed(2)}
Market Session: ${data.marketStatus.session} (Open: ${data.marketStatus.isOpen ? "YES" : "NO - WEEKEND"})
=====================================================

--- TIMEFRAME STATISTICAL PROJECTIONS ---
${Object.entries(data.projections).map(([tf, p]) => `
[${tf}] ${p.name} (ATR: $${p.atr.toFixed(2)})
  +3σ (Extreme Expansion): $${p.activeProjection.plus3Sigma.toFixed(2)}
  +2σ (Strong Extension):   $${p.activeProjection.plus2Sigma.toFixed(2)}
  +1σ (Normal Extension):   $${p.activeProjection.plus1Sigma.toFixed(2)}
  MEAN (Statistical Center): $${p.activeProjection.mean.toFixed(2)} [Slope: ${p.slopes.meanSlope} +$${p.slopes.meanSlopeRate}/p]
  -1σ (Normal Discount):    $${p.activeProjection.minus1Sigma.toFixed(2)}
  -2σ (Deep Discount):      $${p.activeProjection.minus2Sigma.toFixed(2)}
  -3σ (Extreme Rebalancing): $${p.activeProjection.minus3Sigma.toFixed(2)}
  Current Z-Score: ${p.activeProjection.zScore > 0 ? "+" : ""}${p.activeProjection.zScore}σ (${p.activeProjection.zScoreState})
  Regime: ${p.activeProjection.volatilityRegime}
  Decision State: ${p.decisionState.extensionModel}
`).join("")}

--- MULTI-TIMEFRAME PROJECTION CLUSTERS ---
UPPER OBJECTIVE CLUSTERS:
${data.clusters.upperClusters.map(c => `* ${c.id} (${c.typeLabel}) -> Zone: $${c.clusterZone[0]} - $${c.clusterZone[1]} (Score: ${c.score}/100)
  Timeframes: ${c.contributingTimeframes.join(", ")}
  Components: ${c.components.stdLevels.join(" | ")} | ${c.components.liquidity.join(" | ")}
`).join("")}

LOWER OBJECTIVE / REFILL CLUSTERS:
${data.clusters.lowerClusters.map(c => `* ${c.id} (${c.typeLabel}) -> Zone: $${c.clusterZone[1]} - $${c.clusterZone[0]} (Score: ${c.score}/100)
  Timeframes: ${c.contributingTimeframes.join(", ")}
  Components: ${c.components.stdLevels.join(" | ")} | ${c.components.fvgOb || ""}
`).join("")}

--- TARGET LADDER & EXECUTION BOUNDARIES ---
Directional Bias: ${data.targetLadder.directionalBias} (${data.targetLadder.biasRationale})
Valid Entry Zone: $${data.targetLadder.validEntryZone.zoneLow} - $${data.targetLadder.validEntryZone.zoneHigh} (Ideal: $${data.targetLadder.validEntryZone.idealEntry})
Refill Target: $${data.targetLadder.refillZone.midpoint} (${data.targetLadder.refillZone.description})
Structural Invalidation: $${data.targetLadder.invalidation.structuralLevel} (Final Stop: $${data.targetLadder.invalidation.stopLossPrice} with ${data.targetLadder.invalidation.volatilityBuffer} ATR buffer)

TARGET HIERARCHY:
  TP1: $${data.targetLadder.tp1.price} (+${data.targetLadder.tp1.distancePoints} pts) [Score: ${data.targetLadder.tp1.targetScore}/100] -> ${data.targetLadder.tp1.name}
  TP2: $${data.targetLadder.tp2.price} (+${data.targetLadder.tp2.distancePoints} pts) [Score: ${data.targetLadder.tp2.targetScore}/100] -> ${data.targetLadder.tp2.name}
  TP3: $${data.targetLadder.tp3.price} (+${data.targetLadder.tp3.distancePoints} pts) [Score: ${data.targetLadder.tp3.targetScore}/100] -> ${data.targetLadder.tp3.name}

CORE RULE: ${data.stateMatrixSummary.coreRule}
=====================================================`;

    navigator.clipboard.writeText(output);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col gap-6 text-zinc-100 backdrop-blur-md">
      
      {/* Header & Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-black tracking-wide text-zinc-100 uppercase font-mono">
                  XAUUSD Multi-Timeframe Standard-Deviation Projection Engine
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-600/50 text-amber-300">
                  37-POINT SPEC
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Multi-Timeframe Statistical Dispersion &bull; Projection Clusters (Type A&ndash;E) &bull; Target Ladder &bull; Zero Standalone Triggers
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Market Status Indicator */}
          {data?.marketStatus.isWeekendClosed ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-950/80 border border-rose-800/80 text-rose-300 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              WEEKEND CLOSE (FRIDAY SETTLEMENT)
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE TICK DISPERSION ACTIVE
            </span>
          )}

          {/* Copy Report Button */}
          <button
            onClick={copyStandardOutput}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Copy 37-point formatted output"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            {copiedText ? "COPIED" : "COPY PROJECTION"}
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchProjectionData(true)}
            disabled={loading}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition disabled:opacity-50"
            title="Recalculate Projections"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Core Principle Banner */}
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3 text-xs leading-relaxed text-zinc-300">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300 font-mono uppercase tracking-wider block">
            CORE MATHEMATICAL LAW (Section 00 &amp; 37):
          </span>
          <span className="text-zinc-300">
            Standard deviation establishes <strong>WHERE PRICE IS STATISTICALLY LOCATED</strong> and <strong>PROJECTS EXPANSION ZONES</strong>. It is <em>never</em> a standalone BUY/SELL indicator. Projections must always combine: <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded font-mono">STRUCTURE + LIQUIDITY + VOLUME + ORDER FLOW + FVG/OB + VWAP + MACRO</code>.
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/50 border border-rose-800 text-rose-200 p-3 rounded-xl text-xs font-mono">
          {error}
        </div>
      )}

      {/* SECTION 1: Timeframe Tabs & Active TF Statistical Map */}
      <div className="flex flex-col gap-4">
        {/* Timeframe Selector */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 overflow-x-auto">
            {(["W1", "D1", "H4", "H1", "M15", "M5", "M1"] as const).map((tf) => {
              const p = data?.projections?.[tf];
              const z = p?.activeProjection?.zScore || 0;
              const isSelected = selectedTf === tf;
              return (
                <button
                  key={tf}
                  onClick={() => setSelectedTf(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-2 ${
                    isSelected
                      ? "bg-amber-500 text-zinc-950 shadow-md scale-[1.02]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
                  }`}
                >
                  <span>{tf}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-sans ${
                      isSelected
                        ? "bg-zinc-950/20 text-zinc-950 font-black"
                        : Math.abs(z) > 2
                        ? "bg-rose-950 text-rose-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {z > 0 ? `+${z}` : z}&sigma;
                  </span>
                </button>
              );
            })}
          </div>

          {/* Lookback Window Toggle (Section 03) */}
          <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
            <span className="text-[10px] text-zinc-500 uppercase px-2">Window:</span>
            {(["short20", "medium50", "long100"] as const).map((w) => (
              <button
                key={w}
                onClick={() => setActiveWindow(w)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                  activeWindow === w
                    ? "bg-zinc-700 text-amber-300 shadow"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {w === "short20" ? "20p Short" : w === "medium50" ? "50p Med" : "100p Long"}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Timeframe Hero Projection Card */}
        {activeTfData && windowData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: 7-Level Standard Deviation Vertical Projection Map (Section 05) */}
            <div className="lg:col-span-5 bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black font-mono text-amber-400">{activeTfData.name}</span>
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                    ATR: ${activeTfData.atr.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-zinc-500">Z-Score: </span>
                  <span className={`text-xs font-mono font-bold ${Math.abs(windowData.zScore) > 2 ? "text-rose-400" : "text-emerald-400"}`}>
                    {windowData.zScore > 0 ? "+" : ""}{windowData.zScore}&sigma; ({activeTfData.activeProjection.zScoreState})
                  </span>
                </div>
              </div>

              {/* Vertical Ladder */}
              <div className="space-y-1.5 font-mono text-xs">
                {/* +3σ Extreme */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-300">
                  <div className="flex items-center gap-2">
                    <span className="w-10 font-bold text-rose-400">+3.0&sigma;</span>
                    <span className="text-[11px] text-zinc-400">Extreme Extension</span>
                  </div>
                  <span className="font-bold font-mono tracking-wide">${windowData.plus3Sigma.toFixed(2)}</span>
                </div>

                {/* +2σ Strong Extension */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-orange-950/30 border border-orange-900/40 text-orange-300">
                  <div className="flex items-center gap-2">
                    <span className="w-10 font-bold text-orange-400">+2.0&sigma;</span>
                    <span className="text-[11px] text-zinc-400">Upper Statistical Band</span>
                  </div>
                  <span className="font-bold font-mono tracking-wide">${windowData.plus2Sigma.toFixed(2)}</span>
                </div>

                {/* +1σ Normal Variation */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/20 border border-amber-900/30 text-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="w-10 font-bold text-amber-400">+1.0&sigma;</span>
                    <span className="text-[11px] text-zinc-400">Normal Upper Boundary</span>
                  </div>
                  <span className="font-bold font-mono tracking-wide">${windowData.plus1Sigma.toFixed(2)}</span>
                </div>

                {/* CURRENT SPOT PRICE MARKER */}
                <div className="my-1.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-zinc-900 to-amber-500/20 border-2 border-amber-400 flex items-center justify-between text-zinc-100 shadow-md">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-amber-400 animate-spin" />
                    <span className="font-black text-xs text-amber-300 uppercase tracking-wider">LIVE CURRENT PRICE</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-white">${activeTfData.currentPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* MEAN Statistical Center */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-950/30 border border-cyan-900/40 text-cyan-200">
                  <div className="flex items-center gap-2">
                    <span className="w-10 font-bold text-cyan-400">MEAN</span>
                    <span className="text-[11px] text-zinc-400">Equilibrium / POC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1 rounded">
                      {activeTfData.slopes.meanSlope}
                    </span>
                    <span className="font-bold font-mono tracking-wide">${windowData.mean.toFixed(2)}</span>
                  </div>
                </div>

                {/* -1σ Normal Discount */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="w-10 font-bold text-emerald-400">-1.0&sigma;</span>
                    <span className="text-[11px] text-zinc-400">Normal Discount Zone</span>
                  </div>
                  <span className="font-bold font-mono tracking-wide">${windowData.minus1Sigma.toFixed(2)}</span>
                </div>

                {/* -2σ Deep Discount */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-teal-950/30 border border-teal-900/40 text-teal-300">
                  <div className="flex items-center gap-2">
                    <span className="w-10 font-bold text-teal-400">-2.0&sigma;</span>
                    <span className="text-[11px] text-zinc-400">Lower Statistical Band</span>
                  </div>
                  <span className="font-bold font-mono tracking-wide">${windowData.minus2Sigma.toFixed(2)}</span>
                </div>

                {/* -3σ Extreme Oversold */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-950/30 border border-blue-900/40 text-blue-300">
                  <div className="flex items-center gap-2">
                    <span className="w-10 font-bold text-blue-400">-3.0&sigma;</span>
                    <span className="text-[11px] text-zinc-400">Extreme Rebalancing</span>
                  </div>
                  <span className="font-bold font-mono tracking-wide">${windowData.minus3Sigma.toFixed(2)}</span>
                </div>
              </div>

              {/* Band Width & Volatility Regime (Section 10) */}
              <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Band Width (2&sigma;&ndash;-2&sigma;):</span>
                <span className="font-bold text-zinc-200">${windowData.bandWidth.toFixed(2)} ({windowData.bandWidthPct}%)</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeTfData.activeProjection.volatilityRegime === "VOLATILITY_EXPANSION"
                    ? "bg-amber-950 text-amber-300 border border-amber-700"
                    : "bg-zinc-800 text-zinc-300"
                }`}>
                  {activeTfData.activeProjection.volatilityRegime}
                </span>
              </div>
            </div>

            {/* Right: Structural Alignment, Confluences & Decision State Matrix */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* Confluence Grid (Sections 12 - 17) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* 1. Structure + StdDev Alignment (Section 12) */}
                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      1. Structure + Deviation
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {activeTfData.structureAlignment.trend}
                    </span>
                  </div>
                  <div className="text-xs space-y-1 font-mono text-zinc-400">
                    <div className="flex justify-between">
                      <span>BOS Status:</span>
                      <span className="text-zinc-200 font-bold">{activeTfData.structureAlignment.bosStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance to Mean:</span>
                      <span className="text-zinc-200">{activeTfData.structureAlignment.distanceToMeanAtr} ATR</span>
                    </div>
                  </div>
                </div>

                {/* 2. Liquidity Alignment (Section 13) */}
                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                      2. Nearby Liquidity Pool
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                      {activeTfData.confluences.nearbyLiquidity[0]?.type || "BSL"} POOL
                    </span>
                  </div>
                  <div className="text-xs space-y-1 font-mono text-zinc-400">
                    <div className="flex justify-between">
                      <span>Target Level:</span>
                      <span className="text-cyan-300 font-bold">${activeTfData.confluences.nearbyLiquidity[0]?.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Band Overlap:</span>
                      <span className="text-zinc-200">{activeTfData.confluences.nearbyLiquidity[0]?.proximityBand}</span>
                    </div>
                  </div>
                </div>

                {/* 3. FVG / OB Overlap (Sections 14 & 15) */}
                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      3. FVG &amp; Order Block
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                      CONFLUENCE
                    </span>
                  </div>
                  <div className="text-xs space-y-1 font-mono text-zinc-400">
                    <div className="flex justify-between">
                      <span>FVG Range:</span>
                      <span className="text-purple-300 font-bold">
                        ${activeTfData.confluences.fvgOverlap?.range[0]} &ndash; ${activeTfData.confluences.fvgOverlap?.range[1]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nearest Band:</span>
                      <span className="text-zinc-200">{activeTfData.confluences.fvgOverlap?.nearestBand}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Volume Profile & VWAP (Sections 16 & 17) */}
                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                      4. Volume Profile / VWAP
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      POC EQUILIBRIUM
                    </span>
                  </div>
                  <div className="text-xs space-y-1 font-mono text-zinc-400">
                    <div className="flex justify-between">
                      <span>Session POC:</span>
                      <span className="text-emerald-300 font-bold">${activeTfData.confluences.volumeProfileOverlap?.poc.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VWAP Delta:</span>
                      <span className="text-zinc-200">{activeTfData.confluences.vwapOverlap.priceToVwapDelta > 0 ? "+" : ""}{activeTfData.confluences.vwapOverlap.priceToVwapDelta.toFixed(2)} pts</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Decision State Matrix & Mathematical Rationale (Section 28 & 33) */}
              <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Decision Model: {activeTfData.decisionState.extensionModel}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    {activeTfData.decisionState.stateMatrix}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {activeTfData.decisionState.interpretation}
                </p>
                <div className="bg-amber-950/30 border border-amber-600/40 rounded-lg p-2.5 text-[11px] font-mono text-amber-300">
                  <span className="font-bold uppercase text-amber-400">Risk Check: </span>
                  {activeTfData.decisionState.warning}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* SECTION 2: Multi-Timeframe Projection Clusters (Type A to Type E) (Sections 18, 19, 32) */}
      {data?.clusters && (
        <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-200">
                Multi-Timeframe Projection &amp; Liquidity Clusters (Type A&ndash;E)
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Ranked by Multi-Factor Convergence Score
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Upper Objective Clusters (Resistance / Expansion Targets) */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs font-mono font-bold text-rose-400">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  UPPER OBJECTIVE CLUSTERS (BUY-SIDE LIQUIDITY)
                </span>
                <span>{data.clusters.upperClusters.length} Nodes</span>
              </div>

              <div className="space-y-3">
                {data.clusters.upperClusters.map((cluster) => (
                  <div
                    key={cluster.id}
                    className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 transition flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          {cluster.id}
                        </span>
                        <span className="text-xs font-bold font-mono text-zinc-200">
                          ${cluster.clusterZone[0]} &ndash; ${cluster.clusterZone[1]}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        Score: {cluster.score}/100
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 font-mono">
                      {cluster.typeLabel}
                    </p>

                    <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-zinc-300">
                      {cluster.contributingTimeframes.map((tf, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {tf}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lower Objective / Refill Clusters (Demand / Invalidation Zones) */}
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs font-mono font-bold text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" />
                  LOWER OBJECTIVE &amp; REFILL CLUSTERS (DISCOUNT VALUE)
                </span>
                <span>{data.clusters.lowerClusters.length} Nodes</span>
              </div>

              <div className="space-y-3">
                {data.clusters.lowerClusters.map((cluster) => (
                  <div
                    key={cluster.id}
                    className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/50 transition flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {cluster.id}
                        </span>
                        <span className="text-xs font-bold font-mono text-zinc-200">
                          ${cluster.clusterZone[1]} &ndash; ${cluster.clusterZone[0]}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        Score: {cluster.score}/100
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 font-mono">
                      {cluster.typeLabel}
                    </p>

                    <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-zinc-300">
                      {cluster.contributingTimeframes.map((tf, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {tf}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SECTION 3: Intraday Target Ladder & Invalidation Engine (Sections 20 - 27, 35) */}
      {data?.targetLadder && (
        <div className="flex flex-col gap-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-200">
                Intraday Target Ladder &amp; Volatility Invalidation (Refill vs. Destination)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
              BIAS: {data.targetLadder.directionalBias}
            </span>
          </div>

          {/* Target Ladder 4-Tier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* 1. Refill Zone (Section 24) */}
            <div className="bg-zinc-950/80 border border-purple-800/40 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-purple-400 uppercase">
                    1. Refill Zone (Pre-Expansion)
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300">
                    REFILL
                  </span>
                </div>
                <div className="text-base font-black font-mono text-purple-200">
                  ${data.targetLadder.refillZone.midpoint.toFixed(2)}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-tight">
                  Range: ${data.targetLadder.refillZone.priceRange[0]} &ndash; ${data.targetLadder.refillZone.priceRange[1]} (FVG/VWAP)
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-500 mt-2">
                Part of path &bull; Not destination
              </span>
            </div>

            {/* 2. TP1 Nearest Internal Objective */}
            <div className="bg-zinc-950/80 border border-amber-600/40 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-amber-400 uppercase">
                    2. TP1 (Nearest Objective)
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300">
                    Score: {data.targetLadder.tp1.targetScore}
                  </span>
                </div>
                <div className="text-base font-black font-mono text-amber-300">
                  ${data.targetLadder.tp1.price.toFixed(2)}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-tight">
                  +{data.targetLadder.tp1.distancePoints} pts &bull; {data.targetLadder.tp1.reachabilityAtr} ATR (M15 +2&sigma; / VAH)
                </p>
              </div>
              <span className="text-[10px] font-mono text-amber-400/80 mt-2">
                Primary rotational take-profit
              </span>
            </div>

            {/* 3. TP2 Strongest Cluster */}
            <div className="bg-zinc-950/80 border border-cyan-600/40 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase">
                    3. TP2 (Major Liquidity Pool)
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300">
                    Score: {data.targetLadder.tp2.targetScore}
                  </span>
                </div>
                <div className="text-base font-black font-mono text-cyan-300">
                  ${data.targetLadder.tp2.price.toFixed(2)}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-tight">
                  +{data.targetLadder.tp2.distancePoints} pts &bull; {data.targetLadder.tp2.reachabilityAtr} ATR (H1 +2&sigma; / PDH)
                </p>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80 mt-2">
                External BSL sweep objective
              </span>
            </div>

            {/* 4. TP3 Macro Higher-TF Expansion */}
            <div className="bg-zinc-950/80 border border-emerald-600/40 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase">
                    4. TP3 (Macro Expansion)
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">
                    Score: {data.targetLadder.tp3.targetScore}
                  </span>
                </div>
                <div className="text-base font-black font-mono text-emerald-300">
                  ${data.targetLadder.tp3.price.toFixed(2)}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-tight">
                  +{data.targetLadder.tp3.distancePoints} pts &bull; (D1 +2&sigma; / PWH)
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/80 mt-2">
                Multi-day macro wave target
              </span>
            </div>

          </div>

          {/* Invalidation Engine Details (Section 27) */}
          <div className="bg-zinc-950/90 border border-rose-900/40 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
                    Structural Invalidation + Volatility Buffer ($0.45&times;ATR):
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                    STOP: ${data.targetLadder.invalidation.stopLossPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 font-sans">
                  {data.targetLadder.invalidation.rationale} (Distance: {data.targetLadder.invalidation.distanceAtr} ATR | {data.targetLadder.invalidation.distanceSigma}&sigma;)
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Statistical Rating</span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800">
                {data.targetLadder.validEntryZone.statisticalRating} (Entry: ${data.targetLadder.validEntryZone.idealEntry})
              </span>
            </div>
          </div>

        </div>
      )}

      {/* SECTION 4: 6-Step Causal Evaluation Tree (Section 33 & 36) */}
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
            6-Step Decision Reasoning Sequence (Never StdDev alone &rarr; Buy/Sell)
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-bold">STEP 1</span>
            <span className="text-amber-400 font-bold">Higher-TF Trend</span>
            <span className="text-[10px] text-emerald-400">Bullish W1/D1</span>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-bold">STEP 2</span>
            <span className="text-amber-400 font-bold">Acceptance / Rejection</span>
            <span className="text-[10px] text-cyan-400">Above +1&sigma;</span>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-bold">STEP 3</span>
            <span className="text-amber-400 font-bold">Liquidity Map</span>
            <span className="text-[10px] text-purple-400">Untouched BSL</span>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-bold">STEP 4</span>
            <span className="text-amber-400 font-bold">Displacement</span>
            <span className="text-[10px] text-emerald-400">Expansion 2.4x</span>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-bold">STEP 5</span>
            <span className="text-amber-400 font-bold">Structure / BOS</span>
            <span className="text-[10px] text-amber-400">M15/H1 BOS</span>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-bold">STEP 6</span>
            <span className="text-amber-400 font-bold">Order Flow Delta</span>
            <span className="text-[10px] text-emerald-400">+1,480 Aggressive</span>
          </div>
        </div>
      </div>

    </div>
  );
}
