"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Brain, ChevronRight } from "lucide-react";

interface Scenario {
  label: string;
  value: string;
  color: string;
  highlight?: boolean;
}

const scenarios: Scenario[] = [
  { label: "Market Crash (-30%)", value: "₹1.48 Cr", color: "text-red-400" },
  { label: "Salary Increase (+20%)", value: "₹2.56 Cr", color: "text-emerald-400" },
  { label: "Retirement", value: "₹1.82 Cr", color: "text-purple-400" },
  { label: "House Purchase", value: "₹1.95 Cr", color: "text-amber-400" },
  { label: "Increase SIP (+₹5K)", value: "₹2.78 Cr", color: "text-blue-400" },
  {
    label: "Current Plan",
    value: "₹2.14 Cr",
    color: "text-primary",
    highlight: true,
  },
];

interface Goal {
  label: string;
  percent: number;
  color: string;
}

const goals: Goal[] = [
  { label: "Home Goal", percent: 87, color: "bg-blue-500" },
  { label: "Retirement", percent: 91, color: "bg-purple-500" },
  { label: "Emergency Fund", percent: 80, color: "bg-emerald-500" },
];

export function DigitalTwinPreview() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-500" />
          Future Projection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="text-center py-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              ₹2.14 Cr
            </div>
            <div className="text-xs text-muted-foreground mt-1">10Y Projection</div>
          </motion.div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {scenarios.map((s) => (
            <div
              key={s.label}
              className={cn(
                "rounded-lg border p-2.5 text-center",
                s.highlight
                  ? "border-primary/40 bg-primary/5"
                  : "border-white/5 bg-white/[0.02]"
              )}
            >
              <div className={cn("text-sm font-bold", s.color)}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2.5">
          {goals.map((g) => (
            <div key={g.label} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">{g.label}</span>
                <span className="font-medium">{g.percent}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${g.percent}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className={cn("h-full rounded-full", g.color)}
                />
              </div>
            </div>
          ))}
        </div>

        <Link href="/digital-twin">
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-primary/20 bg-primary/5 py-2.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
          >
            Run Simulation
            <ChevronRight className="h-3.5 w-3.5" />
          </motion.div>
        </Link>
      </CardContent>
    </Card>
  );
}
