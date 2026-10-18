"use client";

import React, { useEffect, forwardRef } from "react";
import Link from "next/link";

let mountedAccentCount = 0;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "secondary" | "ghost" | "danger" | "icon";
  size?: "sm" | "md" | "lg";
  href?: string;
  target?: string;
  rel?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className = "",
      disabled,
      children,
      href,
      target,
      rel,
      ...props
    },
    ref
  ) => {
    // The One Hot Thing Rule dev warning
    useEffect(() => {
      if (variant === "accent" && process.env.NODE_ENV !== "production") {
        mountedAccentCount++;
        // Allow up to 2 accent buttons when placed in non-competing viewports (e.g. Hero top vs Closing bottom)
        if (mountedAccentCount > 2) {
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
      "inline-flex items-center justify-center font-sans font-medium rounded-full transition-all duration-150 outline-none select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none";

    let variantClasses = "";
    if (variant === "primary") {
      variantClasses = "bg-white text-canvas hover:bg-white/90 shadow-xs";
    } else if (variant === "accent") {
      variantClasses = "bg-accent text-canvas hover:bg-accent-bright shadow-[0_0_28px_rgba(251,92,52,0.28)]";
    } else if (variant === "secondary") {
      variantClasses = "bg-raised border border-border text-white hover:border-border-hover hover:bg-subtle";
    } else if (variant === "ghost") {
      variantClasses = "bg-transparent text-muted hover:text-white hover:bg-white/5";
    } else if (variant === "danger") {
      variantClasses = "bg-transparent text-muted hover:text-danger hover:bg-danger/10";
    } else if (variant === "icon") {
      variantClasses = "w-10 h-10 rounded-full bg-raised border border-border text-text hover:border-border-hover hover:text-white p-0 shrink-0";
    }

    let sizeClasses = "px-5 py-2.5 text-[13px]";
    if (variant === "icon") {
      sizeClasses = "text-[13px]";
    } else if (size === "sm") {
      sizeClasses = "px-3 py-1 text-[12px]";
    } else if (size === "lg") {
      sizeClasses = "px-6 py-3 text-[14px]";
    }

    const disabledClasses = disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "";
    const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`.trim();

    if (href) {
      return (
        <Link
          href={href}
          target={target}
          rel={rel}
          className={combinedClasses}
          aria-disabled={disabled ? "true" : undefined}
          tabIndex={disabled ? -1 : undefined}
          title={props.title}
          aria-label={props["aria-label"]}
          onClick={(e) => {
            if (disabled) {
              e.preventDefault();
              return;
            }
            if (props.onClick) {
              (props.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>)(e);
            }
          }}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={combinedClasses}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
