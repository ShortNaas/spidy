import React from "react";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-white flex flex-col font-sans selection:bg-accent/20 selection:text-accent-bright">
      {children}
    </div>
  );
}
