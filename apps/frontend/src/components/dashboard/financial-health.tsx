"use client";

import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Heart,
  TrendingUp,
  Wallet,
  Target,
  Shield,
  PiggyBank,
  CreditCard,
  CheckCircle2,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const healthDimensions = [
  {
    label: "Savings Rate",
    score: 82,
    value: "28%",
    target: "30%",
    icon: PiggyBank,
    detail: "You save 28% of your income — above the recommended 20% minimum",
    suggestion: "Increase by 2% to reach optimal savings rate",
    improving: true,
  },
  {
    label: "Emergency Fund",
    score: 72,
    value: "4 months",
    target: "6 months",
    icon: Shield,
    detail: "4 months of expenses covered — solid foundation",
    suggestion: "Build to 6 months for complete financial safety",
    improving: true,
  },
  {
    label: "Diversification",
    score: 88,
    value: "4 sectors",
    target: "5+ sectors",
    icon: TrendingUp,
    detail: "Well diversified across equity, debt, gold, and international",
    suggestion: "Consider adding REITs or infrastructure funds",
    improving: false,
  },
  {
    label: "Goal Progress",
    score: 91,
    value: "85%",
    target: "100%",
    icon: Target,
    detail: "Goals are 85% on track with consistent contributions",
    suggestion: "Review and adjust goal targets annually",
    improving: true,
  },
  {
    label: "Debt Health",
    score: 95,
    value: "0.12",
    target: "<0.40",
    icon: CreditCard,
    detail: "Debt-to-income ratio is excellent at 12%",
    suggestion: "Maintain current debt levels",
    improving: false,
  },
  {
    label: "Investment Consistency",
    score: 94,
    value: "18 months",
    target: "Ongoing",
    icon: CheckCircle2,
    detail: "Unbroken SIP streak for 18 months — excellent discipline",
    suggestion: "Consider stepping up SIP by 10% annually",
    improving: true,
  },
];

function getScoreColor(score: number) {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-amber-400";
  return "text-red-400";
}

function getScoreGradient(score: number) {
  if (score >= 85) return "from-emerald-500 to-teal-400";
  if (score >= 70) return "from-amber-500 to-orange-400";
  return "from-red-500 to-pink-400";
}

export function FinancialHealthScore() {
  const overall = Math.round(
    healthDimensions.reduce((sum, d) => sum + d.score, 0) / healthDimensions.length
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary" />
          Financial Health Score
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          A comprehensive view of your financial wellness
        </p>
      </div>

      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" />
        <CardContent className="pt-6 relative">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <div className={cn("text-4xl font-bold", getScoreColor(overall))}>{overall}</div>
                  <div className="text-xs text-muted-foreground">out of 100</div>
                </div>
              </div>
              <svg className="absolute inset-0 w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                <motion.circle
                  cx="64" cy="64" r="60" fill="none" strokeWidth="4"
                  strokeLinecap="round"
                  className={cn(overall >= 85 ? "stroke-emerald-500" : overall >= 70 ? "stroke-amber-500" : "stroke-red-500")}
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - overall / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold mb-1">Your Financial Health</h2>
              <p className="text-sm text-muted-foreground mb-3">
                {overall >= 85
                  ? "Excellent! Your financial habits are strong. Keep maintaining your discipline."
                  : overall >= 70
                  ? "Good progress! A few areas need attention to reach optimal health."
                  : "Your financial health needs improvement. Focus on the areas highlighted below."}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {healthDimensions.map((d) => (
                  <div key={d.label} className="flex items-center gap-1 text-xs">
                    <div className={cn("w-2 h-2 rounded-full", d.score >= 85 ? "bg-emerald-500" : d.score >= 70 ? "bg-amber-500" : "bg-red-500")} />
                    <span className="text-muted-foreground">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {healthDimensions.map((dim, i) => (
          <motion.div
            key={dim.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0", getScoreGradient(dim.score))}>
                    <dim.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{dim.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-sm font-bold", getScoreColor(dim.score))}>{dim.score}/100</span>
                        {dim.improving ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-1.5 text-xs">
                      <span>Current: <span className="font-medium">{dim.value}</span></span>
                      <span className="text-muted-foreground">Target: <span className="font-medium">{dim.target}</span></span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1.5">{dim.detail}</p>
                    <div className="flex items-center gap-1.5">
                      <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
                      <p className="text-[11px] text-amber-400/80">{dim.suggestion}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <strong>Educational Disclaimer:</strong> This Financial Health Score is for educational
              and informational purposes only. It is computed from general financial principles and
              does not constitute personalized financial advice. Individual circumstances vary — consult
              a SEBI-registered investment advisor for tailored recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
