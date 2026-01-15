# Production Deployment Guide

This guide explains how to prepare the Bible Museum 3D experience for production deployment.

## 🚀 Automatic Production Mode

**By default, all development tools are automatically disabled in production.**

When you build for production (`npm run build` or `yarn build`), the following are automatically disabled:

- ✅ Theatre.js Studio UI (no editor panels)
- ✅ Edit/Preview mode toggle buttons
- ✅ Animation timeline scrubber
- ✅ Debug helpers (SceneHelpers, anchor points)
- ✅ OrbitControls (camera controls)
- ✅ Phase indicator overlay

**The animation still works perfectly** - it's driven by scroll, just without the dev UI.

## 🔧 Development Mode

In development (`npm run dev`), all tools are enabled by default.

## 🧪 Enabling Dev Tools in Production (Optional)

If you need to enable dev tools in production (for testing or debugging), set this environment variable:

```bash
NEXT_PUBLIC_ENABLE_DEV_TOOLS=true
```

**⚠️ Warning:** Only use this for testing. Never deploy with dev tools enabled to production.

### How to Set Environment Variables

**Option 1: `.env.local` file** (recommended for local testing)
```bash
# .env.local
NEXT_PUBLIC_ENABLE_DEV_TOOLS=true
```

**Option 2: Build-time environment variable**
```bash
NEXT_PUBLIC_ENABLE_DEV_TOOLS=true npm run build
```

**Option 3: Platform-specific** (Vercel, Netlify, etc.)
- Add `NEXT_PUBLIC_ENABLE_DEV_TOOLS` in your platform's environment variables settings
- Set to `true` to enable, or leave unset/empty to disable

## 📦 What Gets Included in Production

### ✅ Included (Always)
- 3D scene with Bible model
- Scroll-driven animation
- Carousel with cards
- All Theatre.js keyframes and animations
- HTML overlays (hero, transition, CTA)
- Lighting and fog effects
- Background gradients

### ❌ Excluded (Production Only)
- Theatre.js Studio UI
- Edit mode controls
- Debug helpers
- Development overlays

## 🎬 Theatre.js in Production

**Important:** Theatre.js animations work perfectly in production, but the Studio UI is hidden.

- ✅ All keyframes are loaded from `public/Studio.theatre-project-state.json`
- ✅ All animations play correctly
- ✅ Scroll-driven animation works
- ❌ Studio UI is not accessible (no editing)

## 📝 Build Commands

```bash
# Development (dev tools enabled)
npm run dev

# Production build (dev tools disabled)
npm run build
npm start

# Production build with dev tools (testing only)
NEXT_PUBLIC_ENABLE_DEV_TOOLS=true npm run build
```

## 🔍 Verifying Production Mode

After building, check that:

1. ✅ No Theatre.js Studio panels appear
2. ✅ No edit mode buttons visible
3. ✅ No animation scrubber visible
4. ✅ Scroll still drives the animation
5. ✅ All animations play correctly

## 🐛 Troubleshooting

**Problem:** Dev tools still appear in production build
- **Solution:** Make sure `NEXT_PUBLIC_ENABLE_DEV_TOOLS` is not set to `true`

**Problem:** Animations not working in production
- **Solution:** Check that `public/Studio.theatre-project-state.json` exists and contains your keyframes

**Problem:** Need to debug in production
- **Solution:** Temporarily set `NEXT_PUBLIC_ENABLE_DEV_TOOLS=true`, rebuild, and test

## 📚 Related Files

- `lib/devMode.ts` - Dev mode utilities
- `lib/theatreSetup.ts` - Theatre.js initialization
- `app/location/page.tsx` - Main page component
