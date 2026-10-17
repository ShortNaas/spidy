"use client";

import React, { useEffect, forwardRef } from "react";

let mountedAccentCount = 0;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "secondary" | "ghost" | "danger" | "icon";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // The One Hot Thing Rule dev warning
    useEffect(() => {
      if (variant === "accent" && process.env.NODE_ENV !== "production") {
        mountedAccentCount++;
        if (mountedAccentCount > 1) {
          console.warn(
            `[Spidy Design System Rule] The One Hot Thing Rule violated: ${mountedAccentCount} accent Buttons mounted simultaneously. At most one solid-orange filled element should compete per viewport.`
          );
        }
        return () => {
          mountedAccentCount--;
        };
      }
    }, [variant]);

    const baseClasses =
      "inline-flex items-center justify-center font-sans font-medium text-[13px] rounded-full transition-all duration-150 outline-none select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-live focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none";

    let variantClasses = "";
    if (variant === "primary") {
      variantClasses = "bg-white text-[#050505] hover:bg-white/90 shadow-xs";
    } else if (variant === "accent") {
      variantClasses = "bg-accent text-[#050505] hover:bg-accent-bright shadow-[0_0_28px_rgba(251,92,52,0.28)]";
    } else if (variant === "secondary") {
      variantClasses = "bg-raised border border-border text-white hover:border-border-hover hover:bg-[#1a1a1a]";
    } else if (variant === "ghost") {
      variantClasses = "bg-transparent text-muted hover:text-white hover:bg-white/5";
    } else if (variant === "danger") {
      variantClasses = "bg-transparent text-muted hover:text-danger hover:bg-danger/10";
    } else if (variant === "icon") {
      variantClasses = "w-10 h-10 rounded-full bg-raised border border-border text-text hover:border-border-hover hover:text-white p-0 shrink-0";
    }

    let sizeClasses = "px-5 py-2.5";
    if (variant === "icon") {
      sizeClasses = "";
    } else if (size === "sm") {
      sizeClasses = "px-3.5 py-1.5 text-[12px]";
    } else if (size === "lg") {
      sizeClasses = "px-6 py-3 text-[14px]";
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
