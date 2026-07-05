"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Search,
  Mail,
  MessageSquare,
  Phone,
  Link,
  Clock,
  Zap,
  Eye,
  Copy,
  Lightbulb,
} from "lucide-react";

interface FraudIndicator {
  type: string;
  severity: "high" | "medium" | "low";
  description: string;
}

interface AnalysisResult {
  riskLevel: "critical" | "high" | "medium" | "low" | "safe";
  score: number;
  indicators: FraudIndicator[];
  summary: string;
  recommendations: string[];
  redFlags: string[];
}

const exampleScams = [
  {
    label: "Guaranteed Returns Email",
    content: "URGENT: Invest ₹50,000 now and get guaranteed 40% returns in 30 days! Limited time offer. Click here: bit.ly/fake-invest",
    type: "email",
  },
  {
    label: "WhatsApp Investment Tip",
    content: "Join our Telegram group for insider tips on penny stocks. SEBI registered (fake). Double your money in 15 days. Send ₹10,000 to start.",
    type: "whatsapp",
  },
  {
    label: "Phishing SMS",
    content: "Your bank account will be blocked! Verify KYC immediately at bank-verify.fake.com or call 1800-XXX-XXXX.",
    type: "sms",
  },
];

function analyzeText(text: string): AnalysisResult {
  const lower = text.toLowerCase();
  const indicators: FraudIndicator[] = [];
  let score = 0;

  const patterns = [
    { keyword: /guaranteed|guarante|100%|no risk|risk.free/i, type: "Guaranteed Returns Claim", severity: "high" as const, desc: "Promises guaranteed or risk-free returns — a hallmark of fraudulent schemes." },
    { keyword: /urgent|act now|hurry|limited time|last chance|expire/i, type: "Urgency Tactics", severity: "high" as const, desc: "Creates artificial urgency to bypass rational decision-making." },
    { keyword: /double.*money|10x|20x|40%|50%|100% return/i, type: "Unrealistic Returns", severity: "high" as const, desc: "Promises returns far exceeding market averages (12-15% historically)." },
    { keyword: /insider|secret|exclusive|tip|hot stock/i, type: "Insider Trading Implication", severity: "high" as const, desc: "Suggests access to non-public information — illegal under SEBI regulations." },
    { keyword: /click here|bit\.ly|tinyurl|verify.*now|update.*kyc/i, type: "Suspicious Link/Action", severity: "medium" as const, desc: "Directs to unverified links or asks for sensitive information." },
    { keyword: /send money|transfer|upi|pay.*now|deposit/i, type: "Payment Request", severity: "medium" as const, desc: "Requests immediate payment to unverified entities." },
    { keyword: /sebi registered|regulated|licensed/i, type: "False Credibility Claim", severity: "medium" as const, desc: "Claims regulatory registration — verify at sebi.gov.in." },
    { keyword: /telegram|whatsapp group|private group/i, type: "Unregulated Channel", severity: "medium" as const, desc: "Uses unregulated communication channels for investment advice." },
    { keyword: /penny stock|micro cap|small cap.*tip/i, type: "Penny Stock Promotion", severity: "medium" as const, desc: "Common in pump-and-dump schemes targeting uninformed investors." },
    { keyword: /blocked|suspended|verify.*immediately|account.*close/i, type: "Fear Tactics", severity: "medium" as const, desc: "Uses fear of loss to pressure immediate action." },
    { keyword: /refer.*friend|join.*now|recruit|network/i, type: "MLM/Pyramid Structure", severity: "high" as const, desc: "MLM or pyramid scheme indicators — earnings depend on recruitment." },
    { keyword: /call.*now|whatsapp.*number|contact.*agent/i, type: "Pressure to Contact", severity: "low" as const, desc: "Pushes direct contact to manipulate through personal interaction." },
  ];

  for (const p of patterns) {
    if (p.keyword.test(text)) {
      indicators.push({ type: p.type, severity: p.severity, description: p.desc });
      score += p.severity === "high" ? 25 : p.severity === "medium" ? 15 : 5;
    }
  }

  score = Math.min(score, 100);

  let riskLevel: AnalysisResult["riskLevel"];
  if (score >= 75) riskLevel = "critical";
  else if (score >= 50) riskLevel = "high";
  else if (score >= 25) riskLevel = "medium";
  else if (score > 0) riskLevel = "low";
  else riskLevel = "safe";

  const redFlags = indicators.filter((i) => i.severity === "high").map((i) => i.type);
  const recommendations = [
    "Never invest based on unsolicited messages",
    "Verify companies at SEBI's investor portal (sebi.gov.in)",
    "Check RBI's list of authorized entities",
    "Report suspected fraud at cybercrime.gov.in",
    "Remember: if it sounds too good to be true, it is",
  ];

  const summaries: Record<string, string> = {
    critical: "This message exhibits multiple high-risk fraud indicators. It strongly resembles common investment scams. Do NOT engage or transfer any funds.",
    high: "This message contains several warning signs of a potential scam. Exercise extreme caution and verify independently before taking any action.",
    medium: "This message has some concerning patterns. Verify the sender and claims through official channels before proceeding.",
    low: "Minor concerns detected. While not necessarily fraudulent, exercise normal caution with unsolicited financial advice.",
    safe: "No significant fraud indicators detected in this message. Always remain vigilant with financial communications.",
  };

  return { riskLevel, score, indicators, summary: summaries[riskLevel], recommendations, redFlags };
}

function getRiskColor(level: string) {
  switch (level) {
    case "critical": return "text-red-400 bg-red-500/10 border-red-500/20";
    case "high": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
    case "medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "low": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    case "safe": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    default: return "text-muted-foreground";
  }
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "high": return <Badge variant="destructive">High Risk</Badge>;
    case "medium": return <Badge variant="warning">Medium</Badge>;
    case "low": return <Badge variant="secondary">Low</Badge>;
    default: return <Badge variant="outline">Info</Badge>;
  }
}

const typeIcons: Record<string, React.ElementType> = {
  email: Mail,
  whatsapp: MessageSquare,
  sms: Phone,
};

export function ScamDetector() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = (text?: string) => {
    const toAnalyze = text || input;
    if (!toAnalyze.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setResult(analyzeText(toAnalyze));
      setAnalyzing(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-primary" />
          Scam & Fraud Detector
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste suspicious emails, messages, or ads to check for fraud indicators
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyze a Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste the suspicious email, WhatsApp message, SMS, or investment advertisement here..."
            className="w-full h-32 p-4 rounded-xl bg-white/[0.02] border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            aria-label="Message to analyze"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleAnalyze()} loading={analyzing} disabled={!input.trim()}>
              <Search className="w-4 h-4 mr-2" />
              Analyze Message
            </Button>
            {exampleScams.map((scam) => {
              const Icon = typeIcons[scam.type] || Mail;
              return (
                <Button
                  key={scam.label}
                  variant="outline"
                  size="sm"
                  onClick={() => { setInput(scam.content); handleAnalyze(scam.content); }}
                >
                  <Icon className="w-3 h-3 mr-1.5" />
                  {scam.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <Card className={cn("border", getRiskColor(result.riskLevel))}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {result.riskLevel === "safe" ? (
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    ) : (
                      <ShieldAlert className={cn("w-8 h-8", result.riskLevel === "critical" || result.riskLevel === "high" ? "text-red-400" : "text-amber-400")} />
                    )}
                    <div>
                      <h3 className="text-lg font-bold capitalize">{result.riskLevel} Risk</h3>
                      <p className="text-xs text-muted-foreground">Fraud Risk Score: {result.score}/100</p>
                    </div>
                  </div>
                  <Badge variant={result.riskLevel === "safe" ? "success" : result.riskLevel === "critical" || result.riskLevel === "high" ? "destructive" : "warning"}>
                    {result.score}%
                  </Badge>
                </div>

                <div className="w-full h-2 rounded-full bg-white/5 mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.score}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn("h-full rounded-full", result.riskLevel === "safe" ? "bg-emerald-500" : result.riskLevel === "critical" || result.riskLevel === "high" ? "bg-red-500" : "bg-amber-500")}
                  />
                </div>

                <p className="text-sm mb-4">{result.summary}</p>

                {result.indicators.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      Fraud Indicators Detected
                    </h4>
                    {result.indicators.map((ind, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02] text-xs">
                        <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{ind.type}</span>
                            {getSeverityBadge(ind.severity)}
                          </div>
                          <p className="text-muted-foreground mt-0.5">{ind.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {result.redFlags.length > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <h4 className="text-sm font-medium text-red-400 mb-1.5 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Red Flags
                    </h4>
                    <ul className="space-y-1">
                      {result.redFlags.map((flag, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span className="text-red-400">•</span> {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <h4 className="text-xs font-medium text-primary mb-1.5 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    How to Protect Yourself
                  </h4>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <strong>Educational Disclaimer:</strong> This tool provides pattern-based analysis for
                educational purposes only. It does not constitute legal, financial, or security advice.
                Always verify investment opportunities through official SEBI and RBI channels. Report
                suspected fraud to your local cybercrime cell or at cybercrime.gov.in.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
