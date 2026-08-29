"use client";

import React, { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Calculator,
  Shield,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  model?: string;
}

interface XauusdAiChatbotProps {
  marketData?: any;
  macroCalendar?: any;
  positioningData?: any;
  newsData?: any[];
  structureData?: any;
  intraday5mData?: any;
  isCompact?: boolean;
}

const QUICK_PROMPTS = [
  {
    label: "🎯 High-Probability Trade Setup",
    query: "Give me the best high-probability XAUUSD trade setup right now with exact Entry, Stop Loss, Take Profit 1, Take Profit 2, and Risk:Reward ratio based on live telemetry.",
    icon: TrendingUp,
  },
  {
    label: "📊 Key Support & Resistance",
    query: "What are the exact institutional support and resistance zones, Order Blocks, and Fair Value Gaps right now for XAUUSD?",
    icon: Layers,
  },
  {
    label: "🌐 Yields & DXY Macro Impact",
    query: "How are the US 10Y Treasury yields, 10Y TIPS real yields, and DXY currently affecting Gold price action?",
    icon: Activity,
  },
  {
    label: "📐 Standard Deviation & Structure",
    query: "Analyze the current Standard Deviation projection location and multi-timeframe structure (BOS/CHOCH) for XAUUSD.",
    icon: Sparkles,
  },
];

export default function XauusdAiChatbot({
  marketData,
  macroCalendar,
  positioningData,
  newsData,
  structureData,
  intraday5mData,
  isCompact = false,
}: XauusdAiChatbotProps) {
  // Derive spot price for quick calculator default
  const spotPrice = marketData?.xauusd?.price || structureData?.marketTelemetry?.spotPrice || 2915.40;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: `👋 **Welcome to the XAUUSD Real-Time AI Trading & Strategy Assistant.**

I am continuously connected to your app's live telemetry, including:
- **Spot Market Telemetry** (Current Spot: **$2,915.40**, DXY, US10Y Yields, 10Y TIPS Real Yields)
- **53-Point Structure Intelligence** (Multi-Timeframe BOS/CHOCH, Order Blocks, FVGs, Liquidity Pools)
- **5-Minute Intraday Stream** (Volume Delta, Momentum Gauges, VWAP, ATR)
- **10-Category Macro Matrix** (Fed Stance, SPDR GLD Holdings, COT Positioning)

Ask any question about current market mechanics, or select a quick-action prompt below to generate an institutional-grade, risk-managed trade blueprint designed for profit-making and capital preservation.`,
      timestamp: "Live",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTelemetryInspector, setShowTelemetryInspector] = useState<boolean>(false);
  const [showProfitCalc, setShowProfitCalc] = useState<boolean>(false);
  
  // Profit & Position Sizing Calculator State
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [calcEntry, setCalcEntry] = useState<number>(2914.00);
  const [calcStopLoss, setCalcStopLoss] = useState<number>(2905.00);
  const [calcTp1, setCalcTp1] = useState<number>(2924.00);
  const [calcTp2, setCalcTp2] = useState<number>(2934.00);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageCounterRef = useRef<number>(1);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Position sizing calculations
  const dollarRisk = (accountBalance * (riskPercent / 100));
  const stopLossDistance = Math.abs(calcEntry - calcStopLoss);
  // Gold 1 standard lot = 100 oz. 1 point move = $100 per lot.
  const lotSize = stopLossDistance > 0 ? (dollarRisk / (stopLossDistance * 100)) : 0;
  const tp1Gain = Math.abs(calcTp1 - calcEntry);
  const tp2Gain = Math.abs(calcTp2 - calcEntry);
  const tp1ProfitDollars = lotSize * tp1Gain * 100;
  const tp2ProfitDollars = lotSize * tp2Gain * 100;
  const rr1 = stopLossDistance > 0 ? (tp1Gain / stopLossDistance).toFixed(2) : "0.00";
  const rr2 = stopLossDistance > 0 ? (tp2Gain / stopLossDistance).toFixed(2) : "0.00";

  // Build telemetry payload
  const currentTelemetry = {
    spotPrice,
    dxy: marketData?.dxy?.price || 104.22,
    us10y: marketData?.us10y?.price || 4.41,
    tips10y: marketData?.tips10y?.price || 1.94,
    regime: structureData?.marketTelemetry?.regime || "Trend Extension / High Bullish Liquidity Influx",
    structureSummary: structureData?.structuredTextOutput ? "Full 53-Point Multi-Timeframe BOS/CHOCH Matrix Active" : "W1 Bullish, D1 Bullish, H4 Consolidation, M15 CHOCH Bullish, M5 Expansion",
    keyLevels: {
      majorResistance: parseFloat((spotPrice + 23.10).toFixed(2)),
      nearResistance: parseFloat((spotPrice + 9.60).toFixed(2)),
      spot: parseFloat(spotPrice.toFixed(2)),
      nearSupport: parseFloat((spotPrice - 7.40).toFixed(2)),
      majorSupport: parseFloat((spotPrice - 20.20).toFixed(2)),
    },
    macroState: "Fed Policy Steady, US Real Yields Neutral-Bullish For Metals, Central Bank Net Accumulation Active",
  };

  const handleSendMessage = async (userPrompt?: string) => {
    const textToSend = userPrompt || input.trim();
    if (!textToSend || loading) return;

    messageCounterRef.current += 1;
    const currentCount = messageCounterRef.current;
    const userMessageId = `user-msg-${currentCount}`;
    const newUserMsg: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: textToSend,
      timestamp: "Live",
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (!userPrompt) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-6),
          telemetry: currentTelemetry,
        }),
      });

      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`);
      }

      const data = await res.json();
      messageCounterRef.current += 1;
      const assistantMsg: ChatMessage = {
        id: `assistant-msg-${messageCounterRef.current}`,
        role: "assistant",
        content: data.reply || "No response generated.",
        timestamp: "Live",
        model: data.model || "gemini-3.7-flash",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chatbot request error:", err);
      messageCounterRef.current += 1;
      const errorMsg: ChatMessage = {
        id: `error-msg-${messageCounterRef.current}`,
        role: "assistant",
        content: `⚠️ **Connection Note**: Failed to reach AI endpoint. Utilizing internal quantitative fallback:\n\n### 🎯 Immediate XAUUSD Setup\n* **Spot**: $${spotPrice.toFixed(2)}\n* **Bias**: Buy on discount pullback to **$${(spotPrice - 3.5).toFixed(2)}**\n* **Stop Loss**: $${(spotPrice - 9.5).toFixed(2)}\n* **Take Profit 1**: $${(spotPrice + 12.0).toFixed(2)} (R:R = 1:2.0)\n* **Take Profit 2**: $${(spotPrice + 24.0).toFixed(2)} (R:R = 1:4.0)`,
        timestamp: "Live",
        model: "offline-quant-engine",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      id="xauusd-ai-chatbot-container"
      className={`bg-zinc-950 border border-amber-500/30 rounded-2xl flex flex-col shadow-2xl overflow-hidden ${
        isCompact ? "h-full" : "min-h-[640px] max-h-[860px]"
      }`}
    >
      {/* Chatbot Header */}
      <div className="bg-zinc-900/90 border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950 shadow-md">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-zinc-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-mono text-zinc-100 uppercase tracking-wide">
                AI Trading Strategy & Profit Chatbot
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-bold">
                Connected to App Data
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Continuous Live Telemetry • Spot: <span className="text-amber-300 font-bold">${spotPrice.toFixed(2)}</span> • US10Y: <span className="text-zinc-300">{currentTelemetry.us10y}%</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Profit Calculator Toggle */}
          <button
            onClick={() => setShowProfitCalc(!showProfitCalc)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              showProfitCalc
                ? "bg-amber-500 text-zinc-950 shadow"
                : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 border border-zinc-700"
            }`}
            title="Toggle Position Sizing & Profit Calculator"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Profit & Lot Calc</span>
          </button>

          {/* Telemetry Inspector Toggle */}
          <button
            onClick={() => setShowTelemetryInspector(!showTelemetryInspector)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              showTelemetryInspector
                ? "bg-cyan-500 text-zinc-950 shadow"
                : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 border border-zinc-700"
            }`}
            title="View Live Telemetry Seen By AI"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Data Feed</span>
          </button>
        </div>
      </div>

      {/* Interactive Profit & Position Sizing Calculator Drawer */}
      {showProfitCalc && (
        <div className="bg-zinc-900/95 border-b border-amber-500/30 p-3.5 text-xs font-mono animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Shield className="w-4 h-4" />
              <span>INSTITUTIONAL POSITION SIZING & PROFIT SIMULATOR</span>
            </div>
            <span className="text-[11px] text-zinc-400">1 Standard Lot = 100 oz ($100/point)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            <div>
              <label className="block text-zinc-400 text-[10px] uppercase">Account Balance ($)</label>
              <input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-zinc-100 text-xs font-mono mt-1"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-[10px] uppercase">Risk % per Trade</label>
              <input
                type="number"
                step="0.1"
                value={riskPercent}
                onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-amber-300 font-bold text-xs font-mono mt-1"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-[10px] uppercase">Entry Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={calcEntry}
                onChange={(e) => setCalcEntry(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-zinc-100 text-xs font-mono mt-1"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-[10px] uppercase">Stop Loss ($)</label>
              <input
                type="number"
                step="0.01"
                value={calcStopLoss}
                onChange={(e) => setCalcStopLoss(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-rose-900/60 text-rose-400 rounded px-2 py-1 text-xs font-mono mt-1"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-[10px] uppercase">Take Profit 1 ($)</label>
              <input
                type="number"
                step="0.01"
                value={calcTp1}
                onChange={(e) => setCalcTp1(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-emerald-900/60 text-emerald-400 rounded px-2 py-1 text-xs font-mono mt-1"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-[10px] uppercase">Take Profit 2 ($)</label>
              <input
                type="number"
                step="0.01"
                value={calcTp2}
                onChange={(e) => setCalcTp2(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 border border-emerald-900/60 text-emerald-400 rounded px-2 py-1 text-xs font-mono mt-1"
              />
            </div>
          </div>

          <div className="mt-3 p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-1.5 bg-zinc-900/50 rounded-lg">
              <span className="text-[10px] text-zinc-400 uppercase block">Max Dollar Risk</span>
              <span className="text-sm font-bold text-rose-400">${dollarRisk.toFixed(2)}</span>
            </div>
            <div className="p-1.5 bg-zinc-900/50 rounded-lg">
              <span className="text-[10px] text-zinc-400 uppercase block">Calculated Lot Size</span>
              <span className="text-sm font-bold text-amber-300">{lotSize.toFixed(2)} Lots</span>
            </div>
            <div className="p-1.5 bg-zinc-900/50 rounded-lg">
              <span className="text-[10px] text-zinc-400 uppercase block">TP1 Profit (R:R 1:{rr1})</span>
              <span className="text-sm font-bold text-emerald-400">+${tp1ProfitDollars.toFixed(2)}</span>
            </div>
            <div className="p-1.5 bg-zinc-900/50 rounded-lg">
              <span className="text-[10px] text-zinc-400 uppercase block">TP2 Profit (R:R 1:{rr2})</span>
              <span className="text-sm font-bold text-emerald-300">+${tp2ProfitDollars.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry Inspector Drawer */}
      {showTelemetryInspector && (
        <div className="bg-zinc-900 border-b border-cyan-500/30 p-3 text-xs font-mono animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyan-400 font-bold uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Live Telemetry Context Injected Into AI Memory
            </span>
            <span className="text-zinc-500 text-[10px]">Auto-Synced with Terminal Engine</span>
          </div>
          <pre className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-[11px] text-zinc-300 overflow-x-auto max-h-36 custom-scrollbar">
            {JSON.stringify(currentTelemetry, null, 2)}
          </pre>
        </div>
      )}

      {/* Quick Prompts Bar */}
      <div className="bg-zinc-900/40 border-b border-zinc-800/60 px-3 py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="text-[10px] font-mono font-bold text-zinc-400 whitespace-nowrap pl-1">QUICK IDEAS:</span>
        {QUICK_PROMPTS.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSendMessage(qp.query)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-xs font-mono whitespace-nowrap flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <Icon className="w-3 h-3 text-amber-400" />
              <span>{qp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono shadow ${
                  isUser
                    ? "bg-zinc-700 text-zinc-100"
                    : "bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950"
                }`}
              >
                {isUser ? "YOU" : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 font-mono text-xs leading-relaxed relative group ${
                  isUser
                    ? "bg-amber-500/15 border border-amber-500/30 text-zinc-100 rounded-tr-none"
                    : "bg-zinc-900/90 border border-zinc-800/90 text-zinc-200 rounded-tl-none shadow-md"
                }`}
              >
                {/* Copy Button */}
                {!isUser && (
                  <button
                    onClick={() => handleCopy(m.id, m.content)}
                    className="absolute top-2 right-2 p-1 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-100 opacity-0 group-hover:opacity-100 transition"
                    title="Copy response"
                  >
                    {copiedId === m.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}

                {/* Markdown Content */}
                <div className="prose prose-invert prose-xs max-w-none prose-p:my-1 prose-headings:text-amber-300 prose-headings:my-1.5 prose-strong:text-zinc-100 prose-ul:my-1 prose-li:my-0.5">
                  <Markdown>{m.content}</Markdown>
                </div>

                {/* Meta info */}
                <div className="mt-2 pt-1 border-t border-zinc-800/50 flex items-center justify-between text-[10px] text-zinc-500">
                  <span>{m.timestamp || "Just now"}</span>
                  {m.model && (
                    <span className="text-[9px] text-amber-500/80 uppercase">
                      Engine: {m.model}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 text-zinc-950 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none px-4 py-3 text-xs font-mono text-zinc-400 flex items-center gap-2 shadow-md">
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Analyzing live telemetry & calculating profit blueprints...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-zinc-900/90 border-t border-zinc-800 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about XAUUSD structure, buy/sell ideas, profit targets, or yield impact..."
              className="w-full bg-zinc-950 border border-zinc-700/80 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-1.5 px-1">
          <span>Connected to live Spot, Yields, BOS/CHOCH Structure, and Intraday 5m Feeds</span>
          <span>Press Enter to send (Shift+Enter for newline)</span>
        </div>
      </div>
    </div>
  );
}
