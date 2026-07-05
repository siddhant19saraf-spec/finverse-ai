"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
} from "lucide-react";

type AlertPriority = "CRITICAL" | "WARNING" | "INFO" | "SUCCESS";

interface Alert {
  id: number;
  priority: AlertPriority;
  title: string;
  description: string;
  timestamp: string;
}

const alerts: Alert[] = [
  {
    id: 1,
    priority: "CRITICAL",
    title: "Portfolio Concentration",
    description:
      "RELIANCE constitutes 22.8% of portfolio. SEBI recommended limit is 20%.",
    timestamp: "2 min ago",
  },
  {
    id: 2,
    priority: "WARNING",
    title: "Goal Behind Schedule",
    description:
      "Emergency Fund goal is 2 months behind target pace. Consider increasing SIP.",
    timestamp: "15 min ago",
  },
  {
    id: 3,
    priority: "WARNING",
    title: "High Volatility",
    description:
      "India VIX spiked to 18.5 today. Your portfolio beta is 1.12.",
    timestamp: "1 hour ago",
  },
  {
    id: 4,
    priority: "INFO",
    title: "Large Market Move",
    description:
      "NIFTY rose 1.2% today. Your portfolio outperformed by 0.4%.",
    timestamp: "2 hours ago",
  },
  {
    id: 5,
    priority: "SUCCESS",
    title: "Risk Threshold OK",
    description:
      "All risk metrics within acceptable limits. Portfolio VaR at 2.3%.",
    timestamp: "3 hours ago",
  },
  {
    id: 6,
    priority: "INFO",
    title: "Dividend Received",
    description:
      "HDFCBANK announced ₹44/share dividend. Expected credit: ₹2,200.",
    timestamp: "5 hours ago",
  },
];

const priorityConfig: Record<
  AlertPriority,
  {
    badge: "destructive" | "warning" | "default" | "success";
    border: string;
    icon: typeof Bell;
    iconColor: string;
  }
> = {
  CRITICAL: {
    badge: "destructive",
    border: "border-l-red-500",
    icon: AlertCircle,
    iconColor: "text-red-400",
  },
  WARNING: {
    badge: "warning",
    border: "border-l-amber-500",
    icon: AlertTriangle,
    iconColor: "text-amber-400",
  },
  INFO: {
    badge: "default",
    border: "border-l-blue-500",
    icon: Info,
    iconColor: "text-blue-400",
  },
  SUCCESS: {
    badge: "success",
    border: "border-l-emerald-500",
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
  },
};

export function SmartAlerts() {
  const [dismissed, setDismissed] = useState<number[]>([]);

  const visibleAlerts = alerts.filter((a) => !dismissed.includes(a.id));
  const newCount = 3;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Smart Alerts
          </div>
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
            {newCount} new
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        <AnimatePresence>
          {visibleAlerts.map((alert, index) => {
            const config = priorityConfig[alert.priority];
            const Icon = config.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className={cn(
                  "relative flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 border-l-4",
                  config.border
                )}
              >
                <div className="mt-0.5 shrink-0">
                  <Icon className={cn("h-4 w-4", config.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold truncate">
                      {alert.title}
                    </span>
                    <Badge
                      variant={config.badge}
                      className="text-[9px] px-1.5 py-0 shrink-0"
                    >
                      {alert.priority}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {alert.description}
                  </p>
                  <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                    {alert.timestamp}
                  </span>
                </div>
                <button
                  onClick={() => setDismissed((d) => [...d, alert.id])}
                  className="absolute top-2 right-2 text-muted-foreground/40 hover:text-foreground transition-colors shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
