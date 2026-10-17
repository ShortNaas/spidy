import React from "react";
import Link from "next/link";

export interface WordmarkProps {
  href?: string;
  className?: string;
}

/**
 * Spidy v3 Wordmark: text only "SPIDY", Poppins 600, 18px, tracking-[0.12em], white, no icon.
 */
export function Wordmark({ href = "/", className = "" }: WordmarkProps) {
  const content = (
    <span
      className={`font-sans font-semibold text-[18px] tracking-[0.12em] text-white uppercase select-none ${className}`}
    >
      SPIDY
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-canvas rounded-sm">
        {content}
      </Link>
    );
  }

  return content;
}
