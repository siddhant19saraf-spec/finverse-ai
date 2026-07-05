"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  TrendingUp,
  Shield,
  Target,
  Scale,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface ThinkingStep {
  label: string;
  icon: typeof Brain;
  color: string;
  duration: number;
}

const defaultSteps: ThinkingStep[] = [
  { label: "Reading Portfolio...", icon: TrendingUp, color: "text-blue-400", duration: 600 },
  { label: "Analyzing Market...", icon: Brain, color: "text-cyan-400", duration: 500 },
  { label: "Running Digital Twin...", icon: Target, color: "text-purple-400", duration: 700 },
  { label: "Checking Risk...", icon: Shield, color: "text-amber-400", duration: 400 },
  { label: "Verifying Compliance...", icon: Scale, color: "text-emerald-400", duration: 300 },
  { label: "Generating Insight...", icon: Sparkles, color: "text-primary", duration: 500 },
];

interface AIThinkingExperienceProps {
  steps?: ThinkingStep[];
  onComplete?: () => void;
  active?: boolean;
}

export function AIThinkingExperience({
  steps = defaultSteps,
  onComplete,
  active = true,
}: AIThinkingExperienceProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!active) return;
    setCurrentStep(0);
    let step = 0;
    const runStep = () => {
      if (step >= steps.length) {
        setCompleted(true);
        onComplete?.();
        return;
      }
      setCurrentStep(step);
      setTimeout(() => {
        step++;
        runStep();
      }, steps[step].duration);
    };
    runStep();
  }, [active, steps, onComplete]);

  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center gap-3 py-6"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary"
        />
        <Brain className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="space-y-1.5 text-center">
        <AnimatePresence mode="wait">
          {!completed ? (
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm text-muted-foreground"
            >
              {currentStep >= 0 && currentStep < steps.length && (
                <>
                  <span className={`inline-block mr-1.5 ${steps[currentStep].color}`}>
                    {React.createElement(steps[currentStep].icon, { className: "w-3.5 h-3.5 inline" })}
                  </span>
                  {steps[currentStep].label}
                </>
              )}
            </motion.p>
          ) : (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm text-emerald-400 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Analysis Complete
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Step dots */}
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              i < currentStep
                ? "bg-primary"
                : i === currentStep
                ? "bg-primary animate-pulse"
                : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
