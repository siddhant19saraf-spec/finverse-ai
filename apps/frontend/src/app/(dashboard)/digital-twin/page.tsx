"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Play, Loader2, TrendingUp, AlertTriangle, Target } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageSpinner, ErrorBanner } from "@/components/ui/loading";
import { formatCurrency } from "@/lib/utils";
import {
  useDigitalTwinScenarios,
  useDigitalTwinNamedScenario,
} from "@/lib/hooks";
import { useAppStore } from "@/stores/app";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend
} from "recharts";

const scenarioMeta: Record<string, { icon: string; desc: string; color: string }> = {
  inflation: { icon: "📈", desc: "High inflation impact", color: "#F59E0B" },
  salary_increase: { icon: "💰", desc: "Income growth", color: "#10B981" },
  salary_reduction: { icon: "📉", desc: "Income reduction", color: "#EF4444" },
  market_correction: { icon: "🔻", desc: "Market correction", color: "#EF4444" },
  market_rally: { icon: "🚀", desc: "Bull market", color: "#10B981" },
  home_purchase: { icon: "🏠", desc: "₹50L one-time", color: "#8B5CF6" },
  retirement: { icon: "🏖️", desc: "30-year plan", color: "#8B5CF6" },
  education_funding: { icon: "🎓", desc: "15-year fund", color: "#3B82F6" },
  emergency_expense: { icon: "🚨", desc: "₹5L expense", color: "#EF4444" },
};

const fallbackScenarioResults: Record<string, any> = {
  baseline: { name: "Baseline", projected_value: 5200000, probability: 72, color: "#3B82F6" },
  inflation: { name: "High Inflation", projected_value: 3800000, probability: 45, color: "#F59E0B" },
  salary_increase: { name: "Salary +15%", projected_value: 7200000, probability: 88, color: "#10B981" },
  market_correction: { name: "Market Crash", projected_value: 2100000, probability: 25, color: "#EF4444" },
  retirement: { name: "Retirement", projected_value: 12500000, probability: 65, color: "#8B5CF6" },
};

const fallbackProjection = [
  { year: "Y1", optimistic: 2800000, baseline: 2600000, pessimistic: 2400000 },
  { year: "Y2", optimistic: 3400000, baseline: 3100000, pessimistic: 2700000 },
  { year: "Y3", optimistic: 4200000, baseline: 3700000, pessimistic: 3000000 },
  { year: "Y5", optimistic: 6000000, baseline: 5200000, pessimistic: 3800000 },
  { year: "Y7", optimistic: 8500000, baseline: 7100000, pessimistic: 4800000 },
  { year: "Y10", optimistic: 14000000, baseline: 11000000, pessimistic: 6500000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 rounded-lg text-sm">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {formatCurrency(p.value)}</p>
      ))}
    </div>
  );
};

export default function DigitalTwinPage() {
  const userId = useAppStore((s) => s.userId);
  const [activeScenario, setActiveScenario] = useState("inflation");
  const [result, setResult] = useState<any>(null);

  const { data: scenariosData } = useDigitalTwinScenarios();
  const simulateMutation = useDigitalTwinNamedScenario(userId);

  const scenarios = (scenariosData as any)?.scenarios?.map((s: any) => ({
    id: s.type,
    label: s.name?.replace(/_/g, " ") ?? s.type,
    ...(scenarioMeta[s.type] ?? {}),
  })) ?? [
    { id: "inflation", label: "Inflation 8%", ...scenarioMeta.inflation },
    { id: "salary_increase", label: "Salary +15%", ...scenarioMeta.salary_increase },
    { id: "salary_reduction", label: "Salary -20%", ...scenarioMeta.salary_reduction },
    { id: "market_correction", label: "Market -20%", ...scenarioMeta.market_correction },
    { id: "market_rally", label: "Market +25%", ...scenarioMeta.market_rally },
    { id: "home_purchase", label: "Home Purchase", ...scenarioMeta.home_purchase },
    { id: "retirement", label: "Retirement", ...scenarioMeta.retirement },
    { id: "education_funding", label: "Education", ...scenarioMeta.education_funding },
    { id: "emergency_expense", label: "Emergency", ...scenarioMeta.emergency_expense },
  ];

  const runSimulation = () => {
    simulateMutation.mutate(
      { type: activeScenario, iterations: 1000 },
      {
        onSuccess: (data) => setResult(data),
      }
    );
  };

  const currentResult = result ?? fallbackScenarioResults[activeScenario] ?? fallbackScenarioResults.inflation;
  const projectedValue = currentResult?.projected_value ?? currentResult?.value ?? 3800000;
  const probability = currentResult?.probability ?? currentResult?.goal_probability ?? 45;
  const projectionData = currentResult?.chart_data?.projection ?? currentResult?.projection ?? fallbackProjection;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Digital Twin</h1>
          <p className="text-sm text-muted-foreground">Simulate life events and market scenarios</p>
        </div>
        <Button onClick={runSimulation} disabled={simulateMutation.isPending} className="gap-2">
          {simulateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {simulateMutation.isPending ? "Running..." : "Run Simulation"}
        </Button>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {scenarios.map((s: any) => {
          const meta = scenarioMeta[s.id] ?? scenarioMeta.inflation;
          return (
            <motion.button
              key={s.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveScenario(s.id); setResult(null); }}
              className={`p-4 rounded-xl text-left transition-all ${
                activeScenario === s.id
                  ? "glass-strong border-primary/50 glow-blue"
                  : "glass-card hover:border-white/15"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.icon ?? meta.icon}</span>
                <div>
                  <p className="font-medium text-sm">{s.label ?? s.id.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">{s.desc ?? meta.desc}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Wealth Projection</CardTitle>
                <Badge variant={probability > 60 ? "success" : probability > 30 ? "warning" : "destructive"}>
                  {probability}% probability
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData}>
                    <defs>
                      <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="pessGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="optimistic" stroke="#10B981" strokeWidth={1.5} fill="url(#optGrad)" name="Optimistic" />
                    <Area type="monotone" dataKey="baseline" stroke="#3B82F6" strokeWidth={2} fill="url(#baseGrad)" name="Baseline" />
                    <Area type="monotone" dataKey="pessimistic" stroke="#EF4444" strokeWidth={1.5} fill="url(#pessGrad)" name="Pessimistic" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">Projected Value</p>
              </div>
              <p className="text-3xl font-bold text-gradient">{formatCurrency(projectedValue)}</p>
              <p className="text-xs text-muted-foreground mt-1">in 10 years</p>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-5 h-5 text-emerald-400" />
                <p className="text-sm text-muted-foreground">Goal Probability</p>
              </div>
              <p className="text-3xl font-bold text-emerald-400">{probability}%</p>
              <div className="w-full h-2 bg-white/5 rounded-full mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${probability}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                />
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <p className="text-sm text-muted-foreground">Risk Level</p>
              </div>
              <p className="text-xl font-semibold capitalize">{activeScenario.replace(/_/g, " ")}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {result ? `Monte Carlo simulation with ${result.iterations ?? 1000} iterations` : "Click Run Simulation to execute"}
              </p>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Disclaimer */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <p className="text-xs text-amber-400/80">
          <strong>Educational Disclaimer:</strong> This simulation is for informational purposes only and does not constitute financial advice.
          Actual returns may differ significantly. Consult a SEBI-registered advisor for personalized guidance.
        </p>
      </Card>
    </div>
  );
}
