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
import { useAssetPreloader } from "../../hooks/useAssetPreloader";
import { RSVPButton } from "../../components/RSVPButton";
import { shouldShowEditMode, shouldShowDebugHelpers } from "../../lib/devMode";
import { GroupBookingModal } from "../../components/GroupBookingModal";
import PageScroller from "../../components/Blocks/PageScroller";

// ============================================================================
// ANIMATION PHASES
// ============================================================================
const PHASES = {
  HERO: { start: 0, end: 0.15 },
  REVEAL: { start: 0.15, end: 0.30 },
  CENTERED: { start: 0.30, end: 0.45 },
  ORBIT: { start: 0.10, end: 1 },
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

// ============================================================================
// FLOATING PARTICLE — pure CSS, rendered as inline SVG circles
// ============================================================================
function FloatingParticles() {
  const particles = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1.5,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: Math.random() * 6 + 8,
    opacity: Math.random() * 0.5 + 0.2,
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bottom-0 rounded-full bg-amber-400"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            opacity: 0,
            animation: `float-particle ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// HERO OVERLAY
// ============================================================================
function HeroOverlay({ scrollProgress }: { scrollProgress: number }) {
  const heroOpacity = Math.max(0, 1 - (scrollProgress / PHASES.REVEAL.start) * 1.2);
  const heroY = scrollProgress * -200;

  return (
    <section
      className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-30"
      style={{ opacity: heroOpacity, transform: `translateY(${heroY}px)`, transition: 'opacity 0.1s ease' }}
    >
      <FloatingParticles />

      <div className="relative text-center px-4 pointer-events-auto">
        {/* Overline label */}
        <p
          className="text-xs sm:text-sm uppercase tracking-[0.4em] text-amber-400/80 mb-3 sm:mb-5 font-light"
          style={{ animation: 'fade-in-up 0.8s 0.1s ease-out both' }}
        >
          ቤቴል የአለም ብርሃን መሠረተ ክርስቶስ ቤተክርስቲያን · 2018
        </p>

        {/* Main title — Habesha serif for Amharic beauty */}
        <h1
          className="font-habesha-bold text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-tight mb-3 sm:mb-5"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #fde68a 30%, #d97706 55%, #fbbf24 75%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            backgroundSize: '200% auto',
            animation: 'shimmer-gradient 5s ease-in-out infinite, fade-in-up 0.9s 0.2s ease-out both',
            textShadow: 'none',
            filter: 'drop-shadow(0 0 40px rgba(251,191,36,0.25))',
          }}
        >
          የመጽሐፍ ቅዱስ ሙዚየም
        </h1>

        {/* Sub-heading */}
        <p
          className="text-lg sm:text-xl md:text-2xl text-amber-200/80 mb-1 sm:mb-2 font-light tracking-wide"
          style={{ animation: 'fade-in-up 0.9s 0.35s ease-out both' }}
        >
          ከዘፍጥረት እስከ ራዕይ
        </p>
        <p
          className="text-sm sm:text-base md:text-lg text-gray-400/90 max-w-xl mx-auto px-2"
          style={{ animation: 'fade-in-up 0.9s 0.45s ease-out both' }}
        >
          የእግዚአብሔር እስትንፋስ የሆነውን ቅዱስ ቃሉን አብረን እንጎብኝ
        </p>

        {/* Info cards */}
        <div
          className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 max-w-3xl mx-auto px-2"
          style={{ animation: 'fade-in-up 1s 0.6s ease-out both' }}
        >
          {[
            { label: 'መቼ', value: 'የካቲት 1 - መጋቢት 11, 2018', sub: 'Feb/March 2026' },
            { label: 'የት', value: 'ቤቴል የዓለም ብርሃን መሠረተ ክርስቶስ ቤተክርስቲያን', sub: 'አዲስ አበባ' },
            { label: 'ምን', value: 'የመጽሐፍ ቅዱስ ሙዚየም', sub: 'ታሪካዊ ቅርሶች' },
          ].map(({ label, value, sub }) => (
            <div
              key={label}
              className="location-card-shimmer rounded-2xl p-4 sm:p-5 text-left"
              style={{
                background: 'rgba(10, 8, 20, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(251,191,36,0.15)',
              }}
            >
              <p className="text-amber-400 text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-2">{label}</p>
              <p className="text-white text-sm sm:text-base font-semibold leading-snug">{value}</p>
              <p className="text-gray-500 text-xs mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        style={{ animation: 'fade-in-up 1s 1s ease-out both' }}
      >
        {/* <span className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-[0.25em] hidden sm:block">
          ወደ ታች ይውረዱ
        </span>
        <span className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:hidden">
          ወደ ላይ ይግፉ
        </span>
        */}
        {/* Pulsing rings */}
        {/* <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-amber-400/40 animate-ping" />
          <div className="absolute inset-1 rounded-full border border-amber-400/20 animate-ping" style={{ animationDelay: '0.3s' }} />
          <svg className="w-4 h-4 text-amber-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div> */}

      <PageScroller direction="down" next="histories" variant="shimmer" />
      </div>  
    </section>
  );
}

// ============================================================================
// TRANSITION OVERLAY
// ============================================================================
function TransitionOverlay({ scrollProgress }: { scrollProgress: number }) {
  const isVisible = scrollProgress + .15 > PHASES.HERO.end && scrollProgress < (PHASES.ORBIT.start + .3);
  const opacity = isVisible ? Math.min(1, (scrollProgress - PHASES.HERO.end) / 0.1) : 0;
  const fadeOut = scrollProgress + .15 > PHASES.CENTERED.start
    ? 1 - ((scrollProgress - PHASES.CENTERED.start) / (PHASES.ORBIT.start - PHASES.CENTERED.start + .1))
    : 1;

  return (
    <section
      className="fixed inset-0 flex flex-col items-center justify-center pt-20 pointer-events-none z-30"
      style={{ opacity: opacity * Math.max(0, fadeOut), transition: 'opacity 0.15s ease' }}
    >
      {/* Decorative horizontal rule */}
      <div
        className="mb-6 flex items-center gap-4 w-full max-w-sm px-8"
        style={{ opacity: Math.min(1, opacity * 2) }}
      >
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-500/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-500/50" />
      </div>

      <div className="text-center p-4"
            style={{
              background: 'rgba(10, 8, 20, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(251,191,36,0.15)',
              borderRadius: '30px',
              opacity: opacity * Math.max(0, fadeOut), transition: 'opacity 0.15s ease' 
            }}>
        {/* Eyebrow */}
        <p className="text-xs sm:text-sm uppercase tracking-[0.5em] text-amber-400/70 mb-5 font-light">
          ታሪክን ይመስክሩ
        </p>

        {/* Main heading with text glow */}
        <h2
          className="font-habesha-bold text-4xl md:text-6xl lg:text-7xl text-white mb-6"
          style={{
            letterSpacing: '0.02em',
          }}
        >
          ቃሉ ተገለጠ
        </h2>

        {/* Body text with subtle backdrop */}
        <p
          className="text-sm sm:text-base md:text-lg text-gray-200/90 max-w-md mx-auto leading-relaxed font-thin px-4"
         
        >
          ከጥንታውያን ብራናዎች እስከ ዘመናዊ ትርጉሞች፤ መጽሐፍ ቅዱስ ስልጣኔን ቀርጿል፣ በቢሊዮን የሚቆጠሩ ልቦችንም ለውጡዋል።
        </p>
      </div>

      {/* Bottom rule */}
      <div
        className="mt-6 flex items-center gap-4 w-full max-w-sm px-8"
        style={{ opacity: Math.min(1, opacity * 2) }}
      >
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-500/30" />
        <div className="w-1 h-1 rounded-full bg-amber-400/50" />
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-500/30" />
      </div>
    </section>
  );
}

// ============================================================================
// CTA OVERLAY
// ============================================================================
function CTAOverlay({ scrollProgress, onOpenGroupModal }: {
  scrollProgress: number;
  onOpenGroupModal: () => void;
}) {
  const isVisible = scrollProgress > PHASES.FLYBY.start + 0.15;
  const opacity = isVisible ? Math.min(1, (scrollProgress - (PHASES.FLYBY.start + 0.15)) / 0.1) : 0;

  return (
    <section
      className="fixed bottom-16 left-1/2 -translate-x-1/2 z-30"
      style={{ opacity, transition: 'opacity 0.2s ease', pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      {/* Outer animated border wrapper */}
      <div className="location-cta-border rounded-3xl p-[2px]">
        {/* Inner card */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(12,8,24,0.92) 0%, rgba(20,12,32,0.92) 100%)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(251,191,36,0.12)',
            minWidth: 300,
          }}
        >
          {/* Subtle grain on card */}
          <div className="location-grain absolute inset-0 pointer-events-none" aria-hidden />

          {/* Ambient top glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent)' }}
          />

          <div className="relative z-10 p-6 sm:p-8 text-center">
            {/* Icon with halo */}
            <div className="relative inline-flex items-center justify-center mb-4">
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-40"
                style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
              />
              <span className="relative text-5xl">🏛️</span>
            </div>

            <h3
              className="font-habesha-bold text-2xl text-white mb-1.5"
              style={{ textShadow: '0 0 30px rgba(251,191,36,0.2)' }}
            >
              ሙዚየሙን ይጎብኙ
            </h3>
            <p className="text-gray-400 text-sm mb-6 max-w-[220px] mx-auto leading-relaxed">
              ሙሉ ጉዞውን በሙዚየማችን በዝርዝር ይመልከቱ።
            </p>

            {/* Directions CTA */}
            <a
              href="/map"
              target="_blank"
              rel="noopener noreferrer"
              className="location-btn-shimmer inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm text-gray-900 transition-all duration-300 shadow-lg hover:shadow-amber-500/25 hover:scale-[1.03] active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #d97706 100%)',
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              አቅጣጫ አሳየኝ
            </a>

            {/* Divider */}
            <div className="my-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-gray-600 text-xs">ወይም</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* RSVP group */}
            <RSVPButton onOpenGroupModal={onOpenGroupModal} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// LOADING SCREEN
// ============================================================================
function LoadingScreen({ progress }: { progress: number }) {
  const pct = Math.round(progress * 100);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden location-grain"
      style={{ background: 'radial-gradient(ellipse at center, #0d0a1a 0%, #050308 100%)' }}
    >
      {/* Ambient radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(217,165,32,0.07) 0%, transparent 70%)' }}
      />

      {/* Ornamental spinning ring */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-10" aria-hidden>
        {/* Outer slow ring */}
        <div
          className="absolute inset-0 rounded-full border border-amber-500/15"
          style={{ animation: 'loader-ring-spin 12s linear infinite' }}
        >
          {/* Bright arc segment */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400/80" />
        </div>
        {/* Middle counter-spinning ring */}
        <div
          className="absolute inset-4 rounded-full border border-amber-400/25"
          style={{ animation: 'loader-ring-spin 8s linear infinite reverse' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-300/90" />
        </div>
        {/* Inner fast ring */}
        <div
          className="absolute inset-8 rounded-full"
          style={{
            border: '1px solid transparent',
            background: 'linear-gradient(#050308, #050308) padding-box, conic-gradient(from 0deg, rgba(251,191,36,0.8), transparent, rgba(251,191,36,0.4), transparent, rgba(251,191,36,0.8)) border-box',
            animation: 'loader-ring-spin 3s linear infinite',
          }}
        />
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl sm:text-6xl" style={{ filter: 'drop-shadow(0 0 16px rgba(251,191,36,0.5))' }}>
            📖
          </span>
        </div>
      </div>

      {/* Text block */}
      <div className="text-center mb-8" style={{ animation: 'fade-in-up 0.8s 0.2s ease-out both' }}>
        <p
          className="font-habesha-bold text-xl sm:text-2xl text-amber-300 mb-1"
          style={{ textShadow: '0 0 30px rgba(251,191,36,0.4)' }}
        >
          በመጫን ላይ
        </p>
        <p className="text-gray-600 text-xs tracking-widest uppercase">{pct}%</p>
      </div>

      {/* Progress bar */}
      <div className="w-56 sm:w-72 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #92400e, #f59e0b, #fde68a, #f59e0b, #92400e)',
            backgroundSize: '200% auto',
            animation: 'progress-fill 2s linear infinite',
          }}
        />
      </div>

      {/* Bottom label */}
      <p
        className="absolute bottom-8 text-gray-700 text-[10px] tracking-[0.3em] uppercase"
        style={{ animation: 'fade-in-up 1s 0.5s ease-out both' }}
      >
        Bible Museum · BYBMK
      </p>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function BibleMuseumTheatre() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const defaultMode = shouldShowEditMode() ? 'preview' : 'preview';
  const { mode, toggleMode, isEditMode, isPreviewMode } = useEditMode(defaultMode);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // Real asset preloading — replaces the fake setTimeout
  const { progress, isReady } = useAssetPreloader();

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

      <div
        ref={scrollContainerRef}
        className="fixed inset-0 overflow-x-hidden scrollbar-hide"
        style={{ overflowY: isEditMode ? 'hidden' : 'auto', zIndex: 10, touchAction: 'none', pointerEvents: 'none' }}
      >
        <div style={{ height: "1200vh" }} />
      </div>

      {/* Real loading screen — removed when all assets are ready */}
      {!isReady && <LoadingScreen progress={progress} />}

      {shouldShowEditMode() && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-[1001] bg-gray-900/95 p-4 rounded-lg border border-purple-500/30 w-96 shadow-2xl">
          <label className="block text-purple-400 text-xs font-bold mb-2 uppercase tracking-wider">የእንቅስቃሴ መስመር</label>
          <input
            type="range" min="0" max="1" step="0.001" value={scrollProgress}
            onChange={handleScrubberChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-4">
            <span>0%</span>
            <span className="text-purple-200 font-bold">{currentPhase} • {Math.round(scrollProgress * 100)}%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 h-px bg-gray-800/60 z-[60]">
        <div
          className="h-full transition-all duration-75"
          style={{
            width: `${scrollProgress * 100}%`,
            background: 'linear-gradient(90deg, #92400e, #f59e0b, #fde68a)',
          }}
        />
      </div>
    </>
  );
}