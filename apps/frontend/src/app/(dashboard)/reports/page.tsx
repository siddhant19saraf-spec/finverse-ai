"use client";
import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FileText, Download, Plus, Calendar, BarChart3, Shield, TrendingUp,
  Clock, Loader2, CheckCircle2, ChevronDown, ChevronUp, AlertTriangle, IndianRupee
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageSpinner, ErrorBanner } from "@/components/ui/loading";
import { formatCurrency } from "@/lib/utils";
import { useDashboard } from "@/lib/hooks";
import { useAppStore } from "@/stores/app";

const reportTypes = [
  { id: "comprehensive", label: "Comprehensive Investment Report", desc: "Full portfolio analysis with holdings, performance, risk, and compliance", icon: FileText, color: "from-blue-500 to-cyan-400" },
  { id: "tax", label: "Tax Statement", desc: "Capital gains, losses, and tax-saving opportunities", icon: IndianRupee, color: "from-emerald-500 to-teal-400" },
  { id: "risk", label: "Risk Assessment Report", desc: "Portfolio risk metrics, VaR, volatility, and stress test", icon: Shield, color: "from-purple-500 to-pink-400" },
  { id: "performance", label: "Performance Attribution", desc: "Returns breakdown, sector attribution, and benchmark comparison", icon: TrendingUp, color: "from-amber-500 to-orange-400" },
];

const dateRanges = [
  { label: "This Month", value: "1m" },
  { label: "Quarter", value: "3m" },
  { label: "Half Year", value: "6m" },
  { label: "Full Year", value: "1y" },
  { label: "All Time", value: "all" },
];

const reportHistory = [
  { id: 1, name: "Comprehensive Report — June 2026", date: "2026-06-30", type: "comprehensive", status: "ready", size: "2.4 MB" },
  { id: 2, name: "Tax Statement — FY 2025-26", date: "2026-03-31", type: "tax", status: "ready", size: "1.1 MB" },
  { id: 3, name: "Risk Assessment — Q1 2026", date: "2026-03-31", type: "risk", status: "ready", size: "1.8 MB" },
  { id: 4, name: "Performance Report — May 2026", date: "2026-05-31", type: "performance", status: "ready", size: "2.1 MB" },
];

const holdings = [
  { symbol: "RELIANCE", qty: 50, avgPrice: 2650, current: 2850, sector: "Energy", weight: 22.8 },
  { symbol: "TCS", qty: 30, avgPrice: 3500, current: 3920, sector: "IT", weight: 18.2 },
  { symbol: "HDFCBANK", qty: 80, avgPrice: 1650, current: 1720, sector: "Banking", weight: 16.7 },
  { symbol: "INFY", qty: 100, avgPrice: 1400, current: 1680, sector: "IT", weight: 14.2 },
  { symbol: "ICICIBANK", qty: 60, avgPrice: 1100, current: 1280, sector: "Banking", weight: 9.6 },
  { symbol: "ITC", qty: 200, avgPrice: 380, current: 465, sector: "FMCG", weight: 8.8 },
  { symbol: "SBIN", qty: 150, avgPrice: 700, current: 845, sector: "Banking", weight: 9.7 },
];

async function generatePDF(type: string, dateRange: string) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();

  // Helper
  const addPage = () => { doc.addPage(); y = 25; };
  let y = 20;

  const header = (title: string) => {
    doc.setFillColor(10, 15, 30);
    doc.rect(0, 0, pageWidth, 35, "F");
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246);
    doc.text("FINVERSE AI", 20, 18);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("India's Responsible AI Wealth Operating System", 20, 25);
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 20, 32);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated: ${now.toLocaleDateString("en-IN")} ${now.toLocaleTimeString("en-IN")}`, pageWidth - 20, 18, { align: "right" });
    doc.text("Investor: Siddhant Saraf", pageWidth - 20, 25, { align: "right" });
    doc.text("Confidential", pageWidth - 20, 32, { align: "right" });
    y = 45;
  };

  const section = (title: string) => {
    doc.setFillColor(59, 130, 246);
    doc.rect(20, y - 3, pageWidth - 40, 0.5, "F");
    doc.setFontSize(12);
    doc.setTextColor(59, 130, 246);
    doc.text(title, 20, y + 4);
    y += 12;
  };

  const text = (label: string, value: string, x = 20) => {
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(label, x, y);
    doc.setTextColor(40, 40, 40);
    doc.text(value, x + 50, y);
    y += 5;
  };

  // Cover Page
  header("Investment Report");
  doc.setFontSize(24);
  doc.setTextColor(20, 20, 20);
  doc.text("Investment Report", 20, y + 10);
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Type: ${reportTypes.find((r) => r.id === type)?.label || type}`, 20, y + 22);
  doc.text(`Period: ${dateRanges.find((d) => d.value === dateRange)?.label || dateRange}`, 20, y + 30);
  doc.text(`Date: ${now.toLocaleDateString("en-IN")}`, 20, y + 38);

  // Disclaimer box
  doc.setFillColor(255, 248, 220);
  doc.roundedRect(20, y + 50, pageWidth - 40, 25, 3, 3, "F");
  doc.setFontSize(7);
  doc.setTextColor(180, 120, 0);
  doc.text("EDUCATIONAL DISCLAIMER: This report is generated for informational purposes only.", 25, y + 58);
  doc.text("It does not constitute financial advice. Consult a SEBI-registered investment advisor.", 25, y + 63);
  doc.text("Past performance does not guarantee future results. All data may be simulated.", 25, y + 68);

  // Portfolio Summary
  addPage();
  header("Portfolio Summary");
  section("Holdings Overview");

  const totalValue = holdings.reduce((s, h) => s + h.qty * h.current, 0);
  const totalInvested = holdings.reduce((s, h) => s + h.qty * h.avgPrice, 0);
  const totalPnl = totalValue - totalInvested;
  const pnlPct = ((totalPnl / totalInvested) * 100).toFixed(2);

  text("Total Portfolio Value", formatCurrency(totalValue));
  text("Total Invested", formatCurrency(totalInvested));
  text("Total P&L", `${formatCurrency(totalPnl)} (${pnlPct}%)`);
  text("Number of Holdings", `${holdings.length}`);
  text("Sectors", "5 (Energy, IT, Banking, FMCG)");
  y += 5;

  // Holdings table
  section("Holdings Detail");
  const cols = [22, 55, 75, 95, 115, 140, 165];
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  ["Symbol", "Qty", "Avg Price", "Current", "P&L", "P&L %", "Weight"].forEach((h, i) => {
    doc.text(h, cols[i], y);
  });
  y += 5;
  doc.setFillColor(240, 240, 240);
  doc.rect(20, y - 2, pageWidth - 40, 0.3, "F");
  y += 3;

  holdings.forEach((h) => {
    const pnl = (h.current - h.avgPrice) * h.qty;
    const pnlPctStr = (((h.current - h.avgPrice) / h.avgPrice) * 100).toFixed(1);
    doc.setFontSize(7);
    doc.setTextColor(40, 40, 40);
    doc.text(h.symbol, cols[0], y);
    doc.text(`${h.qty}`, cols[1], y);
    doc.text(`₹${h.avgPrice.toLocaleString("en-IN")}`, cols[2], y);
    doc.text(`₹${h.current.toLocaleString("en-IN")}`, cols[3], y);
    doc.setTextColor(pnl >= 0 ? 16 : 220, pnl >= 0 ? 120 : 50, pnl >= 0 ? 80 : 50);
    doc.text(`${formatCurrency(pnl)}`, cols[4], y);
    doc.text(`${pnl >= 0 ? "+" : ""}${pnlPctStr}%`, cols[5], y);
    doc.setTextColor(40, 40, 40);
    doc.text(`${h.weight}%`, cols[6], y);
    y += 5;
  });

  // Risk Metrics
  addPage();
  header("Risk Assessment");
  section("Portfolio Risk Metrics");
  text("Risk Score", "72/100 (Moderate)");
  text("Sharpe Ratio", "1.25");
  text("Sortino Ratio", "1.68");
  text("Max Drawdown", "-12.5%");
  text("Volatility (Annual)", "15.2%");
  text("Value at Risk (95%)", "8.3%");
  text("Beta", "0.92");
  text("Alpha", "2.1%");
  y += 5;

  section("Risk Distribution");
  text("Equity", "65% (High Risk)");
  text("Debt", "20% (Low Risk)");
  text("Gold", "10% (Medium Risk)");
  text("Cash", "5% (No Risk)");
  y += 5;

  section("Compliance Status");
  text("SEBI Compliance", "PASSED");
  text("RBI Compliance", "PASSED");
  text("DPDP Act", "COMPLIANT");
  text("KYC Status", "Verified");
  text("Last Audit", "2026-06-30");

  // Performance
  addPage();
  header("Performance Attribution");
  section("Returns Summary");
  text("1 Month Return", "+2.8%");
  text("3 Month Return", "+5.2%");
  text("6 Month Return", "+11.5%");
  text("1 Year Return", "+18.3%");
  text("Since Inception", "+42.7%");
  text("Benchmark (Nifty 50)", "+14.2%");
  text("Alpha Generated", "+4.1%");
  y += 5;

  section("Sector Allocation");
  ["IT: 32.4%", "Banking: 36.0%", "Energy: 22.8%", "FMCG: 8.8%"].forEach((s) => {
    text("  •", s);
  });
  y += 5;

  section("Top Performers");
  text("1. TCS", "+12.0% (+₹12,600)");
  text("2. INFY", "+20.0% (+₹28,000)");
  text("3. SBIN", "+20.7% (+₹21,750)");

  // Tax Statement
  if (type === "tax" || type === "comprehensive") {
    addPage();
    header("Tax Statement");
    section("Capital Gains Summary");
    text("Short Term Gains (STCG)", "₹18,500");
    text("Long Term Gains (LTCG)", "₹85,200");
    text("LTCG Exemption Applied", "₹1,25,000");
    text("Taxable LTCG", "₹0 (within limit)");
    text("STCG Tax (@ 20%)", "₹3,700");
    y += 5;

    section("Tax-Loss Harvesting Opportunities");
    text("Realizable Losses", "₹47,000");
    text("Potential Tax Saved", "₹9,400");
    text("Harvestable Holdings", "3 of 7");
    y += 5;

    section("Section 80C Investments");
    text("ELSS Mutual Funds", "₹1,50,000");
    text("PPF Contribution", "₹0");
    text("Total 80C Used", "₹1,50,000 / ₹1,50,000");
    y += 5;

    section("Section 24 (Home Loan)");
    text("Interest Paid", "₹2,40,000");
    text("Deduction Claimed", "₹2,00,000");
  }

  // Footer on last page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `FINVERSE AI — Confidential Investment Report — Page ${i} of ${totalPages} — Generated ${now.toLocaleDateString("en-IN")}`,
      pageWidth / 2, doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      "DISCLAIMER: Not financial advice. Consult a SEBI-registered advisor.",
      pageWidth / 2, doc.internal.pageSize.getHeight() - 6,
      { align: "center" }
    );
  }

  const filename = `finverse-${type}-report-${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return filename;
}

export default function ReportsPage() {
  const userId = useAppStore((s) => s.userId);
  const { data, isLoading, error, refetch } = useDashboard(userId);

  const [selectedType, setSelectedType] = useState("comprehensive");
  const [selectedDateRange, setSelectedDateRange] = useState("1m");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<number | null>(null);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setGenerated(null);
    try {
      const filename = await generatePDF(selectedType, selectedDateRange);
      setGenerated(filename);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }, [selectedType, selectedDateRange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Investment Reports</h1>
          <p className="text-sm text-muted-foreground">Generate, download, and manage your portfolio statements</p>
        </div>
      </div>

      {error && <ErrorBanner message={error.message} onRetry={refetch} />}

      {/* Report Generator */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <CardTitle>Generate New Report</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Report Type Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Report Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {reportTypes.map((rt) => (
                <button
                  key={rt.id}
                  onClick={() => setSelectedType(rt.id)}
                  className={`p-4 rounded-2xl text-left transition-all border ${
                    selectedType === rt.id
                      ? "glass-card border-primary/30 bg-primary/5"
                      : "border-white/5 hover:border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rt.color} flex items-center justify-center mb-3`}>
                    <rt.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold mb-1">{rt.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{rt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <div className="flex items-center gap-1 p-1 glass rounded-lg w-fit">
              {dateRanges.map((dr) => (
                <button
                  key={dr.value}
                  onClick={() => setSelectedDateRange(dr.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    selectedDateRange === dr.value
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {dr.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex items-center gap-4">
            <Button onClick={handleGenerate} disabled={generating} size="lg" className="gap-2">
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : generated ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Download Again
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Generate & Download PDF
                </>
              )}
            </Button>
            {generated && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-emerald-400 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {generated}
              </motion.p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            PDF includes: Portfolio holdings, P&L, risk metrics, compliance status, performance attribution, and tax statement.
            All reports include educational disclaimers.
          </p>
        </CardContent>
      </Card>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reportHistory.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {report.date}
                      <span className="text-muted-foreground/50">·</span>
                      {report.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="success">{report.status}</Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleGenerate}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-400/80 space-y-1">
            <p><strong>Educational Disclaimer:</strong> Reports are generated for informational purposes only and do not constitute financial advice.</p>
            <p>• Portfolio data may include simulated values for demonstration</p>
            <p>• Tax calculations are indicative — consult a CA for actual tax filing</p>
            <p>• Past performance does not guarantee future results</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
