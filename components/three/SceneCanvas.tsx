"use client";

import React, { useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { SheetProvider, useCurrentSheet } from '@theatre/r3f'
import { types } from '@theatre/core'
import * as THREE from 'three'
import { mainSheet } from '../../lib/theatreSetup'

interface SceneCanvasProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

/**
 * Theatre.js controllable scene background
 * Supports gradient backgrounds that can be animated
 */
function SceneBackground() {
  const { scene, gl } = useThree()
  const sheet = useCurrentSheet()
  
  // Create Theatre.js object for background control
  const bgObj = React.useMemo(() => {
    if (!sheet) return null
    
    return sheet.object('SceneBackground', {
      topColor: types.rgba({ r: 0.02, g: 0.02, b: 0.05, a: 1 }), // Deep dark blue
      bottomColor: types.rgba({ r: 0.08, g: 0.06, b: 0.12, a: 1 }), // Dark purple
      enabled: types.boolean(true),
    })
  }, [sheet])
  
  // Create gradient texture
  const gradientTexture = React.useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    // Initial gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 512)
    gradient.addColorStop(0, '#050510') // Top
    gradient.addColorStop(1, '#14101f') // Bottom
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 2, 512)
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return { texture, canvas, ctx }
  }, [])
  
  // Subscribe to Theatre.js changes
  useEffect(() => {
    if (!bgObj) return
    
    const unsubscribe = bgObj.onValuesChange((values) => {
      if (!values.enabled) {
        scene.background = null
        return
      }
      
      const { canvas, ctx, texture } = gradientTexture
      
      // Update gradient colors
      const topR = Math.round(values.topColor.r * 255)
      const topG = Math.round(values.topColor.g * 255)
      const topB = Math.round(values.topColor.b * 255)
      const bottomR = Math.round(values.bottomColor.r * 255)
      const bottomG = Math.round(values.bottomColor.g * 255)
      const bottomB = Math.round(values.bottomColor.b * 255)
      
      const gradient = ctx.createLinearGradient(0, 0, 0, 512)
      gradient.addColorStop(0, `rgb(${topR}, ${topG}, ${topB})`)
      gradient.addColorStop(1, `rgb(${bottomR}, ${bottomG}, ${bottomB})`)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 2, 512)
      
      texture.needsUpdate = true
      scene.background = texture
    })
    
    return () => unsubscribe()
  }, [bgObj, scene, gradientTexture])
  
  // Set initial background
  useEffect(() => {
    scene.background = gradientTexture.texture
    return () => {
      scene.background = null
    }
  }, [scene, gradientTexture])
  
  return null
}

export function SceneCanvas({ children, className, style }: SceneCanvasProps) {
  return (
    <Canvas
      className={className}
      style={{
        ...style,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
      shadows
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: 3, // ACESFilmicToneMapping
        outputColorSpace: 'srgb',
        alpha: false, // No transparency - we control background
      }}
      camera={{
        fov: 60,
        near: 0.01,
        far: 1000,
        position: [0, 0, 10],
      }}
    >
      <SheetProvider sheet={mainSheet}>
        <SceneBackground />
        {children}
      </SheetProvider>
    </Canvas>
  )
}
