"use client";
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Newspaper, TrendingUp, TrendingDown, Minus, Globe, Brain,
  ArrowUpRight, ArrowDownRight, Info, Clock, ThumbsUp, ThumbsDown
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Cell,
} from "recharts";

const newsItems = [
  { id: 1, title: "RBI holds repo rate at 6.5%, signals pause on hikes", source: "Economic Times", time: "2h ago", sentiment: 72, sector: "Banking", impact: "high" },
  { id: 2, title: "TCS Q1 results beat estimates, revenue up 12% YoY", source: "Moneycontrol", time: "3h ago", sentiment: 85, sector: "IT", impact: "high" },
  { id: 3, title: "Reliance Industries announces new green energy investments", source: "Livemint", time: "4h ago", sentiment: 68, sector: "Energy", impact: "medium" },
  { id: 4, title: "India CPI inflation rises to 5.1% in June", source: "Reuters", time: "5h ago", sentiment: -35, sector: "Macro", impact: "high" },
  { id: 5, title: "FII outflows continue — ₹2,800 crore sold in equities", source: "NDTV Profit", time: "6h ago", sentiment: -55, sector: "Market", impact: "high" },
  { id: 6, title: "IT sector faces headwinds as US client spending slows", source: "Business Standard", time: "7h ago", sentiment: -42, sector: "IT", impact: "medium" },
  { id: 7, title: "Gold prices hit record high amid global uncertainty", source: "Hindustan Times", time: "8h ago", sentiment: 30, sector: "Commodities", impact: "medium" },
  { id: 8, title: "HDFC Bank合并后首次季度报告即将发布", source: "CNBC TV18", time: "9h ago", sentiment: 15, sector: "Banking", impact: "medium" },
  { id: 9, title: "Electric vehicle sales surge 45% in H1 2026", source: "Autocar India", time: "10h ago", sentiment: 78, sector: "Auto", impact: "medium" },
  { id: 10, title: "DPDP Act compliance deadline extended to December 2026", source: "Legal India", time: "12h ago", sentiment: 20, sector: "Regulation", impact: "low" },
  { id: 11, title: "Infosys bags $2.1B deal from European banking giant", source: "Economic Times", time: "14h ago", sentiment: 90, sector: "IT", impact: "high" },
  { id: 12, title: "Pharma stocks rally on US FDA approvals", source: "Moneycontrol", time: "16h ago", sentiment: 65, sector: "Pharma", impact: "medium" },
];

const sectorSentiment = [
  { sector: "IT", score: 45, trend: "up", news: 3 },
  { sector: "Banking", score: 35, trend: "up", news: 2 },
  { sector: "Energy", score: 55, trend: "up", news: 1 },
  { sector: "Auto", score: 70, trend: "up", news: 1 },
  { sector: "Pharma", score: 60, trend: "up", news: 1 },
  { sector: "FMCG", score: 10, trend: "down", news: 0 },
  { sector: "Commodities", score: 25, trend: "neutral", news: 1 },
  { sector: "Macro", score: -20, trend: "down", news: 1 },
];

const sentimentTrend = [
  { day: "Mon", score: 42 }, { day: "Tue", score: 55 }, { day: "Wed", score: 38 },
  { day: "Thu", score: 62 }, { day: "Fri", score: 48 }, { day: "Sat", score: 58 },
  { day: "Sun", score: 52 },
];

const overallSentiment = Math.round(newsItems.reduce((s, n) => s + n.sentiment, 0) / newsItems.length);

export default function SentimentPage() {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const filteredNews = selectedSector
    ? newsItems.filter((n) => n.sector === selectedSector)
    : newsItems;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Market Sentiment</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">NLP-powered news analysis and sector sentiment tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={overallSentiment > 30 ? "success" : overallSentiment < 0 ? "destructive" : "warning"} className="text-sm px-3 py-1">
            {overallSentiment > 30 ? <ThumbsUp className="w-3 h-3 mr-1" /> : overallSentiment < 0 ? <ThumbsDown className="w-3 h-3 mr-1" /> : <Minus className="w-3 h-3 mr-1" />}
            Overall: {overallSentiment > 0 ? "+" : ""}{overallSentiment}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Bullish Signals", value: newsItems.filter((n) => n.sentiment > 30).length, color: "text-emerald-400", icon: TrendingUp },
          { label: "Bearish Signals", value: newsItems.filter((n) => n.sentiment < -20).length, color: "text-red-400", icon: TrendingDown },
          { label: "High Impact", value: newsItems.filter((n) => n.impact === "high").length, color: "text-amber-400", icon: ArrowUpRight },
          { label: "News Analyzed", value: newsItems.length, color: "text-blue-400", icon: Globe },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <m.icon className={`w-4 h-4 ${m.color} mb-1`} />
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-bold">{m.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* News Feed */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-1 p-1 glass rounded-lg w-fit flex-wrap">
            <button onClick={() => setSelectedSector(null)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                !selectedSector ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}>All</button>
            {sectorSentiment.map((s) => (
              <button key={s.sector} onClick={() => setSelectedSector(s.sector)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  selectedSector === s.sector ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}>{s.sector}</button>
            ))}
          </div>

          {filteredNews.map((news, i) => (
            <motion.div key={news.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="hover:border-white/15 transition-all">
                <div className="flex items-start gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    news.sentiment > 30 ? "bg-emerald-500/15" : news.sentiment < -20 ? "bg-red-500/15" : "bg-amber-500/15"
                  )}>
                    {news.sentiment > 30 ? <TrendingUp className="w-5 h-5 text-emerald-400" /> :
                     news.sentiment < -20 ? <TrendingDown className="w-5 h-5 text-red-400" /> :
                     <Minus className="w-5 h-5 text-amber-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">{news.sector}</Badge>
                      <Badge variant={news.impact === "high" ? "destructive" : news.impact === "medium" ? "warning" : "secondary"} className="text-[10px]">
                        {news.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm font-medium leading-snug">{news.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{news.source}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{news.time}</span>
                      <span className={cn("font-mono font-bold",
                        news.sentiment > 30 ? "text-emerald-400" : news.sentiment < -20 ? "text-red-400" : "text-amber-400"
                      )}>
                        {news.sentiment > 0 ? "+" : ""}{news.sentiment}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Sentiment Trend */}
          <Card>
            <CardHeader><CardTitle className="text-sm">7-Day Sentiment Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sentimentTrend}>
                    <defs>
                      <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
                    <Tooltip content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="glass-card p-2 rounded-lg text-xs">
                          <p className="font-medium">{payload[0]?.payload?.day}</p>
                          <p className={payload[0]?.value > 0 ? "text-emerald-400" : "text-red-400"}>
                            Score: {payload[0]?.value}
                          </p>
                        </div>
                      );
                    }} />
                    <Area type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} fill="url(#sentGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sector Sentiment */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Sector Sentiment</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorSentiment} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} />
                    <YAxis type="category" dataKey="sector" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }} width={70} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {sectorSentiment.map((entry, i) => (
                        <Cell key={i} fill={entry.score > 30 ? "#10B981" : entry.score < 0 ? "#EF4444" : "#F59E0B"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-amber-400/80 leading-relaxed">
                <strong>Educational Disclaimer:</strong> Sentiment scores are generated by NLP algorithms analyzing news headlines. They are NOT investment recommendations.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
