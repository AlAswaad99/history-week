"use client";

import React from 'react'
import { editable as e } from '@theatre/r3f'

/**
 * Cinematic lighting setup for Bible Museum
 * 
 * Three-point lighting with golden key light (divine/warm)
 * and cool fill for depth and drama.
 * 
 * All lights are Theatre.js editable for keyframe animation.
 */
export function SceneLighting() {
  return (
    <>
      {/* Ambient light - soft base illumination to prevent pure black shadows */}
      <e.ambientLight 
        theatreKey="AmbientLight"
        intensity={0.3}
        color="#b8c6db"
      />
      
      {/* Key light - warm golden divine light from upper right */}
      <e.directionalLight
        theatreKey="KeyLight"
        position={[5, 8, 5]}
        intensity={2.0}
        color="#ffecd2"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light - cool blue from left for contrast */}
      <e.directionalLight
        theatreKey="FillLight"
        position={[-4, 3, 2]}
        intensity={0.6}
        color="#6b8cce"
      />
      
      {/* Rim/Back light - edge separation, slightly warm */}
      <e.spotLight
        theatreKey="RimLight"
        position={[0, 5, -8]}
        intensity={1.5}
        color="#ffddaa"
        angle={0.6}
        penumbra={0.5}
        decay={2}
        distance={30}
      />
      
      {/* Bottom fill - subtle uplight to soften under-shadows */}
      <e.pointLight
        theatreKey="BottomFill"
        position={[0, -3, 3]}
        intensity={0.3}
        color="#ffeedd"
        decay={2}
        distance={15}
      />
    </>
  )
}
