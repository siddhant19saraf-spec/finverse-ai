"use client";

import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Shield,
  TrendingUp,
  PieChart,
} from "lucide-react";

interface SuitabilityDimension {
  dimension: string;
  riskProfile: string;
  currentAllocation: string;
  alignment: "aligned" | "moderate" | "misaligned";
  detail: string;
  suggestion: string;
}

const suitabilityData: SuitabilityDimension[] = [
  {
    dimension: "Equity Exposure",
    riskProfile: "60-80%",
    currentAllocation: "72%",
    alignment: "aligned",
    detail: "Within your moderate-aggressive risk band",
    suggestion: "Maintain current allocation",
  },
  {
    dimension: "Debt Allocation",
    riskProfile: "15-30%",
    currentAllocation: "18%",
    alignment: "aligned",
    detail: "Provides stability to the portfolio",
    suggestion: "Consider increasing if nearing goals",
  },
  {
    dimension: "Gold & Commodities",
    riskProfile: "5-15%",
    currentAllocation: "8%",
    alignment: "aligned",
    detail: "Adequate hedge against inflation",
    suggestion: "Good diversification hedge",
  },
  {
    dimension: "International",
    riskProfile: "10-20%",
    currentAllocation: "3%",
    alignment: "moderate",
    detail: "Below recommended international exposure",
    suggestion: "Add international ETFs for global diversification",
  },
  {
    dimension: "Cash & Liquid",
    riskProfile: "5-10%",
    currentAllocation: "2%",
    alignment: "moderate",
    detail: "Lower than ideal emergency buffer",
    suggestion: "Maintain 6 months expenses in liquid funds",
  },
  {
    dimension: "High-Risk Assets",
    riskProfile: "0-10%",
    currentAllocation: "0%",
    alignment: "aligned",
    detail: "No speculative positions detected",
    suggestion: "Appropriate for your risk level",
  },
];

function getAlignmentIcon(alignment: string) {
  switch (alignment) {
    case "aligned":
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case "moderate":
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    case "misaligned":
      return <XCircle className="w-4 h-4 text-red-400" />;
    default:
      return <Info className="w-4 h-4 text-muted-foreground" />;
  }
}

function getAlignmentBadge(alignment: string) {
  switch (alignment) {
    case "aligned":
      return <Badge variant="success">Aligned</Badge>;
    case "moderate":
      return <Badge variant="warning">Review</Badge>;
    case "misaligned":
      return <Badge variant="destructive">Misaligned</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export function SuitabilityChecker() {
  const aligned = suitabilityData.filter((d) => d.alignment === "aligned").length;
  const moderate = suitabilityData.filter((d) => d.alignment === "moderate").length;
  const misaligned = suitabilityData.filter((d) => d.alignment === "misaligned").length;
  const overallPct = Math.round((aligned / suitabilityData.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-400 flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Investment Suitability Check</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Risk profile vs. current allocation alignment
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">{overallPct}%</div>
              <div className="text-xs text-muted-foreground">aligned</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-muted-foreground">{aligned} aligned</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-muted-foreground">{moderate} review needed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-muted-foreground">{misaligned} misaligned</span>
            </div>
          </div>

          <div className="space-y-2">
            {suitabilityData.map((item, i) => (
              <motion.div
                key={item.dimension}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {getAlignmentIcon(item.alignment)}
                    <span className="text-sm font-medium">{item.dimension}</span>
                  </div>
                  {getAlignmentBadge(item.alignment)}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-1.5">
                  <div>
                    <span className="text-muted-foreground">Profile: </span>
                    <span className="font-medium">{item.riskProfile}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Actual: </span>
                    <span className={cn("font-medium", item.alignment === "misaligned" ? "text-red-400" : item.alignment === "moderate" ? "text-amber-400" : "text-emerald-400")}>{item.currentAllocation}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status: </span>
                    <span className="font-medium capitalize">{item.alignment}</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">{item.detail}</p>
                <p className="text-[11px] text-primary/80 mt-0.5">{item.suggestion}</p>
              </motion.div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">Educational Guidance Only</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              This suitability check compares your stated risk profile with your actual asset
              allocation. It is for educational purposes and does not constitute investment advice.
              Risk profiles and market conditions change — review periodically with a certified advisor.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
