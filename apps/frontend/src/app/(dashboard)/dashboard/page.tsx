"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Target,
  Brain,
  BarChart3,
  Activity,
  Zap,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/ui/loading";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import {
  useDashboard,
  useMarketNews,
} from "@/lib/hooks";
import { useAppStore } from "@/stores/app";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { PortfolioXRay } from "@/components/dashboard/portfolio-xray";
import { MarketCommandCenter } from "@/components/dashboard/market-command";
import { AIInsightCard } from "@/components/dashboard/ai-insight-card";
import { Watchlist } from "@/components/dashboard/watchlist";
import { DecisionTimeline } from "@/components/dashboard/timeline";
import { SmartAlerts } from "@/components/dashboard/smart-alerts";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { VoiceAssistant } from "@/components/dashboard/voice-assistant";
import { DigitalTwinPreview } from "@/components/dashboard/digital-twin-preview";
import { ExplainableAI } from "@/components/dashboard/explainable-ai";
import { NewsBrief } from "@/components/dashboard/news-brief";
import { InvestorSafetyScore } from "@/components/dashboard/investor-safety-score";
import { SuitabilityChecker } from "@/components/dashboard/suitability-checker";
import { AgentFlow } from "@/components/dashboard/agent-flow";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useTranslation } from "@/i18n/context";

function getGreeting(t: (key: string) => string) {
  const h = new Date().getHours();
  if (h < 12) return t("greeting.morning");
  if (h < 17) return t("greeting.afternoon");
  return t("greeting.evening");
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];

const portfolioHistory = [
  { month: "Jan", value: 2200000 },
  { month: "Feb", value: 2280000 },
  { month: "Mar", value: 2150000 },
  { month: "Apr", value: 2350000 },
  { month: "May", value: 2420000 },
  { month: "Jun", value: 2380000 },
  { month: "Jul", value: 2458750 },
];

const allocationData = [
  { name: "Equity", value: 55, color: "#3B82F6" },
  { name: "Debt", value: 25, color: "#10B981" },
  { name: "Gold", value: 10, color: "#F59E0B" },
  { name: "Cash", value: 10, color: "#8B5CF6" },
];

const bankRates = [
  { bank: "SBI", savings: "2.70", fd1y: "6.80", fd5y: "6.50", home: "8.50" },
  { bank: "HDFC Bank", savings: "3.00", fd1y: "6.60", fd5y: "6.50", home: "8.75" },
  { bank: "ICICI Bank", savings: "3.00", fd1y: "6.70", fd5y: "6.60", home: "8.75" },
  { bank: "Axis Bank", savings: "3.00", fd1y: "6.70", fd5y: "6.50", home: "8.75" },
  { bank: "Kotak Mahindra", savings: "3.00", fd1y: "6.70", fd5y: "6.50", home: "8.75" },
  { bank: "Bank of Baroda", savings: "2.75", fd1y: "6.60", fd5y: "6.40", home: "8.50" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 rounded-lg text-sm">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

export default function DashboardPage() {
  const userId = useAppStore((s) => s.userId);
  const { data, isLoading } = useDashboard(userId);
  const isDemoMode = useAppStore((s) => s.isDemoMode);
  const { t } = useTranslation();

  const d = data as any;
  const portfolioValue = d?.portfolio?.total_value ?? 2458750;
  const portfolioHealth = 92;
  const aiConfidence = 96;
  const goalProgress = 84;
  const riskScore = 72;
  const diversificationScore = 95;
  const todayPnL = 5240;
  const ytdReturn = 11.8;

  if (isLoading) return <DashboardSkeleton />;

  return (
    <>
      <div className="space-y-6" role="main" aria-label="Financial Dashboard">

        {/* ─── 1. AI FINANCIAL COMMAND CENTER (HERO) ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="relative overflow-hidden border-primary/20" role="region" aria-label="Portfolio Summary">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-2xl font-bold">
                    {getGreeting(t)}, <span className="text-gradient">Siddhant</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("greeting.subtitle")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isDemoMode && <Badge variant="secondary" className="text-[10px]">{t("common.demo")}</Badge>}
                  <Badge variant="success" className="gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {t("common.live")}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">
                    Updated {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {/* 8-Stat Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="list" aria-label="Key financial metrics">
                {[
                  { label: t("dashboard.portfolioValue"), value: portfolioValue, display: formatCurrency(portfolioValue), sub: "+11.8% YTD", icon: DollarSign, color: "text-foreground", bg: "from-blue-500/10 to-blue-600/5", numVal: portfolioValue },
                  { label: t("dashboard.todayPnL"), value: 5240, display: "+₹5,240", sub: "+0.21%", icon: TrendingUp, color: "text-emerald-400", bg: "from-emerald-500/10 to-emerald-600/5", numVal: 5240 },
                  { label: t("dashboard.portfolioHealth"), value: 92, display: "92", suffix: "/100", sub: "Excellent", icon: Shield, color: "text-emerald-400", bg: "from-emerald-500/10 to-teal-500/5", numVal: 92 },
                  { label: t("dashboard.aiConfidence"), value: 96, display: "96", suffix: "%", sub: "High", icon: Brain, color: "text-primary", bg: "from-primary/10 to-blue-500/5", numVal: 96 },
                  { label: t("dashboard.goalProgress"), value: 84, display: "84", suffix: "%", sub: "5 goals", icon: Target, color: "text-purple-400", bg: "from-purple-500/10 to-pink-500/5", numVal: 84 },
                  { label: t("dashboard.riskProfile"), value: 72, display: "Moderate", sub: "Balanced", icon: AlertTriangle, color: "text-amber-400", bg: "from-amber-500/10 to-orange-500/5", numVal: 72 },
                  { label: t("dashboard.diversification"), value: 95, display: "95", suffix: "/100", sub: "Strong", icon: BarChart3, color: "text-emerald-400", bg: "from-emerald-500/10 to-cyan-500/5", numVal: 95 },
                  { label: t("dashboard.marketStatus"), value: 100, display: t("common.live"), sub: "NSE · BSE", icon: Activity, color: "text-emerald-400", bg: "from-emerald-500/10 to-green-500/5", numVal: 100 },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  >
                    <div className={`relative text-center p-4 rounded-2xl bg-gradient-to-br ${stat.bg} border border-white/5 hover:border-white/10 transition-all duration-300 group cursor-default overflow-hidden`}
                      role="listitem"
                      aria-label={`${stat.label}: ${stat.display}${stat.sub ? `, ${stat.sub}` : ""}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color} group-hover:scale-110 transition-transform`} />
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                      <p className={`text-xl font-bold mt-1 ${stat.color}`}>
                        {stat.suffix ? (
                          <><AnimatedCounter value={stat.value} className={stat.color} />{stat.suffix}</>
                        ) : typeof stat.numVal === "number" && stat.numVal < 10000 ? (
                          <AnimatedCounter value={stat.value} className={stat.color} />
                        ) : (
                          stat.display
                        )}
                      </p>
                      {stat.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="h-px bg-white/5 my-5" />

              {/* AI Insight + Recommended Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ y: -1, transition: { duration: 0.2 } }}
                  className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/10 hover:border-blue-500/20 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{t("dashboard.aiInsight")}</span>
                      <p className="text-[10px] text-muted-foreground">Updated 2 min ago</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {t("dashboard.insightText")}
                  </p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" style={{ width: "92%" }} />
                    </div>
                    <span className="text-[10px] text-blue-400 font-medium">92% confidence</span>
                  </div>
                </motion.div>
                <motion.div
                  whileHover={{ y: -1, transition: { duration: 0.2 } }}
                  className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{t("dashboard.recommendedAction")}</span>
                      <p className="text-[10px] text-muted-foreground">Decision support only</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {t("dashboard.actionText")}
                  </p>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                    <span className="text-xs text-muted-foreground">{t("dashboard.confidence")}</span>
                    <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" style={{ width: "96%" }} />
                    </div>
                    <span className="text-xs font-bold text-emerald-400">96%</span>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── 2. EXECUTIVE SUMMARY ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <CardTitle>{t("dashboard.executiveSummary")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {[
                  { label: t("dashboard.market"), value: t("dashboard.positive"), color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { label: t("dashboard.portfolio"), value: "+0.81%", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { label: t("dashboard.goals"), value: t("dashboard.onTrack"), color: "text-blue-400", bg: "bg-blue-500/10" },
                  { label: t("dashboard.risk"), value: t("dashboard.moderate"), color: "text-amber-400", bg: "bg-amber-500/10" },
                  { label: t("dashboard.aiConfidence"), value: "96%", color: "text-purple-400", bg: "bg-purple-500/10" },
                  { label: t("dashboard.compliance"), value: t("common.compliancePassed"), color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { label: t("dashboard.financialHealth"), value: "92", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                    <Badge variant="outline" className={`${item.bg} ${item.color} border-0 font-semibold text-xs`}>
                      {item.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── 3. AI AGENT FLOW ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                AI Agent Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AgentFlow />
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── 4. AI INSIGHT OF THE DAY + RECOMMENDED ACTION ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
            <AIInsightCard />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <ExplainableAI />
          </motion.div>
        </div>

        {/* ─── 4. PORTFOLIO GROWTH + ASSET ALLOCATION ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Portfolio Growth</CardTitle>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={cn("flex items-center gap-1 font-bold ml-2", ytdReturn >= 0 ? "text-emerald-400" : "text-red-400")}>
                      {ytdReturn >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      +{formatPercent(ytdReturn)} YTD
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portfolioHistory}>
                      <defs>
                        <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={2150000} stroke="rgba(239,68,68,0.3)" strokeDasharray="5 5" label={{ value: "Correction", fill: "#EF4444", fontSize: 10, position: "right" }} />
                      <ReferenceLine y={2458750} stroke="rgba(245,158,11,0.3)" strokeDasharray="5 5" label={{ value: "Current", fill: "#F59E0B", fontSize: 10, position: "right" }} />
                      <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#portfolioGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="h-full">
              <CardHeader><CardTitle>Asset Allocation</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={allocationData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                        {allocationData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {allocationData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="ml-auto font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ─── 5. PORTFOLIO X-RAY ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <PortfolioXRay />
        </motion.div>

        {/* ─── 6. AI MARKET COMMAND CENTER ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <MarketCommandCenter />
        </motion.div>

        {/* ─── 7. AI NEWS BRIEF ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <NewsBrief />
        </motion.div>

        {/* ─── 8. DIGITAL TWIN + EXPLAINABLE AI + QUICK ACTIONS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <DigitalTwinPreview />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <ExplainableAI />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <QuickActions />
          </motion.div>
        </div>

        {/* ─── 9. WATCHLIST ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Watchlist />
        </motion.div>

        {/* ─── 10. SMART ALERTS + DECISION TIMELINE ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
            <SmartAlerts />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <DecisionTimeline />
          </motion.div>
        </div>

        {/* ─── 11. INVESTOR SAFETY + SUITABILITY ─── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <InvestorSafetyScore />
          <SuitabilityChecker />
        </div>

        {/* ─── 12. BANK INTEREST RATES ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <CardTitle>Bank Interest Rates</CardTitle>
                </div>
                <a
                  href="https://www.rbi.org.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors"
                >
                  <span className="text-[10px] text-emerald-400 font-medium">RBI Source</span>
                </a>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground border-b border-white/5">
                      <th className="text-left py-2 font-medium">Bank</th>
                      <th className="text-right py-2 font-medium">Savings</th>
                      <th className="text-right py-2 font-medium">1Y FD</th>
                      <th className="text-right py-2 font-medium">5Y FD</th>
                      <th className="text-right py-2 font-medium">Home Loan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bankRates.map((b, i) => (
                      <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="py-2 font-medium">{b.bank}</td>
                        <td className="text-right font-mono">{b.savings}%</td>
                        <td className="text-right font-mono text-emerald-400">{b.fd1y}%</td>
                        <td className="text-right font-mono">{b.fd5y}%</td>
                        <td className="text-right font-mono text-blue-400">{b.home}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── 13. RBI ATTRIBUTION ─── */}
        <div className="flex items-center justify-center gap-2 py-2">
          <p className="text-[11px] text-muted-foreground">
            Interest rates sourced from Reserve Bank of India (RBI) · Policy Repo Rate: 6.50% · Last updated: July 2026
          </p>
        </div>
      </div>

      {/* VoiceAssistant rendered OUTSIDE the main content */}
      <VoiceAssistant />
    </>
  );
}
