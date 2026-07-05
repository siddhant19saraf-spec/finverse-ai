"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Zap,
  MessageSquare,
  Brain,
  Activity,
  FileText,
  TrendingUp,
  Download,
  Mic,
  ShieldCheck,
  Heart,
  ShieldAlert,
} from "lucide-react";

interface ActionItem {
  icon: typeof MessageSquare;
  label: string;
  href: string;
  color: string;
  glow: string;
}

const actions: ActionItem[] = [
  {
    icon: MessageSquare,
    label: "Ask AI",
    href: "/copilot",
    color: "text-blue-400",
    glow: "hover:shadow-blue-500/20 hover:border-blue-500/30",
  },
  {
    icon: Brain,
    label: "Digital Twin",
    href: "/digital-twin",
    color: "text-purple-400",
    glow: "hover:shadow-purple-500/20 hover:border-purple-500/30",
  },
  {
    icon: Activity,
    label: "X-Ray",
    href: "/portfolio",
    color: "text-emerald-400",
    glow: "hover:shadow-emerald-500/20 hover:border-emerald-500/30",
  },
  {
    icon: FileText,
    label: "Report",
    href: "/reports",
    color: "text-amber-400",
    glow: "hover:shadow-amber-500/20 hover:border-amber-500/30",
  },
  {
    icon: TrendingUp,
    label: "Analysis",
    href: "/market",
    color: "text-cyan-400",
    glow: "hover:shadow-cyan-500/20 hover:border-cyan-500/30",
  },
  {
    icon: Download,
    label: "PDF",
    href: "/reports",
    color: "text-pink-400",
    glow: "hover:shadow-pink-500/20 hover:border-pink-500/30",
  },
  {
    icon: Mic,
    label: "Voice",
    href: "/",
    color: "text-red-400",
    glow: "hover:shadow-red-500/20 hover:border-red-500/30",
  },
  {
    icon: ShieldCheck,
    label: "Safety",
    href: "/financial-health",
    color: "text-teal-400",
    glow: "hover:shadow-teal-500/20 hover:border-teal-500/30",
  },
  {
    icon: Heart,
    label: "Health",
    href: "/financial-health",
    color: "text-pink-400",
    glow: "hover:shadow-pink-500/20 hover:border-pink-500/30",
  },
  {
    icon: ShieldAlert,
    label: "Fraud",
    href: "/scam-detector",
    color: "text-orange-400",
    glow: "hover:shadow-orange-500/20 hover:border-orange-500/30",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-3 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] p-4 cursor-pointer transition-all duration-200 hover:bg-white/[0.06] shadow-lg",
                    action.glow
                  )}
                >
                  <Icon className={cn("h-6 w-6", action.color)} />
                  <span className="text-xs font-medium text-muted-foreground">
                    {action.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
