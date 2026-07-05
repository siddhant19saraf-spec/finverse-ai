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
  Brain,
  TrendingUp,
  Shield,
  Activity,
  BarChart3,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { useState } from "react";

const stats = [
  {
    label: "Top Contributor",
    value: "Infosys",
    detail: "+1.8%",
    icon: TrendingUp,
    color: "text-emerald-500",
  },
  {
    label: "Highest Risk",
    value: "Technology Sector",
    detail: "23% weight",
    icon: Shield,
    color: "text-amber-500",
  },
  {
    label: "Portfolio Trend",
    value: "Upward",
    detail: "+0.82%",
    icon: Activity,
    color: "text-emerald-500",
  },
  {
    label: "Market Trend",
    value: "Positive",
    detail: "NIFTY +0.42%",
    icon: BarChart3,
    color: "text-emerald-500",
  },
  {
    label: "Expected Volatility",
    value: "Low-Medium",
    detail: "VIX 13.45",
    icon: Zap,
    color: "text-primary",
  },
  {
    label: "AI Confidence",
    value: "96%",
    detail: "",
    icon: Brain,
    color: "text-purple-500",
  },
];

export function AIInsightCard() {
  const [reasoningOpen, setReasoningOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative rounded-xl p-[1px] bg-gradient-to-br from-primary via-purple-500 to-primary/50">
        <Card className="bg-black/60 backdrop-blur-xl border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                AI Insight of the Day
              </div>
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 border-white/10 text-muted-foreground"
              >
                Updated 30s ago
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <stat.icon className={cn("h-3 w-3", stat.color)} />
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </span>
                  </div>
                  <div className="font-semibold text-sm">{stat.value}</div>
                  {stat.detail && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {stat.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* AI Explanation */}
            <div className="rounded-lg bg-gradient-to-br from-primary/5 to-purple-500/5 border border-white/5 p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Technology stocks outperformed today. Your portfolio gained mainly
                because of Infosys (+1.8%) and Reliance (+1.2%). The NIFTY IT
                index rose 1.12%, driving most of your equity gains. Banking
                stocks were flat, providing stability.
              </p>
            </div>

            {/* Footer */}
            <div className="space-y-3">
              {/* Reasoning Toggle */}
              <button
                onClick={() => setReasoningOpen(!reasoningOpen)}
                className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Info className="h-3 w-3" />
                  Reasoning
                </span>
                {reasoningOpen ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
              {reasoningOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-[10px] text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/20"
                >
                  The AI model analyzed 15 data points including sector
                  performance, individual stock movements, VIX levels, and
                  historical correlations. The primary signal was the strong
                  IT sector rally driven by positive Q3 guidance from major
                  tech companies.
                </motion.div>
              )}

              {/* Confidence Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Confidence</span>
                  <span>96%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "96%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500"
                  />
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[9px] text-muted-foreground/60 leading-relaxed">
                This AI-generated insight is for educational purposes only and
                does not constitute financial advice. Past performance is not
                indicative of future results. Please consult a SEBI-registered
                advisor before making investment decisions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
