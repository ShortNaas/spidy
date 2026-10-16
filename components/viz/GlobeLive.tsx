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
}

export function GlobeLive({ markers = [], loading = false, className = "" }: GlobeLiveProps) {
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

    // Map markers into Cobe format: location: [lat, lon], size: 0.04 - 0.1
    const cobeMarkers = markers.slice(0, 50).map((m) => ({
      location: [m.lat, m.lon] as [number, number],
      size: 0.06,
    }));

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      baseColor: [0.1, 0.12, 0.15],
      markerColor: [0.02, 0.71, 0.83], // Cyan accent #06b6d4
      glowColor: [0.05, 0.15, 0.25],
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
        className={`relative flex items-center justify-center bg-zinc-950/60 rounded-xl border border-zinc-800/80 p-6 aspect-square ${className}`}
        aria-busy="true"
        aria-label="Loading realtime globe"
      >
        <div className="w-48 h-48 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        <span className="absolute bottom-6 text-xs text-zinc-500 font-mono tabular-nums">
          Initializing 3D coordinates...
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800/80 overflow-hidden p-4 ${className}`}
    >
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
        </span>
        <span className="text-xs font-medium text-zinc-300">Live Global Traffic</span>
        <span className="text-[11px] font-mono tabular-nums text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
          {markers.length} {markers.length === 1 ? "beacon" : "beacons"}
        </span>
      </div>

      <div className="w-full max-w-[420px] aspect-square flex items-center justify-center">
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
        />
      </div>

      {markers.length === 0 && (
        <div className="absolute bottom-4 text-xs text-zinc-500 font-mono">
          Awaiting live beacons in current window
        </div>
      )}
    </div>
  );
}

export default GlobeLive;
