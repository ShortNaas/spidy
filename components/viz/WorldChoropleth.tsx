"use client";

import React, { useEffect, useMemo, useState } from "react";
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from "d3-geo";
import type { ItemCount } from "@/lib/queries";

export interface WorldChoroplethProps {
  data?: ItemCount[];
  loading?: boolean;
  className?: string;
  width?: number;
  height?: number;
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
  US: "USA", GB: "GBR", DE: "DEU", FR: "FRA", JP: "JPN",
  CA: "CAN", AU: "AUS", NL: "NLD", SE: "SWE", IN: "IND",
  BR: "BRA", SG: "SGP", ES: "ESP", IT: "ITA", PL: "POL",
  CH: "CHE", AT: "AUT", BE: "BEL", DK: "DNK", NO: "NOR",
  FI: "FIN", IE: "IRL", NZ: "NZL", MX: "MEX", KR: "KOR",
  CN: "CHN", ZA: "ZAF", IL: "ISR", PT: "PRT", CZ: "CZE",
};

export function WorldChoropleth({
  data = [],
  loading = false,
  className = "",
  width = 680,
  height = 360,
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

  // Color scale: perceptual sequential viridis/cyan scale
  function getChoroplethColor(visitors: number): string {
    if (visitors === 0) return "#18181b"; // zinc-900 unvisited
    const ratio = visitors / maxVisitors;
    if (ratio < 0.15) return "#083344"; // deep cyan
    if (ratio < 0.4) return "#0e7490"; // cyan-700
    if (ratio < 0.7) return "#06b6d4"; // cyan-500
    return "#38bdf8"; // sky-400
  }

  if (loading || geoLoading) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800/80 p-6 min-h-[360px] animate-pulse ${className}`}
        aria-busy="true"
      >
        <div className="w-full h-56 bg-zinc-900 rounded-lg" />
        <span className="text-xs text-zinc-500 font-mono mt-4">Rendering geographic choropleth projection...</span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col bg-zinc-950 rounded-xl border border-zinc-800/80 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-200">World Choropleth</span>
          <span className="text-[11px] font-mono text-zinc-500">
            Natural Earth Projection (Visitors by Country)
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
          <span>0</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-[#18181b] border border-zinc-800" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#083344]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#0e7490]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#06b6d4]" />
          <span className="w-2.5 h-2.5 rounded-xs bg-[#38bdf8]" />
          <span>{maxVisitors.toLocaleString()}</span>
        </div>
      </div>

      <div className="w-full overflow-hidden flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[420px]"
          role="img"
          aria-label="World map choropleth showing visitor density by country"
        >
          <g>
            {paths.map((p, idx) => {
              const fill = getChoroplethColor(p.visitors);
              return (
                <path
                  key={`${p.id}-${idx}`}
                  d={p.d}
                  fill={fill}
                  stroke="#27272a"
                  strokeWidth={0.5}
                  className="transition-colors hover:stroke-cyan-300 hover:stroke-[1.2px] cursor-pointer"
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

      {hoveredCountry && (
        <div
          className="fixed pointer-events-none z-50 bg-zinc-900 text-zinc-100 border border-zinc-700/80 px-2.5 py-1.5 rounded shadow-xl text-xs font-mono -translate-x-1/2 -translate-y-full mb-2"
          style={{ left: hoveredCountry.x, top: hoveredCountry.y }}
        >
          <div className="font-semibold text-cyan-400">{hoveredCountry.name}</div>
          <div className="text-[11px] text-zinc-300">
            {hoveredCountry.visitors.toLocaleString()} unique visitors
          </div>
          <div className="text-[10px] text-zinc-400">
            {hoveredCountry.views.toLocaleString()} total views
          </div>
        </div>
      )}
    </div>
  );
}

export default WorldChoropleth;
