"use client";
import React from "react";
import Image from "next/image";

export function AppBackground() {
  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      {/* Base background image */}
      <Image
        src="/images/backgrounds/finverse-bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={85}
        className="object-cover"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Dark overlay — 55% for WCAG AA text contrast */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(5, 8, 22, 0.55)" }}
      />

      {/* Animated blue glow — top-left */}
      <div className="absolute top-[-15%] left-[5%] w-[600px] h-[600px] rounded-full blur-[160px] animate-glow-pulse pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)" }}
      />

      {/* Animated cyan glow — bottom-right */}
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full blur-[140px] animate-glow-pulse pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0, 229, 255, 0.06) 0%, transparent 70%)", animationDelay: "5s" }}
      />

      {/* Animated purple glow — center */}
      <div className="absolute top-[40%] left-[45%] w-[400px] h-[400px] rounded-full blur-[120px] animate-glow-pulse pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124, 58, 237, 0.05) 0%, transparent 70%)", animationDelay: "12s" }}
      />

      {/* Floating particles overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ["rgba(0, 229, 255, 0.4)", "rgba(37, 99, 235, 0.3)", "rgba(124, 58, 237, 0.3)", "rgba(16, 185, 129, 0.25)"][i % 4],
              animationDuration: `${20 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 15}s`,
              boxShadow: `0 0 ${4 + Math.random() * 6}px ${["rgba(0, 229, 255, 0.3)", "rgba(37, 99, 235, 0.2)", "rgba(124, 58, 237, 0.2)", "rgba(16, 185, 129, 0.2)"][i % 4]}`,
            }}
          />
        ))}
      </div>

      {/* Subtle noise texture for depth */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />
    </div>
  );
}
