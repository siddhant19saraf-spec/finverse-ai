"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Search, BarChart3, ArrowUpRight, ArrowDownRight,
  Loader2, Clock, RefreshCw, Activity, Coins, CircleDot, Banknote,
  AlertCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageSpinner, ErrorBanner } from "@/components/ui/loading";
import { formatCurrency, formatPercent, getChangeColor, cn } from "@/lib/utils";
import {
  useMarketIndices, useMarketSectors, useMarketGainers, useMarketLosers,
  useMarketHistorical, useMarketSearch, useMarketQuote, useMarketStatus,
  useMarketCommodities, useMarketBankRates,
} from "@/lib/hooks";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, CartesianGrid, ComposedChart, Line
} from "recharts";

const timeRanges = [
  { label: "1D", interval: "1d", period: "1d" },
  { label: "1W", interval: "1d", period: "5d" },
  { label: "1M", interval: "1d", period: "1mo" },
  { label: "3M", interval: "1d", period: "3mo" },
  { label: "6M", interval: "1d", period: "6mo" },
  { label: "1Y", interval: "1d", period: "1y" },
  { label: "5Y", interval: "1wk", period: "5y" },
];

const popularSymbols = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries" },
  { symbol: "TCS.NS", name: "Tata Consultancy" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
  { symbol: "INFY.NS", name: "Infosys" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank" },
  { symbol: "SBIN.NS", name: "State Bank of India" },
  { symbol: "ITC.NS", name: "ITC Limited" },
  { symbol: "WIPRO.NS", name: "Wipro" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="glass-card p-3 rounded-lg text-sm space-y-1">
      <p className="text-muted-foreground">{d?.timestamp || label}</p>
      {d?.open !== undefined ? (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
            <span className="text-muted-foreground">Open</span><span className="text-right font-mono">₹{Number(d.open).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            <span className="text-muted-foreground">High</span><span className="text-right font-mono text-emerald-400">₹{Number(d.high).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            <span className="text-muted-foreground">Low</span><span className="text-right font-mono text-red-400">₹{Number(d.low).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            <span className="text-muted-foreground">Close</span><span className="text-right font-mono">₹{Number(d.close).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          <p className="text-muted-foreground text-xs">Vol: {Number(d.volume).toLocaleString()}</p>
        </>
      ) : (
        <p className="font-semibold text-foreground">
          {formatCurrency(payload[0]?.value)}
        </p>
      )}
    </div>
  );
};

export default function MarketPage() {
  const [timeRange, setTimeRange] = useState(5);
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE.NS");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: indicesData, isLoading: indicesLoading, error: indicesError, refetch } = useMarketIndices();
  const { data: sectorsData } = useMarketSectors();
  const { data: gainersData, isLoading: gainersLoading } = useMarketGainers(5);
  const { data: losersData, isLoading: losersLoading } = useMarketLosers(5);
  const { data: historicalData, isLoading: historicalLoading } = useMarketHistorical(
    selectedSymbol,
    timeRanges[timeRange].interval,
    timeRanges[timeRange].period,
  );
  const { data: quoteData } = useMarketQuote(selectedSymbol);
  const { data: statusData } = useMarketStatus();
  const { data: searchData } = useMarketSearch(searchQuery);
  const { data: commoditiesData } = useMarketCommodities();
  const { data: bankRatesData } = useMarketBankRates();

  const indices = (indicesData as any) ?? [];
  const sectors = (sectorsData as any) ?? [];
  const gainers = (gainersData as any) ?? [];
  const losers = (losersData as any) ?? [];
  const historical = (historicalData as any)?.data ?? [];
  const quote = (quoteData as any) ?? {};
  const status = (statusData as any);
  const commodities = Array.isArray(commoditiesData) ? commoditiesData : [];
  const bankRates = Array.isArray(bankRatesData) ? bankRatesData : [];

  const chartData = historical.map((d: any) => ({
    ...d,
    timestamp: new Date(d.timestamp).toLocaleDateString("en-IN", {
      month: "short", day: "numeric",
    }),
  }));

  const chartHeight = historical.length > 60 ? 350 : 300;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Market Intelligence</h1>
          <p className="text-sm text-muted-foreground">Live market data and analysis</p>
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <Badge variant="outline" className="gap-1.5">
              <Activity className="w-3 h-3" />
              {status.provider === "yahoo" ? "Live" : "Simulated"}
            </Badge>
          )}
          <Badge variant="success" className="gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Market Open
          </Badge>
        </div>
      </div>

      {indicesError && <ErrorBanner message={indicesError.message} onRetry={refetch} />}

      {/* Market Indices */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {indices.map((idx: any, i: number) => (
          <motion.div
            key={idx.symbol ?? idx.name ?? i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:border-white/15 transition-all cursor-pointer group">
              <p className="text-xs text-muted-foreground">{idx.name}</p>
              <p className="text-lg font-bold mt-1">
                {Number(idx.value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs font-medium flex items-center gap-1 ${getChangeColor(idx.change_pct)}`}>
                  {idx.change_pct > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {formatPercent(idx.change_pct)}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Symbol Search + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Historical Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-lg">{selectedSymbol.replace(".NS", "")}</CardTitle>
                    {quote.price && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xl font-bold">
                          ₹{Number(quote.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`text-sm font-medium flex items-center gap-1 ${getChangeColor(quote.change_pct)}`}>
                          {quote.change_pct > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {formatPercent(quote.change_pct)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 p-1 glass rounded-lg">
                  {timeRanges.map((tr, i) => (
                    <button
                      key={tr.label}
                      onClick={() => setTimeRange(i)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        timeRange === i
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tr.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {historicalLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : chartData.length > 0 ? (
                <div style={{ height: chartHeight }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis
                        dataKey="timestamp"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#71717a", fontSize: 11 }}
                        interval={Math.max(0, Math.floor(chartData.length / 8))}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#71717a", fontSize: 11 }}
                        domain={["auto", "auto"]}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="close" stroke="#3B82F6" strokeWidth={2} fill="url(#chartGrad)" />
                      <Line type="monotone" dataKey="high" stroke="#10B98180" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="low" stroke="#EF444480" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                  No data available for this period
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Popular Symbols / Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Quick Quote</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search symbol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              {searchQuery && searchData?.length ? (
                <div className="space-y-1">
                  {(searchData as any[]).map((r: any) => (
                    <button
                      key={r.ticker}
                      onClick={() => { setSelectedSymbol(r.ticker); setSearchQuery(""); }}
                      className="w-full text-left p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                    >
                      <p className="text-sm font-medium">{r.ticker}</p>
                      <p className="text-xs text-muted-foreground">{r.name}</p>
                    </button>
                  ))}
                </div>
              ) : null}
              {!searchQuery && (
                <div className="space-y-1">
                  {popularSymbols.map((s) => (
                    <button
                      key={s.symbol}
                      onClick={() => setSelectedSymbol(s.symbol)}
                      className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
                        selectedSymbol === s.symbol
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-white/[0.05]"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{s.symbol.replace(".NS", "")}</p>
                        <p className="text-xs text-muted-foreground">{s.name}</p>
                      </div>
                      {selectedSymbol === s.symbol && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sector + Gainers + Losers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader><CardTitle>Sector Performance</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectors} layout="vertical" margin={{ left: 0 }}>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="sector" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} width={60} />
                    <Bar dataKey="change_pct" radius={[0, 4, 4, 0]}>
                      {sectors.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.change_pct > 0 ? "#10B981" : "#EF4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card>
            <CardHeader><CardTitle>Top Gainers</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {gainersLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : gainers.slice(0, 5).map((s: any) => (
                <div key={s.symbol} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{s.symbol.replace(".NS", "")}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(s.price)}</p>
                  </div>
                  <span className="text-sm font-medium text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    {formatPercent(s.change_pct)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader><CardTitle>Top Losers</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {losersLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : losers.slice(0, 5).map((s: any) => (
                <div key={s.symbol} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{s.symbol.replace(".NS", "")}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(s.price)}</p>
                  </div>
                  <span className="text-sm font-medium text-red-400 flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3" />
                    {formatPercent(s.change_pct)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Commodities + Bank Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Commodity Rates */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <CardTitle>Gold & Silver Rates</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {commodities.length === 0 ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Loading commodity rates...
                </div>
              ) : (
                commodities.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center",
                        String(c.name).includes("Gold") ? "bg-amber-500/15" : String(c.name).includes("Silver") ? "bg-gray-400/15" : "bg-blue-400/15"
                      )}>
                        {String(c.name).includes("Gold") ? <Coins className="w-4 h-4 text-amber-400" /> :
                         String(c.name).includes("Silver") ? <CircleDot className="w-4 h-4 text-gray-400" /> :
                         <Activity className="w-4 h-4 text-blue-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{String(c.name)}</p>
                        <p className="text-xs text-muted-foreground">{String(c.unit)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold font-mono">₹{String(c.price)}</p>
                      <p className={cn("text-xs font-mono", Number(c.change) >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {Number(c.change) >= 0 ? "+" : ""}{String(c.change)} ({String(c.change_pct)}%)
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Bank Interest Rates */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <CardTitle>Bank Interest Rates</CardTitle>
                </div>
                <a
                  href="https://www.rbi.org.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors"
                >
                  <img
                    src="https://www.rbi.org.in/images/rbilogo.png"
                    alt="RBI"
                    className="w-3.5 h-3.5 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="text-[10px] text-emerald-400 font-medium">RBI</span>
                </a>
              </div>
            </CardHeader>
            <CardContent>
              {bankRates.length === 0 ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Loading bank rates...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground border-b border-white/5">
                        <th className="text-left py-2 font-medium">Bank</th>
                        <th className="text-right py-2 font-medium">Savings</th>
                        <th className="text-right py-2 font-medium">1Y FD</th>
                        <th className="text-right py-2 font-medium">2Y FD</th>
                        <th className="text-right py-2 font-medium">5Y FD</th>
                        <th className="text-right py-2 font-medium">Home</th>
                        <th className="text-right py-2 font-medium">Personal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankRates.map((b: any, i: number) => (
                        <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                          <td className="py-2 font-medium truncate max-w-[100px]">{String(b.bank)}</td>
                          <td className="text-right font-mono">{String(b.savings_rate)}%</td>
                          <td className="text-right font-mono text-emerald-400">{String(b.fixed_1y)}%</td>
                          <td className="text-right font-mono">{String(b.fixed_2y)}%</td>
                          <td className="text-right font-mono">{String(b.fixed_5y)}%</td>
                          <td className="text-right font-mono text-blue-400">{String(b.home_loan)}%</td>
                          <td className="text-right font-mono text-amber-400">{String(b.personal_loan)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quote Detail */}
      {quote.price && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{String(quote.symbol ?? selectedSymbol).replace(".NS", "")} — Detailed Quote</CardTitle>
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {quote.timestamp ? new Date(quote.timestamp).toLocaleTimeString("en-IN") : "N/A"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { label: "Open", value: `₹${Number(quote.open).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` },
                  { label: "High", value: `₹${Number(quote.high).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` },
                  { label: "Low", value: `₹${Number(quote.low).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` },
                  { label: "Prev Close", value: `₹${Number(quote.previous_close).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` },
                  { label: "Volume", value: Number(quote.volume).toLocaleString() },
                  { label: "Mkt Cap", value: quote.market_cap ? `₹${(Number(quote.market_cap) / 1e7).toFixed(0)}Cr` : "N/A" },
                  { label: "P/E", value: quote.pe_ratio ? Number(quote.pe_ratio).toFixed(2) : "N/A" },
                  { label: "52W Range", value: quote.week_52_high ? `₹${Number(quote.week_52_low).toLocaleString()} - ₹${Number(quote.week_52_high).toLocaleString()}` : "N/A" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Disclaimer */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <p className="text-xs text-amber-400/80">
          <strong>Educational Disclaimer:</strong> Market data is for informational purposes only and does not constitute financial advice.
          Prices may be delayed or simulated. Always verify with your broker before making investment decisions.
        </p>
      </Card>
    </div>
  );
}
