"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  size = "md",
}: TabsProps) {
  const padClass = size === "sm" ? "px-3 py-1 text-[12px]" : "px-4 py-1.5 text-[13px]";

  return (
    <div
      role="tablist"
      className={`inline-flex items-center p-1 bg-subtle border border-border rounded-full gap-1 select-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-full font-sans font-medium transition-all duration-150 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-live focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${padClass} ${
              isActive
                ? "bg-white text-canvas font-semibold shadow-xs"
                : "text-muted hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
