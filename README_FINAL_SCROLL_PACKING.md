# Noir Sane Final Scroll Packing Animation

This patch fixes the issue where the globe looked like a flat background. The frame sequence now runs only once inside the homepage hero as a pinned GSAP canvas sequence.

## Files to copy

```txt
src/components/hero/NoirPackScrollHero.tsx
src/components/luxury/GlobalNoirBackdrop.tsx
src/components/luxury/LenisScroll.tsx
src/pages/Home.tsx
src/index.css.append.css
scripts/replace-frames.ps1
```

Append `src/index.css.append.css` to the bottom of your real `src/index.css`.

## Frame setup

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

Test one frame:

```txt
http://localhost:5173/Frames/ezgif-frame-001.jpg
```

## Important cleanup

Do not render these old animation components anywhere on the home page:

```tsx
<RealisticImagePackHero />
<SiteFrameSequenceBackground />
<FloatingChocolateJourney />
<CinematicHero />
<GlobePackagingJourney />
<GlobeScrollJourney />
<GlobeToBoxSequenceHero />
<GsapGlobeToBoxHero />
<VideoGuideGlobePack />
```

Use only:

```tsx
<NoirPackScrollHero />
```

## Run

```powershell
npm run dev
npm run build
```

The expected landing flow is:

```txt
Navbar
↓
Pinned Noir Sane scroll animation
↓
Globe moves downward with scroll
↓
Gift box opens
↓
Chocolate enters and becomes packed
↓
Product collection appears
↓
Footer
```
