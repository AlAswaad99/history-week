"use client";

import * as THREE from 'three';
import React, { useRef, useMemo, useEffect, Suspense, useState, useCallback } from 'react';
import { easing } from 'maath';
import { useFrame } from '@react-three/fiber';
import { Image, useTexture } from '@react-three/drei';
import { editable as e, useCurrentSheet } from '@theatre/r3f';
import { types } from '@theatre/core';
import './BentPlaneGeometry';

// ============================================================================
// TYPES
// ============================================================================
export interface CarouselItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  period: string;
  image?: string;
  color?: string;
}

interface RibbonCarouselProps {
  items: CarouselItem[];
  scrollProgress: number;
  orbitStart: number;
  orbitEnd: number;
  isEditMode?: boolean;
}

// ============================================================================
// CARD COLORS - Used when no image provided
// ============================================================================
const CARD_COLORS = [
  '#e94560', '#ff8906', '#bbe1fa', '#ee4540',
  '#e94560', '#7b2cbf', '#faa307', '#778da9',
];

// ============================================================================
// CAROUSEL CARD - Using Image component for curved cards
// ============================================================================
interface CarouselCardProps {
  item: CarouselItem;
  index: number;
  totalItems: number;
  radius: number;
  cardWidth: number;
  cardHeight: number;
  bendRadius: number;
}

function CarouselCard({
  item,
  index,
  totalItems,
  radius,
  cardWidth,
  cardHeight,
  bendRadius,
}: CarouselCardProps) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Calculate position in circle - cards are adjacent (edge to edge)
  const angle = (index / totalItems) * Math.PI * 2;
  const position: [number, number, number] = [
    Math.sin(angle) * radius,
    0,
    Math.cos(angle) * radius
  ];
  
  // Each card faces outward from center
  const rotation: [number, number, number] = [0, angle, 0];
  
  // Hover animation with easing - scale, radius, and zoom
  useFrame((state, delta) => {
    if (!ref.current) return;
    
    // Smooth scale on hover using easing
    easing.damp3(
      ref.current.scale, 
      hovered ? [1.15, 1.15, 1.15] : [1, 1, 1], 
      0.1, 
      delta
    );
    
    // Animate material properties if available (for Image component)
    const material = ref.current.material as any;
    if (material) {
      // Animate border radius (if supported by material)
      if ('radius' in material) {
        easing.damp(material, 'radius', hovered ? 0.25 : 0.1, 0.2, delta);
      }
      // Animate zoom (if supported by material)
      if ('zoom' in material) {
        easing.damp(material, 'zoom', hovered ? 1 : 1.5, 0.2, delta);
      }
    }
  });
  
  const pointerOver = useCallback((e: any) => {
    e.stopPropagation();
    setHovered(true);
  }, []);
  
  const pointerOut = useCallback(() => {
    setHovered(false);
  }, []);
  
  // Get color for this card
  const cardColor = CARD_COLORS[index % CARD_COLORS.length] ?? '#e94560';
  
  // If image is provided, use Image component
  if (item.image) {
    return (
      <Image
        ref={ref as any}
        url={item.image}
        transparent
        side={THREE.DoubleSide}
        position={position}
        rotation={rotation}
        onPointerOver={pointerOver}
        onPointerOut={pointerOut}
      >
        <bentPlaneGeometry args={[-0.5, cardWidth, cardHeight, 20, 20, true]} />
      </Image>
    );
  }
  
  // If no image, use a colored mesh with bent geometry
  return (
    <mesh
      ref={ref}
      position={position}
      rotation={rotation}
      onPointerOver={pointerOver}
      onPointerOut={pointerOut}
    >
      <bentPlaneGeometry args={[bendRadius, cardWidth, cardHeight, 20, 20]} />
      <meshStandardMaterial
        color={cardColor}
        side={THREE.DoubleSide}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

// ============================================================================
// BANNER - Horizontal cylinder wrapping around the carousel
// ============================================================================
interface BannerProps {
  radius: number;
  position: [number, number, number];
}

function BannerInner({ radius, position }: BannerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  
  // Load texture
  const texture = useTexture('/banner-bg.png');
  
  // Configure texture properties BEFORE using it
  useMemo(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(30, 1);
      texture.anisotropy = 16;
      texture.needsUpdate = true;
    }
  }, [texture]);
  
  // Animate the banner
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.time.value += delta * 2;
    }
    // Animate texture offset directly
    if (texture) {
      texture.offset.x += delta * 0.3;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[radius, radius, 0.14, 128, 16, true]} />
      <meshSineMaterial
        ref={materialRef}
        map={texture}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function BannerFallback({ radius, position }: BannerProps) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[radius, radius, 0.14, 128, 16, true]} />
      <meshBasicMaterial color="#ffd700" side={THREE.DoubleSide} transparent opacity={0.9} />
    </mesh>
  );
}

function Banner(props: BannerProps) {
  return (
    <Suspense fallback={<BannerFallback {...props} />}>
      <BannerInner {...props} />
    </Suspense>
  );
}

// ============================================================================
// MAIN CAROUSEL COMPONENT
// ============================================================================
export function RibbonCarousel({
  items,
  scrollProgress,
  orbitStart,
  orbitEnd,
  isEditMode = false,
}: RibbonCarouselProps) {
  const sheet = useCurrentSheet();
  const rigRef = useRef<THREE.Group>(null);
  const carouselRef = useRef<THREE.Group>(null);
  
  // Theatre.js editable parameters
  const carouselObj = useMemo(() => {
    if (!sheet) return null;
    return sheet.object('Carousel', {
      // Carousel shape
      radius: types.number(2, { range: [0.5, 8] }),
      cardWidth: types.number(1.2, { range: [0.5, 3] }),
      cardHeight: types.number(1.6, { range: [0.5, 3] }),
      bendRadius: types.number(0.1, { range: [0.05, 1] }),
      
      // Rotation
      rotationSpeed: types.number(1, { range: [0.1, 5] }),
      tiltZ: types.number(0.15, { range: [-0.5, 0.5] }),
      
      // Entry animation (Y position)
      entryY: types.number(0, { range: [-10, 10] }),
      
      // Banner
      bannerRadius: types.number(2.5, { range: [1, 8] }),
      bannerY: types.number(-0.15, { range: [-2, 2] }),
    });
  }, [sheet]);
  
  // Store current parameter values
  const paramsRef = useRef({
    radius: 2,
    cardWidth: 1.2,      // width in 3D units, aspect = 3:4
    cardHeight: 1.6,     // height in 3D units
    bendRadius: 0.1,
    rotationSpeed: 1,
    tiltZ: 0.15,
    entryY: 0,
    bannerRadius: 2.5,
    bannerY: -0.15,
  });
  
  useEffect(() => {
    if (!carouselObj) return;
    const unsubscribe = carouselObj.onValuesChange((values) => {
      paramsRef.current = values;
    });
    return unsubscribe;
  }, [carouselObj]);
  
  // Calculate animation state
  const animationState = useMemo(() => {
    const phaseLength = orbitEnd - orbitStart;
    
    if (scrollProgress < orbitStart) {
      return { visible: false, progress: 0 };
    }
    
    if (scrollProgress > orbitEnd) {
      return { visible: false, progress: 1 };
    }
    
    const phaseProgress = (scrollProgress - orbitStart) / phaseLength;
    return { visible: true, progress: phaseProgress };
  }, [scrollProgress, orbitStart, orbitEnd]);
  
  // Animate rotation based on scroll + subtle pointer movement
  useFrame((state, delta) => {
    if (!rigRef.current) return;
    
    // Rotation driven by scroll progress
    const targetRotation = -animationState.progress * Math.PI * 2 * paramsRef.current.rotationSpeed;
    rigRef.current.rotation.y += (targetRotation - rigRef.current.rotation.y) * 0.1;
    
    // Update raycasts every frame for smooth hover detection
    state.events.update?.();
    
    // Subtle rig movement based on pointer (NOT camera movement)
    // This creates a parallax-like effect as the user moves the mouse
    if (carouselRef.current) {
      const targetX = -state.pointer.x * 0.3;
      const targetY = state.pointer.y * 0.15;
      easing.damp3(
        carouselRef.current.position,
        [targetX, targetY, 0],
        0.3,
        delta
      );
    }
  });
  
  if (!animationState.visible && !isEditMode) return null;
  
  const { 
    radius, cardWidth, cardHeight, bendRadius,
    tiltZ, entryY, bannerRadius, bannerY
  } = paramsRef.current;
  
  return (
    <e.group theatreKey="CarouselGroup" position={[0, entryY, 0]}>
      {/* Rig group - handles rotation and tilt */}
      <group ref={rigRef} rotation={[0, 0, tiltZ]}>
        {/* Carousel - all cards */}
        <group ref={carouselRef}>
          {items.map((item, index) => (
            <CarouselCard
              key={item.id}
              item={item}
              index={index}
              totalItems={items.length}
              radius={radius}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              bendRadius={bendRadius}
            />
          ))}
        </group>
      </group>
      
      {/* Banner - wraps around carousel */}
      <e.group theatreKey="Banner">
        <Banner 
          radius={bannerRadius}
          position={[0, bannerY, 0]}
        />
      </e.group>
    </e.group>
  );
}

export default RibbonCarousel;
