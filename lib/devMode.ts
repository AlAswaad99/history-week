/**
 * Development Mode Utilities
 * 
 * Controls whether development tools (Theatre.js Studio, edit mode, etc.)
 * are enabled. In production, these are automatically disabled.
 * 
 * To enable dev tools in production (for testing), set:
 * NEXT_PUBLIC_ENABLE_DEV_TOOLS=true
 */

/**
 * Check if we're in development mode
 * This checks both NODE_ENV and the custom env var
 */
export function isDevMode(): boolean {
  return false;
  
  if (typeof window === 'undefined') {
    // Server-side: only check NODE_ENV
    return process.env.NODE_ENV === 'development'
  }
  
  // Client-side: check both NODE_ENV and custom flag
  const isDevelopment = process.env.NODE_ENV === 'development'
  const devToolsEnabled = process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true'
  
  // Enable if: development mode OR explicitly enabled via env var
  return isDevelopment || devToolsEnabled
}

/**
 * Check if Theatre.js Studio should be initialized
 */
export function shouldInitStudio(): boolean {
  return isDevMode()
}

/**
 * Check if edit mode UI should be shown
 */
export function shouldShowEditMode(): boolean {
  return isDevMode()
}

/**
 * Check if debug helpers should be rendered
 */
export function shouldShowDebugHelpers(): boolean {
  return isDevMode()
}
