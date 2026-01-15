"use client";

import React, { useRef, useEffect, Suspense } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { editable as e, RefreshSnapshot } from '@theatre/r3f'
import type { GLTF } from 'three-stdlib'

interface BibleModelProps {
  showAnchorPoint?: boolean
}

type GLTFResult = GLTF & {
  nodes: Record<string, THREE.Mesh>
  materials: Record<string, THREE.Material>
}

/**
 * Bible Model Component
 * 
 * ANIMATION KEYFRAMES (controlled via Theatre.js):
 * 
 * PHASE 0 (HERO) - 0-15%:
 *   position: [0, -8, 0]  (below viewport, only top edge visible)
 *   rotation: [0, 0, 0]
 *   scale: 1
 * 
 * PHASE 1 (REVEAL) - 15-30%:
 *   position.y: -8 → 0  (ascends into view)
 *   rotation: [0, 0, 0]
 * 
 * PHASE 2 (CENTERED) - 30-45%:
 *   position: [0, 0, 0]  (centered, stable)
 *   rotation: [0, 0, 0]
 * 
 * PHASE 3 (ORBIT) - 45-70%:
 *   position: [0, 0, 0]
 *   rotation.y: 0 → 1.5  (slow rotation)
 * 
 * PHASE 4 (FLYBY) - 70-100%:
 *   position: [0, 0, 0]  (stays in place)
 *   rotation.y: continues
 *   (Camera moves forward, Bible appears to recede)
 */
function BibleModelInner({ showAnchorPoint = true }: BibleModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/open_bible/scene.gltf') as unknown as GLTFResult
  
  useEffect(() => {
    if (scene && groupRef.current) {
      // Center the model
      scene.updateMatrixWorld(true)
      const box = new THREE.Box3().setFromObject(scene)
      const center = box.getCenter(new THREE.Vector3())
      
      // Offset children to center pivot at origin
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      
      // Move model so pivot is at center
      scene.position.set(-center.x, -center.y, -center.z)
    }
  }, [scene])

  return (
    <e.group 
      ref={groupRef}
      theatreKey="Bible"
      // Initial position: below viewport (Phase 0 state)
      // Theatre.js will animate this
      position={[0, -8, 0]}
      rotation={[0, 0, 0]}
      scale={1}
    >
      {/* The GLTF model */}
      <primitive object={scene} />
      
      {/* Anchor point indicator - red sphere at pivot origin */}
      {showAnchorPoint && (
        <mesh>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color={0xff0000} />
        </mesh>
      )}
      
      {/* Local axes helper for the pivot */}
      {showAnchorPoint && <axesHelper args={[1]} />}
    </e.group>
  )
}

export function BibleModel(props: BibleModelProps) {
  return (
    <Suspense fallback={null}>
      <RefreshSnapshot />
      <BibleModelInner {...props} />
    </Suspense>
  )
}

// Preload the model
useGLTF.preload('/open_bible/scene.gltf')
