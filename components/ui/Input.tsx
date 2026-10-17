"use client";

import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 font-sans">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-white/90">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-muted pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-subtle border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-faint outline-none transition-all duration-150 ${
              icon ? "pl-10" : ""
            } ${
              error
                ? "border-danger/50 bg-danger/10 focus:border-danger focus:ring-1 focus:ring-danger"
                : "border-border hover:border-border-hover focus:border-live focus:ring-1 focus:ring-live"
            } disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
        </div>

        {error ? (
          <p className="text-[12px] text-danger font-sans leading-none">{error}</p>
        ) : hint ? (
          <p className="text-[12px] text-muted font-sans leading-none">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
