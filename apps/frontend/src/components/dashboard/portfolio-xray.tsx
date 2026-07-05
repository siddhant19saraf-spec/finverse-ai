"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Shield, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";

const radarData = [
  { subject: "Diversification", value: 95 },
  { subject: "Risk Management", value: 82 },
  { subject: "Growth", value: 78 },
  { subject: "Stability", value: 88 },
  { subject: "Liquidity", value: 72 },
  { subject: "Compliance", value: 96 },
];

const miniStats = [
  {
    label: "Concentration Risk",
    value: "23%",
    detail: "in IT sector",
    badge: "warning",
    icon: AlertTriangle,
  },
  {
    label: "Volatility Score",
    value: "Moderate",
    detail: "",
    badge: "warning",
    icon: Shield,
  },
  {
    label: "Stress Score",
    value: "72/100",
    detail: "",
    badge: "success",
    icon: CheckCircle2,
  },
  {
    label: "Diversification",
    value: "95/100",
    detail: "",
    badge: "success",
    icon: CheckCircle2,
  },
];

const improvements = [
  "Reduce IT sector concentration from 25% to 18%",
  "Add international equity exposure (5-10%)",
  "Increase fixed income allocation by 5%",
];

export function PortfolioXRay() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white/[0.02] border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Portfolio X-Ray
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Radar Chart */}
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
                <Radar
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Mini Stat Cards */}
          <div className="grid grid-cols-2 gap-2">
            {miniStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-white/5 bg-white/[0.02] p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] px-1.5 py-0 h-4 border-0",
                      stat.badge === "warning"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-emerald-500/10 text-emerald-500"
                    )}
                  >
                    {stat.badge === "warning" ? "Warning" : "Good"}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-semibold">{stat.value}</span>
                  {stat.detail && (
                    <span className="text-[10px] text-muted-foreground">
                      {stat.detail}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Recommended Improvements */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Lightbulb className="h-3 w-3 text-amber-500" />
              Recommended Improvements
            </div>
            <ul className="space-y-1.5">
              {improvements.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <span className="mt-1 h-1 w-1 rounded-full bg-primary/60 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
