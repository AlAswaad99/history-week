"use client";

import { useState, useCallback, useEffect } from 'react'
import { studio } from '../lib/theatreSetup'

export type EditMode = 'edit' | 'preview'

export interface EditModeState {
  mode: EditMode
  toggleMode: () => void
  isEditMode: boolean
  isPreviewMode: boolean
}

/**
 * Hook for managing Edit/Preview mode
 * 
 * Edit Mode:
 * - OrbitControls enabled for camera manipulation
 * - Scroll does NOT drive Theatre.js animation
 * - Theatre.js Studio visible for keyframe editing
 * 
 * Preview Mode:
 * - OrbitControls disabled
 * - Scroll drives Theatre.js sequence position
 * - End-user experience simulation
 */
export function useEditMode(defaultMode: EditMode = 'edit'): EditModeState {
  const [mode, setMode] = useState<EditMode>(defaultMode)

  const toggleMode = useCallback(() => {
    setMode(prev => {
      const newMode = prev === 'edit' ? 'preview' : 'edit'
      
      // Optionally hide/show Theatre.js Studio based on mode
      if (typeof window !== 'undefined' && studio) {
        if (newMode === 'preview') {
          // In preview mode, user can still toggle studio with Alt+\
          // We don't force hide it
        }
      }
      
      return newMode
    })
  }, [])

  const isEditMode = mode === 'edit'
  const isPreviewMode = mode === 'preview'

  return {
    mode,
    toggleMode,
    isEditMode,
    isPreviewMode,
  }
}
