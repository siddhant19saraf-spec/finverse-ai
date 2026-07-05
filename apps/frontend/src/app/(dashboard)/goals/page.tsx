"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, TrendingUp, AlertCircle, CheckCircle2, Plus, X, Calculator, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageSpinner, ErrorBanner } from "@/components/ui/loading";
import { formatCurrency, cn } from "@/lib/utils";
import { useDashboard } from "@/lib/hooks";
import { useAppStore } from "@/stores/app";

interface Goal {
  name: string;
  target: number;
  current: number;
  monthly: number;
  date: string;
  category: string;
  priority: string;
  probability?: number;
}

const fallbackGoals: Goal[] = [
  { name: "Retirement Corpus", target: 10000000, current: 6200000, monthly: 50000, date: "2040", category: "retirement", priority: "high", probability: 87 },
  { name: "Child Education", target: 3000000, current: 1050000, monthly: 25000, date: "2035", category: "education", priority: "high", probability: 72 },
  { name: "Home Purchase", target: 5000000, current: 900000, monthly: 40000, date: "2028", category: "property", priority: "medium", probability: 45 },
  { name: "Emergency Fund", target: 600000, current: 480000, monthly: 10000, date: "2026", category: "safety", priority: "high", probability: 95 },
  { name: "Vacation Fund", target: 500000, current: 350000, monthly: 15000, date: "2027", category: "lifestyle", priority: "low", probability: 88 },
];

const categoryColors: Record<string, string> = {
  retirement: "from-purple-500 to-pink-400",
  education: "from-blue-500 to-cyan-400",
  property: "from-emerald-500 to-teal-400",
  safety: "from-amber-500 to-orange-400",
  lifestyle: "from-pink-500 to-rose-400",
  emergency: "from-red-500 to-orange-400",
  marriage: "from-rose-500 to-pink-400",
  independence: "from-emerald-500 to-green-400",
};

const goalCategories = [
  { value: "retirement", label: "Retirement" },
  { value: "education", label: "Education" },
  { value: "property", label: "Home Purchase" },
  { value: "safety", label: "Emergency Fund" },
  { value: "lifestyle", label: "Vacation" },
  { value: "marriage", label: "Marriage" },
  { value: "emergency", label: "Emergency" },
  { value: "independence", label: "Financial Independence" },
];

function getProbabilityColor(prob: number) {
  if (prob >= 80) return "text-emerald-400";
  if (prob >= 60) return "text-amber-400";
  return "text-red-400";
}

export default function GoalsPage() {
  const userId = useAppStore((s) => s.userId);
  const { data, isLoading, error, refetch } = useDashboard(userId);
  const [showAddModal, setShowAddModal] = useState(false);
  const [goals, setGoals] = useState<Goal[]>(fallbackGoals);
  const [newGoal, setNewGoal] = useState({ name: "", target: "", monthly: "", date: "", category: "retirement" });

  const d = data as any;
  const apiGoals = d?.goals?.goals;
  const displayGoals = (apiGoals && apiGoals.length > 0 ? apiGoals : goals).map((g: any) => ({
    ...g,
    target: g.target ?? 0,
    current: g.current ?? 0,
    monthly: g.monthly ?? 0,
    date: g.date ?? "N/A",
    category: g.category ?? "retirement",
    priority: g.priority ?? "medium",
  }));

  const totalTarget = displayGoals.reduce((s: number, g: any) => s + (g.target || 0), 0);
  const totalCurrent = displayGoals.reduce((s: number, g: any) => s + (g.current || 0), 0);
  const onTrackCount = displayGoals.filter((g: any) => g.target > 0 && (g.current / g.target) > 0.3).length;

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target || !newGoal.monthly || !newGoal.date) return;
    setGoals((prev) => [
      ...prev,
      {
        name: newGoal.name,
        target: parseInt(newGoal.target),
        current: 0,
        monthly: parseInt(newGoal.monthly),
        date: newGoal.date,
        category: newGoal.category,
        priority: "medium",
        probability: 50,
      },
    ]);
    setNewGoal({ name: "", target: "", monthly: "", date: "", category: "retirement" });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Goals</h1>
          <p className="text-sm text-muted-foreground">Track and manage your financial objectives</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Add Goal
        </Button>
      </div>

      {error && <ErrorBanner message={error.message} onRetry={refetch} />}

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Target", value: formatCurrency(totalTarget) },
          { label: "Total Saved", value: formatCurrency(totalCurrent) },
          { label: "Overall Progress", value: `${Math.round(totalCurrent / totalTarget * 100)}%` },
          { label: "Goals On Track", value: `${onTrackCount}/${displayGoals.length}` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1 text-gradient">{s.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {displayGoals.map((goal: any, i: number) => {
          const progress = Math.round(goal.current / goal.target * 100);
          const onTrack = progress > 30;
          const prob = goal.probability ?? Math.min(95, Math.round(progress * 1.2 + 20));
          return (
            <motion.div
              key={goal.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="hover:border-white/15 transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryColors[goal.category] ?? categoryColors.retirement} flex items-center justify-center flex-shrink-0`}>
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <h3 className="font-semibold">{goal.name}</h3>
                        <p className="text-xs text-muted-foreground">Target: {goal.date} · ₹{(goal.monthly ?? 0).toLocaleString()}/month SIP</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={onTrack ? "success" : "warning"}>
                          {onTrack ? "On Track" : "Behind"}
                        </Badge>
                        <div className="text-right">
                          <div className={cn("text-sm font-bold", getProbabilityColor(prob))}>{prob}%</div>
                          <div className="text-[10px] text-muted-foreground">probability</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">{formatCurrency(goal.current)}</span>
                        <span className="font-medium">{formatCurrency(goal.target)}</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                          className={`h-full rounded-full bg-gradient-to-r ${categoryColors[goal.category] ?? categoryColors.retirement}`}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs text-muted-foreground">{progress}% achieved</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calculator className="w-3 h-3" />
                          <span>{formatCurrency(goal.monthly)}/mo required</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong>Educational Disclaimer:</strong> Goal projections and probability estimates are
            based on simplified Monte Carlo simulations with historical return assumptions. Actual
            returns will vary. This is not financial advice — consult a certified planner for
            personalized goal planning.
          </p>
        </CardContent>
      </Card>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass-card rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Add New Goal</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Goal Name</label>
                  <input
                    value={newGoal.name}
                    onChange={(e) => setNewGoal((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., Retirement Corpus"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Category</label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {goalCategories.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Target Amount (₹)</label>
                    <input
                      type="number"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal((p) => ({ ...p, target: e.target.value }))}
                      placeholder="1000000"
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Monthly SIP (₹)</label>
                    <input
                      type="number"
                      value={newGoal.monthly}
                      onChange={(e) => setNewGoal((p) => ({ ...p, monthly: e.target.value }))}
                      placeholder="25000"
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Target Year</label>
                  <input
                    type="number"
                    value={newGoal.date}
                    onChange={(e) => setNewGoal((p) => ({ ...p, date: e.target.value }))}
                    placeholder="2030"
                    min="2026"
                    max="2060"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={handleAddGoal} disabled={!newGoal.name || !newGoal.target || !newGoal.monthly || !newGoal.date}>
                    Add Goal
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
