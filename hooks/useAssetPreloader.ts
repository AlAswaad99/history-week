"use client";

import { useState, useEffect, useRef } from "react";

// ============================================================================
// ASSETS TO PRELOAD
// ============================================================================
const CARD_IMAGES = [
    "/card_images/card_1.png",
    "/card_images/card_2.png",
    "/card_images/card_3.png",
    "/card_images/card_4.png",
    "/card_images/card_5.png",
    "/card_images/card_6.png",
    "/card_images/card_7.png",
    "/card_images/card_8.png",
];

const OTHER_IMAGES = [
    "/banner-bg.png",
];

const ALL_ASSETS = [...CARD_IMAGES, ...OTHER_IMAGES];

// Minimum display time for the loading screen (ms) so it doesn't flash
const MIN_DISPLAY_MS = 1200;

// ============================================================================
// HOOK
// ============================================================================
export function useAssetPreloader() {
    const [progress, setProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const mountTimeRef = useRef(Date.now());
    const loadedCountRef = useRef(0);

    useEffect(() => {
        mountTimeRef.current = Date.now();
        const totalAssets = ALL_ASSETS.length;
        let cancelled = false;

        const onAssetLoaded = () => {
            loadedCountRef.current += 1;
            const currentProgress = loadedCountRef.current / totalAssets;

            if (cancelled) return;
            setProgress(currentProgress);

            if (loadedCountRef.current >= totalAssets) {
                // All assets loaded — but ensure minimum display time
                const elapsed = Date.now() - mountTimeRef.current;
                const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
                setTimeout(() => {
                    if (!cancelled) setIsReady(true);
                }, remaining);
            }
        };

        // Preload all images
        ALL_ASSETS.forEach((src) => {
            const img = new Image();
            img.onload = onAssetLoaded;
            img.onerror = onAssetLoaded; // Still count errored assets to avoid stuck state
            img.src = src;
        });

        // Safety timeout — if assets take too long (15s), show the page anyway
        const safetyTimer = setTimeout(() => {
            if (!cancelled && !loadedCountRef.current) {
                setProgress(1);
                setIsReady(true);
            }
        }, 15000);

        return () => {
            cancelled = true;
            clearTimeout(safetyTimer);
        };
    }, []);

    return { progress, isReady };
}
