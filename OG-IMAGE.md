# OG Social Share Image — Design Spec

**File:** `public/og-image.png`
**Dimensions:** 1200 × 630px
**Format:** PNG

## Design

- **Background:** Solid dark `#0a0a0a` (matches app theme)
- **Center element:** Large skull emoji 💀 at ~120px, centered horizontally, positioned slightly above vertical center
- **Main text:** `I'm still alive.` in white (`#ffffff`), bold sans-serif (Inter or system font), ~48px, centered below the skull
- **Subtitle:** `One tap. Every day.` in muted gray (`#71717a`), ~20px, centered below main text
- **Accent glow:** Subtle green glow/halo (`rgba(74, 222, 128, 0.15)`) behind the skull — circular radial gradient, ~200px radius
- **Bottom:** Small `imstillhere.app` in accent green (`#4ade80`), ~16px, near bottom

## Visual Hierarchy
```
┌──────────────────────────────────┐
│                                  │
│            (green glow)          │
│              💀                  │
│                                  │
│       I'm still alive.           │
│       One tap. Every day.        │
│                                  │
│         imstillhere.app          │
│                                  │
└──────────────────────────────────┘
```

## Vibe
Dark, minimal, slightly eerie but reassuring. The green accent should feel like a "heartbeat" signal — alive, active, monitored. Think Apple Health meets memento mori.

## Generation Options
- **Figma:** Quick manual design
- **HTML → Screenshot:** Create a simple HTML page, screenshot at 1200×630
- **AI image gen:** "Dark minimal social card with skull emoji, 'I'm still alive.' text, green glow accent, 1200x630"
