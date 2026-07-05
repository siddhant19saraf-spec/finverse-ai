"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  Brain, Shield, LineChart, MessageSquare, Lock, ArrowRight,
  Globe, Cpu, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/stores/app";
import { useTranslation } from "@/i18n/context";

const tickerData = [
  { symbol: "NIFTY 50", value: "24,567.80", change: "+0.45%", up: true },
  { symbol: "SENSEX", value: "81,234.50", change: "+0.38%", up: true },
  { symbol: "BANK NIFTY", value: "51,234.60", change: "-0.22%", up: false },
  { symbol: "NIFTY IT", value: "38,456.20", change: "+1.12%", up: true },
  { symbol: "RELIANCE", value: "₹2,850", change: "+3.2%", up: true },
  { symbol: "TCS", value: "₹3,920", change: "+2.1%", up: true },
  { symbol: "INFY", value: "₹1,680", change: "+1.5%", up: true },
  { symbol: "HDFCBANK", value: "₹1,720", change: "-1.2%", up: false },
];

const features = [
  { icon: Brain, key: "digitalTwin", color: "from-blue-500 to-cyan-400" },
  { icon: MessageSquare, key: "aiCopilot", color: "from-purple-500 to-pink-400" },
  { icon: LineChart, key: "portfolioIntelligence", color: "from-emerald-500 to-teal-400" },
  { icon: Shield, key: "responsibleAI", color: "from-amber-500 to-orange-400" },
  { icon: Lock, key: "enterpriseSecurity", color: "from-red-500 to-pink-400" },
  { icon: Globe, key: "indianMarket", color: "from-cyan-500 to-blue-400" },
];

const stats = [
  { value: "10+", label: "AI Modules" },
  { value: "209+", label: "Test Cases" },
  { value: "3", label: "Regulations" },
  { value: "99.9%", label: "Uptime" },
];

const steps = [
  { step: "01", key: "connect" },
  { step: "02", key: "analyze" },
  { step: "03", key: "simulate" },
  { step: "04", key: "decide" },
];

function MarketTicker() {
  return (
    <div className="relative overflow-hidden border-b border-white/5 py-3" aria-label="Live market data">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...tickerData, ...tickerData].map((item, i) => (
          <div key={`${item.symbol}-${i}`} className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground font-medium">{item.symbol}</span>
            <span className="font-semibold">{item.value}</span>
            <span className={`flex items-center gap-1 ${item.up ? "text-emerald-400" : "text-red-400"}`}>
              {item.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {item.change}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function AnimatedCounter({ value, delay = 0 }: { value: string; delay?: number }) {
  const [display, setDisplay] = useState("0");
  const numericPart = value.replace(/[^0-9.]/g, "");
  const prefix = value.match(/^[^0-9]*/)?.[0] ?? "";
  const suffix = value.match(/[^0-9.]*$/)?.[0] ?? "";
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const target = parseFloat(numericPart);
    if (isNaN(target)) { setDisplay(value); return; }
    const duration = 1500;
    const start = Date.now();
    const timer = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        setDisplay(`${prefix}${Number.isInteger(target) ? Math.round(current) : current.toFixed(1)}${suffix}`);
        if (progress >= 1 && intervalRef.current) clearInterval(intervalRef.current);
      }, 16);
    }, delay);
    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [numericPart, prefix, suffix, delay, value]);

  return <>{display}</>;
}

export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const setDemoMode = useAppStore((s) => s.setDemoMode);
  const setDemoBannerVisible = useAppStore((s) => s.setDemoBannerVisible);
  const { t } = useTranslation();

  const handleDemo = () => {
    setDemoMode(true);
    setDemoBannerVisible(true);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen text-foreground overflow-hidden">
      {/* Market Ticker */}
      <MarketTicker />

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 lg:px-8 py-5 max-w-7xl mx-auto" aria-label="Main navigation">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/logo-icon.png"
            alt="FinVerse AI Logo"
            width={40}
            height={40}
            className="rounded-xl"
            priority
          />
          <span className="text-xl font-bold text-gradient">FINVERSE AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Platform</a>
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </Link>
        </div>
        <div className="md:hidden flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero — CSS animations (SSR-safe, no opacity:0 on server) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-16 lg:pt-20 pb-24 lg:pb-32 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs text-muted-foreground mb-8 ${prefersReducedMotion ? "" : "animate-slide-up-fade"}`} style={{ animationDelay: "0s" }}>
          <Cpu className="w-3.5 h-3.5 text-primary" />
          <span>{t("landing.indiaFirst")}</span>
        </div>

        <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight mb-6 ${prefersReducedMotion ? "" : "animate-slide-up-fade"}`} style={{ animationDelay: "0.1s" }}>
          <span className="text-gradient">{t("landing.hero")}</span>
        </h1>

        <p className={`text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 ${prefersReducedMotion ? "" : "animate-slide-up-fade"}`} style={{ animationDelay: "0.2s" }}>
          {t("landing.heroSubtitle")}
        </p>

        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${prefersReducedMotion ? "" : "animate-slide-up-fade"}`} style={{ animationDelay: "0.3s" }}>
          <Link href="/signup">
            <Button size="lg" className="text-base px-8 w-full sm:w-auto">
              {t("landing.startFreeTrial")} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="text-base px-8 w-full sm:w-auto" onClick={handleDemo}>
            {t("landing.viewDemo")}
          </Button>
        </div>

        {/* Hero Video */}
        <div className={`mt-12 lg:mt-16 max-w-3xl mx-auto ${prefersReducedMotion ? "" : "animate-slide-up-fade"}`} style={{ animationDelay: "0.4s" }}>
          <div className="relative aspect-video rounded-2xl overflow-hidden glass-card border border-white/10 shadow-2xl shadow-primary/10">
            <iframe
              src="https://www.youtube.com/embed/grnjv6gmKmA?si=GhBfHwZcGHn_-Onc"
              title="FINVERSE AI - Intelligent Wealth Management"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Watch how FINVERSE AI transforms wealth management with explainable intelligence
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className={`mt-16 lg:mt-20 relative ${prefersReducedMotion ? "" : "animate-slide-up-fade"}`} style={{ animationDelay: "0.5s" }} aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-t from-hero-gradient via-transparent to-transparent z-10" />
          <div className="glass-card p-3 lg:p-4 rounded-2xl border border-white/10 shadow-2xl shadow-primary/10">
            <div className="bg-gradient-to-br from-[#0d1117] to-[#0a0a1a] rounded-xl p-4 lg:p-6 h-[300px] lg:h-[400px]">
              {/* Mini dashboard mockup */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs text-muted-foreground ml-2">FINVERSE AI — Dashboard</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 stagger-children">
                {[
                  { label: "Portfolio Value", value: "₹24.58L", color: "from-blue-500 to-cyan-400" },
                  { label: "Risk Score", value: "72/100", color: "from-emerald-500 to-teal-400" },
                  { label: "Goal Progress", value: "45%", color: "from-purple-500 to-pink-400" },
                  { label: "Market", value: "↑0.45%", color: "from-amber-500 to-orange-400" },
                ].map((item) => (
                  <div key={item.label} className="glass-card p-3 lg:p-4 rounded-xl">
                    <div className="text-xl lg:text-2xl font-bold text-gradient mb-1">{item.value}</div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>
              {/* Mock chart area */}
              <div className="mt-4 lg:mt-6 grid grid-cols-3 gap-3 lg:gap-4">
                <div className="col-span-2 glass-card rounded-xl p-4 h-32 lg:h-40 flex items-end gap-1">
                  {[40, 65, 45, 80, 55, 70, 90, 75, 85, 95, 88, 92].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary/20 to-primary/60 rounded-t animate-fade-in-up"
                      style={{ height: `${h}%`, animationDelay: `${1.2 + i * 0.05}s`, animationFillMode: "both" }}
                    />
                  ))}
                </div>
                <div className="glass-card rounded-xl p-4 h-32 lg:h-40">
                  <div className="text-xs text-muted-foreground mb-2">Allocation</div>
                  <div className="space-y-2">
                    {[
                      { label: "Equity", pct: 55, color: "bg-blue-500" },
                      { label: "Debt", pct: 25, color: "bg-emerald-500" },
                      { label: "Gold", pct: 10, color: "bg-amber-500" },
                      { label: "Cash", pct: 10, color: "bg-purple-500" },
                    ].map((a) => (
                      <div key={a.label}>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-muted-foreground">{a.label}</span>
                          <span>{a.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${a.color} rounded-full animate-fade-in-up`}
                            style={{ width: `${a.pct}%`, animationDelay: "1.5s", animationFillMode: "both" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="relative z-10 py-16 lg:py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-gradient mb-2">
                  <AnimatedCounter value={stat.value} delay={i * 200} />
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t("landing.features")}</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t("landing.featuresSubtitle")}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={prefersReducedMotion ? {} : { y: -4, transition: { duration: 0.2 } }}
              >
                <Card className="h-full group hover:border-white/15 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t(`landing.featuresList.${feature.key}.title`)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(`landing.featuresList.${feature.key}.desc`)}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-24 lg:py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t("landing.howItWorks")}</h2>
            <p className="text-lg text-muted-foreground">{t("landing.howItWorksSubtitle")}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold text-primary/20 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{t(`landing.steps.${item.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`landing.steps.${item.key}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-10 lg:p-16 rounded-3xl"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t("landing.readyToTransform")}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              {t("landing.readySubtitle")}
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-base px-10">
                {t("landing.getStartedFree")} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/logo-icon.png"
              alt="FinVerse AI Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">FINVERSE AI © 2026</span>
              <span className="text-xs text-muted-foreground/60">Made by <span className="text-primary/70 font-medium">Siddhant Saraf</span></span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button className="hover:text-foreground transition-colors cursor-not-allowed opacity-50">Privacy</button>
            <button className="hover:text-foreground transition-colors cursor-not-allowed opacity-50">Terms</button>
            <button className="hover:text-foreground transition-colors cursor-not-allowed opacity-50">Documentation</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
