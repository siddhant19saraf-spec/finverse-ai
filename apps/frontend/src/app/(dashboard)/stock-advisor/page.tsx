"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, TrendingUp, TrendingDown, Minus, Shield, Target, Zap, AlertTriangle,
  ChevronRight, Info, ArrowUpRight, ArrowDownRight, BarChart3, Eye
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from "recharts";

const stocks = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy", price: 2850, pe: 28.5, roe: 9.8, debt: 0.35, momentum: 5.2, rsi: 58, sma20: 2780, sma50: 2650, volume: 1.2, dividend: 0.3, week52H: 3024, week52L: 2220 },
  { symbol: "TCS", name: "Tata Consultancy", sector: "IT", price: 3920, pe: 34.2, roe: 48.2, debt: 0.04, momentum: 3.8, rsi: 62, sma20: 3850, sma50: 3700, volume: 0.8, dividend: 1.2, week52H: 4246, week52L: 3056 },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", price: 1720, pe: 19.8, roe: 16.5, debt: 0.85, momentum: 1.5, rsi: 52, sma20: 1700, sma50: 1650, volume: 1.5, dividend: 1.1, week52H: 1794, week52L: 1363 },
  { symbol: "INFY", name: "Infosys", sector: "IT", price: 1680, pe: 28.9, roe: 31.5, debt: 0.08, momentum: 4.1, rsi: 65, sma20: 1620, sma50: 1550, volume: 1.1, dividend: 2.3, week52H: 1918, week52L: 1230 },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking", price: 1280, pe: 18.2, roe: 14.8, debt: 0.72, momentum: 2.8, rsi: 55, sma20: 1250, sma50: 1200, volume: 1.3, dividend: 0.8, week52H: 1362, week52L: 956 },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking", price: 845, pe: 10.5, roe: 18.2, debt: 1.1, momentum: 6.5, rsi: 70, sma20: 810, sma50: 760, volume: 2.1, dividend: 1.8, week52H: 912, week52L: 600 },
  { symbol: "ITC", name: "ITC Limited", sector: "FMCG", price: 465, pe: 25.8, roe: 28.5, debt: 0.02, momentum: -1.2, rsi: 42, sma20: 475, sma50: 485, volume: 0.9, dividend: 3.2, week52H: 500, week52L: 399 },
  { symbol: "WIPRO", name: "Wipro", sector: "IT", price: 540, pe: 22.5, roe: 15.2, debt: 0.22, momentum: 2.1, rsi: 56, sma20: 530, sma50: 510, volume: 0.7, dividend: 0.2, week52H: 624, week52L: 405 },
  { symbol: "TATAMOTORS", name: "Tata Motors", sector: "Auto", price: 980, pe: 8.5, roe: 28.8, debt: 0.95, momentum: 8.2, rsi: 72, sma20: 920, sma50: 850, volume: 1.8, dividend: 0.5, week52H: 1180, week52L: 614 },
  { symbol: "SUNPHARMA", name: "Sun Pharma", sector: "Pharma", price: 1750, pe: 38.2, roe: 14.2, debt: 0.12, momentum: 1.8, rsi: 54, sma20: 1720, sma50: 1680, volume: 0.6, dividend: 0.4, week52H: 1960, week52L: 1175 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom", price: 1580, pe: 72.5, roe: 18.5, debt: 1.85, momentum: 3.5, rsi: 60, sma20: 1540, sma50: 1480, volume: 1.0, dividend: 0.6, week52H: 1779, week52L: 1185 },
  { symbol: "MARUTI", name: "Maruti Suzuki", sector: "Auto", price: 12500, pe: 32.5, roe: 24.2, debt: 0.01, momentum: 4.5, rsi: 63, sma20: 12200, sma50: 11800, volume: 0.5, dividend: 1.0, week52H: 13680, week52L: 9738 },
];

function analyzeStock(s: typeof stocks[0]) {
  let score = 50;
  const signals: { name: string; value: string; impact: "positive" | "negative" | "neutral"; points: number }[] = [];

  // Valuation
  if (s.pe < 15) { score += 12; signals.push({ name: "P/E Ratio", value: `${s.pe} (Undervalued)`, impact: "positive", points: 12 }); }
  else if (s.pe < 25) { score += 6; signals.push({ name: "P/E Ratio", value: `${s.pe} (Fair)`, impact: "neutral", points: 6 }); }
  else { score -= 5; signals.push({ name: "P/E Ratio", value: `${s.pe} (Expensive)`, impact: "negative", points: -5 }); }

  // ROE
  if (s.roe > 20) { score += 10; signals.push({ name: "ROE", value: `${s.roe}% (Excellent)`, impact: "positive", points: 10 }); }
  else if (s.roe > 12) { score += 5; signals.push({ name: "ROE", value: `${s.roe}% (Good)`, impact: "positive", points: 5 }); }
  else { score -= 3; signals.push({ name: "ROE", value: `${s.roe}% (Weak)`, impact: "negative", points: -3 }); }

  // Debt
  if (s.debt < 0.3) { score += 8; signals.push({ name: "Debt/Equity", value: `${s.debt} (Low)`, impact: "positive", points: 8 }); }
  else if (s.debt < 0.8) { score += 3; signals.push({ name: "Debt/Equity", value: `${s.debt} (Moderate)`, impact: "neutral", points: 3 }); }
  else { score -= 5; signals.push({ name: "Debt/Equity", value: `${s.debt} (High)`, impact: "negative", points: -5 }); }

  // Momentum
  if (s.momentum > 5) { score += 8; signals.push({ name: "Momentum", value: `+${s.momentum}% (Strong)`, impact: "positive", points: 8 }); }
  else if (s.momentum > 0) { score += 3; signals.push({ name: "Momentum", value: `+${s.momentum}% (Positive)`, impact: "positive", points: 3 }); }
  else { score -= 4; signals.push({ name: "Momentum", value: `${s.momentum}% (Weak)`, impact: "negative", points: -4 }); }

  // RSI
  if (s.rsi > 70) { score -= 6; signals.push({ name: "RSI", value: `${s.rsi} (Overbought)`, impact: "negative", points: -6 }); }
  else if (s.rsi < 30) { score += 6; signals.push({ name: "RSI", value: `${s.rsi} (Oversold)`, impact: "positive", points: 6 }); }
  else { signals.push({ name: "RSI", value: `${s.rsi} (Neutral)`, impact: "neutral", points: 0 }); }

  // Moving Averages
  if (s.price > s.sma20 && s.price > s.sma50) { score += 5; signals.push({ name: "Moving Avg", value: "Above SMA20 & SMA50", impact: "positive", points: 5 }); }
  else if (s.price < s.sma20 && s.price < s.sma50) { score -= 5; signals.push({ name: "Moving Avg", value: "Below SMA20 & SMA50", impact: "negative", points: -5 }); }
  else { signals.push({ name: "Moving Avg", value: "Mixed signals", impact: "neutral", points: 0 }); }

  // Dividend
  if (s.dividend > 2) { score += 4; signals.push({ name: "Dividend", value: `${s.dividend}% (High)`, impact: "positive", points: 4 }); }

  // 52-week range position
  const range52Pct = ((s.price - s.week52L) / (s.week52H - s.week52L)) * 100;
  if (range52Pct > 80) { score -= 3; signals.push({ name: "52W Range", value: `${range52Pct.toFixed(0)}% from low (Near High)`, impact: "negative", points: -3 }); }
  else if (range52Pct < 30) { score += 5; signals.push({ name: "52W Range", value: `${range52Pct.toFixed(0)}% from low (Near Low)`, impact: "positive", points: 5 }); }
  else { signals.push({ name: "52W Range", value: `${range52Pct.toFixed(0)}% from low`, impact: "neutral", points: 0 }); }

  score = Math.max(0, Math.min(100, score));

  let signal: "BUY" | "SELL" | "HOLD";
  let confidence: number;
  if (score >= 68) { signal = "BUY"; confidence = Math.min(95, 60 + (score - 68) * 2); }
  else if (score <= 38) { signal = "SELL"; confidence = Math.min(95, 60 + (38 - score) * 2); }
  else { signal = "HOLD"; confidence = 50 + Math.abs(score - 53) * 1.5; }

  const riskLevel = s.debt > 1 ? "High" : s.debt > 0.5 ? "Medium" : "Low";
  const positionSize = signal === "BUY" ? Math.round(100 / (1 + s.debt + (s.pe > 30 ? 0.5 : 0))) : signal === "SELL" ? 0 : 50;

  return { score, signal, confidence: Math.round(confidence), signals, riskLevel, positionSize, range52Pct };
}

export default function StockAdvisorPage() {
  const [selectedStock, setSelectedStock] = useState(stocks[0].symbol);

  const stock = stocks.find((s) => s.symbol === selectedStock)!;
  const analysis = useMemo(() => analyzeStock(stock), [selectedStock]);

  const radarData = [
    { metric: "Value", value: Math.max(0, 100 - stock.pe * 2.5) },
    { metric: "Growth", value: Math.min(100, stock.roe * 2) },
    { metric: "Momentum", value: Math.max(0, 50 + stock.momentum * 5) },
    { metric: "Safety", value: Math.max(0, 100 - stock.debt * 60) },
    { metric: "Income", value: Math.min(100, stock.dividend * 25) },
    { metric: "Sentiment", value: stock.rsi },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">AI Stock Advisor</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">AI-powered buy/sell/hold recommendations with full reasoning</p>
        </div>
      </div>

      {/* Stock Selector */}
      <div className="flex flex-wrap gap-2">
        {stocks.map((s) => (
          <button key={s.symbol} onClick={() => setSelectedStock(s.symbol)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              selectedStock === s.symbol
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-white/5 text-muted-foreground hover:text-foreground hover:border-white/10"
            )}>
            {s.symbol}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Analysis */}
        <motion.div layout className="lg:col-span-2 space-y-4">
          {/* Signal Card */}
          <Card className={cn("border-2",
            analysis.signal === "BUY" ? "border-emerald-500/30" :
            analysis.signal === "SELL" ? "border-red-500/30" : "border-amber-500/30"
          )}>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center",
                    analysis.signal === "BUY" ? "bg-emerald-500/15" :
                    analysis.signal === "SELL" ? "bg-red-500/15" : "bg-amber-500/15"
                  )}>
                    {analysis.signal === "BUY" ? <TrendingUp className="w-8 h-8 text-emerald-400" /> :
                     analysis.signal === "SELL" ? <TrendingDown className="w-8 h-8 text-red-400" /> :
                     <Minus className="w-8 h-8 text-amber-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">{stock.symbol}</h2>
                      <Badge variant={analysis.signal === "BUY" ? "success" : analysis.signal === "SELL" ? "destructive" : "warning"} className="text-lg px-3 py-0.5">
                        {analysis.signal}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{stock.name} · {stock.sector}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">₹{stock.price.toLocaleString("en-IN")}</p>
                  <p className={cn("text-sm font-medium flex items-center justify-end gap-1",
                    stock.momentum >= 0 ? "text-emerald-400" : "text-red-400"
                  )}>
                    {stock.momentum >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {stock.momentum >= 0 ? "+" : ""}{stock.momentum}%
                  </p>
                </div>
              </div>

              {/* Confidence + Risk */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 rounded-xl bg-white/[0.03]">
                  <p className="text-xs text-muted-foreground mb-1">AI Score</p>
                  <p className="text-2xl font-bold text-gradient">{analysis.score}/100</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/[0.03]">
                  <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                  <p className="text-2xl font-bold text-blue-400">{analysis.confidence}%</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/[0.03]">
                  <p className="text-xs text-muted-foreground mb-1">Position Size</p>
                  <p className="text-2xl font-bold text-purple-400">{analysis.positionSize}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reasoning Breakdown */}
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Eye className="w-4 h-4" /> AI Reasoning Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.signals.map((sig, i) => (
                  <motion.div key={sig.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full",
                        sig.impact === "positive" ? "bg-emerald-400" :
                        sig.impact === "negative" ? "bg-red-400" : "bg-amber-400"
                      )} />
                      <span className="text-sm font-medium">{sig.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{sig.value}</span>
                      <span className={cn("text-xs font-mono font-bold",
                        sig.points > 0 ? "text-emerald-400" : sig.points < 0 ? "text-red-400" : "text-muted-foreground"
                      )}>
                        {sig.points > 0 ? "+" : ""}{sig.points}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.signal === "BUY" && `${stock.symbol} shows strong fundamentals with ${stock.roe}% ROE and low debt (${stock.debt}). Technical momentum is positive at +${stock.momentum}%. The stock is ${analysis.range52Pct > 60 ? "trading near its 52-week high" : "available at a reasonable level from its 52-week low"}. Consider a ${analysis.positionSize}% position with a stop-loss at SMA50 (₹${stock.sma50.toLocaleString("en-IN")}).`}
                  {analysis.signal === "SELL" && `${stock.symbol} shows weakening signals. ${stock.pe > 30 ? "P/E ratio is elevated at " + stock.pe : "Technical momentum is negative at " + stock.momentum + "%"}. ${stock.debt > 0.8 ? "High debt levels add risk." : ""} Consider reducing position or exiting. Risk level: ${analysis.riskLevel}.`}
                  {analysis.signal === "HOLD" && `${stock.symbol} is showing mixed signals. ${stock.pe > 25 ? "Valuation is slightly stretched" : "Valuation is fair"} with ${stock.roe}% ROE. Maintain current position. Watch for breakout above ₹${stock.sma20.toLocaleString("en-IN")} (SMA20) for bullish confirmation.`}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Radar + Details */}
        <motion.div layout className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">AI Analysis Radar</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "#71717a", fontSize: 10 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                    <Radar name="Score" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} strokeWidth={2} />
                    <Tooltip formatter={(v: any) => `${Math.round(v)}/100`} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Key Metrics</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "P/E Ratio", value: stock.pe.toFixed(1), status: stock.pe < 20 ? "good" : stock.pe < 30 ? "neutral" : "bad" },
                { label: "ROE", value: `${stock.roe}%`, status: stock.roe > 20 ? "good" : stock.roe > 12 ? "neutral" : "bad" },
                { label: "Debt/Equity", value: stock.debt.toFixed(2), status: stock.debt < 0.3 ? "good" : stock.debt < 0.8 ? "neutral" : "bad" },
                { label: "RSI", value: stock.rsi.toString(), status: stock.rsi < 30 ? "good" : stock.rsi > 70 ? "bad" : "neutral" },
                { label: "Momentum", value: `${stock.momentum > 0 ? "+" : ""}${stock.momentum}%`, status: stock.momentum > 3 ? "good" : stock.momentum < 0 ? "bad" : "neutral" },
                { label: "Div Yield", value: `${stock.dividend}%`, status: stock.dividend > 2 ? "good" : "neutral" },
                { label: "Risk Level", value: analysis.riskLevel, status: analysis.riskLevel === "Low" ? "good" : analysis.riskLevel === "Medium" ? "neutral" : "bad" },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium">{m.value}</span>
                    <div className={cn("w-1.5 h-1.5 rounded-full",
                      m.status === "good" ? "bg-emerald-400" : m.status === "bad" ? "bg-red-400" : "bg-amber-400"
                    )} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-amber-400/80 leading-relaxed">
                <strong>Educational Disclaimer:</strong> AI recommendations are based on algorithmic analysis of fundamentals and technicals. They are NOT financial advice. Always do your own research.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
