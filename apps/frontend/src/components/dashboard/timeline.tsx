"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Clock, Radio } from "lucide-react";

interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  color: string;
  current?: boolean;
}

const events: TimelineEvent[] = [
  {
    time: "09:15",
    title: "Market Open",
    description: "NIFTY opened at 24,480",
    color: "bg-primary",
  },
  {
    time: "09:30",
    title: "Portfolio Update",
    description: "Holdings refreshed with latest prices",
    color: "bg-primary",
  },
  {
    time: "10:00",
    title: "Risk Analysis",
    description: "Risk score stable at 72/100",
    color: "bg-emerald-500",
  },
  {
    time: "11:30",
    title: "Goal Analysis",
    description: "Retirement goal on track at 91%",
    color: "bg-purple-500",
  },
  {
    time: "13:00",
    title: "AI Recommendation",
    description: "Increase SIP by ₹2,000",
    color: "bg-amber-500",
  },
  {
    time: "14:00",
    title: "News Analysis",
    description: "8 news items processed, sentiment positive",
    color: "bg-primary",
  },
  {
    time: "15:00",
    title: "Compliance Check",
    description: "All SEBI/RBI rules passed",
    color: "bg-emerald-500",
  },
  {
    time: "15:30",
    title: "Daily Summary",
    description: "Portfolio +0.82%, AI Confidence 96%",
    color: "bg-emerald-500",
    current: true,
  },
];

export function DecisionTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white/[0.02] border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            AI Decision Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />

            <div className="space-y-1">
              {events.map((event, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="relative flex items-start gap-3 group"
                >
                  {/* Dot */}
                  <div className="relative z-10 mt-1 shrink-0">
                    <div
                      className={cn(
                        "h-[14px] w-[14px] rounded-full border-2 border-black/40",
                        event.color,
                        event.current && "animate-ping"
                      )}
                      style={event.current ? { animationDuration: "2s" } : undefined}
                    />
                    {event.current && (
                      <div
                        className={cn(
                          "absolute inset-0 h-[14px] w-[14px] rounded-full",
                          event.color,
                          "opacity-40 animate-ping"
                        )}
                        style={{ animationDuration: "2s" }}
                      />
                    )}
                  </div>

                  {/* Card */}
                  <div
                    className={cn(
                      "flex-1 rounded-lg border p-2 mb-1 transition-colors",
                      event.current
                        ? "border-primary/20 bg-primary/5"
                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium">{event.title}</span>
                      <div className="flex items-center gap-1">
                        {event.current && (
                          <Radio className="h-2.5 w-2.5 text-primary animate-pulse" />
                        )}
                        <span className="text-[9px] text-muted-foreground font-mono">
                          {event.time}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
