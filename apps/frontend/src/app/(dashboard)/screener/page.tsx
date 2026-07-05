"use client";
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Filter, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Star, BarChart3, Info, Search, SlidersHorizontal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip,
} from "recharts";

const stockData = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy", price: 2850, change: 1.8, pe: 28.5, pb: 2.1, roe: 9.8, de: 0.35, mcap: 1920000, divYield: 0.3, eps: 99.8, week52High: 3024, week52Low: 2220, score: 82 },
  { symbol: "TCS", name: "Tata Consultancy", sector: "IT", price: 3920, change: 2.1, pe: 34.2, pb: 14.8, roe: 48.2, de: 0.04, mcap: 1420000, divYield: 1.2, eps: 114.6, week52High: 4246, week52Low: 3056, score: 78 },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", price: 1720, change: -0.5, pe: 19.8, pb: 2.8, roe: 16.5, de: 0.85, mcap: 1310000, divYield: 1.1, eps: 86.9, week52High: 1794, week52Low: 1363, score: 85 },
  { symbol: "INFY", name: "Infosys", sector: "IT", price: 1680, change: 1.5, pe: 28.9, pb: 8.2, roe: 31.5, de: 0.08, mcap: 700000, divYield: 2.3, eps: 58.1, week52High: 1918, week52Low: 1230, score: 76 },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking", price: 1280, change: 0.8, pe: 18.2, pb: 2.5, roe: 14.8, de: 0.72, mcap: 895000, divYield: 0.8, eps: 70.3, week52High: 1362, week52Low: 956, score: 80 },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking", price: 845, change: 1.2, pe: 10.5, pb: 1.6, roe: 18.2, de: 1.1, mcap: 755000, divYield: 1.8, eps: 80.5, week52High: 912, week52Low: 600, score: 74 },
  { symbol: "ITC", name: "ITC Limited", sector: "FMCG", price: 465, change: -0.3, pe: 25.8, pb: 7.2, roe: 28.5, de: 0.02, mcap: 580000, divYield: 3.2, eps: 18.0, week52High: 500, week52Low: 399, score: 71 },
  { symbol: "WIPRO", name: "Wipro", sector: "IT", price: 540, change: 0.9, pe: 22.5, pb: 3.8, roe: 15.2, de: 0.22, mcap: 280000, divYield: 0.2, eps: 24.0, week52High: 624, week52Low: 405, score: 65 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom", price: 1580, change: 2.5, pe: 72.5, pb: 9.8, roe: 18.5, de: 1.85, mcap: 940000, divYield: 0.6, eps: 21.8, week52High: 1779, week52Low: 1185, score: 68 },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra", sector: "Banking", price: 1890, change: -0.2, pe: 22.1, pb: 2.9, roe: 13.8, de: 0.68, mcap: 375000, divYield: 0.3, eps: 85.5, week52High: 2068, week52Low: 1543, score: 72 },
  { symbol: "TATAMOTORS", name: "Tata Motors", sector: "Auto", price: 980, change: 3.2, pe: 8.5, pb: 2.2, roe: 28.8, de: 0.95, mcap: 358000, divYield: 0.5, eps: 115.3, week52High: 1180, week52Low: 614, score: 77 },
  { symbol: "SUNPHARMA", name: "Sun Pharma", sector: "Pharma", price: 1750, change: 1.1, pe: 38.2, pb: 5.5, roe: 14.2, de: 0.12, mcap: 420000, divYield: 0.4, eps: 45.8, week52High: 1960, week52Low: 1175, score: 69 },
  { symbol: "LT", name: "Larsen & Toubro", sector: "Infra", price: 3650, change: 0.7, pe: 35.8, pb: 5.8, roe: 15.5, de: 0.55, mcap: 500000, divYield: 1.0, eps: 102.0, week52High: 3958, week52Low: 2962, score: 73 },
  { symbol: "ASIANPAINT", name: "Asian Paints", sector: "Consumer", price: 2850, change: -1.2, pe: 52.5, pb: 15.2, roe: 28.8, de: 0.18, mcap: 272000, divYield: 0.5, eps: 54.3, week52High: 3395, week52Low: 2674, score: 62 },
  { symbol: "MARUTI", name: "Maruti Suzuki", sector: "Auto", price: 12500, change: 1.8, pe: 32.5, pb: 8.5, roe: 24.2, de: 0.01, mcap: 392000, divYield: 1.0, eps: 384.6, week52High: 13680, week52Low: 9738, score: 75 },
];

const sectors = ["All", ...Array.from(new Set(stockData.map((s) => s.sector)))];
const sortOptions = [
  { key: "score", label: "AI Score" },
  { key: "change", label: "Change %" },
  { key: "pe", label: "P/E Ratio" },
  { key: "roe", label: "ROE" },
  { key: "mcap", label: "Market Cap" },
];

export default function StockScreenerPage() {
  const [selectedSector, setSelectedSector] = useState("All");
  const [sortBy, setSortBy] = useState("score");
  const [minPE, setMinPE] = useState(0);
  const [maxPE, setMaxPE] = useState(100);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStocks = useMemo(() => {
    let stocks = [...stockData];
    if (selectedSector !== "All") stocks = stocks.filter((s) => s.sector === selectedSector);
    if (searchQuery) stocks = stocks.filter((s) => s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    stocks = stocks.filter((s) => s.pe >= minPE && s.pe <= maxPE);
    stocks.sort((a, b) => (b as any)[sortBy] - (a as any)[sortBy]);
    return stocks;
  }, [selectedSector, sortBy, minPE, maxPE, searchQuery]);

  const selected = selectedStock ? stockData.find((s) => s.symbol === selectedStock) : null;

  const radarData = selected ? [
    { metric: "Valuation", value: Math.max(0, 100 - selected.pe * 2.5) },
    { metric: "Growth", value: Math.min(100, selected.roe * 2) },
    { metric: "Profitability", value: Math.min(100, selected.roe) },
    { metric: "Momentum", value: Math.max(0, 50 + selected.change * 10) },
    { metric: "Dividend", value: Math.min(100, selected.divYield * 25) },
    { metric: "Safety", value: Math.max(0, 100 - selected.de * 60) },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Stock Screener</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">AI-ranked NSE stocks with multi-criteria filtering</p>
        </div>
        <Badge variant="outline">{filteredStocks.length} stocks</Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search stocks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </div>
            <div className="flex items-center gap-1 p-1 glass rounded-lg">
              {sectors.map((s) => (
                <button key={s} onClick={() => setSelectedSector(s)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedSector === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}>{s}</button>
              ))}
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-3 rounded-lg bg-white/5 border border-white/5 text-sm focus:outline-none">
              {sortOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">P/E:</span>
              <input type="number" value={minPE} onChange={(e) => setMinPE(Number(e.target.value))} placeholder="Min"
                className="w-16 h-7 px-2 rounded bg-white/5 border border-white/5 text-xs focus:outline-none" />
              <span className="text-xs text-muted-foreground">to</span>
              <input type="number" value={maxPE} onChange={(e) => setMaxPE(Number(e.target.value))} placeholder="Max"
                className="w-16 h-7 px-2 rounded bg-white/5 border border-white/5 text-xs focus:outline-none" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stock List */}
        <div className="lg:col-span-2 space-y-2">
          {filteredStocks.map((stock, i) => (
            <motion.div key={stock.symbol} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={cn("hover:border-white/15 transition-all cursor-pointer",
                selectedStock === stock.symbol && "border-primary/30 bg-primary/5"
              )} onClick={() => setSelectedStock(stock.symbol)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold",
                      stock.change >= 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                    )}>
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{stock.symbol}</p>
                        <Badge variant="outline" className="text-[10px]">{stock.sector}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{stock.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-muted-foreground">P/E</p>
                      <p className="text-xs font-mono">{stock.pe}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-muted-foreground">ROE</p>
                      <p className="text-xs font-mono text-emerald-400">{stock.roe}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">₹{stock.price.toLocaleString("en-IN")}</p>
                      <p className={cn("text-xs font-medium flex items-center justify-end gap-0.5",
                        stock.change >= 0 ? "text-emerald-400" : "text-red-400"
                      )}>
                        {stock.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {stock.change > 0 ? "+" : ""}{stock.change}%
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-amber-400">{stock.score}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">AI Score</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detail Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {selected ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selected.symbol}</CardTitle>
                    <Badge variant={selected.change >= 0 ? "success" : "destructive"}>
                      {selected.change >= 0 ? "+" : ""}{selected.change}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{selected.name}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {[
                      { label: "Price", value: `₹${selected.price.toLocaleString("en-IN")}` },
                      { label: "P/E", value: selected.pe.toFixed(1) },
                      { label: "P/B", value: selected.pb.toFixed(1) },
                      { label: "ROE", value: `${selected.roe}%` },
                      { label: "D/E", value: selected.de.toFixed(2) },
                      { label: "Mkt Cap", value: `₹${(selected.mcap / 100000).toFixed(0)}L Cr` },
                      { label: "Div Yield", value: `${selected.divYield}%` },
                      { label: "EPS", value: `₹${selected.eps}` },
                      { label: "52W High", value: `₹${selected.week52High.toLocaleString("en-IN")}` },
                      { label: "52W Low", value: `₹${selected.week52Low.toLocaleString("en-IN")}` },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between p-2 rounded bg-white/[0.02]">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-mono font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm">AI Analysis Radar</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: "#71717a", fontSize: 10 }} />
                        <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                        <Radar name="Score" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} strokeWidth={2} />
                        <Tooltip formatter={(v: any) => `${Math.round(v)}/100`} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* 52W Range */}
              <Card>
                <CardHeader><CardTitle className="text-sm">52-Week Range</CardTitle></CardHeader>
                <CardContent>
                  <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                    <div className="absolute h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full"
                      style={{
                        left: `${((selected.price - selected.week52Low) / (selected.week52High - selected.week52Low)) * 100}%`,
                        width: "4px",
                      }} />
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                    <span>₹{selected.week52Low.toLocaleString("en-IN")}</span>
                    <span className="text-foreground font-medium">Current ₹{selected.price.toLocaleString("en-IN")}</span>
                    <span>₹{selected.week52High.toLocaleString("en-IN")}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center p-8">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a stock to view details</p>
              </div>
            </Card>
          )}
        </motion.div>
      </div>

      <Card className="border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-400/80 space-y-1">
            <p><strong>Educational Disclaimer:</strong> AI scores are generated using fundamental analysis algorithms. They are NOT buy/sell recommendations.</p>
            <p>• Stock data may be delayed or simulated for demonstration</p>
            <p>• Always do your own research (DYOR) before investing</p>
            <p>• Past performance does not guarantee future results</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
