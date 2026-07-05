"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  LayoutDashboard, Briefcase, Brain, MessageSquare, TrendingUp,
  FileText, Target, Settings, ChevronLeft, ChevronRight,
  LogOut, Menu, X, BarChart3, Flame, Scissors, Calculator, Filter,
  Newspaper, BellRing, PieChart, ShieldAlert, Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app";
import { SIDEBAR_OPEN, SIDEBAR_CLOSED } from "./shell";
import { useTranslation } from "@/i18n/context";

const SidebarMarketInfo = dynamic(
  () => import("./sidebar-market-info").then((m) => m.SidebarMarketInfo),
  { ssr: false }
);

const navItems = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/portfolio", labelKey: "nav.portfolio", icon: Briefcase },
  { href: "/digital-twin", labelKey: "nav.digitalTwin", icon: Brain },
  { href: "/copilot", labelKey: "nav.aiCopilot", icon: MessageSquare },
  { href: "/market", labelKey: "nav.market", icon: TrendingUp },
  { href: "/goals", labelKey: "nav.goals", icon: Target },
  { href: "/reports", labelKey: "nav.reports", icon: FileText },
  { href: "/analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { href: "/fire-calculator", labelKey: "nav.fireCalculator", icon: Flame },
  { href: "/emi-calculator", labelKey: "nav.emiCalculator", icon: Calculator },
  { href: "/tax-harvester", labelKey: "nav.taxHarvester", icon: Scissors },
  { href: "/screener", labelKey: "nav.stockScreener", icon: Filter },
  { href: "/stock-advisor", labelKey: "nav.aiAdvisor", icon: Brain },
  { href: "/sentiment", labelKey: "nav.sentiment", icon: Newspaper },
  { href: "/alerts", labelKey: "nav.smartAlerts", icon: BellRing },
  { href: "/sip-projector", labelKey: "nav.sipProjector", icon: PieChart },
  { href: "/behavioural-coach", labelKey: "nav.behaviouralCoach", icon: Brain },
  { href: "/financial-health", labelKey: "nav.financialHealth", icon: Heart },
  { href: "/scam-detector", labelKey: "nav.scamDetector", icon: ShieldAlert },
  { href: "/settings", labelKey: "nav.settings", icon: Settings },
];

function NavContent({ sidebarOpen, pathname }: { sidebarOpen: boolean; pathname: string }) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex items-center h-16 px-4 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3" aria-label="FINVERSE home">
          <Image
            src="/brand/logo-icon.png"
            alt="FinVerse AI"
            width={36}
            height={36}
            className="rounded-xl flex-shrink-0"
            priority
          />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-lg font-bold text-gradient whitespace-nowrap"
              >
                FINVERSE
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                active
                  ? "bg-primary/10 text-primary glow-active"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full"
                  transition={{ duration: 0.3 }}
                />
              )}
              <item.icon className={cn("w-5 h-5 flex-shrink-0", active && "text-primary")} />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {t(item.labelKey)}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <SidebarMarketInfo sidebarOpen={sidebarOpen} />

      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
          <Link href="/settings" className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              S
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate">Siddhant Saraf</p>
                  <p className="text-xs text-muted-foreground truncate">Demo Investor</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => {
                  document.cookie = "finverse_user_id=; path=/; max-age=0";
                  useAppStore.getState().setUserId(0);
                  useAppStore.getState().setDemoMode(false);
                  window.location.href = "/login";
                }}
                aria-label="Log out"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={() => useAppStore.getState().toggleSidebar()}
        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        aria-expanded={sidebarOpen}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-secondary border border-white/10 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all z-50"
      >
        {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? SIDEBAR_OPEN : SIDEBAR_CLOSED }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="hidden lg:flex fixed left-0 top-0 z-40 h-screen glass-sidebar flex-col"
      >
        <NavContent sidebarOpen={sidebarOpen} pathname={pathname ?? ""} />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="lg:hidden fixed left-0 top-0 z-50 h-screen w-[280px] glass-sidebar flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <NavContent sidebarOpen={true} pathname={pathname ?? ""} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
