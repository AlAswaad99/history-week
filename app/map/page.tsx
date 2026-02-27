"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

// ============================================================================
// CONSTANTS
// ============================================================================
const DESTINATION = { lat: 9.005098, lng: 38.679236 };
const SMOOTHING = 0.18;
const MAPS_EMBED_URL =
  // Custom HTML embed with a marker at the center using Google Maps Static API
  // Fallbacks to original embed for full map functionality
  `https://maps.google.com/maps?q=${DESTINATION.lat},${DESTINATION.lng}&t=m&z=18&output=embed&iwloc=near`;

// ============================================================================
// UTILITY
// ============================================================================
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(m: number): string {
  if (m >= 1000) return (m / 1000).toFixed(2) + " km";
  return Math.round(m) + " m";
}

function formatBearing(
  userLat: number,
  userLng: number,
  destLat: number,
  destLng: number
): string {
  const φ1 = (userLat * Math.PI) / 180;
  const φ2 = (destLat * Math.PI) / 180;
  const Δλ = ((destLng - userLng) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = (Math.atan2(y, x) * 180) / Math.PI;
  const bearing = (θ + 360) % 360;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(bearing / 45) % 8] ?? "N";
}

// ============================================================================
// TYPES
// ============================================================================
interface TrackerState {
  status: "idle" | "tracking" | "error" | "arrived";
  distance: number | null;
  speed: number;
  bearing: string;
  accuracy: number | null;
  error: string | null;
  audioArmed: boolean;
}

// ============================================================================
// HUD STAT CELL
// ============================================================================
function StatCell({
  label,
  value,
  unit,
  color,
  borderRight = false,
}: {
  label: string;
  value: string;
  unit?: string;
  color: string;
  borderRight?: boolean;
}) {
  return (
    <div
      className="p-4 text-center"
      style={{
        borderRight: borderRight ? "1px solid rgba(255,255,255,0.04)" : undefined,
      }}
    >
      <p className="text-[8px] font-mono uppercase tracking-[0.35em] text-gray-600 mb-1.5">
        {label}
      </p>
      <p
        className="font-mono font-bold leading-none tabular-nums"
        style={{ fontSize: "1.5rem", color }}
      >
        {value}
        {unit && (
          <span className="text-xs ml-1" style={{ opacity: 0.55 }}>
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<unknown>(null);
  const userMarkerRef = useRef<unknown>(null);
  const routeLineRef = useRef<unknown>(null);
  const lastCoordRef = useRef<{ lat: number; lng: number } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const [state, setState] = useState<TrackerState>({
    status: "idle",
    distance: null,
    speed: 0,
    bearing: "—",
    accuracy: null,
    error: null,
    audioArmed: false,
  });

  // ── Init Leaflet map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || leafletMapRef.current) return;

    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = (L as any).map(mapContainerRef.current!, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }).setView([DESTINATION.lat, DESTINATION.lng], 16) as any;

      // Dark tile layer to match theme
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (L as any).tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      ).addTo(map);

      // Destination marker
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const destIcon = (L as any).divIcon({
        className: "",
        html: `<div style="
          width:14px;height:14px;
          background:#f59e0b;border:2px solid #fff;
          border-radius:50%;
          box-shadow:0 0 18px rgba(245,158,11,0.9);
          position:relative;
        "><div style="
          position:absolute;top:-26px;left:50%;transform:translateX(-50%);
          background:#f59e0b;color:#000;font-size:8px;padding:2px 6px;
          border-radius:4px;white-space:nowrap;font-weight:900;
          font-family:monospace;letter-spacing:1px;
        ">BYB MKC</div></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (L as any).marker([DESTINATION.lat, DESTINATION.lng], { icon: destIcon }).addTo(map);

      leafletMapRef.current = map;
    });

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (leafletMapRef.current) { (leafletMapRef.current as any).remove(); leafletMapRef.current = null; }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // ── Sonar beep ───────────────────────────────────────────────────────────
  const playSonar = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  // ── GPS update ───────────────────────────────────────────────────────────
  const onLocationUpdate = useCallback(
    (pos: GeolocationPosition) => {
      import("leaflet").then((L) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const map = leafletMapRef.current as any;
        if (!map) return;

        const { latitude, longitude, speed, accuracy } = pos.coords;
        let smoothLat = latitude;
        let smoothLng = longitude;

        if (lastCoordRef.current) {
          smoothLat =
            lastCoordRef.current.lat +
            (latitude - lastCoordRef.current.lat) * SMOOTHING;
          smoothLng =
            lastCoordRef.current.lng +
            (longitude - lastCoordRef.current.lng) * SMOOTHING;
        }
        lastCoordRef.current = { lat: smoothLat, lng: smoothLng };

        const dist = haversineDistance(
          smoothLat, smoothLng, DESTINATION.lat, DESTINATION.lng
        );
        const bearing = formatBearing(
          smoothLat, smoothLng, DESTINATION.lat, DESTINATION.lng
        );
        const arrived = dist < 30;

        setState((prev) => ({
          ...prev,
          status: arrived ? "arrived" : "tracking",
          distance: dist,
          speed: speed ? speed * 3.6 : 0,
          bearing,
          accuracy: accuracy ?? null,
          error: null,
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userIcon = (L as any).divIcon({
          className: "",
          html: `<div style="
            width:12px;height:12px;
            background:#00bcd4;border:2px solid #fff;
            border-radius:50%;box-shadow:0 0 14px rgba(0,188,212,0.9);
          "></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        if (!userMarkerRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          userMarkerRef.current = (L as any).marker(
            [smoothLat, smoothLng], { icon: userIcon }
          ).addTo(map);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (userMarkerRef.current as any).setLatLng([smoothLat, smoothLng]);
        }

        map.panTo([smoothLat, smoothLng]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (routeLineRef.current) map.removeLayer(routeLineRef.current as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        routeLineRef.current = (L as any).polyline(
          [[smoothLat, smoothLng], [DESTINATION.lat, DESTINATION.lng]],
          {
            color: "#f59e0b",
            weight: 3,
            opacity: 0.85,
            dashArray: arrived ? undefined : "7 5",
          }
        ).addTo(map);

        playSonar();
      });
    },
    [playSonar]
  );

  const onLocationError = useCallback((err: GeolocationPositionError) => {
    setState((prev) => ({ ...prev, status: "error", error: err.message }));
  }, []);

  // ── Start tracking ────────────────────────────────────────────────────────
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: "Geolocation not supported by your browser.",
      }));
      return;
    }
    setState((prev) => ({ ...prev, status: "tracking", error: null }));
    watchIdRef.current = navigator.geolocation.watchPosition(
      onLocationUpdate,
      onLocationError,
      { enableHighAccuracy: true }
    );
  }, [onLocationUpdate, onLocationError]);

  const armAudio = useCallback(() => {
    audioCtxRef.current = new (
      window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!
    )();
    setState((prev) => ({ ...prev, audioArmed: true }));
  }, []);

  const { status, distance, speed, bearing, accuracy, error, audioArmed } =
    state;

  const statusConfig = {
    idle: {
      text: "text-gray-500",
      dot: "bg-gray-600",
      border: "border-gray-700/50",
      bg: "bg-gray-800/60",
      label: "Standby",
    },
    tracking: {
      text: "text-cyan-400",
      dot: "bg-cyan-400 animate-pulse",
      border: "border-cyan-500/30",
      bg: "bg-cyan-500/10",
      label: "Live Tracking",
    },
    error: {
      text: "text-red-400",
      dot: "bg-red-400",
      border: "border-red-500/30",
      bg: "bg-red-500/10",
      label: "Signal Error",
    },
    arrived: {
      text: "text-emerald-400",
      dot: "bg-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      label: "Arrived",
    },
  }[status];

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        height: "100dvh",
        // Account for the fixed Navbar (py-4 + logo min-h-12 ≈ 80px)
        paddingTop: "5rem",
        background:
          "radial-gradient(ellipse 80% 50% at 15% 0%, rgba(10,20,38,1) 0%, #060a14 55%)",
      }}
    >
      {/* ── Status bar ────────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center gap-3 px-5 lg:px-8 py-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        {/* Nav icon + title */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.18)",
          }}
        >
          <svg
            className="w-3.5 h-3.5"
            style={{ color: "#f59e0b" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <div>
          <p className="font-habesha-bold text-amber-400 text-sm leading-none">
            BYB MKC Navigator
          </p>
          <p className="text-[10px] font-mono text-gray-600 tracking-wider mt-0.5">
            MESERETE KRISTOS CHURCH · BETHEL
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Coordinate readout */}
          <span className="hidden sm:block font-mono text-[10px] text-gray-700 tracking-wide">
            {DESTINATION.lat.toFixed(5)}, {DESTINATION.lng.toFixed(5)}
          </span>

          {/* Status pill */}
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* ── Split body ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">

        {/* ═══ LEFT — Tracker panel ══════════════════════════════════════════ */}
        <aside
          className="lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col border-r overflow-y-auto overflow-x-hidden scrollbar-hide"
          style={{
            borderColor: "rgba(255,255,255,0.04)",
            background: "rgba(6,10,20,0.98)",
          }}
        >
          {/* ── Live radar ─────────────────────────────────────────────────── */}
          <div
            className="p-4 border-b"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-mono uppercase tracking-[0.35em] text-gray-600">
                Live Radar
              </p>
              {status === "tracking" && (
                <span className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-500 uppercase tracking-widest">
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                  GPS Lock
                </span>
              )}
            </div>

            {/* Leaflet radar container */}
            <div
              className="relative w-full rounded-xl overflow-hidden"
              style={{
                aspectRatio: "4/3",
                border: "1px solid rgba(0,188,212,0.12)",
                boxShadow:
                  "0 0 0 1px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.6), inset 0 0 24px rgba(0,188,212,0.03)",
              }}
            >
              <div ref={mapContainerRef} className="w-full h-full" />

              {/* Sonar sweep */}
              {status === "tracking" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                  <div
                    className="absolute inset-0 origin-center"
                    style={{
                      background:
                        "conic-gradient(from 0deg, transparent 65%, rgba(0,188,212,0.09) 100%)",
                      animation: "loader-ring-spin 4s linear infinite",
                    }}
                  />
                </div>
              )}

              {/* Corner crosshairs */}
              {(["tl", "tr", "bl", "br"] as const).map((corner) => (
                <div
                  key={corner}
                  className="absolute w-3.5 h-3.5"
                  style={{
                    top: corner.startsWith("t") ? 8 : undefined,
                    bottom: corner.startsWith("b") ? 8 : undefined,
                    left: corner.endsWith("l") ? 8 : undefined,
                    right: corner.endsWith("r") ? 8 : undefined,
                    borderTop: corner.startsWith("t")
                      ? "1.5px solid rgba(245,158,11,0.35)"
                      : undefined,
                    borderBottom: corner.startsWith("b")
                      ? "1.5px solid rgba(245,158,11,0.35)"
                      : undefined,
                    borderLeft: corner.endsWith("l")
                      ? "1.5px solid rgba(245,158,11,0.35)"
                      : undefined,
                    borderRight: corner.endsWith("r")
                      ? "1.5px solid rgba(245,158,11,0.35)"
                      : undefined,
                  }}
                />
              ))}

              {/* Idle overlay */}
              {status === "idle" && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
                  style={{
                    background: "rgba(6,10,20,0.78)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center mb-2.5"
                    style={{
                      border: "1px solid rgba(0,188,212,0.18)",
                      background: "rgba(0,188,212,0.05)",
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      style={{ color: "#4b5563" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-[11px] text-center font-mono leading-relaxed">
                    Activate tracker
                    <br />
                    to begin
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── HUD stats ──────────────────────────────────────────────────── */}
          <div
            className="grid grid-cols-2 border-b"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
          >
            <StatCell
              label="DISTANCE"
              value={distance !== null ? formatDistance(distance) : "—"}
              color="#f59e0b"
              borderRight
            />
            <StatCell
              label="VELOCITY"
              value={speed.toFixed(1)}
              unit="km/h"
              color="#00bcd4"
            />
          </div>

          <div
            className="grid grid-cols-2 border-b"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
          >
            <StatCell
              label="BEARING"
              value={bearing}
              color="#fb923c"
              borderRight
            />
            <StatCell
              label="ACCURACY"
              value={accuracy !== null ? `±${Math.round(accuracy)}m` : "—"}
              color="#c084fc"
            />
          </div>

          {/* ── Destination card ───────────────────────────────────────────── */}
          <div
            className="p-4 border-b"
            style={{ borderColor: "rgba(255,255,255,0.04)" }}
          >
            <p className="text-[9px] font-mono uppercase tracking-[0.35em] text-gray-600 mb-3">
              Destination
            </p>
            <div
              className="rounded-xl p-3.5 flex items-start gap-3"
              style={{
                background: "rgba(245,158,11,0.04)",
                border: "1px solid rgba(245,158,11,0.12)",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(245,158,11,0.07)",
                  border: "1px solid rgba(245,158,11,0.14)",
                }}
              >
                <span className="text-lg leading-none">⛪</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-snug">
                  Bethel Yealem Birhan MKC
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Addis Ababa, Ethiopia
                </p>
                <p
                  className="font-mono text-[10px] mt-1.5 tracking-wide"
                  style={{ color: "rgba(245,158,11,0.65)" }}
                >
                  {DESTINATION.lat.toFixed(6)}, {DESTINATION.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Arrived banner ─────────────────────────────────────────────── */}
          {status === "arrived" && (
            <div
              className="mx-4 mt-1 mb-2 rounded-xl p-4 text-center"
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <span className="text-xl block mb-1">🎉</span>
              <p className="text-emerald-400 text-sm font-bold">
                You have arrived!
              </p>
              <p className="text-gray-600 text-xs mt-0.5">
                Welcome to BYB MKC
              </p>
            </div>
          )}

          {/* ── Error banner ───────────────────────────────────────────────── */}
          {error && (
            <div
              className="mx-4 mt-1 mb-2 rounded-xl p-3"
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.14)",
              }}
            >
              <p className="text-red-400 text-xs font-mono leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {/* ── Action buttons ─────────────────────────────────────────────── */}
          <div className="p-4 flex flex-col gap-2.5 mt-auto">
            {status === "idle" ? (
              <button
                onClick={startTracking}
                className="location-btn-shimmer w-full py-3.5 rounded-xl font-bold text-sm text-gray-900 tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] active:scale-95"
                style={{
                  background:
                    "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)",
                  boxShadow: "0 4px 24px rgba(245,158,11,0.22)",
                }}
              >
                ▶ Activate Tracker
              </button>
            ) : (
              <div
                className="w-full py-3 rounded-xl text-center text-sm font-bold font-mono tracking-wider"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${
                    status === "arrived"
                      ? "rgba(16,185,129,0.22)"
                      : status === "error"
                      ? "rgba(239,68,68,0.22)"
                      : "rgba(0,188,212,0.22)"
                  }`,
                  color:
                    status === "arrived"
                      ? "#10b981"
                      : status === "error"
                      ? "#ef4444"
                      : "#00bcd4",
                }}
              >
                {status === "arrived"
                  ? "✓ Destination Reached"
                  : status === "error"
                  ? "⚠ Signal Lost"
                  : "◉ Tracking Active"}
              </div>
            )}

            <button
              onClick={armAudio}
              disabled={audioArmed}
              className="w-full py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-95"
              style={{
                background: audioArmed
                  ? "rgba(0,188,212,0.06)"
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${
                  audioArmed
                    ? "rgba(0,188,212,0.25)"
                    : "rgba(255,255,255,0.06)"
                }`,
                color: audioArmed ? "#00bcd4" : "#6b7280",
              }}
            >
              {audioArmed ? "◈ Sonar Armed" : "◇ Arm Sonar"}
            </button>

            <a
              href="https://maps.app.goo.gl/ZQN3dpjtG6dom8Fj7"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-center transition-all duration-200 hover:scale-[1.01] active:scale-95"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                color: "#6b7280",
              }}
            >
              Open in Google Maps ↗
            </a>
          </div>
        </aside>

        {/* ═══ RIGHT — Google Maps embed ═════════════════════════════════════ */}
        <main className="flex-1 relative min-h-[45vh] lg:min-h-0">
          <iframe
            src={MAPS_EMBED_URL}
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Bethel MKC Church Location"
          />

          {/* Location badge — bottom left */}
          <div
            className="absolute bottom-5 left-5 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold pointer-events-none"
            style={{
              background: "rgba(6,10,20,0.88)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(245,158,11,0.2)",
              color: "#f59e0b",
              boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#f59e0b" }}
            />
            Bethel MKC · Addis Ababa
          </div>

          {/* Map hint — top right */}
          <div
            className="absolute top-5 right-5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono pointer-events-none"
            style={{
              background: "rgba(6,10,20,0.75)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#4b5563",
            }}
          >
            Satellite · Interactive
          </div>
        </main>
      </div>
    </div>
  );
}
