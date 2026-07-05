"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, BellRing, AlertTriangle, CheckCircle2, Info, X, Plus, Clock,
  TrendingUp, TrendingDown, Shield, Target, Settings, Filter, Trash2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Alert {
  id: number;
  type: "price" | "compliance" | "drift" | "goal" | "system";
  priority: "critical" | "warning" | "info";
  title: string;
  message: string;
  time: string;
  read: boolean;
  action?: string;
}

const initialAlerts: Alert[] = [
  { id: 1, type: "price", priority: "critical", title: "RELIANCE Price Drop", message: "RELIANCE has fallen 4.2% in the last hour. Current: ₹2,850. Stop-loss level: ₹2,750.", time: "5 min ago", read: false, action: "View RELIANCE" },
  { id: 2, type: "compliance", priority: "critical", title: "SEBI Limit Breach", message: "Single stock exposure (RELIANCE 22.8%) exceeds SEBI recommended limit of 20%.", time: "15 min ago", read: false, action: "Fix allocation" },
  { id: 3, type: "drift", priority: "warning", title: "Portfolio Drift Detected", message: "Your equity allocation drifted to 78% (target: 65%). Rebalance recommended.", time: "1 hour ago", read: false, action: "Rebalance" },
  { id: 4, type: "goal", priority: "info", title: "SIP Due Tomorrow", message: "Monthly SIP of ₹50,000 for Retirement Corpus is due on July 5th.", time: "2 hours ago", read: true },
  { id: 5, type: "price", priority: "warning", title: "TCS 52-Week High", message: "TCS is trading near its 52-week high (₹4,246). Consider partial profit booking.", time: "3 hours ago", read: true },
  { id: 6, type: "system", priority: "info", title: "Monthly Report Ready", message: "Your June 2026 portfolio report is ready for download.", time: "5 hours ago", read: true },
  { id: 7, type: "compliance", priority: "warning", title: "DPDP Compliance Reminder", message: "Update your data consent preferences before the December 2026 deadline.", time: "1 day ago", read: true },
  { id: 8, type: "drift", priority: "info", title: "Goal On Track", message: "Emergency Fund goal is 80% complete — on track for September 2026 target.", time: "1 day ago", read: true },
];

const alertTypeIcons: Record<string, any> = {
  price: TrendingUp, compliance: Shield, drift: Target, goal: Target, system: Info,
};

const priorityConfig = {
  critical: { color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/20", badge: "destructive" as const },
  warning: { color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/20", badge: "warning" as const },
  info: { color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/20", badge: "secondary" as const },
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState<"all" | "unread" | "critical">("all");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "unread" && a.read) return false;
    if (filter === "critical" && a.priority !== "critical") return false;
    if (typeFilter && a.type !== typeFilter) return false;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;
  const criticalCount = alerts.filter((a) => a.priority === "critical" && !a.read).length;

  const markAsRead = (id: number) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));
  };

  const dismissAlert = (id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <BellRing className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Smart Alerts</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">AI-prioritized alerts for your portfolio, compliance, and goals</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCircle2 className="w-3 h-3 mr-1" /> Mark all read
            </Button>
          )}
          <Badge variant="outline" className="gap-1.5">
            <Bell className="w-3 h-3" />
            {unreadCount} unread
          </Badge>
        </div>
      </div>

      {/* Priority Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Critical", count: alerts.filter((a) => a.priority === "critical").length, unread: alerts.filter((a) => a.priority === "critical" && !a.read).length, config: priorityConfig.critical },
          { label: "Warning", count: alerts.filter((a) => a.priority === "warning").length, unread: alerts.filter((a) => a.priority === "warning" && !a.read).length, config: priorityConfig.warning },
          { label: "Info", count: alerts.filter((a) => a.priority === "info").length, unread: alerts.filter((a) => a.priority === "info" && !a.read).length, config: priorityConfig.info },
        ].map((item) => (
          <Card key={item.label} className={cn("border", item.config.border)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={cn("text-2xl font-bold", item.config.color)}>{item.count}</p>
              </div>
              {item.unread > 0 && (
                <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                  item.label === "Critical" ? "bg-red-500" : item.label === "Warning" ? "bg-amber-500" : "bg-blue-500"
                )}>{item.unread}</span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 p-1 glass rounded-lg">
          {["all", "unread", "critical"].map((f) => (
            <button key={f} onClick={() => setFilter(f as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}>{f}</button>
          ))}
        </div>
        <div className="flex items-center gap-1 p-1 glass rounded-lg">
          <button onClick={() => setTypeFilter(null)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              !typeFilter ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}>All Types</button>
          {["price", "compliance", "drift", "goal", "system"].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                typeFilter === t ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.map((alert) => {
            const Icon = alertTypeIcons[alert.type] || Info;
            const config = priorityConfig[alert.priority];
            return (
              <motion.div key={alert.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}>
                <Card className={cn("border-l-4 transition-all", config.border, !alert.read && "bg-white/[0.03]")}>
                  <div className="flex items-start gap-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                      <Icon className={cn("w-5 h-5", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={cn("font-semibold text-sm", !alert.read && "text-foreground")}>{alert.title}</p>
                        <Badge variant={config.badge}>{alert.priority}</Badge>
                        <Badge variant="outline" className="text-[10px] capitalize">{alert.type}</Badge>
                        {!alert.read && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />{alert.time}
                        </span>
                        {alert.action && (
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-primary gap-1" onClick={() => markAsRead(alert.id)}>
                            {alert.action} →
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!alert.read && (
                        <button onClick={() => markAsRead(alert.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                          aria-label="Mark as read">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => dismissAlert(alert.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        aria-label="Dismiss alert">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredAlerts.length === 0 && (
          <Card className="p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No alerts to show. All caught up!</p>
          </Card>
        )}
      </div>

      <Card className="border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-amber-400/80 leading-relaxed">
            <strong>Educational Disclaimer:</strong> Alerts are generated by rule-based algorithms and AI analysis. They are informational only and do not constitute financial advice.
          </p>
        </div>
      </Card>
    </div>
  );
}
