"use client";
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Target, Calculator, TrendingUp, Info, IndianRupee, Plus, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

interface Goal {
  id: number;
  name: string;
  target: number;
  current: number;
  years: number;
  risk: "conservative" | "balanced" | "aggressive";
  color: string;
}

const defaultGoals: Goal[] = [
  { id: 1, name: "Retirement Corpus", target: 50000000, current: 12500000, years: 20, risk: "balanced", color: "#3B82F6" },
  { id: 2, name: "Child Education", target: 25000000, current: 4200000, years: 15, risk: "balanced", color: "#10B981" },
  { id: 3, name: "Dream Home", target: 15000000, current: 3800000, years: 8, risk: "aggressive", color: "#F59E0B" },
];

const returnsByRisk = { conservative: 8, balanced: 12, aggressive: 15 };

const fmt = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;

const fmtFull = (n: number) => `₹${(n / 1e5).toFixed(2)}L`;

export default function SIPProjectorPage() {
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [inflation, setInflation] = useState(6);
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: "", target: 10000000, current: 0, years: 10, risk: "balanced" as Goal["risk"] });

  const projections = useMemo(() => {
    return goals.map((goal) => {
      const realReturn = (returnsByRisk[goal.risk] - inflation) / 100;
      const monthlyReturn = realReturn / 12;
      const months = goal.years * 12;
      const gap = goal.target - goal.current;
      const requiredSIP = gap > 0 && monthlyReturn > 0
        ? gap * monthlyReturn / (Math.pow(1 + monthlyReturn, months) - 1)
        : gap > 0 ? gap / months : 0;
      const futureValue = goal.current * Math.pow(1 + realReturn, goal.years);
      const totalInvested = goal.current + requiredSIP * months;
      const wealthGain = futureValue - totalInvested;
      const onTrack = futureValue >= goal.target;

      const timeline = [];
      const step = goal.years <= 5 ? 1 : goal.years <= 15 ? 3 : 5;
      for (let y = 0; y <= goal.years; y += step) {
        const fv = goal.current * Math.pow(1 + realReturn, y) + requiredSIP * ((Math.pow(1 + monthlyReturn, y * 12) - 1) / monthlyReturn);
        timeline.push({ year: `Y${y}`, projected: Math.round(fv), target: goal.target });
      }
      if (timeline[timeline.length - 1]?.year !== `Y${goal.years}`) {
        timeline.push({ year: `Y${goal.years}`, projected: Math.round(futureValue), target: goal.target });
      }

      return { ...goal, requiredSIP: Math.round(requiredSIP), futureValue: Math.round(futureValue), totalInvested: Math.round(totalInvested), wealthGain: Math.round(wealthGain), onTrack, timeline };
    });
  }, [goals, inflation]);

  const totalMonthlySIP = projections.reduce((s, p) => s + p.requiredSIP, 0);
  const totalFutureValue = projections.reduce((s, p) => s + p.futureValue, 0);
  const totalInvested = projections.reduce((s, p) => s + p.totalInvested, 0);

  const addGoal = () => {
    if (!newGoal.name) return;
    setGoals((prev) => [...prev, { ...newGoal, id: Date.now(), color: ["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6"][prev.length % 5] }]);
    setNewGoal({ name: "", target: 10000000, current: 0, years: 10, risk: "balanced" });
    setShowAdd(false);
  };

  const removeGoal = (id: number) => setGoals((prev) => prev.filter((g) => g.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Goal SIP Projector</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Calculate the SIP needed to achieve your financial goals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-3 h-3 mr-1" /> Add Goal
          </Button>
          <Badge variant="outline" className="gap-1.5">
            <Target className="w-3 h-3" /> {goals.length} goals
          </Badge>
        </div>
      </div>

      {/* Inflation */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Assumed Inflation</span>
            <Badge variant="secondary" className="font-mono">{inflation}%</Badge>
          </div>
          <input type="range" min={2} max={12} step={0.5} value={inflation} onChange={(e) => setInflation(Number(e.target.value))}
            className="w-48 accent-primary" />
        </div>
      </Card>

      {/* Add Goal Form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card className="border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Add New Goal</p>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded hover:bg-white/5"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <input type="text" placeholder="Goal name" value={newGoal.name} onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                className="px-3 py-2 rounded-lg bg-background/50 border border-white/10 text-sm" />
              <input type="number" placeholder="Target (₹)" value={newGoal.target} onChange={(e) => setNewGoal({ ...newGoal, target: Number(e.target.value) })}
                className="px-3 py-2 rounded-lg bg-background/50 border border-white/10 text-sm" />
              <input type="number" placeholder="Current (₹)" value={newGoal.current} onChange={(e) => setNewGoal({ ...newGoal, current: Number(e.target.value) })}
                className="px-3 py-2 rounded-lg bg-background/50 border border-white/10 text-sm" />
              <input type="number" placeholder="Years" value={newGoal.years} onChange={(e) => setNewGoal({ ...newGoal, years: Number(e.target.value) })}
                className="px-3 py-2 rounded-lg bg-background/50 border border-white/10 text-sm" />
              <select value={newGoal.risk} onChange={(e) => setNewGoal({ ...newGoal, risk: e.target.value as any })}
                className="px-3 py-2 rounded-lg bg-background/50 border border-white/10 text-sm">
                <option value="conservative">Conservative (8%)</option>
                <option value="balanced">Balanced (12%)</option>
                <option value="aggressive">Aggressive (15%)</option>
              </select>
            </div>
            <Button size="sm" className="mt-3" onClick={addGoal}>Add Goal</Button>
          </Card>
        </motion.div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Monthly SIP", value: fmt(totalMonthlySIP), color: "text-primary" },
          { label: "Projected Wealth", value: fmt(totalFutureValue), color: "text-emerald-400" },
          { label: "Total Invested", value: fmt(totalInvested), color: "text-amber-400" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projections.map((proj, i) => (
          <motion.div key={proj.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: proj.color }} />
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-sm">{proj.name}</p>
                <div className="flex items-center gap-1">
                  <Badge variant={proj.onTrack ? "success" : "destructive"} className="text-[10px]">
                    {proj.onTrack ? "On Track" : "Shortfall"}
                  </Badge>
                  {goals.length > 1 && (
                    <button onClick={() => removeGoal(proj.id)} className="p-1 rounded hover:bg-white/5"><X className="w-3 h-3 text-muted-foreground" /></button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Target</span><span className="font-medium">{fmt(proj.target)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Current</span><span className="font-medium">{fmt(proj.current)}</span>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Required SIP</span>
                  <span className="font-bold text-primary">{fmt(proj.requiredSIP)}/mo</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Projected Value</span>
                  <span className="font-medium text-emerald-400">{fmt(proj.futureValue)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Wealth Gain</span>
                  <span className="font-medium text-amber-400">{fmt(proj.wealthGain)}</span>
                </div>
              </div>

              <div className="h-[140px] mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={proj.timeline}>
                    <defs>
                      <linearGradient id={`projGrad${proj.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={proj.color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={proj.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 9 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 9 }} tickFormatter={(v: number) => fmt(v)} />
                    <Tooltip content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="glass-card p-2 rounded-lg text-xs">
                          <p className="font-medium">{payload[0]?.payload?.year}</p>
                          <p style={{ color: proj.color }}>Projected: {fmt(payload[0]?.value)}</p>
                          <p className="text-muted-foreground">Target: {fmt(payload[1]?.value)}</p>
                        </div>
                      );
                    }} />
                    <Area type="monotone" dataKey="projected" stroke={proj.color} strokeWidth={2} fill={`url(#projGrad${proj.id})`} />
                    <Area type="monotone" dataKey="target" stroke="#71717a" strokeWidth={1} strokeDasharray="5 5" fill="transparent" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-amber-400/80 leading-relaxed">
            <strong>Educational Disclaimer:</strong> Projections assume constant returns and are adjusted for inflation. Actual returns vary. Past performance does not guarantee future results. Consult a SEBI-registered advisor.
          </p>
        </div>
      </Card>
    </div>
  );
}
