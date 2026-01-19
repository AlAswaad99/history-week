"use client";

import { useEffect, useCallback } from 'react';

interface UseKeyboardScrollOptions {
  /** Current scroll progress (0-1) */
  scrollProgress: number;
  /** Callback to update scroll progress */
  setScrollProgress: (progress: number) => void;
  /** Amount to scroll per key press (default: 0.05 = 5%) */
  scrollStep?: number;
  /** Whether keyboard scrolling is enabled */
  enabled?: boolean;
}

/**
 * Hook to enable keyboard-based scrolling for accessibility
 * 
 * Supports:
 * - Arrow Down / Page Down / Space: Scroll forward
 * - Arrow Up / Page Up: Scroll backward  
 * - Home: Jump to start
 * - End: Jump to end
 */
export function useKeyboardScroll({
  scrollProgress,
  setScrollProgress,
  scrollStep = 0.05,
  enabled = true,
}: UseKeyboardScrollOptions) {
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    // Don't interfere with input fields
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }
    
    let newProgress = scrollProgress;
    let handled = false;
    
    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        newProgress = Math.min(1, scrollProgress + scrollStep);
        handled = true;
        break;
        
      case 'ArrowUp':
      case 'PageUp':
        newProgress = Math.max(0, scrollProgress - scrollStep);
        handled = true;
        break;
        
      case ' ': // Space
        // Space scrolls down, Shift+Space scrolls up
        if (e.shiftKey) {
          newProgress = Math.max(0, scrollProgress - scrollStep);
        } else {
          newProgress = Math.min(1, scrollProgress + scrollStep);
        }
        handled = true;
        break;
        
      case 'Home':
        newProgress = 0;
        handled = true;
        break;
        
      case 'End':
        newProgress = 1;
        handled = true;
        break;
    }
    
    if (handled) {
      e.preventDefault();
      setScrollProgress(newProgress);
    }
  }, [enabled, scrollProgress, scrollStep, setScrollProgress]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
