"use client";

import { TrendingUp, TrendingDown, AlertCircle, Users, Star } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  foot?: string;
  delta?: string;
  icon?: React.ElementType;
  variant?: "default" | "negative" | "neutral";
}

export function KpiCard({
  label,
  value,
  foot,
  delta,
  icon: Icon,
  variant = "default",
}: KpiCardProps) {
  const getIcon = () => {
    if (!Icon) return null;
    if (variant === "negative") return <AlertCircle size={20} strokeWidth={2} />;
    if (variant === "neutral") return <Users size={20} strokeWidth={2} />;
    return <Icon size={20} strokeWidth={2} />;
  };

  const badge = delta ? (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
        delta.startsWith("-") || delta.startsWith("+")
          ? "bg-red-50 border-red-100 text-red-700"
          : "bg-green-50 border-green-100 text-green-700"
      }`}
    >
      {delta}
    </span>
  ) : null;

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-xs font-semibold text-muted-foreground">{label}</p>
        {badge}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        {getIcon()}
      </div>
      {foot && <p className="text-xs text-muted-foreground mt-1">{foot}</p>}
    </div>
  );
}
