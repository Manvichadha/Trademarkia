"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "subtle";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
}

const baseClasses =
  "inline-flex items-center justify-center rounded-full font-medium outline-none disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base transition-colors";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-bg-base hover:bg-primary/90 shadow-lg",
  ghost:
    "border border-border-subtle bg-surface-2 text-text-secondary hover:border-primary hover:text-text-primary hover:bg-surface-3",
  subtle: "bg-surface-2 text-text-secondary hover:bg-surface-3",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        className ?? ""
      }`}
      {...props}
    >
      {leftIcon ? <span className="mr-2 flex items-center">{leftIcon}</span> : null}
      {children}
    </button>
  );
}

