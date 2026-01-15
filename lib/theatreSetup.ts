// Theatre.js initialization - MUST be at module level, not in useEffect
import studio from '@theatre/studio'
import extension from '@theatre/r3f/dist/extension'
import { getProject } from '@theatre/core'
import { shouldInitStudio } from './devMode'

// Import the saved Theatre.js state
// This file is exported from Theatre.js Studio and contains all your keyframes
import savedState from '../public/Studio.theatre-project-state.json'

// Initialize Theatre.js Studio immediately at module load (development only)
if (typeof window !== 'undefined' && shouldInitStudio()) {
    studio.initialize()
    studio.extend(extension)
}

// Check if the saved state has our project's sheet
// If not, we start fresh (the file might only have R3F UI editor state)
const hasMainAnimation = (savedState?.sheetsById as any)?.['Main Animation'] !== undefined

// Create the project and sheet, loading saved state if it has our animation
export const project = getProject('Bible Museum', 
    hasMainAnimation ? { state: savedState } : undefined
)
export const mainSheet = project.sheet('Main Animation')

// Helper to get sequence length
export const SEQUENCE_LENGTH = 40 // 35second animation driven by scroll

// Export studio for conditional UI hiding
export { studio }

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HOW TO SAVE YOUR ANIMATION PROGRESS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 1. Look at the Theatre.js panel at the BOTTOM of your browser
 * 
 * 2. Find "Bible Museum" in the project list (left side)
 *    It should show:
 *    📁 Bible Museum
 *       📄 Main Animation
 *          📦 Bible
 *          📦 Camera
 *          ...
 * 
 * 3. Click on "Bible Museum" (the project name, NOT the sheet)
 * 
 * 4. In the dropdown menu, click "Export to JSON"
 * 
 * 5. Save it as: public/Studio.theatre-project-state.json
 *    (overwrite the existing file)
 * 
 * 6. Restart your dev server - keyframes will now persist!
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * IMPORTANT: The file must contain "Main Animation" sheet data!
 * If you only see "R3F UI" in the JSON, you exported from wrong place.
 * ═══════════════════════════════════════════════════════════════════════════
 */
