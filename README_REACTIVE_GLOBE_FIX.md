# Noir Sane Reactive Globe Fix

This patch fixes the problem where the chocolate globe/frame sequence looked flat.

## What changed

`src/components/luxury/GlobalNoirBackdrop.tsx` now behaves like the reference video:

- globe starts near navbar/right side
- frame sequence scrubs with scroll
- globe tilts/parallaxes with mouse movement
- ring/glow layer reacts with cursor
- particles animate with GSAP
- canvas is masked so the frame sequence feels like an object, not a flat rectangle
- admin/login/checkout get route-based frame offsets so the background does not freeze

## Files

Copy these into your project:

```txt
src/components/luxury/GlobalNoirBackdrop.tsx
src/components/luxury/RouteGsapEnhancer.tsx
src/components/luxury/LenisScroll.tsx
src/index.css.append.css
scripts/replace-frames.ps1
```

Append `src/index.css.append.css` to the bottom of your real `src/index.css`.

## App.tsx check

Your current App.tsx already imports and mounts:

```tsx
import GlobalNoirBackdrop from "@/components/luxury/GlobalNoirBackdrop";
import RouteGsapEnhancer from "@/components/luxury/RouteGsapEnhancer";

<GlobalNoirBackdrop />
<RouteGsapEnhancer />
```

Keep those. Do not also mount these old components:

```tsx
<SiteFrameSequenceBackground />
<FloatingChocolateJourney />
<RealisticImagePackHero />
<CinematicHero />
<GlobePackagingJourney />
<GlobeScrollJourney />
<GlobeToBoxSequenceHero />
<GsapGlobeToBoxHero />
<VideoGuideGlobePack />
```

## Replace frames

From your project root:

```powershell
cd "NOIR SANE\gilded-bites"
.\scripts\replace-frames.ps1 ".\ezgif-23f368a5082f7b62-jpg.zip"
```

Check:

```powershell
(Get-ChildItem ".\public\Frames\ezgif-frame-*.jpg").Count
```

Expected:

```txt
240
```

## Test

```powershell
npm run dev
```

Then open:

```txt
http://localhost:8080/Frames/ezgif-frame-001.jpg
```

or, if your Vite port is 5173:

```txt
http://localhost:5173/Frames/ezgif-frame-001.jpg
```

Finally:

```powershell
npm run build
```
