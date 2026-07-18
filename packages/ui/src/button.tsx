import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost";
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition";
  const styles =
    variant === "primary"
      ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
      : "bg-transparent text-slate-200 hover:bg-slate-800";
  return (
    <button className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}
