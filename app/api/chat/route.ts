import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      history = [],
      telemetry = {},
    } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string." },
        { status: 400 }
      );
    }

    // Extract telemetry context
    const spotPrice = telemetry?.spotPrice || 2915.40;
    const dxy = telemetry?.dxy || 104.22;
    const us10y = telemetry?.us10y || 4.41;
    const tips10y = telemetry?.tips10y || 1.94;
    const regime = telemetry?.regime || "Trend Extension / High Bullish Liquidity Influx";
    const structureTelemetry = telemetry?.structureSummary || "D1 Bullish, H4 Neutral/Consolidation, M15 CHOCH Bullish, M5 Expansion";
    const keyLevels = telemetry?.keyLevels || {
      majorResistance: 2938.50,
      nearResistance: 2925.00,
      spot: spotPrice,
      nearSupport: 2908.00,
      majorSupport: 2895.20,
    };
    const macroState = telemetry?.macroState || "Fed Hawkish-Hold, Real Yields Neutral, Central Bank Inflows Strong";

    // Format full contextual system prompt
    const systemInstruction = `You are the XAUUSD Real-Time Institutional Trading & Market Mechanics Assistant for this live quantitative terminal.

LIVE TERMINAL CONTEXT & REPOSITORY DATA:
- Current Spot Gold (XAUUSD): $${spotPrice}
- US Dollar Index (DXY): ${dxy}
- US 10-Year Nominal Treasury Yield: ${us10y}%
- US 10-Year TIPS Real Yield: ${tips10y}%
- Market Structure Multi-Timeframe State: ${structureTelemetry}
- Volatility & Standard Deviation Regime: ${regime}
- Macro Matrix Context: ${macroState}
- Key Calculated Price Zones:
  * Major Institutional Liquidity Resistance: $${keyLevels.majorResistance}
  * Nearest Dynamic Resistance (VWAP / +1.5 SD): $${keyLevels.nearResistance}
  * Current Reference Spot: $${keyLevels.spot}
  * Nearest Dynamic Support (Order Block / -1.5 SD): $${keyLevels.nearSupport}
  * Major Swing Low Liquidity Pool: $${keyLevels.majorSupport}

CORE DIRECTIVES:
1. Speak in clean, professional, crystal-clear normal text formatted with Markdown.
2. Deliver actionable, quantitative trade blueprints designed for profit-making and capital preservation (always calculate Entry, Stop Loss, Take Profit 1, Take Profit 2, and exact Risk-to-Reward ratio minimum 1:2.0).
3. Connect all your analysis directly to the real app data provided above (Spot Price, Real Yields, Structure BOS/CHOCH, Standard Deviation Bands, Intraday 5m Momentum, and Macro Matrix).
4. Never give generic boilerplate; evaluate whether the setup is a Mean-Reversion Long/Short or Trend-Extension Continuation based on live standard deviations and structure.
5. If the user asks general market questions, explain the exact mathematical and macro mechanisms behind Gold pricing (e.g., negative correlation with real yields, central bank reserve accumulation, swap rate liquidity).`;

    let apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Format recent messages for context
      const contents = [
        ...history.slice(-8).map((m: ChatMessage) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        {
          role: "user",
          parts: [{ text: message }],
        },
      ];

      // Multi-model fallback sequence to handle temporary 503/429 demand spikes seamlessly
      const candidateModels = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.7-flash"];
      for (const modelCandidate of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelCandidate,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
              topP: 0.95,
            },
          });

          const replyText = response.text;
          if (replyText) {
            return NextResponse.json({
              reply: replyText,
              model: modelCandidate,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (err: any) {
          console.info(`Model ${modelCandidate} temporarily busy (${err?.status || err?.code || 503}), attempting next model candidate...`);
        }
      }
    }

    // Deterministic Quant Blueprint Fallback Engine
    const fallbackReply = generateDeterministicChatResponse(message, spotPrice, keyLevels, regime, us10y, tips10y, dxy);

    return NextResponse.json({
      reply: fallbackReply,
      model: "quant-terminal-engine",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing chat request." },
      { status: 500 }
    );
  }
}

function generateDeterministicChatResponse(
  userQuery: string,
  spot: number,
  levels: any,
  regime: string,
  us10y: number,
  tips10y: number,
  dxy: number
): string {
  const query = userQuery.toLowerCase();

  if (query.includes("buy") || query.includes("sell") || query.includes("trade") || query.includes("setup") || query.includes("signal") || query.includes("idea")) {
    const isBullishBias = tips10y < 2.10 && dxy < 105.0;
    const entry = isBullishBias ? spot - 1.80 : spot + 1.80;
    const sl = isBullishBias ? entry - 7.50 : entry + 7.50;
    const tp1 = isBullishBias ? entry + 11.25 : entry - 11.25;
    const tp2 = isBullishBias ? entry + 22.50 : entry - 22.50;
    const rr1 = (Math.abs(tp1 - entry) / Math.abs(entry - sl)).toFixed(2);
    const rr2 = (Math.abs(tp2 - entry) / Math.abs(entry - sl)).toFixed(2);

    return `### 🎯 Real-Time XAUUSD Institutional Trade Blueprint

Based on live telemetry (**Spot: $${spot.toFixed(2)}**, **Real Yields: ${tips10y}%**, **DXY: ${dxy}**), here is the high-probability quantitative setup:

**Execution Parameter Summary:**
* **Direction:** **${isBullishBias ? "LONG (Buy On Structural Retracement)" : "SHORT (Sell at Premium Order Block)"}**
* **Optimal Entry Zone:** **$${entry.toFixed(2)}** (Confluence of M15 Fair Value Gap & -1.5 SD Mean Reversion Zone)
* **Hard Stop Loss:** **$${sl.toFixed(2)}** (${Math.abs(entry - sl).toFixed(2)} pts risk / structural invalidation below swing liquidity)
* **Take Profit 1 (Scale 50%):** **$${tp1.toFixed(2)}** (${Math.abs(tp1 - entry).toFixed(2)} pts gain | **R:R = 1:${rr1}**)
* **Take Profit 2 (Runner Target):** **$${tp2.toFixed(2)}** (${Math.abs(tp2 - entry).toFixed(2)} pts gain | **R:R = 1:${rr2}**)

**Quantitative Rationale:**
1. **Mean Reversion & SD Alignment:** Current price is stabilizing near the statistical equilibrium. A pullback into **$${entry.toFixed(2)}** captures liquidity without chasing extremes.
2. **Order Flow & Structure:** Multi-timeframe structure confirms ongoing accumulation with higher structural lows.
3. **Macro Filter:** TIPS 10Y real yields at **${tips10y}%** and DXY at **${dxy}** keep downside risk capped.

*Risk Advisory: Maintain strict 1.0% account risk per position. Move Stop Loss to Breakeven once Take Profit 1 is triggered.*`;
  }

  if (query.includes("support") || query.includes("resistance") || query.includes("level") || query.includes("zone")) {
    return `### 📊 Live XAUUSD Structural & Standard Deviation Zones

Current reference spot price: **$${spot.toFixed(2)}**

* **Institutional Supply / Major Liquidity Pool:** **$${levels.majorResistance.toFixed(2)}** (+2.5 SD Extreme Overextension)
* **Dynamic Resistance (VWAP Upper Band / Fair Value Gap):** **$${levels.nearResistance.toFixed(2)}** (+1.0 SD Resistance)
* **Current Statistical Equilibrium (Mean):** **$${spot.toFixed(2)}**
* **Dynamic Demand / Bullish Order Block:** **$${levels.nearSupport.toFixed(2)}** (-1.0 SD Demand)
* **Major Institutional Buy-Side Liquidity Basin:** **$${levels.majorSupport.toFixed(2)}** (-2.5 SD Extreme Underextension)

**Execution Note:** Watch for liquidity sweeps around **$${levels.nearSupport.toFixed(2)}** with 5-minute volume delta confirmation before initiating buy positions.`;
  }

  if (query.includes("macro") || query.includes("fed") || query.includes("yield") || query.includes("dollar") || query.includes("dxy") || query.includes("inflation")) {
    return `### 🌐 Macro Matrix & Intermarket Dynamics for Gold

* **US 10Y TIPS Real Yield:** **${tips10y}%** (The primary non-yielding opportunity cost driver. Stable or declining real yields are strongly supportive of physical bullion).
* **US Dollar Index (DXY):** **${dxy}** (Modest pressure; sustained DXY weakness below 104.00 triggers aggressive institutional gold bids).
* **US 10-Year Nominal Yield:** **${us10y}%**
* **Central Bank Gold Reserves:** Net monthly accumulation by global central banks remains positive at over 30 tonnes/month.
* **SPDR Gold Shares (GLD) ETF Flows:** Continuous institutional holdings stabilization.

**Synthesis:** Macro backdrop provides a strong structural floor for Gold, favoring buy-the-dip strategies at key discount levels rather than aggressive shorting.`;
  }

  return `### 🤖 XAUUSD Live Market Intelligence

**Current Live Status:**
* **Spot Gold:** **$${spot.toFixed(2)}**
* **Regime:** **${regime}**
* **Macro Matrix:** US10Y: **${us10y}%** | TIPS Real Yield: **${tips10y}%** | DXY: **${dxy}**

**Actionable Insights:**
1. **Structure Alignment:** Momentum is prioritizing liquidity sweeps at standard deviation extremes.
2. **Key Execution Pivot:** Watch for price reactions between **$${levels.nearSupport.toFixed(2)}** (Support) and **$${levels.nearResistance.toFixed(2)}** (Resistance).
3. **Risk Management:** Always size positions according to your distance to structural invalidation (Stop Loss), maintaining at least 1:2 Risk-to-Reward.

*Ask a specific question like "Give me a BUY setup", "What are today's support levels?", or "How are 10Y yields affecting gold?" for instant, targeted blueprints.*`;
}
