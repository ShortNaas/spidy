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
    // Pure neutral gray landmass [0.15, 0.15, 0.15], white live blips [1, 1, 1]
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
      markerColor: [1, 1, 1], // Live White
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
        <div className="w-48 h-48 rounded-full border border-white/20 border-t-white animate-spin" />
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
          ? `relative flex flex-col items-center justify-between w-full h-full ${className}`
          : `relative flex flex-col items-center justify-between bg-surface border border-border rounded-3xl p-6 sm:p-7 sheen overflow-hidden shadow-[0_0_24px_rgba(255,255,255,0.25)] ${className}`
      }
      role="region"
      aria-label="Real-time planetary globe telemetry"
    >
      {/* Live Badge and Beacon count */}
      <div className="w-full flex items-center justify-between mb-3 px-1 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-live-pulse absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
          </span>
          <span className="font-sans text-[13px] font-medium text-white">Live Global Traffic</span>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-muted bg-raised px-2.5 py-0.5 rounded-full border border-border">
          {markers.length} {markers.length === 1 ? "beacon" : "beacons"}
        </span>
      </div>

      {/* Accessible summary */}
      <div className="sr-only">
        Interactive 3D globe displaying {markers.length} real-time active visitor locations.
      </div>

      <div className="relative w-full flex-1 max-w-[360px] aspect-square flex items-center justify-center">
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
