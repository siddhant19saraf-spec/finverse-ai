"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageSpinner, ErrorBanner, CardSpinner } from "@/components/ui/loading";
import { formatCurrency, formatPercent, getChangeColor } from "@/lib/utils";
import { usePortfolioSummary, usePortfolioAllocation, usePortfolioRisk, usePortfolioPerformance, useMarketQuotes } from "@/lib/hooks";
import { useAppStore } from "@/stores/app";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];

export default function PortfolioPage() {
  const [tab, setTab] = useState<"holdings" | "performance" | "risk">("holdings");
  const userId = useAppStore((s) => s.userId);
  const portfolioId = userId;

  const { data: summary, isLoading: summaryLoading, error: summaryError, refetch: refetchSummary } = usePortfolioSummary(portfolioId);
  const { data: allocation } = usePortfolioAllocation(portfolioId);
  const { data: risk } = usePortfolioRisk(portfolioId);
  const { data: performance } = usePortfolioPerformance(portfolioId);

  const s = summary as any;
  const r = risk as any;
  const p = performance as any;

  const holdings = s?.holdings ?? [
    { symbol: "RELIANCE", qty: 50, avg_price: 2450, current_price: 2850, pnl: 20000, allocation: 28 },
    { symbol: "TCS", qty: 30, avg_price: 3600, current_price: 3920, pnl: 9600, allocation: 19 },
    { symbol: "HDFCBANK", qty: 40, avg_price: 1650, current_price: 1720, pnl: 2800, allocation: 13 },
    { symbol: "INFY", qty: 60, avg_price: 1500, current_price: 1680, pnl: 10800, allocation: 11 },
    { symbol: "ICICIBANK", qty: 80, avg_price: 1050, current_price: 1185, pnl: 10800, allocation: 9 },
    { symbol: "ITC", qty: 200, avg_price: 420, current_price: 465, pnl: 9000, allocation: 7 },
    { symbol: "SBIN", qty: 100, avg_price: 620, current_price: 710, pnl: 9000, allocation: 6 },
    { symbol: "BHARTIARTL", qty: 25, avg_price: 1100, current_price: 1250, pnl: 3750, allocation: 5 },
  ];

  const holdingSymbols = holdings.map((h: any) => `${h.symbol}.NS`);
  const { data: liveQuotesData } = useMarketQuotes(holdingSymbols);

  const liveQuotesMap: Record<string, any> = {};
  if (liveQuotesData && Array.isArray(liveQuotesData)) {
    for (const q of liveQuotesData) {
      liveQuotesMap[q.symbol.replace(".NS", "")] = q;
    }
  }

  const holdingsWithLivePrices = holdings.map((h: any) => {
    const live = liveQuotesMap[h.symbol];
    if (live) {
      const currentPrice = Number(live.price);
      const pnl = (currentPrice - h.avg_price) * h.qty;
      return { ...h, current_price: currentPrice, pnl };
    }
    return h;
  });

  const totalValue = s?.total_value ?? holdingsWithLivePrices.reduce((sum: number, h: any) => sum + h.qty * h.current_price, 0);
  const totalPnl = s?.total_pnl ?? holdingsWithLivePrices.reduce((sum: number, h: any) => sum + h.pnl, 0);
  const invested = totalValue - totalPnl;

  const allocationData = (allocation as any)?.allocations ?? [
    { name: "Large Cap", value: 45, color: "#3B82F6" },
    { name: "Mid Cap", value: 20, color: "#10B981" },
    { name: "Small Cap", value: 10, color: "#F59E0B" },
    { name: "Debt", value: 15, color: "#8B5CF6" },
    { name: "Gold ETF", value: 10, color: "#EC4899" },
  ];

  const performanceData = p?.data ?? [
    { month: "Jan", value: 2200000 }, { month: "Feb", value: 2280000 },
    { month: "Mar", value: 2150000 }, { month: "Apr", value: 2350000 },
    { month: "May", value: 2420000 }, { month: "Jun", value: 2380000 },
    { month: "Jul", value: totalValue },
  ];

  const riskMetrics = r?.risk_metrics ?? [
    { label: "Sharpe Ratio", value: "1.25", desc: "Risk-adjusted return" },
    { label: "Max Drawdown", value: "12.5%", desc: "Worst peak-to-trough" },
    { label: "Volatility", value: "15.2%", desc: "Annual price variation" },
    { label: "VaR (95%)", value: "8.3%", desc: "Daily loss at risk" },
    { label: "Beta", value: "0.92", desc: "Market sensitivity" },
    { label: "Sortino Ratio", value: "1.68", desc: "Downside risk-adjusted" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-sm text-muted-foreground">Your investment portfolio analysis</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetchSummary()}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {summaryError && <ErrorBanner message={summaryError.message} onRetry={refetchSummary} />}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Value", value: formatCurrency(totalValue), sub: `${holdingsWithLivePrices.length} holdings` },
          { label: "Total P&L", value: formatCurrency(totalPnl), sub: formatPercent(totalPnl / invested * 100), positive: totalPnl >= 0 },
          { label: "Day Change", value: formatCurrency(s?.day_change ?? 12450), sub: formatPercent(s?.day_change_pct ?? 0.51), positive: (s?.day_change ?? 12450) >= 0 },
          { label: "Invested", value: formatCurrency(invested), sub: "Since inception" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
              <p className={`text-xs mt-1 ${s.positive ? "text-emerald-400" : "text-muted-foreground"}`}>{s.sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl w-fit">
        {(["holdings", "performance", "risk"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "holdings" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardHeader><CardTitle>Holdings</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="space-y-1 min-w-[600px]">
                <div className="grid grid-cols-6 gap-4 px-4 py-2 text-xs text-muted-foreground">
                  <span>Symbol</span><span className="text-right">Qty</span><span className="text-right">Avg Price</span>
                  <span className="text-right">Current</span><span className="text-right">P&L</span><span className="text-right">Allocation</span>
                </div>
                {holdingsWithLivePrices.map((h: any) => (
                  <div key={h.symbol} className="grid grid-cols-6 gap-4 px-4 py-3 rounded-lg hover:bg-white/[0.02] transition-colors items-center">
                    <div>
                      <p className="font-medium text-sm">{h.symbol}</p>
                    </div>
                    <span className="text-sm text-right">{h.qty}</span>
                    <span className="text-sm text-right">₹{h.avg_price.toLocaleString()}</span>
                    <span className="text-sm text-right font-medium">₹{h.current_price.toLocaleString()}</span>
                    <span className={`text-sm text-right font-medium ${getChangeColor(h.pnl)}`}>
                      {h.pnl > 0 ? "+" : ""}₹{h.pnl.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${h.allocation}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{h.allocation}%</span>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tab === "performance" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader><CardTitle>Performance</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#perfGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Allocation</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocationData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {allocationData.map((e: any, i: number) => <Cell key={i} fill={e.color ?? COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {allocationData.map((a: any, i: number) => (
                  <div key={a.name} className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color ?? COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{a.name}</span>
                    <span className="ml-auto font-medium">{a.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {tab === "risk" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {riskMetrics.map((m: any) => (
            <Card key={m.label}>
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="text-3xl font-bold mt-1 text-gradient">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  );
}
