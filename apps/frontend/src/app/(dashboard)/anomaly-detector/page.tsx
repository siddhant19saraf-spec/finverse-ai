"use client";
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, CheckCircle2, XCircle, Shield, TrendingUp, TrendingDown,
  PieChart, BarChart3, ArrowRight, Info, Zap, Eye, Layers
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const holdings = [
  { symbol: "RELIANCE", weight: 22.8, sector: "Energy", change: 1.8, risk: "medium", anomaly: null },
  { symbol: "TCS", weight: 18.2, sector: "IT", change: 2.1, risk: "low", anomaly: null },
  { symbol: "HDFCBANK", weight: 16.7, sector: "Banking", change: -0.5, risk: "low", anomaly: null },
  { symbol: "INFY", weight: 14.2, sector: "IT", change: 1.5, risk: "low", anomaly: null },
  { symbol: "ICICIBANK", weight: 9.6, sector: "Banking", change: 0.8, risk: "low", anomaly: null },
  { symbol: "SBIN", weight: 9.7, sector: "Banking", change: 1.2, risk: "medium", anomaly: null },
  { symbol: "ITC", weight: 8.8, sector: "FMCG", change: -0.3, risk: "low", anomaly: null },
];

const anomalies = [
  { id: 1, severity: "critical", title: "Banking Sector Overweight", desc: "Banking allocation is 36% — exceeds recommended max of 30%. Diversify into other sectors.", action: "Reduce HDFCBANK or ICICIBANK by 3-5%", icon: PieChart, category: "concentration" },
  { id: 2, severity: "warning", title: "IT Sector Concentration", desc: "IT sector at 32.4% with TCS + INFY + WIPRO. Consider reducing overlap.", action: "Consolidate IT holdings — sell WIPRO", icon: Layers, category: "concentration" },
  { id: 3, severity: "warning", title: "No Gold/Commodity Allocation", desc: "Portfolio has 0% allocation to gold/commodities. Adding 5-10% improves risk-adjusted returns.", action: "Add gold ETF (GOLDBEES)", icon: Shield, category: "allocation" },
  { id: 4, severity: "info", title: "RELIANCE Near 52-Week High", desc: "RELIANCE is within 6% of its 52-week high. Consider partial profit booking.", action: "Book 20% of RELIANCE position", icon: TrendingUp, category: "timing" },
  { id: 5, severity: "critical", title: "No Emergency Fund Buffer", desc: "Cash allocation is only 2.8%. Recommended 5-10% for emergency liquidity.", action: "Move ₹1.2L to liquid fund", icon: AlertTriangle, category: "liquidity" },
  { id: 6, severity: "info", title: "SBIN Momentum Alert", desc: "SBIN has rallied 6.5% this week. RSI approaching overbought (70).", action: "Monitor — set trailing stop at ₹810", icon: Zap, category: "timing" },
];

const categoryColors: Record<string, string> = {
  IT: "#3B82F6",
  Banking: "#10B981",
  Energy: "#F59E0B",
  FMCG: "#8B5CF6",
  Pharma: "#EC4899",
};

const pieColors = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#EF4444"];

export default function AnomalyDetectorPage() {
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info">("all");

  const sectorData = useMemo(() => {
    const sectors: Record<string, number> = {};
    holdings.forEach((h) => { sectors[h.sector] = (sectors[h.sector] || 0) + h.weight; });
    return Object.entries(sectors).map(([sector, weight]) => ({ sector, weight: Number(weight.toFixed(1)) }));
  }, []);

  const filteredAnomalies = filter === "all" ? anomalies : anomalies.filter((a) => a.severity === filter);

  const criticalCount = anomalies.filter((a) => a.severity === "critical").length;
  const warningCount = anomalies.filter((a) => a.severity === "warning").length;
  const infoCount = anomalies.filter((a) => a.severity === "info").length;
  const healthScore = Math.max(0, 100 - criticalCount * 20 - warningCount * 8 - infoCount * 2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Anomaly Detector</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">AI-powered portfolio health monitoring and risk detection</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Portfolio Health</p>
            <p className={cn("text-2xl font-bold", healthScore >= 80 ? "text-emerald-400" : healthScore >= 50 ? "text-amber-400" : "text-red-400")}>
              {healthScore}%
            </p>
          </div>
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center",
            healthScore >= 80 ? "bg-emerald-500/15" : healthScore >= 50 ? "bg-amber-500/15" : "bg-red-500/15"
          )}>
            {healthScore >= 80 ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> :
             healthScore >= 50 ? <AlertTriangle className="w-6 h-6 text-amber-400" /> :
             <XCircle className="w-6 h-6 text-red-400" />}
          </div>
        </div>
      </div>

      {/* Traffic Light Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Critical", count: criticalCount, color: "bg-red-500", textColor: "text-red-400", borderColor: "border-red-500/20" },
          { label: "Warning", count: warningCount, color: "bg-amber-500", textColor: "text-amber-400", borderColor: "border-amber-500/20" },
          { label: "Info", count: infoCount, color: "bg-blue-500", textColor: "text-blue-400", borderColor: "border-blue-500/20" },
        ].map((item) => (
          <Card key={item.label} className={cn("border", item.borderColor)}>
            <div className="flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-full", item.color, item.count === 0 && "opacity-30")} />
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={cn("text-2xl font-bold", item.textColor)}>{item.count}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Anomaly List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-1 p-1 glass rounded-lg w-fit">
            {["all", "critical", "warning", "info"].map((f) => (
              <button key={f} onClick={() => setFilter(f as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                  filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}>{f}</button>
            ))}
          </div>

          {filteredAnomalies.map((anomaly, i) => (
            <motion.div key={anomaly.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={cn("border-l-4",
                anomaly.severity === "critical" ? "border-l-red-500" :
                anomaly.severity === "warning" ? "border-l-amber-500" : "border-l-blue-500"
              )}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                      anomaly.severity === "critical" ? "bg-red-500/15" :
                      anomaly.severity === "warning" ? "bg-amber-500/15" : "bg-blue-500/15"
                    )}>
                      <anomaly.icon className={cn("w-4 h-4",
                        anomaly.severity === "critical" ? "text-red-400" :
                        anomaly.severity === "warning" ? "text-amber-400" : "text-blue-400"
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{anomaly.title}</p>
                        <Badge variant={anomaly.severity === "critical" ? "destructive" : anomaly.severity === "warning" ? "warning" : "secondary"}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{anomaly.desc}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <ArrowRight className="w-3 h-3 text-primary" />
                        <p className="text-xs text-primary font-medium">{anomaly.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Sector Allocation */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Sector Allocation</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={sectorData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="weight">
                      {sectorData.map((entry, i) => (
                        <Cell key={i} fill={categoryColors[entry.sector] || pieColors[i]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => `${v}%`} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {sectorData.map((s, i) => (
                  <div key={s.sector} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: categoryColors[s.sector] || pieColors[i] }} />
                      {s.sector}
                    </span>
                    <span className={cn("font-mono font-medium",
                      s.weight > 30 ? "text-red-400" : s.weight > 25 ? "text-amber-400" : "text-foreground"
                    )}>{s.weight}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Top Holdings Risk</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {holdings.slice(0, 5).map((h) => (
                <div key={h.symbol} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full",
                      h.risk === "low" ? "bg-emerald-400" : h.risk === "medium" ? "bg-amber-400" : "bg-red-400"
                    )} />
                    <span className="text-xs font-medium">{h.symbol}</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{h.weight}%</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-amber-400/80 leading-relaxed">
                <strong>Educational Disclaimer:</strong> Anomaly detection is based on portfolio rules and heuristics. This is NOT financial advice.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
