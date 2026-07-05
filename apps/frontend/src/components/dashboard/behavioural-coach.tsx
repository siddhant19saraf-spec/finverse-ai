"use client";

import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Shield,
  Eye,
} from "lucide-react";

interface BiasPattern {
  name: string;
  severity: "high" | "medium" | "low";
  detected: boolean;
  description: string;
  evidence: string;
  coaching: string;
  actionableTip: string;
}

const biasPatterns: BiasPattern[] = [
  {
    name: "FOMO (Fear of Missing Out)",
    severity: "high",
    detected: true,
    description: "Tendency to chase investments after seeing others profit",
    evidence: "Recent portfolio shows 3 positions entered after 15%+ rallies",
    coaching: "FOMO-driven decisions often lead to buying at peaks. The best investment opportunities are found through analysis, not panic.",
    actionableTip: "Set entry criteria before researching any stock. If it doesn't meet your criteria, skip it regardless of momentum.",
  },
  {
    name: "Loss Aversion",
    severity: "medium",
    detected: true,
    description: "Holding losing investments too long while selling winners early",
    evidence: "Average holding period for losses: 180 days. For gains: 45 days.",
    coaching: "Research shows losses feel 2x more painful than equivalent gains feel good. This causes irrational holding of declining assets.",
    actionableTip: "Set stop-loss levels at purchase. Review positions quarterly against original thesis, not purchase price.",
  },
  {
    name: "Overconfidence Bias",
    severity: "medium",
    detected: true,
    description: "Overestimating your ability to predict market movements",
    evidence: "Portfolio turnover is 3x higher than recommended for your risk profile",
    coaching: "Even professional fund managers underperform the index 80% of the time. Excessive trading erodes returns through costs.",
    actionableTip: "Limit portfolio reviews to monthly. Focus on long-term thesis rather than daily price movements.",
  },
  {
    name: "Concentration Bias",
    severity: "low",
    detected: false,
    description: "Over-investing in familiar sectors or companies",
    evidence: "IT sector allocation is 23% — within acceptable limits",
    coaching: "Familiarity feels safe but isn't always wise. Diversification across sectors and geographies reduces risk.",
    actionableTip: "No single sector should exceed 25% of your portfolio. Review sector allocation quarterly.",
  },
  {
    name: "Panic Selling",
    severity: "high",
    detected: true,
    description: "Selling investments during market downturns out of fear",
    evidence: "Portfolio was reduced by 15% during the March correction before recovering",
    coaching: "Markets have recovered from every crash in history. Selling during downturns locks in losses and misses the recovery.",
    actionableTip: "Create a written investment plan that includes what you'll do during corrections. Automate SIPs to remove emotion.",
  },
  {
    name: "Anchoring Bias",
    severity: "low",
    detected: false,
    description: "Relying too heavily on the first piece of information encountered",
    evidence: "Purchase prices are not being used as reference for current valuations",
    coaching: "The price you paid for an investment is irrelevant to its future potential. Evaluate based on current fundamentals.",
    actionableTip: "Review positions based on current valuation metrics, not historical purchase price.",
  },
];

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "high": return <Badge variant="destructive">High Impact</Badge>;
    case "medium": return <Badge variant="warning">Moderate</Badge>;
    case "low": return <Badge variant="success">Low</Badge>;
    default: return <Badge variant="outline">Info</Badge>;
  }
}

export function BehaviouralCoach() {
  const detected = biasPatterns.filter((b) => b.detected);
  const notDetected = biasPatterns.filter((b) => !b.detected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          Behavioural Finance Coach
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Understand your investing biases and improve decision-making
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-400">{detected.filter((d) => d.severity === "high").length}</div>
            <div className="text-xs text-muted-foreground">High Impact Biases</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-400">{detected.filter((d) => d.severity === "medium").length}</div>
            <div className="text-xs text-muted-foreground">Moderate Biases</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-400">{notDetected.length}</div>
            <div className="text-xs text-muted-foreground">No Issues Found</div>
          </CardContent>
        </Card>
      </div>

      {detected.length > 0 && (
        <div>
          <h2 className="text-sm font-medium mb-3 flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            Biases Detected in Your Behaviour
          </h2>
          <div className="space-y-3">
            {detected.map((bias, i) => (
              <motion.div
                key={bias.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="border-amber-500/20">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-semibold">{bias.name}</span>
                      </div>
                      {getSeverityBadge(bias.severity)}
                    </div>
                    <p className="text-xs text-muted-foreground">{bias.description}</p>
                    <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span className="text-[11px] font-medium text-amber-400">Evidence</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{bias.evidence}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Brain className="w-3 h-3 text-primary" />
                        <span className="text-[11px] font-medium text-primary">Coaching</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{bias.coaching}</p>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <Lightbulb className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[11px] font-medium text-emerald-400">Actionable Tip</span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{bias.actionableTip}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {notDetected.length > 0 && (
        <div>
          <h2 className="text-sm font-medium mb-3 flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Good Behavioural Habits
          </h2>
          <div className="space-y-2">
            {notDetected.map((bias) => (
              <div key={bias.name} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-sm font-medium">{bias.name}</span>
                  <p className="text-xs text-muted-foreground">{bias.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <strong>Educational Disclaimer:</strong> Behavioural analysis is based on general
              patterns in your portfolio activity and common cognitive biases documented in behavioural
              finance research. It is for educational purposes and does not constitute financial advice.
              Every investor is unique — consult a financial advisor for personalized guidance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
