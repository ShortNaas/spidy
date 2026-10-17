"use client";

import React, { useEffect, useMemo, useState } from "react";
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from "d3-geo";
import type { ItemCount } from "@/lib/queries";
import { Tooltip } from "@/components/ui/Tooltip";
import { Skeleton } from "@/components/ui/Skeleton";

export interface WorldChoroplethProps {
  data?: ItemCount[];
  loading?: boolean;
  className?: string;
  width?: number;
  height?: number;
  embedded?: boolean;
}

interface GeoJsonFeature {
  type: string;
  id?: string;
  properties: {
    name: string;
  };
  geometry: Record<string, unknown>;
}

// Alpha-2 to Alpha-3 ISO country mapping for standard 110m world datasets
const ALPHA2_TO_ALPHA3: Record<string, string> = {
  US: "USA",
  GB: "GBR",
  DE: "DEU",
  FR: "FRA",
  JP: "JPN",
  CA: "CAN",
  AU: "AUS",
  NL: "NLD",
  SE: "SWE",
  IN: "IND",
  BR: "BRA",
  SG: "SGP",
  ES: "ESP",
  IT: "ITA",
  PL: "POL",
  CH: "CHE",
  AT: "AUT",
  BE: "BEL",
  DK: "DNK",
  NO: "NOR",
  FI: "FIN",
  IE: "IRL",
  NZ: "NZL",
  MX: "MEX",
  KR: "KOR",
  CN: "CHN",
  ZA: "ZAF",
  IL: "ISR",
  PT: "PRT",
  CZ: "CZE",
};

export function WorldChoropleth({
  data = [],
  loading = false,
  className = "",
  width = 680,
  height = 360,
  embedded = false,
}: WorldChoroplethProps) {
  const [geoFeatures, setGeoFeatures] = useState<GeoJsonFeature[]>([]);
  const [geoLoading, setGeoLoading] = useState(true);
  const [hoveredCountry, setHoveredCountry] = useState<{
    name: string;
    visitors: number;
    views: number;
    x: number;
    y: number;
  } | null>(null);

  // Load static GeoJSON from /world.geojson
  useEffect(() => {
    fetch("/world.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        if (geojson.features) {
          setGeoFeatures(geojson.features);
        }
        setGeoLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load /world.geojson:", err);
        setGeoLoading(false);
      });
  }, []);

  // Map input data by ISO country code
  const { countryMap, maxVisitors } = useMemo(() => {
    const map = new Map<string, { views: number; visitors: number; name: string }>();
    let max = 1;

    for (const item of data) {
      const code = item.name.toUpperCase();
      const a3 = ALPHA2_TO_ALPHA3[code] || code;

      map.set(code, { views: item.views, visitors: item.visitors, name: item.name });
      map.set(a3, { views: item.views, visitors: item.visitors, name: item.name });

      if (item.visitors > max) max = item.visitors;
    }

    return { countryMap: map, maxVisitors: max };
  }, [data]);

  // Natural Earth projection with d3-geo
  const { paths } = useMemo(() => {
    if (!geoFeatures.length) return { paths: [] };

    const projection = geoNaturalEarth1()
      .scale(width / 5.5)
      .translate([width / 2, height / 1.75]);

    const pathGen = geoPath().projection(projection);

    const projected = geoFeatures.map((feat) => {
      const id = (feat.id || "").toUpperCase();
      const name = feat.properties.name || "";
      const d = pathGen(feat as unknown as GeoPermissibleObjects) || "";

      // Look up stats
      const stats = countryMap.get(id) || countryMap.get(name.toUpperCase());

      return {
        id,
        name,
        d,
        visitors: stats?.visitors || 0,
        views: stats?.views || 0,
      };
    });

    return { paths: projected };
  }, [geoFeatures, countryMap, width, height]);

  // Ember volume ramp:
  // Step 0: empty (#161616 with hairline)
  // Step 1: hatched ember 35%
  // Step 2: hatched ember 75%
  // Step 3: solid #c4472a
  // Step 4: solid #fb5c34
  // Peak: solid #ff7a57
  function getChoroplethFill(visitors: number): string {
    if (visitors === 0) return "#161616";
    const ratio = visitors / maxVisitors;
    if (ratio < 0.2) return "url(#choro-hatch-35)";
    if (ratio < 0.45) return "url(#choro-hatch-75)";
    if (ratio < 0.7) return "#c4472a";
    if (ratio < 0.9) return "#fb5c34";
    return "#ff7a57";
  }

  if (loading || geoLoading) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-[360px] ${
          embedded ? "w-full" : "bg-surface border border-border rounded-3xl p-6 sheen"
        } ${className}`}
        aria-busy="true"
        aria-label="Loading world choropleth"
      >
        <Skeleton className="w-full h-56 rounded-2xl" />
        <span className="text-xs text-muted font-mono mt-4">
          Rendering geographic choropleth projection...
        </span>
      </div>
    );
  }

  return (
    <div
      className={
        embedded
          ? `relative flex flex-col w-full ${className}`
          : `relative flex flex-col bg-surface border border-border rounded-3xl p-6 sheen overflow-hidden ${className}`
      }
      role="region"
      aria-label="Geographic density choropleth projection"
    >
      <div className={`flex flex-wrap items-center ${embedded ? "justify-end" : "justify-between"} gap-3 mb-3 z-10`}>
        {!embedded && (
          <div className="flex items-center gap-2">
            <span className="font-sans text-[13px] font-medium text-white">Geographic Density</span>
            <span className="font-mono text-[11px] text-muted">
              Natural Earth Projection
            </span>
          </div>
        )}

        {/* Ember Ramp Legend */}
        <div className="flex items-center gap-2 text-[10px] text-muted font-mono">
          <span>0</span>
          <span className="w-3 h-3 rounded-[3px] bg-raised border border-border" title="Empty (0)" />
          <span className="w-3 h-3 rounded-[3px] overflow-hidden inline-block" title="Low (35% hatch)">
            <svg width="12" height="12">
              <rect width="12" height="12" fill="url(#choro-hatch-35)" />
            </svg>
          </span>
          <span className="w-3 h-3 rounded-[3px] overflow-hidden inline-block" title="Mid-Low (75% hatch)">
            <svg width="12" height="12">
              <rect width="12" height="12" fill="url(#choro-hatch-75)" />
            </svg>
          </span>
          <span className="w-3 h-3 rounded-[3px] bg-[#c4472a]" title="Mid (Solid)" />
          <span className="w-3 h-3 rounded-[3px] bg-accent" title="High (Solid)" />
          <span className="w-3 h-3 rounded-[3px] bg-accent-bright" title="Peak" />
          <span>{maxVisitors.toLocaleString()}</span>
        </div>
      </div>

      {/* Accessible summary */}
      <div className="sr-only">
        Geographic density map showing visitor counts across {data.length} countries. Peak country has {maxVisitors.toLocaleString()} visitors.
      </div>

      <div className="w-full overflow-hidden flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[420px]"
          role="img"
          aria-label="World map choropleth showing visitor density by country"
        >
          <defs>
            <pattern
              id="choro-hatch-35"
              width="6"
              height="6"
              patternTransform="rotate(-45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <rect width="6" height="6" fill="#161616" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="#fb5c34" strokeWidth="1.5" strokeOpacity="0.35" />
            </pattern>
            <pattern
              id="choro-hatch-75"
              width="6"
              height="6"
              patternTransform="rotate(-45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <rect width="6" height="6" fill="#161616" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="#fb5c34" strokeWidth="1.5" strokeOpacity="0.75" />
            </pattern>
          </defs>

          <g>
            {paths.map((p, idx) => {
              const fill = getChoroplethFill(p.visitors);
              const isHovered = hoveredCountry?.name === p.name;
              return (
                <path
                  key={`${p.id}-${idx}`}
                  d={p.d}
                  fill={fill}
                  stroke={isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.08)"}
                  strokeWidth={isHovered ? 1.5 : 0.5}
                  className="transition-colors cursor-pointer"
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredCountry({
                      name: p.name,
                      visitors: p.visitors,
                      views: p.views,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => setHoveredCountry(null)}
                >
                  <title>
                    {`${p.name}: ${p.visitors.toLocaleString()} visitors (${p.views.toLocaleString()} views)`}
                  </title>
                </path>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Shared Tooltip */}
      {hoveredCountry && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoveredCountry.x, top: hoveredCountry.y }}
        >
          <Tooltip
            label={hoveredCountry.name}
            value={`${hoveredCountry.visitors.toLocaleString()} visitors`}
            subtext={`${hoveredCountry.views.toLocaleString()} views`}
          />
        </div>
      )}
    </div>
  );
}

export default WorldChoropleth;
