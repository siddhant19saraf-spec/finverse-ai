"use client";
import dynamic from "next/dynamic";
import { CardSpinner } from "@/components/ui/loading";

export const DynamicAreaChart = dynamic(
  () => import("recharts").then((mod: any) => mod.AreaChart),
  { ssr: false, loading: () => <CardSpinner /> }
);
export const DynamicArea = dynamic(
  () => import("recharts").then((mod: any) => mod.Area),
  { ssr: false }
);
export const DynamicPieChart = dynamic(
  () => import("recharts").then((mod: any) => mod.PieChart),
  { ssr: false, loading: () => <CardSpinner /> }
);
export const DynamicPie = dynamic(
  () => import("recharts").then((mod: any) => mod.Pie),
  { ssr: false }
);
export const DynamicBarChart = dynamic(
  () => import("recharts").then((mod: any) => mod.BarChart),
  { ssr: false, loading: () => <CardSpinner /> }
);
export const DynamicBar = dynamic(
  () => import("recharts").then((mod: any) => mod.Bar),
  { ssr: false }
);
export const DynamicCell = dynamic(
  () => import("recharts").then((mod: any) => mod.Cell),
  { ssr: false }
);
export const DynamicXAxis = dynamic(
  () => import("recharts").then((mod: any) => mod.XAxis),
  { ssr: false }
);
export const DynamicYAxis = dynamic(
  () => import("recharts").then((mod: any) => mod.YAxis),
  { ssr: false }
);
export const DynamicTooltip = dynamic(
  () => import("recharts").then((mod: any) => mod.Tooltip),
  { ssr: false }
);
export const DynamicResponsiveContainer = dynamic(
  () => import("recharts").then((mod: any) => mod.ResponsiveContainer),
  { ssr: false }
);
export const DynamicLegend = dynamic(
  () => import("recharts").then((mod: any) => mod.Legend),
  { ssr: false }
);
