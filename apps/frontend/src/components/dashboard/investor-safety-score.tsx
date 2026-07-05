"use client";

import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Heart,
  Target,
  Wallet,
  BookOpen,
  TrendingUp,
  Lightbulb,
} from "lucide-react";

const dimensions = [
  {
    label: "Diversification",
    score: 88,
    icon: TrendingUp,
    detail: "Well spread across 4 sectors",
    suggestion: "Consider adding international exposure",
  },
  {
    label: "Emergency Fund",
    score: 72,
    icon: Wallet,
    detail: "4 months of expenses saved",
    suggestion: "Aim for 6 months for better safety",
  },
  {
    label: "Goal Planning",
    score: 91,
    icon: Target,
    detail: "All 5 goals are on track",
    suggestion: "Review goal targets annually",
  },
  {
    label: "Risk Alignment",
    score: 85,
    icon: Shield,
    detail: "Portfolio matches risk profile",
    suggestion: "Rebalance if risk appetite changes",
  },
  {
    label: "Investment Discipline",
    score: 94,
    icon: CheckCircle2,
    detail: "Consistent SIP for 18 months",
    suggestion: "Continue current SIP pattern",
  },
  {
    label: "Insurance Awareness",
    score: 65,
    icon: Heart,
    detail: "Health cover exists, life cover low",
    suggestion: "Consider term insurance of 10x income",
  },
  {
    label: "Financial Literacy",
    score: 78,
    icon: BookOpen,
    detail: "Completed 3 learning modules",
    suggestion: "Explore risk management module next",
  },
];

function getScoreColor(score: number) {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-amber-400";
  return "text-red-400";
}

function getScoreBg(score: number) {
  if (score >= 85) return "bg-emerald-500/10";
  if (score >= 70) return "bg-amber-500/10";
  return "bg-red-500/10";
}

function getOverallGrade(score: number) {
  if (score >= 90) return { label: "Excellent", variant: "success" as const };
  if (score >= 80) return { label: "Good", variant: "default" as const };
  if (score >= 70) return { label: "Fair", variant: "warning" as const };
  return { label: "Needs Improvement", variant: "destructive" as const };
}

export function InvestorSafetyScore() {
  const overall = Math.round(
    dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
  );
  const grade = getOverallGrade(overall);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Investor Safety Score</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your overall investment safety rating
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={cn("text-3xl font-bold", getScoreColor(overall))}>
                {overall}
              </div>
              <div className="text-xs text-muted-foreground">out of 100</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <Shield className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Overall Safety Rating</span>
                <Badge variant={grade.variant}>{grade.label}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on 7 key financial safety dimensions
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {dimensions.map((dim, i) => (
              <motion.div
                key={dim.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", getScoreBg(dim.score))}>
                  <dim.icon className={cn("w-4 h-4", getScoreColor(dim.score))} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{dim.label}</span>
                    <span className={cn("text-sm font-bold", getScoreColor(dim.score))}>
                      {dim.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{dim.detail}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
                    <p className="text-[11px] text-amber-400/80">{dim.suggestion}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">Educational Disclaimer</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              This score is for educational guidance only. It does not constitute financial advice.
              Scores are based on simulated data and general financial principles. Consult a
              certified financial planner for personalized recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
