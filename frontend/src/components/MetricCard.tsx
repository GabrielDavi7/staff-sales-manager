import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = "bg-neutral-100",
  iconTextColor = "text-neutral-600",
  className = "",
}: MetricCardProps) {
  return (
    <div
      className={`bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex items-start justify-between ${className}`}
    >
      <div>
        <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-3xl font-serif text-neutral-900 mt-2">{value}</p>
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
        )}
      </div>
      {icon && (
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgColor} ${iconTextColor}`}
        >
          {icon}
        </div>
      )}
    </div>
  );
}
