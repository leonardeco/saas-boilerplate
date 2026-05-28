import * as React from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger";

const variants: Record<BadgeVariant, string> = {
  default: "bg-blue-50 text-blue-700",
  success: "bg-green-50 text-green-700",
  warning: "bg-yellow-50 text-yellow-700",
  danger: "bg-red-50 text-red-700",
};

export function Badge({
  variant = "default",
  children,
}: {
  variant?: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}
