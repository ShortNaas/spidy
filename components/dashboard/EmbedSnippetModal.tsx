"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

export interface EmbedSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  triggerRef?: React.RefObject<HTMLElement | null>;
  onCopied?: () => void;
}

const emptySubscribe = () => () => {};

/**
 * Centered Embed Snippet Modal Overlay per DESIGN.md & Impeccable polish:
 * - Rendered in a portal to document.body
 * - Centered overlay with bg-canvas/70 backdrop-blur-sm
 * - max-h-[calc(100dvh-2rem)] overflow-y-auto w-full max-w-lg
 * - 32px radius (rounded-4xl), Surface background, hairline border, .sheen
 * - Snippet in Raised block with mono text
 * - Wordmark-free header with title in Poppins 500
 * - Focus trapped, focus returned on close, focus to Copy snippet on open
 * - Backdrop click & Escape close
 * - "Copy snippet" writes to clipboard, shows Toast "Snippet copied", and closes box
 * - Fallback with select and inline error "Press Ctrl/Cmd+C to copy" if clipboard fails
 * - No "Done" button!
 */
export function EmbedSnippetModal({
  isOpen,
  onClose,
  siteId,
  triggerRef,
  onCopied,
}: EmbedSnippetModalProps) {
  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [toastVisible, setToastVisible] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const copyBtnRef = useRef<HTMLButtonElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleClose = React.useCallback(() => {
    setCopyError(null);
    onClose();
  }, [onClose]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const embedSnippet = `<script defer src="${origin}/a.js" data-site="${siteId}"></script>`;

  // Focus trap, initial focus, and return focus
  useEffect(() => {
    if (!isOpen) return;

    const triggerNode = triggerRef?.current;

    // Capture currently focused element before opening
    if (document.activeElement instanceof HTMLElement) {
      previousFocusRef.current = document.activeElement;
    }

    // Initial focus on "Copy snippet" button
    const focusTimer = setTimeout(() => {
      copyBtnRef.current?.focus();
    }, 20);

    // Trap focus inside modal
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        handleClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);

      // Return focus on close
      const returnTarget = triggerNode || previousFocusRef.current;
      if (returnTarget && typeof returnTarget.focus === "function") {
        returnTarget.focus();
      }
    };
  }, [isOpen, triggerRef, handleClose]);

  async function handleCopy() {
    let copied = false;

    // Path 1: navigator.clipboard.writeText
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(embedSnippet);
        copied = true;
      } catch {
        copied = false;
      }
    }

    // Path 2: document.execCommand fallback
    if (!copied && typeof document !== "undefined") {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = embedSnippet;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        textarea.style.pointerEvents = "none";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        copied = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      setCopyError(null);
      setToastVisible(true);
      onCopied?.();
      onClose();
    } else {
      // Keep box open, select snippet text, and show inline error
      setCopyError("Press Ctrl/Cmd+C to copy");
      if (codeRef.current) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(codeRef.current);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }

  if (!isClient) return null;

  return (
    <>
      {/* Toast notification rendered in portal */}
      <Toast
        message="Snippet copied"
        isOpen={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />

      {isOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="embed-snippet-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleClose();
              }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/70 backdrop-blur-sm"
          >
            <div
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto bg-surface border border-border rounded-4xl p-6 sm:p-7 sheen shadow-2xl space-y-5 text-left transition-all duration-150 animate-in fade-in"
            >
              {/* Header: Wordmark-free, title in Poppins 500 */}
              <div className="flex items-center justify-between gap-4">
                <h3
                  id="embed-snippet-title"
                  className="font-sans font-medium text-[16px] text-white"
                >
                  Embed Analytics Tracker
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-raised border border-border text-muted hover:text-white flex items-center justify-center cursor-pointer transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-canvas shrink-0"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Explanatory text */}
              <p className="text-[13px] text-muted leading-relaxed font-sans">
                Add this lightweight script tag (&lt;1 KB) to your website&apos;s &lt;head&gt; or before &lt;/body&gt;. Zero cookies, no device fingerprints, raw IPs never stored.
              </p>

              {/* Snippet in Raised block with mono text */}
              <div className="bg-raised border border-border rounded-xl p-3.5 font-mono text-[12px] text-white break-all select-all leading-relaxed">
                <code ref={codeRef} data-testid="embed-snippet">
                  {embedSnippet}
                </code>
              </div>

              {/* Inline error if copy failed */}
              {copyError && (
                <p role="alert" className="text-[12px] font-sans text-danger">
                  {copyError}
                </p>
              )}

              {/* Actions footer: Copy snippet only, no Done button */}
              <div className="flex justify-end pt-2">
                <Button
                  ref={copyBtnRef}
                  variant="primary"
                  onClick={handleCopy}
                  className="cursor-pointer"
                >
                  Copy snippet
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
