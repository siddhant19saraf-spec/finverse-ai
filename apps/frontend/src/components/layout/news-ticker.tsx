"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Zap, Minus, Globe, TrendingUp, TrendingDown } from "lucide-react";
import { useMarketNews } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const terminalData = [
  { label: "Market", value: "Open", color: "text-emerald-400", pulse: true },
  { label: "NIFTY", value: "24,567.80", change: "+0.42%", up: true },
  { label: "SENSEX", value: "81,234.50", change: "+0.38%", up: true },
  { label: "Fear & Greed", value: "Neutral", color: "text-amber-400" },
  { label: "Rupee", value: "₹85.22", change: "+0.1%", up: true },
  { label: "Gold", value: "₹98,100", change: "+0.5%", up: true },
  { label: "Crude", value: "$72/bbl", change: "-1.2%", up: false },
  { label: "VIX", value: "13.45", change: "-2.1%", up: false },
];

function BreakingBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold uppercase tracking-wider animate-pulse-hot flex-shrink-0">
      <Zap className="w-2.5 h-2.5" />
      BREAKING
    </span>
  );
}

export function NewsTicker() {
  const { data: news } = useMarketNews();

  const allNews = useMemo(() => {
    if (!news) return [];
    return news.map((n: any) => ({
      text: n.title,
      source: n.source,
      published: n.published,
      sentiment: n.sentiment,
      isBreaking: n.sentiment === "negative" || n.tags?.some((t: string) =>
        ["SEBI", "RBI", "FII", "Earnings"].includes(t)
      ),
    }));
  }, [news]);

  return (
    <div className="relative overflow-hidden border-b border-white/5 h-8" role="marquee" aria-label="Live market news ticker">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 h-full w-12 z-10 bg-gradient-to-r from-background/80 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-12 z-10 bg-gradient-to-l from-background/80 to-transparent pointer-events-none" />

      <motion.div
        className="flex items-center gap-5 whitespace-nowrap h-full"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        {/* Terminal Market Data */}
        {[...terminalData, ...terminalData].map((item, i) => (
          <div key={`terminal-${i}`} className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground/60 text-[10px] uppercase tracking-wider font-medium">{item.label}</span>
            {"change" in item && item.change ? (
              <>
                <span className="font-semibold text-foreground">{item.value}</span>
                <span className={cn("flex items-center gap-0.5 font-mono font-bold text-[11px]", item.up ? "text-emerald-400" : "text-red-400")}>
                  {item.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {item.change}
                </span>
              </>
            ) : (
              <span className={cn("font-semibold", item.color)}>
                {item.value}
                {"pulse" in item && item.pulse && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1.5" />}
              </span>
            )}
          </div>
        ))}

        {/* Separator */}
        <span className="text-white/20 mx-2">|</span>

        {/* Breaking News */}
        {allNews.length > 0 && [...allNews, ...allNews].map((item, i) => (
          <div key={`news-${i}`} className="flex items-center gap-2 text-xs">
            {item.isBreaking && <BreakingBadge />}
            <span className="text-foreground/80 max-w-[300px] truncate">{item.text}</span>
            <span className="text-muted-foreground/60 text-[10px]">{item.published}</span>
          </div>
        ))}

        {allNews.length === 0 && [
          { text: "RBI holds repo rate at 6.5% — market steady", isBreaking: true },
          { text: "Gold hits ₹98,100/10g — all-time high", isBreaking: false },
          { text: "FII inflows at ₹3,200 crore today", isBreaking: false },
          { text: "SEBI tightens F&O margin rules", isBreaking: true },
          { text: "NIFTY crosses 24,500 — bullish momentum", isBreaking: false },
          { text: "Rupee at 85.22 against USD", isBreaking: false },
        ].map((item, i) => (
          <div key={`fallback-${i}`} className="flex items-center gap-2 text-xs">
            {item.isBreaking && <BreakingBadge />}
            <span className="text-foreground/80">{item.text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
