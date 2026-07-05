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
import { Newspaper, TrendingUp, TrendingDown, Minus } from "lucide-react";

type Sentiment = "positive" | "negative" | "neutral";

const sentimentConfig: Record<
  Sentiment,
  { badge: string; icon: typeof TrendingUp }
> = {
  positive: { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: TrendingUp },
  negative: { badge: "bg-red-500/10 text-red-400 border-red-500/20", icon: TrendingDown },
  neutral: { badge: "bg-white/5 text-muted-foreground border-white/10", icon: Minus },
};

const smallNews = [
  {
    title: "RBI Holds Repo Rate at 6.5%",
    source: "Business Standard · 3h ago",
    sentiment: "neutral" as Sentiment,
    impact: "Banking stocks stable",
  },
  {
    title: "Reliance Q1 Profit Surges 12%",
    source: "Moneycontrol · 4h ago",
    sentiment: "positive" as Sentiment,
    impact: "RELIANCE +3.2% today",
  },
  {
    title: "IT Sector Faces Headwinds",
    source: "Economic Times · 5h ago",
    sentiment: "negative" as Sentiment,
    impact: "ITC -0.5% impact minimal",
  },
  {
    title: "Gold Prices Hit Record High",
    source: "LiveMint · 6h ago",
    sentiment: "positive" as Sentiment,
    impact: "Gold allocation +0.5%",
  },
];

export function NewsBrief() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-blue-400" />
              AI News Brief
            </div>
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 h-4 border-white/10 text-muted-foreground"
            >
              Updated 5m ago
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Featured News */}
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <h4 className="text-sm font-semibold text-foreground mb-1.5">
              NIFTY 50 Crosses 24,500 Amid Strong FII Buying
            </h4>
            <p className="text-[11px] text-muted-foreground mb-2">
              Economic Times · 2h ago
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">
                  AI Impact:{" "}
                  <span className="text-emerald-400 font-medium">
                    Your portfolio: +₹1,240 (+0.05%)
                  </span>
                </p>
              </div>
              <Badge
                className={cn(
                  "text-[9px] px-1.5 py-0 h-4",
                  sentimentConfig.positive.badge
                )}
              >
                Positive
              </Badge>
            </div>
            <div className="flex gap-1.5 mt-2">
              {["NIFTY", "FII", "Bullish"].map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Small News Grid */}
          <div className="grid grid-cols-2 gap-2">
            {smallNews.map((item) => {
              const sentimentStyle = sentimentConfig[item.sentiment];
              return (
                <div
                  key={item.title}
                  className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-1.5"
                >
                  <h5 className="text-xs font-medium text-foreground leading-tight">
                    {item.title}
                  </h5>
                  <p className="text-[10px] text-muted-foreground">
                    {item.source}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge
                      className={cn(
                        "text-[8px] px-1.5 py-0 h-3.5",
                        sentimentStyle.badge
                      )}
                    >
                      {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70">
                    {item.impact}
                  </p>
                </div>
              );
            })}
          </div>

          {/* How This Affects You */}
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
              How This Affects You
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Overall positive day. FII buying and strong earnings drive gains.
              Your diversified portfolio benefits from multiple sectors.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
