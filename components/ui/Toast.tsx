"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export interface ToastProps {
  message: string;
  isOpen: boolean;
  onDismiss: () => void;
  duration?: number;
}

const emptySubscribe = () => () => {};

/**
 * Toast pill per DESIGN.md:
 * - Pill at bottom center
 * - Raised background
 * - Hairline border
 * - White text, 13px font-sans
 * - 8px ring-dot on the left
 * - Auto-dismiss after 2s
 * - role="status", aria-live="polite"
 */
export function Toast({ message, isOpen, onDismiss, duration = 2000 }: ToastProps) {
  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, onDismiss, duration]);

  if (!isClient || !isOpen) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto bg-raised border border-border text-white text-[13px] font-sans font-medium rounded-full px-4 py-2 flex items-center gap-2.5 shadow-xl transition-all duration-150 animate-in fade-in"
    >
      <span
        className="w-2 h-2 rounded-full border border-white/60 bg-transparent shrink-0"
        aria-hidden="true"
      />
      <span>{message}</span>
    </div>,
    document.body
  );
}
