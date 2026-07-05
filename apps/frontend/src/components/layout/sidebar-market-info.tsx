"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Banknote, CircleDot, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMarketCommodities, useMarketBankRates, useMarketNews } from "@/lib/hooks";

export function SidebarMarketInfo({ sidebarOpen }: { sidebarOpen: boolean }) {
  const { data: commodities } = useMarketCommodities();
  const { data: bankRates } = useMarketBankRates();
  const { data: news } = useMarketNews();
  const [newsIdx, setNewsIdx] = useState(0);

  const commoditiesArr = Array.isArray(commodities) ? commodities : [];
  const bankRatesArr = Array.isArray(bankRates) ? bankRates : [];
  const newsArr = Array.isArray(news) ? news : [];

  useEffect(() => {
    if (newsArr.length === 0) return;
    const t = setInterval(() => setNewsIdx((i) => (i + 1) % newsArr.length), 5000);
    return () => clearInterval(t);
  }, [newsArr.length]);

  const gold = commoditiesArr[0] as any;
  const silver = commoditiesArr[2] as any;

  if (!sidebarOpen) {
    return (
      <div className="px-3 py-2 space-y-2 border-t border-white/5">
        {gold && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs">
            <Coins className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-mono font-medium truncate">₹{String(gold.price)}</span>
          </div>
        )}
        {silver && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-400/10 text-gray-400 text-xs">
            <CircleDot className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-mono font-medium truncate">₹{String(silver.price)}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-3 py-3 border-t border-white/5 space-y-3">
      {gold && (
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-amber-500/10">
          <div className="flex items-center gap-2 text-amber-400">
            <Coins className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Gold (24K)</span>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono font-bold text-amber-400">₹{String(gold.price)}</p>
            <p className={cn("text-[10px] font-mono", Number(gold.change) >= 0 ? "text-green-400" : "text-red-400")}>
              {Number(gold.change) >= 0 ? "+" : ""}{String(gold.change)} ({String(gold.change_pct)}%)
            </p>
          </div>
        </div>
      )}
      {silver && (
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-gray-400/10">
          <div className="flex items-center gap-2 text-gray-400">
            <CircleDot className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Silver</span>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono font-bold text-gray-300">₹{String(silver.price)}</p>
            <p className={cn("text-[10px] font-mono", Number(silver.change) >= 0 ? "text-green-400" : "text-red-400")}>
              {Number(silver.change) >= 0 ? "+" : ""}{String(silver.change)} ({String(silver.change_pct)}%)
            </p>
          </div>
        </div>
      )}
      {bankRatesArr.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 text-muted-foreground">
            <Banknote className="w-3 h-3" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Top Bank Rates</span>
          </div>
          <div className="px-2 py-1 rounded-lg bg-white/5 space-y-0.5">
            {bankRatesArr.slice(0, 3).map((b: any) => (
              <div key={String(b.bank)} className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground truncate">{String(b.bank)}</span>
                <span className="font-mono text-foreground">{String(b.fixed_1y)}%</span>
              </div>
            ))}
          </div>
          <a
            href="https://www.rbi.org.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors group"
          >
            <img
              src="https://www.rbi.org.in/images/rbilogo.png"
              alt="RBI Logo"
              className="w-4 h-4 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span className="text-[10px] text-emerald-400 font-medium group-hover:text-emerald-300">RBI Reference Rates</span>
          </a>
        </div>
      )}
      {newsArr.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 text-muted-foreground">
            <FileText className="w-3 h-3" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Live News</span>
          </div>
          <div className="px-2 py-1.5 rounded-lg bg-white/5">
            <AnimatePresence mode="wait">
              <motion.p
                key={newsIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[11px] text-foreground leading-tight line-clamp-2"
              >
                {String(newsArr[newsIdx]?.title ?? "")}
              </motion.p>
            </AnimatePresence>
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {String(newsArr[newsIdx]?.source ?? "")} · {String(newsArr[newsIdx]?.published ?? "")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
