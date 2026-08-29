"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Copy,
  Check,
  Clock,
  Layers,
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Sliders,
  Maximize2,
  Calendar,
  DollarSign,
  BarChart2,
  PieChart,
  Target,
  Compass,
  FileText,
  Search,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Info,
} from "lucide-react";
import type { Intraday5mData } from "@/app/api/intraday-5m/route";

interface Props {
  initialData?: Intraday5mData | null;
}

export default function XauusdIntraday5mSection({ initialData }: Props) {
  const [data, setData] = useState<Intraday5mData | null>(initialData || null);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "orderflow" | "structure" | "levels" | "intermarket" | "raw">("overview");
  const [refreshIntervalMinutes, setRefreshIntervalMinutes] = useState<number>(60); // 60 minutes as requested
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60 * 60);

  // Client mounting tracking
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const fetchIntradayData = useCallback(async (isManual = false) => {
    try {
      if (isManual) {
        setLoading(true);
      }
      setError("");
      const res = await fetch(`/api/intraday-5m?t=${Date.now()}&force=${isManual ? "true" : "false"}`, {
        cache: "no-store",
      }).catch(() => null);

      if (res && res.ok) {
        const json: Intraday5mData = await res.json();
        setData(json);
        setSecondsRemaining(refreshIntervalMinutes * 60);
      } else {
        // Fallback retry after brief pause
        setTimeout(async () => {
          try {
            const retryRes = await fetch(`/api/intraday-5m?t=${Date.now()}`, { cache: "no-store" });
            if (retryRes.ok) {
              const retryJson: Intraday5mData = await retryRes.json();
              setData(retryJson);
            }
          } catch {
            // Silently ignore secondary retry
          }
        }, 1200);
      }
    } catch {
      // Gracefully handled
    } finally {
      setLoading(false);
    }
  }, [refreshIntervalMinutes]);

  // Initial fetch on mount
  useEffect(() => {
    let ignore = false;
    const init = async () => {
      try {
        const res = await fetch(`/api/intraday-5m?t=${Date.now()}`, { cache: "no-store" }).catch(() => null);
        if (res && res.ok && !ignore) {
          const json: Intraday5mData = await res.json();
          setData(json);
        } else if (!ignore) {
          // Quick retry on mount
          setTimeout(async () => {
            if (ignore) return;
            try {
              const retryRes = await fetch(`/api/intraday-5m?t=${Date.now()}`, { cache: "no-store" });
              if (retryRes.ok && !ignore) {
                const json: Intraday5mData = await retryRes.json();
                setData(json);
              }
            } catch {
              // Silently ignore
            }
          }, 1000);
        }
      } catch {
        // Handled
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    init();
    return () => {
      ignore = true;
    };
  }, []);

  // Auto-refresh countdown timer (Default every 60 minutes when market is open)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          fetchIntradayData();
          return refreshIntervalMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchIntradayData, refreshIntervalMinutes]);

  // Format countdown mm:ss
  const formattedCountdown = useMemo(() => {
    const m = Math.floor(secondsRemaining / 60);
    const s = secondsRemaining % 60;
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  }, [secondsRemaining]);

  const handleCopyData = () => {
    if (!data) return;
    const textData = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(textData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isWeekendClosed = data ? !data.marketStatus.isOpen : false;

  return (
    <section id="intraday-5m-section" className="bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 border-b border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-amber-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                5-MINUTE INTRADAY DATA LIST
              </span>
              {isWeekendClosed ? (
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  WEEKEND MARKET CLOSED
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  MARKET OPEN • LIVE 5M STREAM
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-[11px] font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-700/60">
                Session: {data?.marketStatus.currentSession || "SYNCHRONIZING"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-100 flex items-center gap-2">
              XAUUSD 5m Institutional Order-Flow & Microstructure
            </h2>
            <p className="text-xs text-zinc-400 max-w-3xl">
              Real-time 5-minute timeframe telemetry capturing spot price, Level-2 DOM depth, delta & cumulative volume, ICT liquidity sweeps, fair value gaps, key session price levels, and market regimes.
            </p>
          </div>

          {/* Auto Refresh & Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <div className="flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Refresh:</span>
              <select
                value={refreshIntervalMinutes}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRefreshIntervalMinutes(val);
                  setSecondsRemaining(val * 60);
                }}
                className="bg-zinc-800 text-amber-300 border border-zinc-700 rounded px-1.5 py-0.5 text-xs focus:outline-none"
              >
                <option value={5}>5m</option>
                <option value={15}>15m</option>
                <option value={60}>60m (Default)</option>
              </select>
              <span className="text-zinc-500">|</span>
              <span className="text-amber-400 font-bold" suppressHydrationWarning>
                {isMounted ? formattedCountdown : "60m 00s"}
              </span>
            </div>

            <button
              onClick={() => fetchIntradayData(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition active:scale-95 disabled:opacity-50 shadow-sm"
              title="Force instant 5m live data collection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Instant Collect
            </button>

            <button
              onClick={handleCopyData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono border border-zinc-700 transition"
              title="Copy complete 5m data list as JSON"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              {copied ? "Copied JSON" : "Copy 5m Data"}
            </button>
          </div>
        </div>

        {/* Weekend Closed Warning Callout */}
        {isWeekendClosed && (
          <div className="mt-3.5 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-300">Weekend Trading Suspension:</span> Spot Gold and COMEX Futures markets are closed for the weekend. No new 5m tick volume is trading until Sunday 21:00 UTC. The table below preserves verified last-session settlement anchors and baseline microstructure.
            </div>
          </div>
        )}
      </div>

      {/* Tabs & Search Navigation */}
      <div className="px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/60 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === "overview"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            All 5m Telemetry (Master Grid)
          </button>
          <button
            onClick={() => setActiveTab("orderflow")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === "orderflow"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            DOM, Delta & Order-Flow
          </button>
          <button
            onClick={() => setActiveTab("structure")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === "structure"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            SMC, FVG & Liquidity
          </button>
          <button
            onClick={() => setActiveTab("levels")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === "levels"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            Session High/Lows & Open Levels
          </button>
          <button
            onClick={() => setActiveTab("intermarket")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === "intermarket"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            5m Intermarket & Macro
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === "raw"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            Raw JSON Feed
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search metric (e.g. FVG, Delta, POC)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-8 pr-3 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 space-y-6">
        {loading && !data && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            <p className="text-sm font-mono">Aggregating live 5-minute institutional order-flow...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Top Metrics Hero Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">5m Spot Price</span>
                <div className="text-lg font-mono font-bold text-amber-300 flex items-center gap-1 mt-0.5">
                  ${data.priceAndSpread.price.toFixed(2)}
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Spread: ${data.priceAndSpread.spread.toFixed(2)} ({data.priceAndSpread.spreadPips} pips)
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">5m Bid / Ask</span>
                <div className="text-sm font-mono font-semibold text-zinc-200 mt-0.5">
                  {data.priceAndSpread.bid.toFixed(2)} / {data.priceAndSpread.ask.toFixed(2)}
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Tick Size: {data.priceAndSpread.tickSize}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">5m Delta & Volume</span>
                <div className={`text-sm font-mono font-bold mt-0.5 ${data.orderFlowAndVolume.delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {data.orderFlowAndVolume.delta >= 0 ? "+" : ""}{data.orderFlowAndVolume.delta} ({data.orderFlowAndVolume.deltaPercent}%)
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Vol: {data.orderFlowAndVolume.tickVolume.toLocaleString()} | Ticks: {data.orderFlowAndVolume.tickCount5m}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">5m Session VWAP & POC</span>
                <div className="text-sm font-mono font-semibold text-zinc-200 mt-0.5">
                  VWAP: ${data.profileAndAtr.vwap.toFixed(2)}
                </div>
                <span className="text-[10px] text-amber-400 font-mono">
                  POC: ${data.profileAndAtr.volumeProfile.poc.toFixed(2)} (VAH: {data.profileAndAtr.volumeProfile.vah})
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">5m ATR & Volatility</span>
                <div className="text-sm font-mono font-semibold text-zinc-200 mt-0.5">
                  ATR(14): ${data.profileAndAtr.atr5m.toFixed(2)}
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  State: {data.profileAndAtr.rangeState.replace("_", " ")}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">5m Market Regime</span>
                <div className="text-sm font-mono font-bold text-amber-300 mt-0.5">
                  {data.regimes.marketRegime.replace("_", " ")}
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Trend Score: {data.regimes.trendRangeScore}/100
                </span>
              </div>
            </div>

            {/* TAB: OVERVIEW / MASTER GRID (All 68 requested data points) */}
            {(activeTab === "overview" || activeTab === "orderflow") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-amber-400" />
                    Section 1: Real-Time 5m Price, Volume & Order-Flow State
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Order-Flow Metrics Card */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 font-mono uppercase border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5" />
                      Tick Data & Volume Delta
                    </h4>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">5m Tick Data Count:</span>
                        <span className="text-zinc-200 font-bold">{data.orderFlowAndVolume.tickCount5m} ticks</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">5m Tick Volume:</span>
                        <span className="text-zinc-200 font-bold">{data.orderFlowAndVolume.tickVolume.toLocaleString()} lots</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Buy Volume:</span>
                        <span className="text-emerald-400 font-bold">{data.orderFlowAndVolume.buyVolume.toLocaleString()} lots</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Sell Volume:</span>
                        <span className="text-rose-400 font-bold">{data.orderFlowAndVolume.sellVolume.toLocaleString()} lots</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Delta (5m Bar):</span>
                        <span className={`font-bold ${data.orderFlowAndVolume.delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {data.orderFlowAndVolume.delta >= 0 ? "+" : ""}{data.orderFlowAndVolume.delta} ({data.orderFlowAndVolume.deltaPercent}%)
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Cumulative Delta (CVD):</span>
                        <span className={`font-bold ${data.orderFlowAndVolume.cumulativeDeltaSession >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {data.orderFlowAndVolume.cumulativeDeltaSession >= 0 ? "+" : ""}{data.orderFlowAndVolume.cumulativeDeltaSession} lots
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-zinc-400">Order-Flow State:</span>
                        <span className="text-amber-300 font-bold">{data.regimes.orderFlowState}</span>
                      </div>
                    </div>
                  </div>

                  {/* DOM / Market Depth & Imbalance */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 font-mono uppercase border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      DOM / Market Depth & Imbalance
                    </h4>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Bid-Ask Imbalance:</span>
                        <span className={`font-bold ${data.orderFlowAndVolume.bidAskImbalanceRatio > 1 ? "text-emerald-400" : "text-rose-400"}`}>
                          {data.orderFlowAndVolume.bidAskImbalanceRatio} : 1.00
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Total Bid Depth (L2):</span>
                        <span className="text-emerald-400 font-bold">{data.orderFlowAndVolume.domDepth.bidDepthTotal} contracts</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Total Ask Depth (L2):</span>
                        <span className="text-rose-400 font-bold">{data.orderFlowAndVolume.domDepth.askDepthTotal} contracts</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Large Orders (&gt;50 lots):</span>
                        <span className="text-amber-300 font-bold">{data.orderFlowAndVolume.largeOrdersCount} blocks detected</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Order Absorption:</span>
                        <span className={`font-bold ${data.orderFlowAndVolume.orderAbsorptionDetected ? "text-amber-400" : "text-zinc-400"}`}>
                          {data.orderFlowAndVolume.orderAbsorptionDetected ? "DETECTED AT LEVEL" : "NO ACTIVE ABSORPTION"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-zinc-400">Absorption Price Level:</span>
                        <span className="text-zinc-200 font-bold">${data.orderFlowAndVolume.absorptionLevel || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Level 2 Micro Ladder Preview */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 space-y-2">
                    <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase border-b border-zinc-800 pb-1.5">
                      Live 5m DOM Orderbook Ladder
                    </h4>
                    <div className="space-y-1 text-[11px] font-mono">
                      {data.orderFlowAndVolume.domDepth.asks.slice(0, 3).reverse().map((ask, i) => (
                        <div key={`ask-${i}`} className="flex items-center justify-between text-rose-400 bg-rose-950/20 px-2 py-0.5 rounded">
                          <span>ASK ${ask.price.toFixed(2)}</span>
                          <span>{ask.volume} lots (Cum: {ask.total})</span>
                        </div>
                      ))}
                      <div className="text-center py-1 text-xs font-bold text-amber-300 bg-amber-500/10 border-y border-amber-500/30">
                        SPOT MID: ${data.priceAndSpread.price.toFixed(2)}
                      </div>
                      {data.orderFlowAndVolume.domDepth.bids.slice(0, 3).map((bid, i) => (
                        <div key={`bid-${i}`} className="flex items-center justify-between text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded">
                          <span>BID ${bid.price.toFixed(2)}</span>
                          <span>{bid.volume} lots (Cum: {bid.total})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: STRUCTURE & SMC (BOS, CHOCH, FVG, Order Block, Sweeps) */}
            {(activeTab === "overview" || activeTab === "structure") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-400" />
                    Section 2: ICT / SMC Market Structure, Liquidity Sweeps & Gaps
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Market Structure Card */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 font-mono uppercase border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      5m Structure & Swings
                    </h4>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Sub-Structure Type:</span>
                        <span className="text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {data.marketStructure.structureType} (Higher High / Higher Low)
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">5m Swing High:</span>
                        <span className="text-zinc-200 font-bold">${data.marketStructure.swingHigh.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">5m Swing Low:</span>
                        <span className="text-zinc-200 font-bold">${data.marketStructure.swingLow.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">BOS (Break of Structure):</span>
                        <span className={`font-bold ${data.marketStructure.bos.detected ? "text-emerald-400" : "text-zinc-400"}`}>
                          {data.marketStructure.bos.detected ? `${data.marketStructure.bos.direction} ($${data.marketStructure.bos.brokenLevel})` : "NO BOS"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">MSS / CHOCH:</span>
                        <span className={`font-bold ${data.marketStructure.mssChoch.detected ? "text-amber-400" : "text-zinc-400"}`}>
                          {data.marketStructure.mssChoch.detected ? `${data.marketStructure.mssChoch.direction} ($${data.marketStructure.mssChoch.level})` : "NO ACTIVE SHIFT"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-zinc-400">Displacement Candle:</span>
                        <span className={`font-bold ${data.marketStructure.displacement.active ? "text-emerald-400" : "text-zinc-400"}`}>
                          {data.marketStructure.displacement.active ? `ACTIVE (${data.marketStructure.displacement.magnitudePoints} pts)` : "NORMAL VOLATILITY"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* FVG & Order Block */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 font-mono uppercase border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Fair Value Gap (FVG) & Order Block
                    </h4>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">FVG Imbalance Zone:</span>
                        <span className="text-emerald-400 font-bold">{data.marketStructure.fvg.type}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">FVG High / Low:</span>
                        <span className="text-zinc-200 font-bold">${data.marketStructure.fvg.top.toFixed(2)} - ${data.marketStructure.fvg.bottom.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Consequent Encroachment (50%):</span>
                        <span className="text-amber-300 font-bold">${data.marketStructure.fvg.midpointConsequentEncroachment.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">FVG Mitigation Status:</span>
                        <span className="text-amber-400 font-bold">{data.marketStructure.fvg.mitigationStatus}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Institutional Order Block (OB):</span>
                        <span className="text-emerald-400 font-bold">{data.marketStructure.orderBlock.type}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-zinc-400">OB Mean Threshold:</span>
                        <span className="text-zinc-200 font-bold">${data.marketStructure.orderBlock.meanThreshold.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Liquidity State & Sweeps */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 font-mono uppercase border-b border-zinc-800 pb-1.5 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" />
                      Liquidity State & Sweep Detection
                    </h4>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Liquidity State:</span>
                        <span className="text-amber-300 font-bold">{data.liquidity.liquidityState.replace(/_/g, " ")}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Liquidity Sweep:</span>
                        <span className={`font-bold ${data.liquidity.liquiditySweep.detected ? "text-emerald-400" : "text-zinc-400"}`}>
                          {data.liquidity.liquiditySweep.detected ? `${data.liquidity.liquiditySweep.direction} ($${data.liquidity.liquiditySweep.sweptLevel})` : "NO SWEEP"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Equal Highs (EQH Liquidity):</span>
                        <span className="text-amber-300 font-bold">
                          {data.liquidity.equalHighsLows.equalHighs.detected ? `DETECTED AT $${data.liquidity.equalHighsLows.equalHighs.level}` : "NONE"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Equal Lows (EQL Liquidity):</span>
                        <span className="text-zinc-400 font-bold">
                          {data.liquidity.equalHighsLows.equalLows.detected ? `DETECTED AT $${data.liquidity.equalHighsLows.equalLows.level}` : "NONE"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Internal Range Equilibrium:</span>
                        <span className="text-zinc-200 font-bold">${data.liquidity.internalLiquidity.equilibrium.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-zinc-400">External BSL / SSL:</span>
                        <span className="text-zinc-200 font-bold">${data.liquidity.externalLiquidity.bslMajor} / ${data.liquidity.externalLiquidity.sslMajor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: KEY LEVELS & SESSIONS */}
            {(activeTab === "overview" || activeTab === "levels") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    Section 3: Key Price Levels, Session Ranges & Open Anchors
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                  {/* Daily & Weekly Levels */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 space-y-2.5">
                    <h4 className="text-xs font-bold text-amber-400 uppercase border-b border-zinc-800 pb-1">
                      Daily & Weekly Anchors
                    </h4>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Daily Open (DO):</span>
                      <span className="text-zinc-200 font-bold">${data.priceLevelsAndSessions.dailyOpen.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Weekly Open (WO):</span>
                      <span className="text-zinc-200 font-bold">${data.priceLevelsAndSessions.weeklyOpen.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Previous Day High (PDH):</span>
                      <span className="text-emerald-400 font-bold">${data.priceLevelsAndSessions.previousDayHigh.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Previous Day Low (PDL):</span>
                      <span className="text-rose-400 font-bold">${data.priceLevelsAndSessions.previousDayLow.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Previous Week High (PWH):</span>
                      <span className="text-emerald-400 font-bold">${data.priceLevelsAndSessions.previousWeekHigh.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Previous Week Low (PWL):</span>
                      <span className="text-rose-400 font-bold">${data.priceLevelsAndSessions.previousWeekLow.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Session Highs & Lows */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 space-y-2.5">
                    <h4 className="text-xs font-bold text-amber-400 uppercase border-b border-zinc-800 pb-1">
                      Session High / Lows
                    </h4>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Active Session Open:</span>
                      <span className="text-zinc-200 font-bold">${data.priceLevelsAndSessions.sessionOpen.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Active Session High:</span>
                      <span className="text-emerald-400 font-bold">${data.priceLevelsAndSessions.sessionHigh.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Active Session Low:</span>
                      <span className="text-rose-400 font-bold">${data.priceLevelsAndSessions.sessionLow.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Asia High (00-08 UTC):</span>
                      <span className="text-zinc-200 font-bold">${data.priceLevelsAndSessions.asiaHigh.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Asia Low (00-08 UTC):</span>
                      <span className="text-zinc-200 font-bold">${data.priceLevelsAndSessions.asiaLow.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">London High / Low:</span>
                      <span className="text-zinc-200 font-bold">${data.priceLevelsAndSessions.londonHigh.toFixed(2)} / ${data.priceLevelsAndSessions.londonLow.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Volume Profile POC / VAH / VAL */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 space-y-2.5">
                    <h4 className="text-xs font-bold text-amber-400 uppercase border-b border-zinc-800 pb-1">
                      Volume Profile & VWAP
                    </h4>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Point of Control (POC):</span>
                      <span className="text-amber-300 font-bold">${data.profileAndAtr.volumeProfile.poc.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Value Area High (VAH):</span>
                      <span className="text-emerald-400 font-bold">${data.profileAndAtr.volumeProfile.vah.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Value Area Low (VAL):</span>
                      <span className="text-rose-400 font-bold">${data.profileAndAtr.volumeProfile.val.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Session VWAP:</span>
                      <span className="text-zinc-200 font-bold">${data.profileAndAtr.vwap.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">VWAP +1σ / -1σ:</span>
                      <span className="text-zinc-200 font-bold">${data.profileAndAtr.vwapUpper1.toFixed(2)} / ${data.profileAndAtr.vwapLower1.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">VWAP +2σ / -2σ:</span>
                      <span className="text-zinc-200 font-bold">${data.profileAndAtr.vwapUpper2.toFixed(2)} / ${data.profileAndAtr.vwapLower2.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Volatility & Momentum */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 space-y-2.5">
                    <h4 className="text-xs font-bold text-amber-400 uppercase border-b border-zinc-800 pb-1">
                      Volatility & Momentum
                    </h4>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">5m ATR (14):</span>
                      <span className="text-zinc-200 font-bold">${data.profileAndAtr.atr5m.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Realized Volatility:</span>
                      <span className="text-zinc-200 font-bold">{data.profileAndAtr.realizedVolatilityAnnualized}% ann.</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">Expansion / Compression:</span>
                      <span className="text-amber-300 font-bold">{data.profileAndAtr.rangeState}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">5m RSI (14):</span>
                      <span className="text-zinc-200 font-bold">{data.profileAndAtr.momentum.rsi5m}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-900">
                      <span className="text-zinc-400">MACD Histogram 5m:</span>
                      <span className={`font-bold ${data.profileAndAtr.momentum.macdHist5m >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {data.profileAndAtr.momentum.macdHist5m}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Momentum State:</span>
                      <span className="text-emerald-400 font-bold">{data.profileAndAtr.momentum.state}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INTERMARKET & MACRO */}
            {(activeTab === "overview" || activeTab === "intermarket") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    Section 4: 5m Intermarket Telemetry, News & Futures Basis
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Intermarket Asset Table */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 space-y-2.5">
                    <h4 className="text-xs font-bold text-amber-400 uppercase font-mono border-b border-zinc-800 pb-1">
                      5m Intermarket Correlations
                    </h4>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">US Dollar Index (DXY):</span>
                        <span className="text-zinc-200 font-bold">{data.intermarket5m.dxy.price.toFixed(2)} ({data.intermarket5m.dxy.correlation} corr)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">US 2Y Yield:</span>
                        <span className="text-zinc-200 font-bold">{data.intermarket5m.us2Y.yield.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">US 10Y Yield:</span>
                        <span className="text-zinc-200 font-bold">{data.intermarket5m.us10Y.yield.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">US 10Y Real TIPS Yield:</span>
                        <span className="text-emerald-400 font-bold">{data.intermarket5m.us10YRealYield.yield.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Silver (XAGUSD):</span>
                        <span className="text-zinc-200 font-bold">${data.intermarket5m.silverXagUsd.price.toFixed(2)} (G/S: {data.intermarket5m.silverXagUsd.goldSilverRatio})</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">S&P 500 / Nasdaq:</span>
                        <span className="text-zinc-200 font-bold">{data.intermarket5m.sp500.price.toFixed(1)} / {data.intermarket5m.nasdaq.price.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-zinc-400">CBOE VIX Volatility:</span>
                        <span className="text-amber-400 font-bold">{data.intermarket5m.vix.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Macro Calendar & News */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 space-y-2.5">
                    <h4 className="text-xs font-bold text-amber-400 uppercase font-mono border-b border-zinc-800 pb-1">
                      Economic Calendar & News Surprise
                    </h4>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="py-1 border-b border-zinc-900">
                        <span className="text-zinc-500 text-[10px] block">Next High-Impact Release:</span>
                        <span className="text-zinc-200 font-bold">{data.macroAndNews5m.nextEventTitle}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Actual / Forecast / Prev:</span>
                        <span className="text-emerald-400 font-bold">{data.macroAndNews5m.actual} / {data.macroAndNews5m.forecast} / {data.macroAndNews5m.previous}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">News Surprise Factor:</span>
                        <span className="text-amber-300 font-bold">{data.macroAndNews5m.newsSurpriseFactor}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Minutes to News:</span>
                        <span className="text-amber-400 font-bold">{data.macroAndNews5m.minutesToNews} minutes</span>
                      </div>
                      <div className="py-1">
                        <span className="text-zinc-500 text-[10px] block">Upcoming Fed Events:</span>
                        <span className="text-zinc-300 font-semibold">{data.macroAndNews5m.upcomingFedEvent}</span>
                      </div>
                    </div>
                  </div>

                  {/* Futures GC & COT Positioning */}
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 space-y-2.5">
                    <h4 className="text-xs font-bold text-amber-400 uppercase font-mono border-b border-zinc-800 pb-1">
                      Futures GC & Institutional COT
                    </h4>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">COMEX Gold Futures (GC):</span>
                        <span className="text-amber-300 font-bold">${data.futuresAndCot.goldFuturesGc.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Futures 24h Volume:</span>
                        <span className="text-zinc-200 font-bold">{data.futuresAndCot.futuresVolume24h.toLocaleString()} contracts</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Futures Open Interest (OI):</span>
                        <span className="text-zinc-200 font-bold">{data.futuresAndCot.futuresOpenInterest.toLocaleString()} contracts</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">Spot-to-Futures Basis:</span>
                        <span className="text-emerald-400 font-bold">+${data.futuresAndCot.basisSpread.toFixed(2)}/oz Contango</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-400">COT Managed Money Net:</span>
                        <span className="text-emerald-400 font-bold">+{data.futuresAndCot.cotPositioning.managedMoneyNetLong.toLocaleString()} lots</span>
                      </div>
                      <div className="py-1">
                        <span className="text-zinc-500 text-[10px] block">Weekly Positioning Shift:</span>
                        <span className="text-zinc-300">{data.futuresAndCot.cotPositioning.weeklyShift}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: RAW JSON FEED */}
            {activeTab === "raw" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">
                    Live Telemetry JSON Feed (5m Institutional Payload):
                  </span>
                  <button
                    onClick={handleCopyData}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded text-xs font-bold font-mono transition flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy Payload"}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[500px]">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
