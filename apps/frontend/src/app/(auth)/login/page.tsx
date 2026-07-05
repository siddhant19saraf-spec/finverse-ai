"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/stores/app";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setUserId = useAppStore((s) => s.setUserId);
  const setDemoMode = useAppStore((s) => s.setDemoMode);
  const setDemoBannerVisible = useAppStore((s) => s.setDemoBannerVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user_id) setUserId(data.user_id);
        document.cookie = "finverse_user_id=1; path=/; max-age=86400";
        router.push("/dashboard");
      } else {
        setError("Invalid email or password. Try Demo Mode instead.");
      }
    } catch {
      setUserId(1);
      document.cookie = "finverse_user_id=1; path=/; max-age=86400";
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setUserId(1);
    setDemoMode(true);
    setDemoBannerVisible(true);
    document.cookie = "finverse_user_id=1; path=/; max-age=86400";
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6" aria-label="FINVERSE AI home">
            <Image
              src="/brand/logo-icon.png"
              alt="FinVerse AI Logo"
              width={40}
              height={40}
              className="rounded-xl"
              priority
            />
            <span className="text-xl font-bold text-gradient">FINVERSE AI</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your wealth operating system</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex items-center justify-between text-sm">
              <label htmlFor="remember" className="flex items-center gap-2 cursor-pointer">
                <input
                  id="remember"
                  type="checkbox"
                  className="rounded border-white/20 bg-white/5 w-4 h-4"
                />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <span className="text-primary text-sm opacity-50 cursor-not-allowed">Forgot password?</span>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-4">
            <Button type="button" variant="glass" className="w-full" size="lg" onClick={handleDemo}>
              <Zap className="w-4 h-4 mr-2" /> Enter Demo Mode
            </Button>
          </div>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            {["Google", "GitHub", "Passkey"].map((provider) => (
              <Button key={provider} variant="outline" className="text-sm" type="button" onClick={handleDemo}>
                {provider}
              </Button>
            ))}
          </div>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:text-primary/80 transition-colors">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
