"use client";
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Scissors, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, Shield, IndianRupee, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";

const mockHoldings = [
  { symbol: "TATASTEEL.NS", name: "Tata Steel", buyPrice: 145, currentPrice: 118, qty: 200, category: "equity", sector: "Metals", buyDate: "2025-08-15", sttPaid: 290 },
  { symbol: "YESBANK.NS", name: "Yes Bank", buyPrice: 28, currentPrice: 19, qty: 5000, category: "equity", sector: "Banking", buyDate: "2024-06-10", sttPaid: 1400 },
  { symbol: "SUZLON.NS", name: "Suzlon Energy", buyPrice: 52, currentPrice: 45, qty: 1000, category: "equity", sector: "Energy", buyDate: "2025-03-20", sttPaid: 520 },
  { symbol: "ITC.NS", name: "ITC Ltd", buyPrice: 420, currentPrice: 465, qty: 300, category: "equity", sector: "FMCG", buyDate: "2025-01-10", sttPaid: 1260 },
  { symbol: "RELIANCE.NS", name: "Reliance Industries", buyPrice: 2650, currentPrice: 2850, qty: 50, category: "equity", sector: "Energy", buyDate: "2025-05-05", sttPaid: 1325 },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", buyPrice: 1780, currentPrice: 1720, qty: 80, category: "equity", sector: "Banking", buyDate: "2025-09-12", sttPaid: 1424 },
  { symbol: "ADANIENT.NS", name: "Adani Enterprises", buyPrice: 3200, currentPrice: 2800, qty: 30, category: "equity", sector: "Infrastructure", buyDate: "2025-07-20", sttPaid: 960 },
  { symbol: "WIPRO.NS", name: "Wipro", buyPrice: 580, currentPrice: 540, qty: 150, category: "equity", sector: "IT", buyDate: "2025-04-18", sttPaid: 870 },
];

const TAX_RATE_STCG = 20;
const TAX_RATE_LTCG = 12.5;
const STCG_THRESHOLD_DAYS = 365;

function analyzeTaxLoss(holdings: typeof mockHoldings) {
  const today = new Date();
  const opportunities: any[] = [];
  let totalRealizableLoss = 0;
  let totalTaxSaved = 0;
  let totalSTTSaveable = 0;

  for (const h of holdings) {
    const pnl = (h.currentPrice - h.buyPrice) * h.qty;
    const holdingDays = Math.floor((today.getTime() - new Date(h.buyDate).getTime()) / 86400000);
    const isSTCG = holdingDays < STCG_THRESHOLD_DAYS;
    const applicableTaxRate = isSTCG ? TAX_RATE_STCG : TAX_RATE_LTCG;

    if (pnl < 0) {
      const lossAmount = Math.abs(pnl);
      const potentialTaxSaving = lossAmount * (applicableTaxRate / 100);
      totalRealizableLoss += lossAmount;
      totalTaxSaved += potentialTaxSaving;
      totalSTTSaveable += h.sttPaid;

      const replacementCandidates = holdings.filter(
        (r) => r.symbol !== h.symbol && r.sector === h.sector && (r.currentPrice - r.buyPrice) * r.qty > 0
      );

      opportunities.push({
        ...h,
        pnl,
        lossAmount,
        potentialTaxSaving,
        holdingDays,
        isSTCG,
        applicableTaxRate,
        status: "harvest",
        replacement: replacementCandidates[0] || null,
        urgency: lossAmount > 100000 ? "high" : lossAmount > 30000 ? "medium" : "low",
      });
    } else {
      opportunities.push({
        ...h,
        pnl,
        holdingDays,
        isSTCG,
        applicableTaxRate: isSTCG ? TAX_RATE_STCG : TAX_RATE_LTCG,
        status: "hold",
        urgency: "none",
      });
    }
  }

  return { opportunities, totalRealizableLoss, totalTaxSaved, totalSTTSaveable };
}

const chartColors = ["#EF4444", "#F97316", "#EAB308", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#06B6D4"];

export default function TaxHarvesterPage() {
  const [selectedTab, setSelectedTab] = useState<"overview" | "opportunities" | "rules">("overview");

  const analysis = useMemo(() => analyzeTaxLoss(mockHoldings), []);

  const lossHoldings = analysis.opportunities.filter((h) => h.status === "harvest");
  const gainHoldings = analysis.opportunities.filter((h) => h.status === "hold");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Tax Loss Harvester</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Identify opportunities to offset gains and reduce tax liability</p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <IndianRupee className="w-3 h-3" />
          Save up to {formatCurrency(Math.round(analysis.totalTaxSaved))}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Realizable Losses", value: formatCurrency(analysis.totalRealizableLoss), color: "text-red-400", icon: TrendingDown },
          { label: "Potential Tax Saved", value: formatCurrency(Math.round(analysis.totalTaxSaved)), color: "text-emerald-400", icon: IndianRupee },
          { label: "STT Recoverable", value: formatCurrency(analysis.totalSTTSaveable), color: "text-blue-400", icon: Shield },
          { label: "Harvestable Holdings", value: `${lossHoldings.length} of ${mockHoldings.length}`, color: "text-amber-400", icon: Scissors },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <m.icon className={`w-4 h-4 ${m.color}`} />
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 glass rounded-lg w-fit">
        {(["overview", "opportunities", "rules"] as const).map((tab) => (
          <button key={tab} onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
              selectedTab === tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {selectedTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Loss Chart */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Unrealized P&L by Holding</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis.opportunities.map((h) => ({
                    name: h.symbol.replace(".NS", ""),
                    pnl: h.pnl,
                    isLoss: h.pnl < 0,
                  }))} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} width={70} />
                    <Tooltip content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="glass-card p-2 rounded-lg text-xs">
                          <p className="font-medium">{d?.name}</p>
                          <p className={d?.pnl >= 0 ? "text-emerald-400" : "text-red-400"}>
                            {formatCurrency(d?.pnl)}
                          </p>
                        </div>
                      );
                    }} />
                    <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                      {analysis.opportunities.map((h, i) => (
                        <Cell key={i} fill={h.pnl < 0 ? "#EF4444" : "#10B981"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sector Breakdown */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Sector-wise Tax Impact</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(
                lossHoldings.reduce((acc: Record<string, number>, h) => {
                  acc[h.sector] = (acc[h.sector] || 0) + h.potentialTaxSaving;
                  return acc;
                }, {})
              ).map(([sector, saving], i) => (
                <div key={sector} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: chartColors[i % chartColors.length] }} />
                    <span className="text-sm font-medium">{sector}</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">{formatCurrency(Math.round(saving))}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === "opportunities" && (
        <div className="space-y-3">
          {lossHoldings.map((h, i) => (
            <motion.div key={h.symbol} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:border-white/15 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      h.urgency === "high" ? "bg-red-500/15" : h.urgency === "medium" ? "bg-amber-500/15" : "bg-blue-500/15"
                    )}>
                      <TrendingDown className={cn("w-5 h-5",
                        h.urgency === "high" ? "text-red-400" : h.urgency === "medium" ? "text-amber-400" : "text-blue-400"
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{h.symbol.replace(".NS", "")}</p>
                        <Badge variant={h.urgency === "high" ? "destructive" : h.urgency === "medium" ? "warning" : "secondary"}>
                          {h.urgency} priority
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{h.isSTCG ? "STCG" : "LTCG"}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{h.name} · {h.sector} · Held {h.holdingDays} days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 sm:gap-8">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Buy / Current</p>
                      <p className="text-sm font-mono">₹{h.buyPrice} → ₹{h.currentPrice}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Loss</p>
                      <p className="text-sm font-semibold text-red-400">{formatCurrency(h.pnl)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Tax Saved</p>
                      <p className="text-sm font-semibold text-emerald-400">{formatCurrency(Math.round(h.potentialTaxSaving))}</p>
                    </div>
                    {h.replacement && (
                      <div className="text-right hidden md:block">
                        <p className="text-xs text-muted-foreground">Replacement</p>
                        <p className="text-sm font-mono text-blue-400">{h.replacement.symbol.replace(".NS", "")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {selectedTab === "rules" && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Tax Harvesting Rules (India)</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "STCG (≤ 12 months)", desc: "Taxed at 20% for listed equity. Losses can offset STCG gains only.", icon: TrendingDown, color: "text-red-400" },
                { title: "LTCG (> 12 months)", desc: "Taxed at 12.5% above ₹1.25L exemption. Losses can offset LTCG gains.", icon: TrendingUp, color: "text-emerald-400" },
                { title: "Loss Carry Forward", desc: "Unabsorbed losses can be carried forward for 8 assessment years.", icon: Calendar, color: "text-blue-400" },
                { title: "Wash Sale Rule", desc: "India does NOT have a wash sale rule — you can buy back immediately. But avoid artificial transactions.", icon: AlertTriangle, color: "text-amber-400" },
                { title: "Same-Sector Replacement", desc: "To maintain portfolio exposure, sell the loss-making stock and buy a similar stock in the same sector.", icon: ArrowRight, color: "text-purple-400" },
                { title: "STT Consideration", desc: "Securities Transaction Tax is paid on both buy and sell. Factor this into your harvesting decision.", icon: Shield, color: "text-cyan-400" },
              ].map((rule, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <rule.icon className={`w-4 h-4 ${rule.color}`} />
                    <p className="font-semibold text-foreground">{rule.title}</p>
                  </div>
                  <p className="text-xs">{rule.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-400/80 space-y-1">
            <p><strong>Educational Disclaimer:</strong> Tax loss harvesting is a strategy to offset capital gains with losses. This is NOT tax advice.</p>
            <p>• Consult a CA or SEBI-registered advisor before executing any tax strategy</p>
            <p>• Tax laws change — rates shown are for FY 2025-26 (old regime)</p>
            <p>• Consider transaction costs (brokerage, STT, GST) before harvesting</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Calendar(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
