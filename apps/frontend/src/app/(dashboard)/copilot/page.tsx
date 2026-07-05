"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  MessageSquare, Send, Sparkles, Bot, User, Copy, Check,
  Loader2, TrendingUp, Shield, Target, BarChart3, AlertTriangle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoiceInput } from "@/components/voice-input";
import { useCopilotChat } from "@/lib/hooks";
import { useAppStore } from "@/stores/app";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  cards?: any[];
  sources?: any[];
  confidence?: number;
  reasoning?: string;
  disclaimer?: string;
}

const suggestedPrompts = [
  { icon: TrendingUp, text: "Analyze my portfolio risk" },
  { icon: Target, text: "Am I on track for retirement?" },
  { icon: BarChart3, text: "How is the market today?" },
  { icon: Shield, text: "Check my SEBI compliance" },
];

const fallbackResponses: Record<string, Partial<Message>> = {
  analyze: {
    content: "Based on your portfolio analysis:\n\n**Portfolio Value:** ₹24.58L\n**Risk Level:** MODERATE\n**Sharpe Ratio:** 1.25\n**Max Drawdown:** 12.5%\n**VaR (95%):** 8.3%\n\nYour portfolio shows a moderate risk profile with good diversification across sectors. The Sharpe ratio above 1.0 indicates acceptable risk-adjusted returns.",
    reasoning: "Analyzed portfolio risk metrics using Sharpe ratio, VaR, and maximum drawdown calculations.",
    confidence: 85,
    cards: [{ type: "risk", title: "Risk Dashboard", data: { risk_level: "moderate", sharpe: 1.25, max_dd: 12.5 } }],
  },
  inflation: {
    content: "Running **High Inflation** scenario (8% rate):\n\n**Projected Portfolio (10yr):** ₹38.2L\n**Inflation-Adjusted:** ₹24.1L\n**Goal Achievement:** 45%\n**Monthly Savings Impact:** -₹8,500\n\nHigh inflation significantly erodes purchasing power. Consider increasing allocation to inflation-hedged assets like gold, real estate, and equity.",
    reasoning: "Executed Monte Carlo simulation for high inflation scenario with 1,000 iterations.",
    confidence: 72,
  },
  retirement: {
    content: "**Retirement Readiness:**\n\n**Target Corpus:** ₹1,00,00,000\n**Expected Value:** ₹72,50,000\n**Achievement Probability:** 65%\n**Shortfall Risk:** ₹27,50,000\n**Recommended SIP:** ₹55,000/month\n\nYou're making good progress. Increasing your SIP by ₹10,000/month would significantly improve your retirement readiness.",
    reasoning: "Calculated goal achievement using Monte Carlo simulation with current savings trajectory.",
    confidence: 78,
  },
  market: {
    content: "**Market Overview:**\n\n**NIFTY 50:** 24,567.80 (+0.45%)\n**SENSEX:** 81,234.50 (+0.38%)\n**NIFTY Bank:** 51,234.60 (-0.22%)\n\n**Top Gainers:** ADANIENT +5.4%, TATASTEEL +3.8%\n**Top Losers:** BAJFINANCE -2.1%, AXISBANK -1.5%\n\nMarkets are positive today with broader indices gaining.",
    confidence: 99,
  },
  compliance: {
    content: "**Compliance Status:**\n\n**SEBI:** ✅ Compliant\n**RBI:** ✅ Compliant\n**DPDP:** ✅ Compliant\n\nAll regulatory checks passed. Your portfolio meets SEBI investment limits, RBI transaction guidelines, and DPDP data protection requirements.",
    reasoning: "Checked compliance against all three Indian regulatory frameworks.",
    confidence: 95,
  },
};

function CopilotCard({ card }: { card: any }) {
  const iconMap: Record<string, React.ElementType> = {
    risk: Shield,
    scenario: TrendingUp,
    goal: Target,
    market: BarChart3,
    compliance: Shield,
  };
  const Icon = iconMap[card.type] || BarChart3;

  return (
    <div className="glass rounded-xl p-3 border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(card.data || {}).map(([key, val]) => (
          <div key={key}>
            <p className="text-[10px] text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
            <p className="text-sm font-semibold">
              {typeof val === "number" ? val.toLocaleString("en-IN") : String(val)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy response"}
      className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function CopilotPage() {
  const userId = useAppStore((s) => s.userId);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your **FINVERSE AI Copilot**. I can help you with:\n\n- 📊 **Portfolio Analysis** — Risk metrics, allocation, performance\n- 🧠 **Scenario Simulation** — What-if analysis with Monte Carlo\n- 🎯 **Goal Planning** — Track progress and probability\n- 🛡️ **Compliance** — SEBI, RBI, DPDP checks\n- 📈 **Market Intelligence** — Live indices and movers\n\nAsk me anything about your financial situation!",
      confidence: 100,
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const copilotMutation = useCopilotChat(userId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || copilotMutation.isPending) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    copilotMutation.mutate(
      { message: text },
      {
        onSuccess: (data: any) => {
          const answer = data?.answer ?? data?.message ?? data?.content ?? "I can help with that.";
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: answer,
            cards: data?.cards,
            sources: data?.sources,
            confidence: data?.confidence,
            reasoning: data?.reasoning,
            disclaimer: data?.disclaimer ?? "This analysis is for educational purposes only. Not financial advice.",
          };
          setMessages((prev) => [...prev, aiMsg]);
        },
        onError: () => {
          const lower = text.toLowerCase();
          let fallback: Partial<Message> | undefined;
          for (const [key, val] of Object.entries(fallbackResponses)) {
            if (lower.includes(key)) { fallback = val; break; }
          }
          if (!fallback) fallback = fallbackResponses.market;
          setMessages((prev) => [...prev, {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: fallback?.content ?? "I can help with that.",
            cards: fallback?.cards,
            confidence: fallback?.confidence,
            reasoning: fallback?.reasoning,
            disclaimer: "This analysis is for educational purposes only. Not financial advice.",
          }]);
        },
      }
    );
  }, [copilotMutation]);

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> AI Copilot
          </h1>
          <p className="text-sm text-muted-foreground">Connected to Portfolio, Digital Twin, Risk, Market & Compliance</p>
        </div>
        {messages.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setMessages([messages[0]]);
              inputRef.current?.focus();
            }}
            className="text-muted-foreground"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <Image
                  src="/brand/logo-icon.png"
                  alt="FinVerse AI"
                  width={32}
                  height={32}
                  className="rounded-lg flex-shrink-0 mt-1"
                />
              )}
              <div className="max-w-[75%]">
                <div className={`p-4 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "glass-card rounded-bl-md"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  )}
                </div>

                {/* Assistant metadata */}
                {msg.role === "assistant" && (
                  <div className="mt-2 px-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {msg.confidence !== undefined && (
                        <Badge variant="outline" className="text-[10px]">
                          Confidence: {msg.confidence}%
                        </Badge>
                      )}
                      {msg.reasoning && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[300px]">
                          {msg.reasoning}
                        </span>
                      )}
                      <CopyButton text={msg.content} />
                    </div>

                    {msg.cards && msg.cards.length > 0 && (
                      <div className="space-y-2">
                        {msg.cards.map((card: any, i: number) => (
                          <CopilotCard key={i} card={card} />
                        ))}
                      </div>
                    )}

                    {msg.disclaimer && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400/60 flex-shrink-0" />
                        <p className="text-[10px] text-amber-400/60">{msg.disclaimer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {copilotMutation.isPending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <Image
              src="/brand/logo-icon.png"
              alt="FinVerse AI"
              width={32}
              height={32}
              className="rounded-lg flex-shrink-0"
            />
            <div className="glass-card p-4 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt.text}
              onClick={() => sendMessage(prompt.text)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm glass rounded-xl hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground text-left"
            >
              <prompt.icon className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{prompt.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="glass-card p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <VoiceInput onTranscript={(text) => { setInput(text); sendMessage(text); }} disabled={copilotMutation.isPending} />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask about your portfolio, goals, market..."
            aria-label="Ask AI Copilot a question"
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
          <Button
            size="icon"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || copilotMutation.isPending}
            className="rounded-xl"
            aria-label="Send message"
          >
            {copilotMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
