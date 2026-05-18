# Global Frame Effect

The frame sequence now runs once from the public app shell through
`src/components/hero/SiteFrameSequenceBackground.tsx`.

The important structure is:

```tsx
<App>
  <SiteFrameSequenceBackground />
  <Navbar />
  <Routes />
  <Footer />
</App>
```

Do not render the older frame or hero animation components alongside this
background on the landing page:

```tsx
<RealisticImagePackHero />
<CinematicHero />
<GlobePackagingJourney />
<GlobeScrollJourney />
<GlobeToBoxSequenceHero />
<GsapGlobeToBoxHero />
<VideoGuideGlobePack />
```

To refresh the frame assets from the zip:

```powershell
.\scripts\replace-frames.ps1 ".\ezgif-23f368a5082f7b62-jpg.zip"
```

Check the frame count:

```powershell
(Get-ChildItem ".\public\Frames\ezgif-frame-*.jpg").Count
```

Expected result:

```txt
240
```

You can test one frame directly in the browser:

```txt
http://localhost:5173/Frames/ezgif-frame-001.jpg
```
