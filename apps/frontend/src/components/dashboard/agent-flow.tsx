"use client";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Briefcase,
  Shield,
  Brain,
  Scale,
  Sparkles,
  ArrowDown,
} from "lucide-react";

const agents = [
  { icon: TrendingUp, label: "Market Intelligence", color: "from-blue-500 to-cyan-400", status: "active" as const },
  { icon: Briefcase, label: "Portfolio Analysis", color: "from-emerald-500 to-teal-400", status: "active" as const },
  { icon: Shield, label: "Risk Guardian", color: "from-amber-500 to-orange-400", status: "active" as const },
  { icon: Brain, label: "Digital Twin", color: "from-purple-500 to-pink-400", status: "active" as const },
  { icon: Scale, label: "Compliance", color: "from-cyan-500 to-blue-400", status: "active" as const },
  { icon: Sparkles, label: "Explainability", color: "from-primary to-blue-400", status: "active" as const },
];

export function AgentFlow() {
  return (
    <div className="flex flex-col items-center gap-0 py-4">
      {agents.map((agent, i) => (
        <motion.div
          key={agent.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.12, duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl glass-card hover:border-white/15 transition-all duration-300 group w-full max-w-[260px]">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              <agent.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{agent.label}</span>
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          {i < agents.length - 1 && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: i * 0.12 + 0.1 }}
            >
              <ArrowDown className="w-4 h-4 text-primary/30 my-0.5" />
            </motion.div>
          )}
        </motion.div>
      ))}

      {/* Final output */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: agents.length * 0.12 + 0.2 }}
        className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 text-center"
      >
        <p className="text-xs font-semibold text-primary uppercase tracking-wider">Final Recommendation</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Educational decision support with full transparency</p>
      </motion.div>
    </div>
  );
}
