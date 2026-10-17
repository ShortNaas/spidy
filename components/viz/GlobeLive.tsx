"use client";

import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";

export interface GlobeMarker {
  lat: number;
  lon: number;
  country?: string;
  city?: string;
  path?: string;
  ts?: string;
}

export interface GlobeLiveProps {
  markers?: GlobeMarker[];
  loading?: boolean;
  className?: string;
  embedded?: boolean;
}

export function GlobeLive({
  markers = [],
  loading = false,
  className = "",
  embedded = false,
}: GlobeLiveProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phiRef = useRef(0);
  const pointerStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current || loading) return;

    let width = canvasRef.current.offsetWidth || 400;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth || 400;
      }
    };
    window.addEventListener("resize", onResize);

    // Map markers into Cobe format: location: [lat, lon], size: 0.05 - 0.08
    const cobeMarkers = markers.slice(0, 50).map((m) => ({
      location: [m.lat, m.lon] as [number, number],
      size: 0.06,
    }));

    // Respect user's motion preferences
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Cobe WebGL globe configuration per DESIGN.md:
    // Pure neutral gray landmass [0.15, 0.15, 0.15], cyan live blips [0.133, 0.827, 0.933]
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: phiRef.current,
      theta: 0.25,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.15, 0.15, 0.15],
      markerColor: [0.133, 0.827, 0.933], // Live Orbital Cyan
      glowColor: [0.08, 0.08, 0.08],
      markers: cobeMarkers,
    });

    let animationFrameId: number;

    const animate = () => {
      if (pointerStartRef.current === null && !prefersReducedMotion) {
        phiRef.current += 0.003;
      }
      globe.update({
        phi: phiRef.current,
        width: width * 2,
        height: width * 2,
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [markers, loading]);

  if (loading) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center aspect-square ${
          embedded ? "w-full" : "bg-surface border border-border rounded-3xl p-6 sheen"
        } ${className}`}
        aria-busy="true"
        aria-label="Loading realtime globe"
      >
        <div className="w-48 h-48 rounded-full border border-live/20 border-t-live animate-spin" />
        <span className="absolute bottom-6 text-xs text-muted font-mono tabular-nums">
          Initializing 3D coordinates...
        </span>
      </div>
    );
  }

  return (
    <div
      className={
        embedded
          ? `relative flex flex-col items-center justify-center w-full ${className}`
          : `relative flex flex-col items-center justify-center bg-surface border border-border rounded-3xl p-6 sheen overflow-hidden shadow-[0_0_24px_rgba(34,211,238,0.15)] ${className}`
      }
      role="region"
      aria-label="Real-time planetary globe telemetry"
    >
      {/* Live Badge and Beacon count */}
      <div className={embedded ? "w-full flex items-center justify-between mb-2" : "absolute top-5 left-5 z-10 flex items-center gap-2.5"}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
          </span>
          <span className="font-sans text-[13px] font-medium text-white">Live Global Traffic</span>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-muted bg-raised px-2 py-0.5 rounded-full border border-border">
          {markers.length} {markers.length === 1 ? "beacon" : "beacons"}
        </span>
      </div>

      {/* Accessible summary */}
      <div className="sr-only">
        Interactive 3D globe displaying {markers.length} real-time active visitor locations.
      </div>

      <div className="w-full max-w-[420px] aspect-square flex items-center justify-center mt-2">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", contain: "layout paint size" }}
          onPointerDown={(e) => {
            pointerStartRef.current = e.clientX;
            try {
              canvasRef.current?.setPointerCapture(e.pointerId);
            } catch {}
            if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
          }}
          onPointerUp={(e) => {
            pointerStartRef.current = null;
            try {
              canvasRef.current?.releasePointerCapture(e.pointerId);
            } catch {}
            if (canvasRef.current) canvasRef.current.style.cursor = "grab";
          }}
          onPointerCancel={(e) => {
            pointerStartRef.current = null;
            try {
              canvasRef.current?.releasePointerCapture(e.pointerId);
            } catch {}
            if (canvasRef.current) canvasRef.current.style.cursor = "grab";
          }}
          onPointerMove={(e) => {
            if (pointerStartRef.current !== null) {
              const delta = e.clientX - pointerStartRef.current;
              phiRef.current += delta * 0.005;
              pointerStartRef.current = e.clientX;
            }
          }}
          className="cursor-grab transition-opacity duration-500"
          aria-hidden="true"
        />
      </div>

      {markers.length === 0 && (
        <div className="absolute bottom-5 text-xs text-muted font-mono">
          Awaiting live beacons in current window
        </div>
      )}
    </div>
  );
}

export default GlobeLive;
