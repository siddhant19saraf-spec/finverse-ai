"use client";
import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

const sectorReturns = [
  { sector: "IT", monthly: [2.1, -0.5, 3.2, 1.8, -1.2, 2.5, 0.8, 1.5, -0.3, 2.8, 1.2, -0.7] },
  { sector: "Banking", monthly: [1.5, 2.3, -0.8, 1.2, 0.5, -1.5, 2.8, -0.3, 1.8, 0.9, -0.2, 1.1] },
  { sector: "Energy", monthly: [-1.2, 0.8, 1.5, -0.3, 2.1, 1.8, -2.1, 0.5, 1.2, -0.8, 1.5, 0.3] },
  { sector: "Pharma", monthly: [0.8, 1.2, -0.5, 2.1, 1.5, 0.3, -0.8, 1.8, 0.5, -1.2, 0.8, 1.5] },
  { sector: "Auto", monthly: [1.2, -0.3, 2.5, 0.8, -1.5, 1.2, 2.2, -0.5, 1.8, 0.5, -0.8, 1.2] },
  { sector: "FMCG", monthly: [0.5, 0.8, 0.3, 1.2, 0.5, -0.2, 0.8, 1.5, -0.3, 0.5, 0.8, 0.2] },
];

function computeCorrelation(a: number[], b: number[]): number {
  const n = a.length;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  return denA && denB ? num / Math.sqrt(denA * denB) : 0;
}

function CorrelationMatrix() {
  const sectors = sectorReturns.map((s) => s.sector);
  const matrix = useMemo(() => {
    const result: { x: string; y: string; value: number }[] = [];
    for (let i = 0; i < sectors.length; i++) {
      for (let j = 0; j < sectors.length; j++) {
        const corr = i === j ? 1 : computeCorrelation(sectorReturns[i].monthly, sectorReturns[j].monthly);
        result.push({ x: sectors[i], y: sectors[j], value: Math.round(corr * 100) / 100 });
      }
    }
    return result;
  }, [sectors]);

  const getColor = (v: number) => {
    if (v >= 0.7) return "bg-emerald-500";
    if (v >= 0.3) return "bg-emerald-500/50";
    if (v >= -0.3) return "bg-white/5";
    if (v >= -0.7) return "bg-red-500/50";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Correlation Matrix</CardTitle>
        <p className="text-xs text-muted-foreground">Cross-sector correlation (12-month returns)</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[400px]">
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `60px repeat(${sectors.length}, 1fr)` }}>
              <div />
              {sectors.map((s) => (
                <div key={s} className="text-[10px] text-muted-foreground text-center py-1 truncate">{s}</div>
              ))}
              {matrix.map((cell, i) => {
                if (i % sectors.length === 0) {
                  const row = Math.floor(i / sectors.length);
                  return (
                    <React.Fragment key={i}>
                      <div className="text-[10px] text-muted-foreground flex items-center pr-1 truncate">{sectors[row]}</div>
                      <div className={`w-full aspect-square rounded ${getColor(cell.value)} flex items-center justify-center text-[9px] font-mono`}
                        title={`${cell.x} × ${cell.y}: ${cell.value}`}>
                        {cell.value.toFixed(2)}
                      </div>
                    </React.Fragment>
                  );
                }
                return (
                  <div key={i} className={`w-full aspect-square rounded ${getColor(cell.value)} flex items-center justify-center text-[9px] font-mono`}
                    title={`${cell.x} × ${cell.y}: ${cell.value}`}>
                    {cell.value.toFixed(2)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function EfficientFrontier() {
  const { points, frontier } = useMemo(() => {
    const rand = seededRandom(42);
    const pts: { risk: number; return: number; sharpe: number }[] = [];
    for (let i = 0; i < 50; i++) {
      const risk = 5 + rand() * 20;
      const ret = 4 + risk * 0.6 + (rand() - 0.5) * 8;
      const sharpe = (ret - 4) / risk;
      pts.push({ risk: Math.round(risk * 10) / 10, return: Math.round(ret * 10) / 10, sharpe: Math.round(sharpe * 100) / 100 });
    }
    const sorted = [...pts].sort((a, b) => a.risk - b.risk);
    const fr: typeof pts = [];
    let maxRet = -Infinity;
    for (const p of sorted) {
      if (p.return > maxRet) {
        fr.push(p);
        maxRet = p.return;
      }
    }
    return { points: pts, frontier: fr };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Efficient Frontier</CardTitle>
        <p className="text-xs text-muted-foreground">Risk vs. return optimization (simulated portfolios)</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <XAxis dataKey="risk" type="number" name="Risk" unit="%" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} label={{ value: "Risk (%)", position: "bottom", fill: "#71717a", fontSize: 11 }} />
              <YAxis dataKey="return" type="number" name="Return" unit="%" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} label={{ value: "Return (%)", angle: -90, position: "insideLeft", fill: "#71717a", fontSize: 11 }} />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="glass-card p-3 rounded-lg text-sm">
                      <p className="text-muted-foreground">Risk: {d.risk}% | Return: {d.return}%</p>
                      <p className="text-primary font-medium">Sharpe: {d.sharpe}</p>
                    </div>
                  );
                }}
              />
              <Scatter data={points} fill="#3B82F6" fillOpacity={0.3} />
              <Scatter data={frontier} fill="#10B981" fillOpacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskRadar() {
  const data = [
    { metric: "Volatility", value: 65, fullMark: 100 },
    { metric: "Drawdown", value: 40, fullMark: 100 },
    { metric: "Concentration", value: 55, fullMark: 100 },
    { metric: "Liquidity", value: 80, fullMark: 100 },
    { metric: "Beta", value: 45, fullMark: 100 },
    { metric: "VaR", value: 50, fullMark: 100 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Profile</CardTitle>
        <p className="text-xs text-muted-foreground">Multi-dimensional risk assessment</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#71717a", fontSize: 11 }} />
              <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
              <Radar name="Risk" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function MonthlyReturns() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const returns = [2.1, -0.5, 3.2, 1.8, -1.2, 2.5, 0.8, 1.5, -0.3, 2.8, 1.2, -0.7];
  const data = months.map((m, i) => ({
    month: m,
    return: returns[i],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Returns</CardTitle>
        <p className="text-xs text-muted-foreground">Portfolio returns by month (current year)</p>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.length) return null;
                  const val = (payload[0] as any).value as number;
                  return (
                    <div className="glass-card p-3 rounded-lg text-sm">
                      <p className="text-muted-foreground">{(payload[0] as any).payload.month}</p>
                      <p className={`font-medium ${val >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {val >= 0 ? "+" : ""}{val}%
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="return" radius={[4, 4, 0, 0]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.return >= 0 ? "#10B981" : "#EF4444"} fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Advanced Analytics</h1>
          <p className="text-sm text-muted-foreground">Deep portfolio analysis and risk modeling</p>
        </div>
        <Badge variant="outline">Beta</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CorrelationMatrix />
        <EfficientFrontier />
        <RiskRadar />
        <MonthlyReturns />
      </div>
    </div>
  );
}
