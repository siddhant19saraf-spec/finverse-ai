"use client";
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, IndianRupee, TrendingDown, Calendar, Percent, Info, ArrowRight, PieChart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart as RePieChart, Pie, Cell,
} from "recharts";

function calculateEMI(principal: number, annualRate: number, months: number) {
  const r = annualRate / 100 / 12;
  if (r === 0) return { emi: principal / months, totalPayment: principal, totalInterest: 0 };
  const emi = principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;
  return { emi, totalPayment, totalInterest };
}

function generateAmortization(principal: number, annualRate: number, months: number, prepayment: number) {
  const r = annualRate / 100 / 12;
  const emi = principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
  const schedule: any[] = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPrincipalPaid = 0;

  for (let m = 1; m <= months && balance > 0; m++) {
    const interestPayment = balance * r;
    let principalPayment = emi - interestPayment;
    let extraPrincipal = 0;

    if (prepayment > 0 && m > 1) {
      extraPrincipal = Math.min(prepayment, balance - principalPayment);
    }

    principalPayment += extraPrincipal;
    principalPayment = Math.min(principalPayment, balance);
    balance -= principalPayment;
    totalInterest += interestPayment;
    totalPrincipalPaid += principalPayment;

    if (m % 12 === 1 || m === months) {
      schedule.push({
        month: m,
        year: Math.ceil(m / 12),
        emi: Math.round(emi + extraPrincipal),
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        balance: Math.round(Math.max(balance, 0)),
        totalInterest: Math.round(totalInterest),
      });
    }
  }

  return { schedule, emi: Math.round(emi), totalInterest: Math.round(totalInterest), totalPayment: Math.round(totalInterest + principal) };
}

const COLORS = ["#3B82F6", "#EF4444"];

export default function EMICalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [prepayment, setPrepayment] = useState(0);

  const tenureMonths = tenure * 12;

  const withPrepayment = useMemo(
    () => generateAmortization(loanAmount, interestRate, tenureMonths, prepayment),
    [loanAmount, interestRate, tenureMonths, prepayment]
  );
  const withoutPrepayment = useMemo(
    () => generateAmortization(loanAmount, interestRate, tenureMonths, 0),
    [loanAmount, interestRate, tenureMonths]
  );

  const interestSaved = withoutPrepayment.totalInterest - withPrepayment.totalInterest;
  const timeSaved = withoutPrepayment.schedule.length - withPrepayment.schedule.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">EMI Calculator</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Home, Car, Personal Loan — with amortization and prepayment analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Loan Details</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-muted-foreground">Loan Amount</label>
                  <span className="text-sm font-semibold">{formatCurrency(loanAmount)}</span>
                </div>
                <input type="range" min={100000} max={100000000} step={100000} value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-primary" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>₹1L</span><span>₹10Cr</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-muted-foreground">Interest Rate</label>
                  <span className="text-sm font-semibold">{interestRate}%</span>
                </div>
                <input type="range" min={4} max={24} step={0.25} value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-primary" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>4%</span><span>24%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-muted-foreground">Tenure</label>
                  <span className="text-sm font-semibold">{tenure} years ({tenureMonths} months)</span>
                </div>
                <input type="range" min={1} max={30} step={1} value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-primary" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>1 year</span><span>30 years</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm text-muted-foreground">Monthly Prepayment</label>
                  <span className="text-sm font-semibold">{formatCurrency(prepayment)}</span>
                </div>
                <input type="range" min={0} max={500000} step={1000} value={prepayment}
                  onChange={(e) => setPrepayment(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-emerald-400" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>None</span><span>₹5L/mo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Monthly EMI", value: `₹${withPrepayment.emi.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-blue-400" },
              { label: "Total Interest", value: formatCurrency(withPrepayment.totalInterest), icon: Percent, color: "text-red-400" },
              { label: "Total Payment", value: formatCurrency(withPrepayment.totalPayment), icon: Calculator, color: "text-purple-400" },
              { label: "Interest Saved", value: prepayment > 0 ? formatCurrency(interestSaved) : "—", icon: TrendingDown, color: "text-emerald-400" },
            ].map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                <Card>
                  <m.icon className={`w-4 h-4 ${m.color} mb-1`} />
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-lg font-bold mt-0.5">{m.value}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Prepayment Impact */}
          {prepayment > 0 && (
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-400">Prepayment saves you {formatCurrency(interestSaved)} in interest!</p>
                  <p className="text-xs text-emerald-400/70">Loan tenure reduced by ~{Math.round(timeSaved / 12)} years · Extra ₹{prepayment.toLocaleString("en-IN")}/month</p>
                </div>
              </div>
            </Card>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amortization Chart */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Balance Over Time</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={withPrepayment.schedule}>
                      <defs>
                        <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }}
                        label={{ value: "Year", position: "insideBottom", offset: -5, fill: "#71717a", fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 10 }}
                        tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                      <Tooltip content={({ active, payload }: any) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="glass-card p-2 rounded-lg text-xs">
                            <p className="font-medium">Year {payload[0]?.payload?.year}</p>
                            <p className="text-blue-400">Balance: {formatCurrency(payload[0]?.value)}</p>
                          </div>
                        );
                      }} />
                      <Area type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={2} fill="url(#balGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Principal vs Interest</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[220px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={[
                          { name: "Principal", value: loanAmount },
                          { name: "Interest", value: withPrepayment.totalInterest },
                        ]}
                        cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                        paddingAngle={3} dataKey="value"
                      >
                        {[loanAmount, withPrepayment.totalInterest].map((_, i) => (
                          <Cell key={i} fill={COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => formatCurrency(v)} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-2 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />Principal ({((loanAmount / withPrepayment.totalPayment) * 100).toFixed(0)}%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Interest ({((withPrepayment.totalInterest / withPrepayment.totalPayment) * 100).toFixed(0)}%)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Amortization Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Amortization Schedule</CardTitle>
                <Badge variant="outline">{withPrepayment.schedule.length} yearly entries</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground border-b border-white/5">
                      <th className="text-left py-2 font-medium">Year</th>
                      <th className="text-right py-2 font-medium">EMI</th>
                      <th className="text-right py-2 font-medium">Principal</th>
                      <th className="text-right py-2 font-medium">Interest</th>
                      <th className="text-right py-2 font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withPrepayment.schedule.slice(0, 15).map((row: any) => (
                      <tr key={row.month} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="py-2 font-medium">{row.year}</td>
                        <td className="text-right font-mono">₹{row.emi.toLocaleString("en-IN")}</td>
                        <td className="text-right font-mono text-blue-400">₹{row.principal.toLocaleString("en-IN")}</td>
                        <td className="text-right font-mono text-red-400">₹{row.interest.toLocaleString("en-IN")}</td>
                        <td className="text-right font-mono">{formatCurrency(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-400/80 space-y-1">
                <p><strong>Educational Disclaimer:</strong> EMI calculations are based on the reducing balance method. Actual EMIs may vary based on processing fees, insurance, and other charges.</p>
                <p>• Interest rate shown is indicative — check with your lender for actual rates</p>
                <p>• Prepayment charges may apply (typically 2-3% for floating rate loans)</p>
                <p>• Tax benefits on home loans: up to ₹2L (Section 24) + ₹1.5L (Section 80C)</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
