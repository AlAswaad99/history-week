"use client";

import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { OrbitControls } from "@react-three/drei";
import { PerspectiveCamera } from "@theatre/r3f";
import { useFrame } from "@react-three/fiber";
import { editable as e } from "@theatre/r3f";
import * as THREE from "three";

// Import Theatre.js setup (must be first to initialize at module level)
import "../../lib/theatreSetup";
import { mainSheet, SEQUENCE_LENGTH } from "../../lib/theatreSetup";

// Import R3F components
import {
  SceneCanvas,
  BibleModel,
  SceneLighting,
  SceneHelpers,
  SceneFog,
  RibbonCarousel,
} from "../../components/three";
import type { CarouselItem } from "../../components/three";
import { useEditMode } from "../../hooks/useEditMode";
import { useKeyboardScroll } from "../../hooks/useKeyboardScroll";
import { RSVPButton } from "../../components/RSVPButton";
import { shouldShowEditMode, shouldShowDebugHelpers } from "../../lib/devMode";

// ============================================================================
// ANIMATION PHASES - These map scroll progress to animation state
// ============================================================================
const PHASES = {
  HERO: { start: 0, end: 0.15 },        // Hero landing, Bible barely visible
  REVEAL: { start: 0.15, end: 0.30 },   // Bible ascends into view
  CENTERED: { start: 0.30, end: 0.45 }, // Bible centered, reverent moment
  ORBIT: { start: 0.20, end: 1 },    // Bible rotates, cards orbit
  FLYBY: { start: 0.60, end: 1.0 },     // Camera flies past Bible
};

// Helper to get current phase from scroll progress
function getCurrentPhase(progress: number) {
  if (progress < PHASES.HERO.end) return 'HERO';
  if (progress < PHASES.REVEAL.end) return 'REVEAL';
  if (progress < PHASES.CENTERED.end) return 'CENTERED';
  if (progress < PHASES.ORBIT.end) return 'ORBIT';
  return 'FLYBY';
}

// Museum content data for carousel cards
// Add image paths when you have the images ready
const museumContent: CarouselItem[] = [
  {
    id: 1,
    title: "Torah Era",
    subtitle: "በኦሪት ዘመን",
    description: "The first five books, the foundation of faith. Explore replica Torah scrolls hand-written on authentic parchment.",
    icon: "📜",
    period: "1500-1300 BC",
    image: "/card_images/card_1.png", // Add your image path
  },
  {
    id: 2,
    title: "Judges",
    subtitle: "የመሳፍንት ዘመን",
    description: "The era after Joshua when Israel was ruled by Judges like Deborah, Gideon, and Samson. Period of tribal confederacy and recurring cycles of oppression and deliverance.",
    icon: "⚖️",
    period: "1300-1050 BC",
    image: "/card_images/card_2.png",
  },
  {
    id: 3,
    title: "Kingdom & Prophets",
    subtitle: "የነገሥታት ዘመን",
    description: "The golden age of Israel's monarchy. See replicas of King Solomon's Temple treasures.",
    icon: "👑",
    period: "1050-586 BC",
    image: "/card_images/card_3.png",
  },
  {
    id: 4,
    title: "Exile Period",
    subtitle: "የምርኮና የእርስዋር ዘመን",
    description: "The time when Israelites were exiled to Babylon, and prophets such as Daniel and Ezekiel ministered in foreign lands.",
    icon: "🌒",
    period: "586-538 BC",
    image: "/card_images/card_4.png",
  },
  {
    id: 5,
    title: "Restoration Period",
    subtitle: "የመደገፍና የእነርሱን መናፈሻ ዘመን",
    description: "Return from exile; rebuilding the Temple and community in Jerusalem, as led by Ezra, Nehemiah, and later prophets.",
    icon: "🏗️",
    period: "538-400 BC",
    image: "/card_images/card_5.png",
  },
  {
    id: 6,
    title: "Wisdom Literature",
    subtitle: "የጥበብ መጻሕፍት",
    description: "Psalms, Proverbs, and divine wisdom through illuminated manuscripts.",
    icon: "✨",
    period: "1000-200 BC",
    image: "/card_images/card_6.png",
  },
  {
    id: 7,
    title: "Gospels & Early Church",
    subtitle: "የወንጌል ዘመን",
    description: "The life and teachings of Christ through the four Gospels.",
    icon: "✝️",
    period: "1-100 AD",
    image: "/card_images/card_7.png",
  },
  {
    id: 8,
    title: "Acts & Revelation & Early Church Fathers",
    subtitle: "የሐዋርያት ተግባር",
    description: "The Church is born and spreads. Follow Paul's missionary journeys.",
    icon: "💫",
    period: "30-100 AD",
    image: "/card_images/card_8.png",
  }

];

// ============================================================================
// SCROLL ANIMATION DRIVER
// ============================================================================
function ScrollAnimationDriver({ 
  enabled, 
  scrollProgress 
}: { 
  enabled: boolean
  scrollProgress: number 
}) {
  useFrame(() => {
    if (enabled && mainSheet?.sequence) {
      // Drive Theatre.js timeline with scroll progress
      mainSheet.sequence.position = scrollProgress * SEQUENCE_LENGTH;
    }
  });
  
  return null;
}


// ============================================================================
// MAIN 3D SCENE CONTENT
// ============================================================================
function SceneContent({ 
  isEditMode, 
  scrollProgress 
}: { 
  isEditMode: boolean
  scrollProgress: number 
}) {
  return (
    <>
      {/* Camera - Theatre.js editable
          PHASE 0-2: Position [0, 0, 10] looking at origin
          PHASE 3: Slight dolly
          PHASE 4: Fly forward past the Bible
      */}
      <PerspectiveCamera 
        theatreKey="Camera" 
        makeDefault 
        position={[0, 0, 10]} 
        fov={60}
      />
      
      {/* Lighting - All Theatre.js editable */}
      <SceneLighting />
      
      {/* Fog - Creates depth and atmosphere */}
      <SceneFog enabled={true} />
      
      {/* Bible Model - Theatre.js editable
          PHASE 0: position.y = -8 (below viewport)
          PHASE 1: position.y: -8 → 0 (ascend)
          PHASE 2: position.y = 0, centered
          PHASE 3: rotation.y animates with scroll
          PHASE 4: appears to fall behind as camera advances
      */}
      <BibleModel showAnchorPoint={shouldShowDebugHelpers() && isEditMode} />
      
      {/* Ribbon Carousel - Cards enter like a ribbon from bottom-right
          - Entry: Cards spiral in from off-screen
          - Orbit: Cards circle around the Bible
          - Exit: Cards fade when behind Bible on 2nd revolution
          
          All parameters editable in Theatre.js:
          - radius, cardWidth, cardHeight
          - entryDuration, revolutionsBeforeFade
          - orbitSpeed, yOffset
      */}
      <RibbonCarousel
        items={museumContent}
        scrollProgress={scrollProgress}
        orbitStart={PHASES.ORBIT.start}
        orbitEnd={PHASES.ORBIT.end}
        isEditMode={isEditMode}
      />
      
      {/* Development helpers - only in edit mode and dev mode */}
      {shouldShowDebugHelpers() && isEditMode && <SceneHelpers />}
      
      {/* OrbitControls - only in edit mode and dev mode */}
      {shouldShowEditMode() && isEditMode && (
        <OrbitControls 
          enableDamping
          dampingFactor={0.05}
          screenSpacePanning
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
        />
      )}
      
      {/* Scroll animation driver - only in preview mode */}
      <ScrollAnimationDriver 
        enabled={!isEditMode} 
        scrollProgress={scrollProgress} 
      />
    </>
  );
}

// ============================================================================
// HTML OVERLAY - Hero Section (exists in 2D HTML layer)
// ============================================================================
function HeroOverlay({ scrollProgress }: { scrollProgress: number }) {
  // Fade out hero as Bible rises
  const heroOpacity = Math.max(0, 1 - (scrollProgress / PHASES.REVEAL.start) * 1.2);
  const heroY = scrollProgress * -200; // Parallax upward
  
  return (
    <section 
      className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-30"
      style={{
        opacity: heroOpacity,
        transform: `translateY(${heroY}px)`,
        transition: 'opacity 0.1s ease',
      }}
    >
      <div className="text-center px-4 pointer-events-auto">
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 mb-2 sm:mb-4 drop-shadow-2xl">
          Bible Museum
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-amber-300/90 mb-1 sm:mb-2">
          ከዘፍጥረት እስከ ራዕይ
        </p>
        <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-300/80 max-w-2xl mx-auto px-2">
          Journey through the history of the world's most sacred text
        </p>
        
        {/* Event Info Cards - hidden on very small screens */}
        <div className="mt-6 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto px-2">
          <div className="bg-gray-900/60 backdrop-blur-sm p-3 sm:p-6 rounded-xl border border-amber-500/20">
            <p className="text-amber-400 text-xs sm:text-sm uppercase mb-1 sm:mb-2">When</p>
            <p className="text-white text-sm sm:text-lg font-bold">የካቲት 2017</p>
            <p className="text-gray-400 text-xs sm:text-sm">February 2025</p>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-sm p-3 sm:p-6 rounded-xl border border-amber-500/20">
            <p className="text-amber-400 text-xs sm:text-sm uppercase mb-1 sm:mb-2">Where</p>
            <p className="text-white text-sm sm:text-lg font-bold">Bethel Church</p>
            <p className="text-gray-400 text-xs sm:text-sm">Addis Ababa</p>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-sm p-3 sm:p-6 rounded-xl border border-amber-500/20">
            <p className="text-amber-400 text-xs sm:text-sm uppercase mb-1 sm:mb-2">What</p>
            <p className="text-white text-sm sm:text-lg font-bold">Interactive Museum</p>
            <p className="text-gray-400 text-xs sm:text-sm">Authentic Replicas</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator - show swipe on mobile */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce pointer-events-auto">
        <span className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 hidden sm:block">Scroll to explore</span>
        <span className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 sm:hidden">Swipe up to explore</span>
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}

// ============================================================================
// TRANSITION TEXT OVERLAY
// ============================================================================
function TransitionOverlay({ scrollProgress }: { scrollProgress: number }) {
  // Show during REVEAL and CENTERED phases
  const isVisible = scrollProgress + .15 > PHASES.HERO.end && scrollProgress < (PHASES.ORBIT.start + .3);
  const opacity = isVisible ? Math.min(1, (scrollProgress - PHASES.HERO.end) / 0.1) : 0;
  
  // Fade out approaching ORBIT
  const fadeOut = scrollProgress + .15 > PHASES.CENTERED.start 
    ? 1 - ((scrollProgress - PHASES.CENTERED.start) / (PHASES.ORBIT.start - PHASES.CENTERED.start + .1))
    : 1;
  
  return (
    <section 
      className="fixed inset-0 flex flex-col items-center justify-center pt-20 pointer-events-none z-30"
      style={{
        opacity: opacity * Math.max(0, fadeOut),
        transition: 'opacity 0.15s ease',
      }}
    >
      <div className="text-center px-4">
        <p className="text-lg md:text-xl text-amber-400 uppercase tracking-[0.3em] mb-4">Witness History</p>
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">The Word Revealed</h2>
        <p className="backdrop-blur-sm bg-clip-text text-gray-700 max-w-lg mx-auto">
          From ancient scrolls to modern translations, the Bible has shaped civilizations and touched billions of hearts.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// FINAL CTA OVERLAY
// ============================================================================
function CTAOverlay({ scrollProgress }: { scrollProgress: number }) {
  // Show in FLYBY phase
  const isVisible = scrollProgress > PHASES.FLYBY.start + 0.15;
  const opacity = isVisible 
    ? Math.min(1, (scrollProgress - (PHASES.FLYBY.start + 0.15)) / 0.1) 
    : 0;
  
  return (
    <section 
      className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-30"
      style={{
        opacity,
        transition: 'opacity 0.2s ease',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <div className="bg-gradient-to-br from-amber-900/60 to-amber-800/60 backdrop-blur-xl rounded-3xl p-8 border border-amber-400/30 text-center shadow-2xl min-w-[320px]">
        <span className="text-5xl mb-4 block">🏛️</span>
        <h3 className="text-2xl font-bold text-white mb-2">Visit the Museum</h3>
        <p className="text-gray-300 text-sm mb-6 max-w-xs">
          Experience the full journey through our interactive exhibits.
        </p>
        <a
          href="https://maps.app.goo.gl/ZQN3dpjtG6dom8Fj7"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold rounded-full hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg hover:shadow-amber-500/30"
        >
          Get Directions
        </a>

        {/* RSVP Button - Centered below cards */}
        <div className="mt-6 sm:mt-8">
          <RSVPButton />
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function BibleMuseumTheatre() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // In production, always use preview mode (edit mode disabled)
  const defaultMode = shouldShowEditMode() ? 'preview' : 'preview';
  const { mode, toggleMode, isEditMode, isPreviewMode } = useEditMode(defaultMode);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Mark as loaded after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation for accessibility (Arrow keys, Space, Home/End)
  useKeyboardScroll({
    scrollProgress,
    setScrollProgress: (newProgress) => {
      setScrollProgress(newProgress);
      // Also update Theatre.js directly
      if (mainSheet?.sequence) {
        mainSheet.sequence.position = newProgress * SEQUENCE_LENGTH;
      }
    },
    scrollStep: 0.03, // 3% per key press
    enabled: isPreviewMode,
  });

  // Scroll handler - only active in preview mode
  // Uses window-level wheel + touch capture so scrolling works on all devices
  useEffect(() => {
    if (isEditMode) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    let touchStartY = 0;
    let touchStartProgress = 0;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progress = scrollHeight > 0 
        ? Math.min(Math.max(scrollTop / scrollHeight, 0), 1)
        : 0;
      setScrollProgress(progress);
    };

    // Global wheel handler - scrolls the container regardless of hover target
    const handleWheel = (e: WheelEvent) => {
      container.scrollTop += e.deltaY;
      handleScroll();
    };

    // Touch handlers for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        touchStartY = e.touches[0].clientY;
        touchStartProgress = scrollProgress;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches || !e.touches[0]) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      const sensitivity = 0.001; // Adjust for scroll speed
      const newProgress = Math.min(Math.max(touchStartProgress + deltaY * sensitivity, 0), 1);
      setScrollProgress(newProgress);
      
      // Update Theatre.js directly for smooth mobile animation
      if (mainSheet?.sequence) {
        mainSheet.sequence.position = newProgress * SEQUENCE_LENGTH;
      }
    };

    // Listen on window so scrolling works even when hovering fixed overlays
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [isEditMode, scrollProgress]);

  // Manual scrubber control (for both modes)
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseFloat(e.target.value);
    setScrollProgress(newVal);
    
    // Update Theatre.js directly
    if (mainSheet?.sequence) {
      mainSheet.sequence.position = newVal * SEQUENCE_LENGTH;
    }
  };

  const currentPhase = getCurrentPhase(scrollProgress);

  return (
    <>
      {/* ========== 3D CANVAS - FIXED BACKGROUND ========== */}
      <SceneCanvas>
        <SceneContent 
          isEditMode={isEditMode} 
          scrollProgress={scrollProgress} 
        />
      </SceneCanvas>

      {/* ========== FIXED UI OVERLAYS ========== */}
      {/* These are BELOW the scroll container so scrolling always works */}
      
      {/* Hero Section */}
      {isPreviewMode && <HeroOverlay scrollProgress={scrollProgress} />}
      
      {/* Transition Text */}
      {isPreviewMode && <TransitionOverlay scrollProgress={scrollProgress} />}
      
      {/* Final CTA */}
      {isPreviewMode && <CTAOverlay scrollProgress={scrollProgress} />}

      {/* ========== SCROLL CONTAINER ========== */}
      {/* Hidden scroll container - wheel events are captured globally */}
      <div
        ref={scrollContainerRef}
        className="fixed inset-0 overflow-x-hidden scrollbar-hide pointer-events-none"
        style={{ 
          overflowY: isEditMode ? 'hidden' : 'auto',
          zIndex: 10,
        }}
      >
        <div style={{ height: "1200vh" }} />
      </div>

      {/* ========== LOADING SCREEN ========== */}
      {!isLoaded && (
        <div className="fixed inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center z-[100]">
          <div className="relative w-48 h-48 mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-ping" />
            <div className="absolute inset-4 rounded-full border-2 border-amber-400/30 animate-pulse" />
            <div className="absolute inset-8 rounded-full border-2 border-amber-300/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl">📖</span>
            </div>
          </div>
          <p className="text-amber-400 text-xl mb-2">Loading</p>
          <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 animate-pulse w-full" />
          </div>
        </div>
      )}

      {/* ========== DEV CONTROLS ========== */}
      {/* Only show in development mode */}
      {shouldShowEditMode() && (
        <>
          {/* Mode Toggle */}
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[1002] flex gap-2">
            <button
              onClick={toggleMode}
              className={`px-4 py-2 rounded-lg shadow-lg text-sm font-bold transition-all duration-300 ${
                isEditMode 
                  ? 'bg-amber-500 hover:bg-amber-600 text-gray-900' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isEditMode ? '🎬 Edit Mode' : '👁️ Preview Mode'}
            </button>
            
            <button
              onClick={toggleMode}
              className="px-4 py-2 rounded-lg shadow-lg text-sm font-medium bg-gray-800/80 hover:bg-gray-700 text-gray-300 transition-colors"
            >
              Switch to {isEditMode ? 'Preview' : 'Edit'}
            </button>
          </div>

          {/* Animation Scrubber */}
          <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-[1001] bg-gray-900/95 p-4 rounded-lg border border-purple-500/30 w-96 shadow-2xl">
            <label className="block text-purple-400 text-xs font-bold mb-2 uppercase tracking-wider">
              🎬 Animation Timeline ({isEditMode ? 'Manual' : 'Scroll-Driven'})
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={scrollProgress}
              onChange={handleScrubberChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            
            {/* Phase markers */}
            <div className="relative h-4 mt-1">
              {Object.entries(PHASES).map(([name, phase], i) => (
                <div 
                  key={name}
                  className="absolute top-0 h-full border-l border-gray-600"
                  style={{ left: `${phase.start * 100}%` }}
                >
                  <span className="absolute top-full text-[8px] text-gray-500 -translate-x-1/2 mt-0.5">
                    {name}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mt-4">
              <span>0%</span>
              <span className="text-purple-200 font-bold">
                {currentPhase} • {Math.round(scrollProgress * 100)}%
              </span>
              <span>100%</span>
            </div>
            
            <div className="mt-3 p-2 bg-gray-800/50 rounded text-[10px] text-gray-400 space-y-1">
              {isEditMode ? (
                <>
                  <p>🎨 <strong className="text-white">Edit Mode:</strong> Use OrbitControls to navigate</p>
                  <p>📦 Edit keyframes in Theatre.js panel (bottom)</p>
                  <p>🔧 Drag slider to preview animation states</p>
                </>
              ) : (
                <>
                  <p>📜 <strong className="text-white">Preview Mode:</strong> Scroll to drive animation</p>
                  <p>⌨️ Press Alt+\ to toggle Theatre.js Studio</p>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-800 z-[60]">
        <div
          className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all duration-75"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Phase Indicator - Only in dev mode */}
      {shouldShowEditMode() && (
        <div className="fixed bottom-4 left-4 z-[60] bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700">
          <p className="text-xs text-gray-400">Current Phase</p>
          <p className="text-amber-400 font-mono text-sm font-bold">{currentPhase}</p>
          <p className="text-gray-500 text-xs">{Math.round(scrollProgress * 100)}%</p>
        </div>
      )}
    </>
  );
}
