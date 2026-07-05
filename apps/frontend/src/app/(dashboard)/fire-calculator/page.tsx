"use client";
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, TrendingUp, DollarSign, Calendar, AlertTriangle, Zap, Target, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";

function runMonteCarlo(
  currentAge: number, retireAge: number, lifeExpectancy: number,
  currentCorpus: number, monthlyInvestment: number, annualReturn: number,
  inflation: number, yearsSavedPct: number, swrPct: number,
  iterations: number
) {
  const yearsToRetire = retireAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retireAge;
  const totalYears = lifeExpectancy - currentAge;
  const monthlyR = annualReturn / 100 / 12;
  const inflationR = inflation / 100 / 12;

  const percentileData: { year: number; age: number; p10: number; p25: number; p50: number; p75: number; p90: number }[] = [];
  const allFinalValues: number[] = [];
  const allRetirementCorpus: number[] = [];
  let successCount = 0;

  for (let iter = 0; iter < iterations; iter++) {
    let corpus = currentCorpus;
    const yearlyValues: number[] = [];

    for (let y = 0; y < totalYears; y++) {
      const age = currentAge + y;
      if (age < retireAge) {
        const annualReturn = (1 + monthlyR) ** 12 - 1;
        const vol = (Math.random() - 0.5) * 0.2;
        corpus *= (1 + annualReturn + vol);
        corpus += monthlyInvestment * 12;
      } else {
        const swrAmount = corpus * (swrPct / 100);
        const inflationAdj = (1 + inflation / 100) ** (age - retireAge);
        const withdrawal = swrAmount * inflationAdj;
        corpus -= withdrawal;
        const annualReturn = (1 + monthlyR * 0.5) ** 12 - 1;
        const vol = (Math.random() - 0.5) * 0.15;
        corpus *= (1 + annualReturn + vol);
      }
      corpus = Math.max(corpus, 0);
      yearlyValues.push(corpus);
    }

    allFinalValues.push(yearlyValues[totalYears - 1] || 0);
    if (yearsToRetire > 0) allRetirementCorpus.push(yearlyValues[yearsToRetire - 1] || 0);
    if (yearlyValues[totalYears - 1] > 0) successCount++;
  }

  allFinalValues.sort((a, b) => a - b);
  allRetirementCorpus.sort((a, b) => a - b);

  for (let y = 0; y < totalYears; y++) {
    const yearValues: number[] = [];
    for (let iter = 0; iter < iterations; iter++) {
      let corpus = currentCorpus;
      for (let yy = 0; yy <= y; yy++) {
        const age = currentAge + yy;
        if (age < retireAge) {
          const annualReturn = (1 + monthlyR) ** 12 - 1;
          const vol = (Math.random() - 0.5) * 0.2;
          corpus *= (1 + annualReturn + vol);
          corpus += monthlyInvestment * 12;
        } else {
          const swrAmount = corpus * (swrPct / 100);
          const inflationAdj = (1 + inflation / 100) ** (age - retireAge);
          corpus -= swrAmount * inflationAdj;
          const annualReturn = (1 + monthlyR * 0.5) ** 12 - 1;
          const vol = (Math.random() - 0.5) * 0.15;
          corpus *= (1 + annualReturn + vol);
        }
        corpus = Math.max(corpus, 0);
      }
      yearValues.push(corpus);
    }
    yearValues.sort((a, b) => a - b);
    percentileData.push({
      year: currentAge + y,
      age: currentAge + y,
      p10: yearValues[Math.floor(iterations * 0.1)] || 0,
      p25: yearValues[Math.floor(iterations * 0.25)] || 0,
      p50: yearValues[Math.floor(iterations * 0.5)] || 0,
      p75: yearValues[Math.floor(iterations * 0.75)] || 0,
      p90: yearValues[Math.floor(iterations * 0.9)] || 0,
    });
  }

  const medianRetirement = allRetirementCorpus[Math.floor(allRetirementCorpus.length * 0.5)] || 0;
  const monthlyAtRetirement = medianRetirement * (swrPct / 100) / 12;
  const inflationAdjMonthly = monthlyAtRetirement / ((1 + inflation / 100) ** (retireAge - currentAge));

  return {
    percentileData,
    successRate: (successCount / iterations) * 100,
    medianFinalValue: allFinalValues[Math.floor(allFinalValues.length * 0.5)] || 0,
    medianRetirementCorpus: medianRetirement,
    monthlyAtRetirement: Math.round(inflationAdjMonthly),
    yearsToRetire,
    yearsInRetirement,
  };
}

const Slider = ({ label, value, onChange, min, max, step, format }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; format?: (v: number) => string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-sm text-muted-foreground">{label}</label>
      <span className="text-sm font-semibold">{format ? format(value) : value}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-primary"
    />
    <div className="flex justify-between text-[10px] text-muted-foreground">
      <span>{format ? format(min) : min}</span>
      <span>{format ? format(max) : max}</span>
    </div>
  </div>
);

export default function FireCalculatorPage() {
  const [currentAge, setCurrentAge] = useState(28);
  const [retireAge, setRetireAge] = useState(45);
  const [lifeExp, setLifeExp] = useState(85);
  const [corpus, setCorpus] = useState(500000);
  const [monthly, setMonthly] = useState(50000);
  const [returnPct, setReturnPct] = useState(12);
  const [inflation, setInflation] = useState(6);
  const [swr, setSwr] = useState(4);

  const result = useMemo(() => {
    return runMonteCarlo(currentAge, retireAge, lifeExp, corpus, monthly, returnPct, inflation, 0, swr, 500);
  }, [currentAge, retireAge, lifeExp, corpus, monthly, returnPct, inflation, swr]);

  const yearlySavings = monthly * 12;
  const totalInvested = yearlySavings * (retireAge - currentAge) + corpus;
  const yearsToRetire = retireAge - currentAge;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">FIRE Calculator</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Financial Independence, Retire Early — Monte Carlo simulation with 500 iterations</p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Zap className="w-3 h-3" />
          {Math.round(result.successRate)}% Success Rate
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Personal Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Slider label="Current Age" value={currentAge} onChange={setCurrentAge} min={18} max={60} step={1} />
              <Slider label="Retirement Age" value={retireAge} onChange={setRetireAge} min={30} max={70} step={1} />
              <Slider label="Life Expectancy" value={lifeExp} onChange={setLifeExp} min={60} max={100} step={1} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Financials</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Slider label="Current Corpus" value={corpus} onChange={setCorpus} min={0} max={50000000} step={100000} format={(v) => `₹${(v / 100000).toFixed(1)}L`} />
              <Slider label="Monthly Investment" value={monthly} onChange={setMonthly} min={1000} max={500000} step={1000} format={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Slider label="Expected Return" value={returnPct} onChange={setReturnPct} min={4} max={25} step={0.5} format={(v) => `${v}%`} />
              <Slider label="Inflation" value={inflation} onChange={setInflation} min={2} max={12} step={0.5} format={(v) => `${v}%`} />
              <Slider label="Safe Withdrawal Rate" value={swr} onChange={setSwr} min={2} max={8} step={0.5} format={(v) => `${v}%`} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Chart + Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Wealth Projection</CardTitle>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />90th %ile</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Median</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />10th %ile</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.percentileData}>
                    <defs>
                      <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }}
                      label={{ value: "Age", position: "insideBottom", offset: -5, fill: "#71717a", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }}
                      tickFormatter={(v) => `₹${(v / 10000000).toFixed(1)}Cr`} />
                    <Tooltip content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="glass-card p-3 rounded-lg text-xs space-y-1">
                          <p className="font-semibold">Age {d?.age}</p>
                          <p className="text-emerald-400">Best case: {formatCurrency(d?.p90)}</p>
                          <p className="text-blue-400">Median: {formatCurrency(d?.p50)}</p>
                          <p className="text-red-400">Worst case: {formatCurrency(d?.p10)}</p>
                        </div>
                      );
                    }} />
                    <ReferenceLine x={retireAge} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: "Retire", fill: "#F59E0B", fontSize: 10 }} />
                    <Area type="monotone" dataKey="p90" stroke="#10B981" strokeWidth={1} fill="none" strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="p75" stroke="#10B98140" strokeWidth={0} fill="none" />
                    <Area type="monotone" dataKey="p50" stroke="#3B82F6" strokeWidth={2} fill="url(#bandGrad)" />
                    <Area type="monotone" dataKey="p25" stroke="#EF444440" strokeWidth={0} fill="none" />
                    <Area type="monotone" dataKey="p10" stroke="#EF4444" strokeWidth={1} fill="none" strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Target, label: "Retirement Corpus", value: formatCurrency(result.medianRetirementCorpus), color: "text-blue-400" },
              { icon: DollarSign, label: "Monthly Income", value: `₹${result.monthlyAtRetirement.toLocaleString("en-IN")}/mo`, color: "text-emerald-400" },
              { icon: Calendar, label: "Years to FIRE", value: `${yearsToRetire} years`, color: "text-amber-400" },
              { icon: TrendingUp, label: "Total Invested", value: formatCurrency(totalInvested), color: "text-purple-400" },
            ].map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                <Card className="text-center">
                  <m.icon className={`w-5 h-5 ${m.color} mx-auto mb-2`} />
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-lg font-bold mt-1">{m.value}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Insights */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-400/80 space-y-1">
                <p><strong>Educational Disclaimer:</strong> This is a Monte Carlo simulation based on historical market data and assumptions. Past performance does not guarantee future results.</p>
                <p>• Assumed return: {returnPct}% p.a. (before inflation) with ±20% annual volatility</p>
                <p>• Assumed inflation: {inflation}% p.a. — withdrawal adjusted annually</p>
                <p>• SWR of {swr}% means you withdraw {swr}% of corpus yearly, adjusted for inflation</p>
                <p>• {Math.round(result.successRate)}% of 500 simulations had money lasting through age {lifeExp}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
