"use client";

import React, { useMemo, useState } from "react";
import {
  sankey,
  sankeyLinkHorizontal,
  type SankeyNode as D3SankeyNode,
  type SankeyLink as D3SankeyLink,
} from "d3-sankey";
import type { SankeyData, SankeyLink } from "@/lib/queries";

export interface FlowSankeyProps {
  data?: SankeyData;
  loading?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

interface CustomNodeExtra {
  name: string;
  category: "referrer" | "landing" | "next";
}

interface CustomLinkExtra {
  value: number;
}

export function FlowSankey({
  data = { nodes: [], links: [] },
  loading = false,
  className = "",
  width = 680,
  height = 360,
}: FlowSankeyProps) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);

  const margin = { top: 24, right: 100, bottom: 20, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Compute Sankey layout with d3-sankey
  const layout = useMemo(() => {
    if (!data.nodes.length || !data.links.length) {
      return null;
    }

    try {
      // Clone nodes and links because d3-sankey mutates them
      const nodesCopy: Array<CustomNodeExtra> = data.nodes.map((n) => ({ ...n }));
      const linksCopy: Array<SankeyLink & CustomLinkExtra> = data.links.map((l) => ({ ...l }));

      const sankeyGenerator = sankey<CustomNodeExtra, CustomLinkExtra>()
        .nodeWidth(14)
        .nodePadding(18)
        .extent([
          [0, 0],
          [innerWidth, innerHeight],
        ]);

      return sankeyGenerator({
        nodes: nodesCopy,
        links: linksCopy,
      });
    } catch (e) {
      console.error("Sankey layout generation error:", e);
      return null;
    }
  }, [data, innerWidth, innerHeight]);

  if (loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800/80 p-6 min-h-[360px] animate-pulse ${className}`}
        aria-busy="true"
      >
        <div className="w-full flex justify-between px-12 mb-6">
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-4 w-28 bg-zinc-800 rounded" />
          <div className="h-4 w-24 bg-zinc-800 rounded" />
        </div>
        <div className="w-full h-48 bg-zinc-900/50 rounded-lg border border-zinc-800/40" />
        <span className="text-xs text-zinc-500 font-mono mt-4">Computing user journey pathways...</span>
      </div>
    );
  }

  if (!layout || layout.nodes.length === 0 || layout.links.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800/80 p-8 min-h-[360px] text-center ${className}`}
      >
        <span className="text-zinc-400 text-sm font-medium mb-1">User Journey Flow</span>
        <span className="text-zinc-600 text-xs">
          No multi-step visitor sessions detected in the selected time range.
        </span>
      </div>
    );
  }

  const pathGenerator = sankeyLinkHorizontal();

  return (
    <div
      className={`relative flex flex-col bg-zinc-950 rounded-xl border border-zinc-800/80 p-4 overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-200">Visitor Journey Flows</span>
          <span className="text-[11px] font-mono tabular-nums text-zinc-500">
            Referrer → Landing → Next Page
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/80 inline-block" /> Referrers
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500/80 inline-block" /> Landing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80 inline-block" /> Next Action
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[420px]"
          role="img"
          aria-label="Sankey diagram showing visitor transitions from referrers through landing pages to next pages"
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* Links */}
            {layout.links.map((link, idx) => {
              const sourceNode = link.source as D3SankeyNode<CustomNodeExtra, CustomLinkExtra>;
              const targetNode = link.target as D3SankeyNode<CustomNodeExtra, CustomLinkExtra>;
              const pathD =
                pathGenerator(link as D3SankeyLink<CustomNodeExtra, CustomLinkExtra>) || "";

              const sourceIndex = typeof link.source === "object" ? link.source.index : link.source;
              const targetIndex = typeof link.target === "object" ? link.target.index : link.target;

              const isHighlighted =
                hoveredLink === idx ||
                hoveredNode === sourceIndex ||
                hoveredNode === targetIndex;

              return (
                <path
                  key={`link-${idx}`}
                  d={pathD}
                  fill="none"
                  stroke={isHighlighted ? "#38bdf8" : "#334155"}
                  strokeWidth={Math.max(1.5, link.width || 1)}
                  strokeOpacity={isHighlighted ? 0.75 : hoveredNode !== null ? 0.1 : 0.35}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredLink(idx)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <title>
                    {`${sourceNode.name} → ${targetNode.name}: ${link.value} sessions`}
                  </title>
                </path>
              );
            })}

            {/* Nodes */}
            {layout.nodes.map((node, idx) => {
              const x0 = node.x0 ?? 0;
              const x1 = node.x1 ?? 0;
              const y0 = node.y0 ?? 0;
              const y1 = node.y1 ?? 0;
              const nodeHeight = Math.max(4, y1 - y0);

              const activeLink = hoveredLink !== null ? layout.links[hoveredLink] : null;
              const activeSrc = activeLink ? (typeof activeLink.source === "object" ? activeLink.source.index : activeLink.source) : null;
              const activeTgt = activeLink ? (typeof activeLink.target === "object" ? activeLink.target.index : activeLink.target) : null;

              const isHighlighted =
                hoveredNode === idx ||
                (hoveredLink !== null && (activeSrc === idx || activeTgt === idx));

              const nodeColor =
                node.category === "referrer"
                  ? "#06b6d4" // Cyan
                  : node.category === "landing"
                  ? "#6366f1" // Indigo
                  : "#10b981"; // Emerald

              const isLeftAligned = x0 < innerWidth / 2;

              return (
                <g
                  key={`node-${idx}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode(idx)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <rect
                    x={x0}
                    y={y0}
                    width={x1 - x0}
                    height={nodeHeight}
                    fill={nodeColor}
                    fillOpacity={isHighlighted ? 1 : 0.8}
                    rx={2}
                    className="transition-all duration-200"
                  />
                  <text
                    x={isLeftAligned ? x0 - 8 : x1 + 8}
                    y={(y0 + y1) / 2}
                    dy="0.35em"
                    textAnchor={isLeftAligned ? "end" : "start"}
                    fontSize={11}
                    fontFamily="monospace"
                    fill={isHighlighted ? "#f8fafc" : "#94a3b8"}
                    className="select-none pointer-events-none transition-colors duration-200"
                  >
                    {node.name.length > 18 ? `${node.name.slice(0, 16)}…` : node.name}
                  </text>
                  <title>{`${node.name} (${node.value} sessions)`}</title>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}

export default FlowSankey;
