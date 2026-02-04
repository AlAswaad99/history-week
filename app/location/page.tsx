"use client";

import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { OrbitControls } from "@react-three/drei";
import { PerspectiveCamera } from "@theatre/r3f";
import { useFrame } from "@react-three/fiber";
import { editable as e } from "@theatre/r3f";
import * as THREE from "three";

// Import Theatre.js setup
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
import { GroupBookingModal } from "../../components/GroupBookingModal";

// ============================================================================
// ANIMATION PHASES
// ============================================================================
const PHASES = {
  HERO: { start: 0, end: 0.15 },
  REVEAL: { start: 0.15, end: 0.30 },
  CENTERED: { start: 0.30, end: 0.45 },
  ORBIT: { start: 0.20, end: 1 },
  FLYBY: { start: 0.60, end: 1.0 },
};

function getCurrentPhase(progress: number) {
  if (progress < PHASES.HERO.end) return 'መግቢያ';
  if (progress < PHASES.REVEAL.end) return 'መገለጥ';
  if (progress < PHASES.CENTERED.end) return 'ትኩረት';
  if (progress < PHASES.ORBIT.end) return 'ዙረት';
  return 'ጉዞ';
}

// ============================================================================
// MUSEUM CONTENT - AMHARIC TRANSLATION
// ============================================================================
const museumContent: CarouselItem[] = [
  {
    id: 1,
    title: "የኦሪት ዘመን",
    subtitle: "በኦሪት ዘመን",
    description: "የመጀመሪያዎቹ አምስት መጻሕፍት የእምነት መሠረት ናቸው። በእውነተኛ ብራና ላይ የተጻፉ የኦሪት ጥቅልሎችን እዚህ ይመልከቱ።",
    icon: "📜",
    period: "ከክርስቶስ ልደት በፊት 1500-1300",
    image: "/card_images/card_1.png",
  },
  {
    id: 2,
    title: "የመሳፍንት ዘመን",
    subtitle: "የመሳፍንት ዘመን",
    description: "ከኢያሱ በኋላ እስራኤል በዲቦራ፣ በጌዴዎን እና በሳምሶን ይመሩ የነበረበት ወቅት። የነገድ አስተዳደር እና የነፃነት ዘመን።",
    icon: "⚖️",
    period: "ከክርስቶስ ልደት በፊት 1300-1050",
    image: "/card_images/card_2.png",
  },
  {
    id: 3,
    title: "የነገሥታትና የነቢያት ዘመን",
    subtitle: "የነገሥታት ዘመን",
    description: "የእስራኤል መንግሥት የከበረበት ወርቃማ ዘመን። የንጉሥ ሰሎሞን ቤተ መቅደስ ንዋያተ ቅድሳትን ምሳሌዎች ይመልከቱ።",
    icon: "👑",
    period: "ከክርስቶስ ልደት በፊት 1050-586",
    image: "/card_images/card_3.png",
  },
  {
    id: 4,
    title: "የምርኮ ዘመን",
    subtitle: "የምርኮ ዘመን",
    description: "እስራኤላውያን በባቢሎን በምርኮ ሳሉ ነቢያቱ ዳንኤልና ሕዝቅኤል በባዕድ አገር ያስተማሩበት ወቅት።",
    icon: "🌒",
    period: "ከክርስቶስ ልደት በፊት 586-538",
    image: "/card_images/card_4.png",
  },
  {
    id: 5,
    title: "የተሃድሶ ዘመን",
    subtitle: "የመመለስ ዘመን",
    description: "ከምርኮ መመለስ፤ በዕዝራ እና በነህምያ መሪነት የኢየሩሳሌም ቤተ መቅደስ እና ማህበረሰቡ እንደገና የታነፀበት ጊዜ።",
    icon: "🏗️",
    period: "ከክርስቶስ ልደት በፊት 538-400",
    image: "/card_images/card_5.png",
  },
  {
    id: 6,
    title: "የጥበብ መጻሕፍት",
    subtitle: "የጥበብ መጻሕፍት",
    description: "መዝሙረ ዳዊት፣ መጽሐፈ ምሳሌ እና መለኮታዊ ጥበብ በስነ-ጽሁፍ የተቀመጡበት ድንቅ ስብስብ።",
    icon: "✨",
    period: "ከክርስቶስ ልደት በፊት 1000-200",
    image: "/card_images/card_6.png",
  },
  {
    id: 7,
    title: "ወንጌልና ቀዳሚዋ ቤተክርስቲያን",
    subtitle: "የወንጌል ዘመን",
    description: "የጌታችን የኢየሱስ ክርስቶስ ሕይወትና ትምህርት በአራቱ ወንጌላት በኩል የሚታይበት።",
    icon: "✝️",
    period: "ከ1-100 ዓመተ ምሕረት",
    image: "/card_images/card_7.png",
  },
  {
    id: 8,
    title: "የሐዋርያት ሥራና ራዕይ",
    subtitle: "የሐዋርያት ተግባር",
    description: "ቤተክርስቲያን ተመስርታ የተስፋፋችበት ወቅት። የሐዋርያው ጳውሎስን የሚስዮን ጉዞዎች ይከተሉ።",
    icon: "💫",
    period: "ከ30-100 ዓመተ ምሕረት",
    image: "/card_images/card_8.png",
  }
];

function ScrollAnimationDriver({ enabled, scrollProgress }: { enabled: boolean; scrollProgress: number }) {
  useFrame(() => {
    if (enabled && mainSheet?.sequence) {
      mainSheet.sequence.position = scrollProgress * SEQUENCE_LENGTH;
    }
  });
  return null;
}

function SceneContent({ isEditMode, scrollProgress }: { isEditMode: boolean; scrollProgress: number }) {
  return (
    <>
      <PerspectiveCamera theatreKey="Camera" makeDefault position={[0, 0, 10]} fov={60} />
      <SceneLighting />
      <SceneFog enabled={true} />
      <BibleModel showAnchorPoint={shouldShowDebugHelpers() && isEditMode} />
      <RibbonCarousel
        items={museumContent}
        scrollProgress={scrollProgress}
        orbitStart={PHASES.ORBIT.start}
        orbitEnd={PHASES.ORBIT.end}
        isEditMode={isEditMode}
      />
      {shouldShowDebugHelpers() && isEditMode && <SceneHelpers />}
      {shouldShowEditMode() && isEditMode && (
        <OrbitControls enableDamping dampingFactor={0.05} screenSpacePanning />
      )}
      <ScrollAnimationDriver enabled={!isEditMode} scrollProgress={scrollProgress} />
    </>
  );
}

function HeroOverlay({ scrollProgress }: { scrollProgress: number }) {
  const heroOpacity = Math.max(0, 1 - (scrollProgress / PHASES.REVEAL.start) * 1.2);
  const heroY = scrollProgress * -200;
  
  return (
    <section className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-30" style={{ opacity: heroOpacity, transform: `translateY(${heroY}px)`, transition: 'opacity 0.1s ease' }}>
      <div className="text-center px-4 pointer-events-auto">
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 mb-2 sm:mb-4 drop-shadow-2xl">
          የመጽሐፍ ቅዱስ ሙዚየም
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-amber-300/90 mb-1 sm:mb-2">
          ከዘፍጥረት እስከ ራዕይ
        </p>
        <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-300/80 max-w-2xl mx-auto px-2">
          በዓለም ላይ እጅግ የተቀደሰውን መጽሐፍ ታሪክ አብረን እንመርምር
        </p>
        
        <div className="mt-6 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto px-2">
          <div className="bg-gray-900/60 backdrop-blur-sm p-3 sm:p-6 rounded-xl border border-amber-500/20">
            <p className="text-amber-400 text-lg sm:text-xl uppercase mb-1 sm:mb-2">መቼ</p>
            <p className="text-white text-sm sm:text-lg font-bold">የካቲት 1 - 30, 2018</p>
            <p className="text-gray-400 text-xs sm:text-sm">የካቲት 2026</p>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-sm p-3 sm:p-6 rounded-xl border border-amber-500/20">
            <p className="text-amber-400 text-lg sm:text-xl uppercase mb-1 sm:mb-2">የት</p>
            <p className="text-white text-sm sm:text-lg font-bold">ቤቴል የዓለም ብርሃን መሰረተ ክርስቶስ ቤተክርስቲያን</p>
            <p className="text-gray-400 text-xs sm:text-sm">አዲስ አበባ</p>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-sm p-3 sm:p-6 rounded-xl border border-amber-500/20">
            <p className="text-amber-400 text-lg sm:text-xl uppercase mb-1 sm:mb-2">ምን</p>
            <p className="text-white text-sm sm:text-lg font-bold">የመጽሐፍ ቅዱስ ሙዚየም</p>
            <p className="text-gray-400 text-xs sm:text-sm">ታሪካዊ ቅርሶች</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce pointer-events-auto">
        <span className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 hidden sm:block">ለማየት ወደ ታች ይውረዱ</span>
        <span className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 sm:hidden">ለማየት ወደ ላይ ይግፉ</span>
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}

function TransitionOverlay({ scrollProgress }: { scrollProgress: number }) {
  const isVisible = scrollProgress + .15 > PHASES.HERO.end && scrollProgress < (PHASES.ORBIT.start + .3);
  const opacity = isVisible ? Math.min(1, (scrollProgress - PHASES.HERO.end) / 0.1) : 0;
  const fadeOut = scrollProgress + .15 > PHASES.CENTERED.start 
    ? 1 - ((scrollProgress - PHASES.CENTERED.start) / (PHASES.ORBIT.start - PHASES.CENTERED.start + .1))
    : 1;
  
  return (
    <section className="fixed inset-0 flex flex-col items-center justify-center pt-20 pointer-events-none z-30" style={{ opacity: opacity * Math.max(0, fadeOut), transition: 'opacity 0.15s ease' }}>
      <div className="text-center px-4">
        <p className="text-lg md:text-xl text-amber-400 uppercase tracking-[0.3em] mb-4">ታሪክን ይመስክሩ</p>
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">ቃሉ ተገለጠ</h2>
        <p className="backdrop-blur-sm bg-clip-text text-gray-700 max-w-lg mx-auto">
          ከጥንታውያን ብራናዎች እስከ ዘመናዊ ትርጉሞች፤ መጽሐፍ ቅዱስ ስልጣኔን ቀርጿል፣ በቢሊዮን የሚቆጠሩ ልቦችንም ለውጡዋል።
        </p>
      </div>
    </section>
  );
}

function CTAOverlay({ scrollProgress, onOpenGroupModal }: { scrollProgress: number; onOpenGroupModal: () => void; }) {
  const isVisible = scrollProgress > PHASES.FLYBY.start + 0.15;
  const opacity = isVisible ? Math.min(1, (scrollProgress - (PHASES.FLYBY.start + 0.15)) / 0.1) : 0;
  
  return (
    <section className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-30" style={{ opacity, transition: 'opacity 0.2s ease', pointerEvents: isVisible ? 'auto' : 'none' }}>
      <div className="bg-gradient-to-br from-amber-900/60 to-amber-800/60 backdrop-blur-xl rounded-3xl p-8 border border-amber-400/30 text-center shadow-2xl min-w-[320px]">
        <span className="text-5xl mb-4 block">🏛️</span>
        <h3 className="text-2xl font-bold text-white mb-2">ሙዚየሙን ይጎብኙ</h3>
        <p className="text-gray-300 text-sm mb-6 max-w-xs">
          ሙሉ ጉዞውን በሙዚየማችን በዝርዝር ይመልከቱ።
        </p>
        <a href="https://maps.app.goo.gl/ZQN3dpjtG6dom8Fj7" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold rounded-full hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg">
          አቅጣጫ ያሳዩኝ
        </a>
        <div className="mt-2 sm:mt-4">
          <RSVPButton onOpenGroupModal={onOpenGroupModal} />
        </div>
      </div>
    </section>
  );
}

export default function BibleMuseumTheatre() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const defaultMode = shouldShowEditMode() ? 'preview' : 'preview';
  const { mode, toggleMode, isEditMode, isPreviewMode } = useEditMode(defaultMode);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useKeyboardScroll({
    scrollProgress,
    setScrollProgress: (newProgress) => {
      setScrollProgress(newProgress);
      if (mainSheet?.sequence) {
        mainSheet.sequence.position = newProgress * SEQUENCE_LENGTH;
      }
    },
    scrollStep: 0.03,
    enabled: isPreviewMode,
  });

  const touchStartRef = useRef({ y: 0, progress: 0 });
  const scrollProgressRef = useRef(scrollProgress);
  
  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    if (isEditMode) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progress = scrollHeight > 0 ? Math.min(Math.max(scrollTop / scrollHeight, 0), 1) : 0;
      setScrollProgress(progress);
    };

    const handleWheel = (e: WheelEvent) => {
      container.scrollTop += e.deltaY;
      handleScroll();
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        touchStartRef.current = { y: e.touches[0].clientY, progress: scrollProgressRef.current };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches || !e.touches[0]) return;
      e.preventDefault();
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartRef.current.y - touchY;
      const viewportHeight = window.innerHeight;
      const sensitivity = 0.5 / viewportHeight;
      const newProgress = Math.min(Math.max(touchStartRef.current.progress + deltaY * sensitivity, 0), 1);
      setScrollProgress(newProgress);
      if (mainSheet?.sequence) {
        mainSheet.sequence.position = newProgress * SEQUENCE_LENGTH;
      }
    };

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
  }, [isEditMode]);

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseFloat(e.target.value);
    setScrollProgress(newVal);
    if (mainSheet?.sequence) {
      mainSheet.sequence.position = newVal * SEQUENCE_LENGTH;
    }
  };

  const currentPhase = getCurrentPhase(scrollProgress);

  return (
    <>
      <SceneCanvas>
        <SceneContent isEditMode={isEditMode} scrollProgress={scrollProgress} />
      </SceneCanvas>

      {isPreviewMode && <HeroOverlay scrollProgress={scrollProgress} />}
      {isPreviewMode && <TransitionOverlay scrollProgress={scrollProgress} />}
      {isPreviewMode && <CTAOverlay scrollProgress={scrollProgress} onOpenGroupModal={() => setIsGroupModalOpen(true)} />}

      <GroupBookingModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />

      <div ref={scrollContainerRef} className="fixed inset-0 overflow-x-hidden scrollbar-hide" style={{ overflowY: isEditMode ? 'hidden' : 'auto', zIndex: 10, touchAction: 'none', pointerEvents: 'none' }}>
        <div style={{ height: "1200vh" }} />
      </div>

      {!isLoaded && (
        <div className="fixed inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center z-[100]">
          <div className="relative w-48 h-48 mb-8">
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-ping" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl">📖</span>
            </div>
          </div>
          <p className="text-amber-400 text-xl mb-2">በመጫን ላይ</p>
          <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 animate-pulse w-full" />
          </div>
        </div>
      )}

      {shouldShowEditMode() && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-[1001] bg-gray-900/95 p-4 rounded-lg border border-purple-500/30 w-96 shadow-2xl">
          <label className="block text-purple-400 text-xs font-bold mb-2 uppercase tracking-wider">የእንቅስቃሴ መስመር</label>
          <input type="range" min="0" max="1" step="0.001" value={scrollProgress} onChange={handleScrubberChange} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
          <div className="flex justify-between text-xs text-gray-500 mt-4">
            <span>0%</span>
            <span className="text-purple-200 font-bold">{currentPhase} • {Math.round(scrollProgress * 100)}%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-800 z-[60]">
        <div className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all duration-75" style={{ width: `${scrollProgress * 100}%` }} />
      </div>
    </>
  );
}