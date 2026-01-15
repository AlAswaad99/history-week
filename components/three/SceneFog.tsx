"use client";

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useCurrentSheet } from '@theatre/r3f'
import { types } from '@theatre/core'

interface SceneFogProps {
  enabled?: boolean
}

/**
 * Theatre.js controllable fog
 * 
 * Note: Fog affects 3D objects based on distance from camera.
 * It does NOT affect the scene background.
 * Fog color should generally match or complement background colors.
 */
export function SceneFog({ enabled = true }: SceneFogProps) {
  const { scene } = useThree()
  const sheet = useCurrentSheet()
  
  // Create a Theatre.js object for fog properties
  const fogObj = React.useMemo(() => {
    if (!sheet) return null
    
    return sheet.object('Fog', {
      color: types.rgba({ r: 0.06, g: 0.05, b: 0.1, a: 1 }), // Match dark background
      near: types.number(5, { range: [0, 50] }),
      far: types.number(30, { range: [5, 100] }),
      density: types.number(0.02, { range: [0, 0.1] }), // For exponential fog
      type: types.stringLiteral('linear', { linear: 'Linear', exponential: 'Exponential' }),
    })
  }, [sheet])
  
  // Create and attach fog to scene
  useEffect(() => {
    if (!enabled) {
      scene.fog = null
      return
    }
    
    // Default: linear fog
    scene.fog = new THREE.Fog('#0f0d19', 5, 30)
    
    return () => {
      scene.fog = null
    }
  }, [scene, enabled])
  
  // Subscribe to Theatre.js value changes
  useEffect(() => {
    if (!fogObj || !enabled) return
    
    const unsubscribe = fogObj.onValuesChange((values) => {
      const { r, g, b } = values.color
      const fogColor = new THREE.Color(r, g, b)
      
      if (values.type === 'exponential') {
        scene.fog = new THREE.FogExp2(fogColor.getHex(), values.density)
      } else {
        scene.fog = new THREE.Fog(fogColor.getHex(), values.near, values.far)
      }
    })
    
    return () => unsubscribe()
  }, [fogObj, scene, enabled])
  
  return null // Fog is attached directly to scene, no JSX element needed
}
