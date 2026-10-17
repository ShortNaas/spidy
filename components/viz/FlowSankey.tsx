"use client";

import React, { useMemo, useState } from "react";
import {
  sankey,
  sankeyLinkHorizontal,
  type SankeyNode as D3SankeyNode,
  type SankeyLink as D3SankeyLink,
} from "d3-sankey";
import type { SankeyData, SankeyLink } from "@/lib/queries";
import { Tooltip } from "@/components/ui/Tooltip";
import { Skeleton } from "@/components/ui/Skeleton";
import { tokens, sankeyColors } from "@/lib/theme";

export interface FlowSankeyProps {
  data?: SankeyData;
  loading?: boolean;
  className?: string;
  width?: number;
  height?: number;
  embedded?: boolean;
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
  embedded = false,
}: FlowSankeyProps) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{
    label: string;
    value: string;
    subtext?: string;
    x: number;
    y: number;
  } | null>(null);

  const margin = { top: 28, right: 110, bottom: 20, left: 110 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Compute Sankey layout with d3-sankey
  const layout = useMemo(() => {
    if (!data.nodes.length || !data.links.length) {
      return null;
    }

    try {
      const nodesCopy: Array<CustomNodeExtra> = data.nodes.map((n) => ({ ...n }));
      const linksCopy: Array<SankeyLink & CustomLinkExtra> = data.links.map((l) => ({ ...l }));

      const sankeyGenerator = sankey<CustomNodeExtra, CustomLinkExtra>()
        .nodeWidth(16)
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
        className={`flex flex-col items-center justify-center min-h-[360px] ${
          embedded ? "w-full" : "bg-surface border border-border rounded-3xl p-6 sheen"
        } ${className}`}
        aria-busy="true"
        aria-label="Loading visitor flows"
      >
        <div className="w-full flex justify-between px-12 mb-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="w-full h-52 rounded-2xl" />
        <span className="text-xs text-muted font-mono mt-4">
          Computing user journey pathways...
        </span>
      </div>
    );
  }

  if (!layout || layout.nodes.length === 0 || layout.links.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-surface border border-border rounded-3xl p-8 min-h-[360px] text-center sheen ${className}`}
      >
        <span className="text-white text-sm font-medium mb-1">User Journey Flow</span>
        <span className="text-muted text-xs">
          No multi-step visitor sessions detected in the selected time range.
        </span>
      </div>
    );
  }

  const pathGenerator = sankeyLinkHorizontal();

  // Category color mapping per DESIGN.md:
  function getNodeCategoryColor(category: "referrer" | "landing" | "next"): string {
    if (category === "referrer") return sankeyColors.referrer;
    if (category === "landing") return sankeyColors.landing;
    return sankeyColors.next;
  }

  return (
    <div
      className={
        embedded
          ? `relative flex flex-col w-full ${className}`
          : `relative flex flex-col bg-surface border border-border rounded-3xl p-6 sheen overflow-hidden ${className}`
      }
      role="region"
      aria-label="Visitor transition pathways sankey flow"
    >
      <div className={`flex flex-wrap items-center ${embedded ? "justify-end" : "justify-between"} gap-3 mb-3`}>
        {!embedded && (
          <div className="flex items-center gap-2">
            <span className="font-sans text-[13px] font-medium text-white">Journey Transitions</span>
            <span className="font-mono text-[11px] tabular-nums text-muted">
              Referrer → Landing → Next Page
            </span>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" /> Referrers
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" /> Landing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-positive inline-block" /> Next Action
          </span>
        </div>
      </div>

      {/* Accessible summary */}
      <div className="sr-only">
        Sankey diagram displaying {layout.nodes.length} stages and {layout.links.length} transition pathways connecting incoming referrers, landing pages, and subsequent pages.
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
                hoveredLink === idx || hoveredNode === sourceIndex || hoveredNode === targetIndex;
              const isDimmed = (hoveredNode !== null || hoveredLink !== null) && !isHighlighted;

              return (
                <path
                  key={`link-${idx}`}
                  d={pathD}
                  fill="none"
                  stroke={isHighlighted ? tokens.colors.accent : sankeyColors.link}
                  strokeWidth={Math.max(2, link.width || 1)}
                  strokeOpacity={isHighlighted ? 0.7 : isDimmed ? 0.1 : 0.3}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredLink(idx);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipInfo({
                      label: `${sourceNode.name} → ${targetNode.name}`,
                      value: `${link.value} sessions`,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredLink(null);
                    setTooltipInfo(null);
                  }}
                >
                  <title>{`${sourceNode.name} → ${targetNode.name}: ${link.value} sessions`}</title>
                </path>
              );
            })}

            {/* Nodes: 12px-rounded cards with 3px left colored edge */}
            {layout.nodes.map((node, idx) => {
              const x0 = node.x0 ?? 0;
              const x1 = node.x1 ?? 0;
              const y0 = node.y0 ?? 0;
              const y1 = node.y1 ?? 0;
              const nodeHeight = Math.max(8, y1 - y0);

              const activeLink = hoveredLink !== null ? layout.links[hoveredLink] : null;
              const activeSrc = activeLink
                ? typeof activeLink.source === "object"
                  ? activeLink.source.index
                  : activeLink.source
                : null;
              const activeTgt = activeLink
                ? typeof activeLink.target === "object"
                  ? activeLink.target.index
                  : activeLink.target
                : null;

              const isHighlighted =
                hoveredNode === idx ||
                (hoveredLink !== null && (activeSrc === idx || activeTgt === idx));
              const isDimmed = (hoveredNode !== null || hoveredLink !== null) && !isHighlighted;

              const categoryColor = getNodeCategoryColor(node.category);
              const isLeftAligned = x0 < innerWidth / 2;

              return (
                <g
                  key={`node-${idx}`}
                  className="cursor-pointer"
                  opacity={isDimmed ? 0.25 : 1}
                  onMouseEnter={(e) => {
                    setHoveredNode(idx);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipInfo({
                      label: `${node.category.toUpperCase()}: ${node.name}`,
                      value: `${node.value} sessions`,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredNode(null);
                    setTooltipInfo(null);
                  }}
                >
                  {/* Node body: 12px rounded card */}
                  <rect
                    x={x0}
                    y={y0}
                    width={x1 - x0}
                    height={nodeHeight}
                    fill={tokens.colors.raised}
                    stroke={isHighlighted ? tokens.colors.text : tokens.colors.border}
                    strokeWidth={1}
                    rx={6}
                    className="transition-all duration-200"
                  />
                  {/* 3px colored left edge per DESIGN.md (NEXORA flow style) */}
                  <rect
                    x={x0}
                    y={y0}
                    width={3}
                    height={nodeHeight}
                    fill={categoryColor}
                    rx={1.5}
                  />

                  {/* Node Label */}
                  <text
                    x={isLeftAligned ? x0 - 8 : x1 + 8}
                    y={(y0 + y1) / 2}
                    dy="0.35em"
                    textAnchor={isLeftAligned ? "end" : "start"}
                    fontSize={11}
                    fontFamily="var(--font-mono, monospace)"
                    fill={isHighlighted ? tokens.colors.text : tokens.colors.muted}
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

      {/* Shared Tooltip */}
      {tooltipInfo && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: tooltipInfo.x, top: tooltipInfo.y }}
        >
          <Tooltip
            label={tooltipInfo.label}
            value={tooltipInfo.value}
            subtext={tooltipInfo.subtext}
          />
        </div>
      )}
    </div>
  );
}

export default FlowSankey;
