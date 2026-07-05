"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Globe,
  Cpu,
} from "lucide-react";

interface MarketItem {
  label: string;
  value: string;
  change?: string | null;
  color?: string;
  positive?: boolean;
  dot?: boolean;
}

const marketData: MarketItem[][] = [
  [
    {
      label: "Market Status",
      value: "OPEN",
      change: null,
      color: "text-emerald-500",
      dot: true,
    },
    {
      label: "NIFTY 50",
      value: "24,567.80",
      change: "+0.42%",
      positive: true,
    },
    {
      label: "SENSEX",
      value: "81,234.50",
      change: "+0.38%",
      positive: true,
    },
  ],
  [
    {
      label: "India VIX",
      value: "13.45",
      change: "-2.1%",
      positive: false,
    },
    {
      label: "Fear & Greed",
      value: "Neutral",
      change: null,
      color: "text-amber-500",
    },
    {
      label: "USD/INR",
      value: "₹85.22",
      change: "+0.1%",
      positive: false,
    },
  ],
  [
    {
      label: "Gold",
      value: "₹98,100",
      change: "+0.5%",
      positive: true,
    },
    {
      label: "Silver",
      value: "₹1,22,500",
      change: "-0.3%",
      positive: false,
    },
    {
      label: "Crude",
      value: "$72/bbl",
      change: "-1.2%",
      positive: false,
    },
  ],
  [
    {
      label: "US Markets",
      value: "S&P +0.3%",
      change: null,
      positive: true,
    },
    {
      label: "Asian Markets",
      value: "Nikkei +0.8%",
      change: null,
      positive: true,
    },
    {
      label: "European Markets",
      value: "FTSE -0.2%",
      change: null,
      positive: false,
    },
  ],
];

const sectorData = [
  { sector: "IT", change: 1.8 },
  { sector: "Banking", change: 0.5 },
  { sector: "Energy", change: -0.3 },
  { sector: "Consumer", change: 0.2 },
  { sector: "Pharma", change: 0.9 },
  { sector: "Auto", change: 2.1 },
];

export function MarketCommandCenter() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white/[0.02] border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            AI Market Command Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Terminal-style market grid */}
          <div className="rounded-lg border border-white/5 bg-black/30 p-3 font-mono text-xs space-y-2">
            {marketData.map((row, ri) => (
              <div key={ri} className="grid grid-cols-3 gap-3">
                {row.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded bg-white/[0.03] px-2 py-1.5"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      {item.dot && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      <span
                        className={cn(
                          "font-medium",
                          item.color ||
                            (item.positive ? "text-emerald-500" : "text-red-400")
                        )}
                      >
                        {item.value}
                      </span>
                      {item.change && (
                        <span
                          className={cn(
                            "text-[10px]",
                            item.positive
                              ? "text-emerald-500"
                              : "text-red-400"
                          )}
                        >
                          {item.change}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Sector Performance */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Activity className="h-3 w-3 text-primary" />
              Sector Performance
            </div>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectorData}
                  layout="vertical"
                  margin={{ left: 0, right: 10, top: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="sector"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [`${value > 0 ? "+" : ""}${value}%`, "Change"]}
                  />
                  <Bar
                    dataKey="change"
                    radius={[0, 4, 4, 0]}
                    fill="#3B82F6"
                  >
                    {sectorData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.change >= 0 ? "#3B82F6" : "#EF4444"}
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Market Summary */}
          <div className="rounded-lg border border-white/5 bg-primary/5 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Globe className="h-3 w-3" />
              AI Market Summary
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Markets closed mixed. IT and Auto sectors led gains. Banking
              remained steady. Crude oil weakness may benefit India&apos;s current
              account deficit.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
