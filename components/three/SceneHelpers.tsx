"use client";

import React from 'react'
import * as THREE from 'three'

interface SceneHelpersProps {
  showGrid?: boolean
  showAxes?: boolean
  showOriginMarker?: boolean
  gridSize?: number
  gridDivisions?: number
}

export function SceneHelpers({
  showGrid = true,
  showAxes = true,
  showOriginMarker = true,
  gridSize = 20,
  gridDivisions = 20,
}: SceneHelpersProps) {
  return (
    <>
      {/* Ground grid */}
      {showGrid && (
        <gridHelper 
          args={[gridSize, gridDivisions, 0x888888, 0x444444]} 
        />
      )}
      
      {/* World axes - R=X, G=Y, B=Z */}
      {showAxes && (
        <axesHelper args={[10]} />
      )}
      
      {/* Origin marker - bright sphere at world 0,0,0 */}
      {showOriginMarker && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshBasicMaterial color={0xff0000} transparent opacity={0.8} />
        </mesh>
      )}
    </>
  )
}
