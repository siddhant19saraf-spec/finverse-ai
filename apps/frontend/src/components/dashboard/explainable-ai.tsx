"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lightbulb,
  Scale,
} from "lucide-react";

const reasons = [
  "Your income increased by 12% this year",
  "Risk tolerance supports higher allocation",
  "Goal timeline allows compounding benefit",
];

const alternatives = [
  { text: "Increase by ₹1,000", detail: "Lower risk" },
  { text: "Lump sum ₹50,000", detail: "One-time" },
  { text: "No change", detail: "Current SIP sufficient" },
];

export function ExplainableAI() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative rounded-xl p-[1px] bg-gradient-to-br from-primary/30 via-purple-500/20 to-purple-500/30">
        <Card className="bg-black/60 backdrop-blur-xl border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Explainable AI
              </div>
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 border-amber-500/20 text-amber-400"
              >
                Transparency First
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Main Recommendation */}
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-xs text-muted-foreground mb-1">
                Recommendation
              </p>
              <p className="text-base font-semibold text-amber-400">
                Increase SIP by ₹2,000/month
              </p>
            </div>

            {/* Confidence */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Confidence</span>
                <span className="font-semibold text-foreground">95%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "95%" }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                />
              </div>
            </div>

            {/* Why Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                Why
              </div>
              <div className="space-y-1.5 pl-1">
                {reasons.map((reason) => (
                  <div key={reason} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-[11px] text-muted-foreground leading-relaxed">
                      {reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence Used */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Evidence Used
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Analyzed 12 months of income data, portfolio risk metrics, goal
                projections, and market conditions
              </p>
            </div>

            {/* Assumptions */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Assumptions
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                12% expected return, 6% inflation, stable employment
              </p>
            </div>

            {/* Alternatives */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Scale className="h-3.5 w-3.5 text-blue-400" />
                Alternatives
              </div>
              <div className="space-y-1.5">
                {alternatives.map((alt) => (
                  <div
                    key={alt.text}
                    className="flex items-center justify-between rounded-md border border-white/5 bg-white/[0.02] px-3 py-1.5"
                  >
                    <span className="text-[11px] text-muted-foreground">
                      {alt.text}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {alt.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Potential Risks */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                Potential Risks
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-5">
                Market downturn could reduce short-term returns. SIP increase may
                strain emergency fund if not planned.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between">
            <p className="text-[9px] text-muted-foreground/60">
              Educational Decision Support — not financial advice
            </p>
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground/60">
              <Clock className="h-2.5 w-2.5" />
              Data fresh as of 2 min ago
            </div>
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  );
}
