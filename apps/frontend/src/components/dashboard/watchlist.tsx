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
import { Star, ArrowUpDown } from "lucide-react";

interface StockData {
  symbol: string;
  price: number;
  change: number;
  volume: string;
  low52: number;
  high52: number;
  sentiment: "Bullish" | "Neutral" | "Bearish";
}

const stocks: StockData[] = [
  { symbol: "RELIANCE", price: 2850, change: 3.2, volume: "12.5M", low52: 2220, high52: 2980, sentiment: "Bullish" },
  { symbol: "TCS", price: 3920, change: 2.1, volume: "8.2M", low52: 3400, high52: 4100, sentiment: "Bullish" },
  { symbol: "INFY", price: 1680, change: 1.5, volume: "15.3M", low52: 1420, high52: 1750, sentiment: "Bullish" },
  { symbol: "HDFCBANK", price: 1720, change: -1.2, volume: "10.1M", low52: 1580, high52: 1800, sentiment: "Neutral" },
  { symbol: "ICICIBANK", price: 1145, change: 0.8, volume: "9.5M", low52: 950, high52: 1200, sentiment: "Bullish" },
  { symbol: "SBIN", price: 812, change: -0.5, volume: "18.7M", low52: 620, high52: 850, sentiment: "Neutral" },
  { symbol: "TATAMOTORS", price: 985, change: 4.5, volume: "22.1M", low52: 680, high52: 1020, sentiment: "Bullish" },
  { symbol: "WIPRO", price: 462, change: 0.9, volume: "7.8M", low52: 380, high52: 490, sentiment: "Neutral" },
  { symbol: "ITC", price: 478, change: 0.3, volume: "14.2M", low52: 430, high52: 510, sentiment: "Bullish" },
  { symbol: "BHARTIARTL", price: 1520, change: 1.8, volume: "6.5M", low52: 1200, high52: 1580, sentiment: "Bullish" },
];

function Range52W({ low, high, current }: { low: number; high: number; current: number }) {
  const pct = ((current - low) / (high - low)) * 100;
  return (
    <div className="flex flex-col gap-0.5 min-w-[80px]">
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>{low.toLocaleString("en-IN")}</span>
        <span>{high.toLocaleString("en-IN")}</span>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden relative">
        <div
          className="absolute h-full rounded-full bg-primary/40"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute h-1.5 w-1.5 rounded-full bg-primary -top-0.5 border border-black/30"
          style={{ left: `calc(${pct}% - 3px)` }}
        />
      </div>
    </div>
  );
}

const sentimentConfig = {
  Bullish: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  Neutral: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  Bearish: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" },
};

export function Watchlist() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white/[0.02] border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  {["Stock", "Price", "Change", "Volume", "52W Range", "AI Sentiment"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left py-2 px-2 text-[10px] text-muted-foreground uppercase tracking-wider font-medium"
                      >
                        <span className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
                          {h}
                          <ArrowUpDown className="h-2.5 w-2.5 opacity-40" />
                        </span>
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => {
                  const sent = sentimentConfig[stock.sentiment];
                  return (
                    <tr
                      key={stock.symbol}
                      className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-2">
                        <span className="font-semibold text-foreground">
                          {stock.symbol}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 font-medium">
                        ₹{stock.price.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-2">
                        <span
                          className={cn(
                            "font-medium",
                            stock.change >= 0 ? "text-emerald-500" : "text-red-400"
                          )}
                        >
                          {stock.change > 0 ? "+" : ""}
                          {stock.change}%
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-muted-foreground">
                        {stock.volume}
                      </td>
                      <td className="py-2.5 px-2">
                        <Range52W
                          low={stock.low52}
                          high={stock.high52}
                          current={stock.price}
                        />
                      </td>
                      <td className="py-2.5 px-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] px-1.5 py-0 h-4 border-0",
                            sent.bg,
                            sent.text
                          )}
                        >
                          {stock.sentiment}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
