---
name: Field Intelligence Atlas
description: A configurable agricultural operations admin system with a dramatic geospatial visualization layer.
colors:
  primary: "#00a3cf"
  signal-cyan-light: "#c4f3fe"
  visualization-space: "#040d14"
  shell-light: "#f6f9f8"
  shell-dark: "#101014"
  structural-ink: "#18181c"
  white: "#ffffff"
  border-light: "#e5e7eb"
  placeholder: "#9ca3af"
rounded:
  xs: "3px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "10px"
  pill: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "22px"
  section: "40px"
  header: "52px"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(52px, 7.5vw, 88px)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.1em"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    typography: "{typography.title}"
    rounded: "{rounded.lg}"
    padding: "14px 26px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "4px 8px"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.structural-ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  visualization-chip:
    backgroundColor: "color-mix(in srgb, {colors.primary} 6%, transparent)"
    textColor: "rgba(255, 255, 255, 0.72)"
    rounded: "{rounded.md}"
    padding: "7px 14px"
  visualization-stat:
    backgroundColor: "color-mix(in srgb, {colors.primary} 5%, rgba(0, 0, 0, 0.2))"
    textColor: "{colors.white}"
    rounded: "{rounded.xl}"
    padding: "16px 18px"
---

# Design System: Field Intelligence Atlas

## Overview

**Creative North Star: "The Field Intelligence Atlas"**

The system treats agricultural operations as a navigable field of evidence. The everyday admin surface is measured, configurable, and information-dense: menus, tabs, cards, tables, forms, and settings help an operator complete work quickly. The visualization surface changes register without changing the product's purpose. It uses a deep spatial canvas, a luminous earth, project markers, and scroll-linked transitions to make distributed agricultural activity feel legible at a glance.

This is a two-speed system. Operational UI earns trust through predictable controls, quiet surfaces, and restrained depth. The dramatic layer earns attention through scale, atmospheric contrast, cyan signal light, masks, scanlines, and motion that follows the user's scroll. Both modes share the same configurable primary accent and a system sans voice rather than introducing a separate brand language.

**Key Characteristics:**
- Configurable operational shell with a vertical navigation default.
- Signal Cyan used as a functional accent and visualization beacon.
- Deep-space visualization canvas paired with pale or charcoal admin surfaces.
- Subtle elevation for admin surfaces; glow and tonal layering for visualization.
- Scroll-linked motion with reduced-motion fallbacks.

**The Two-Speed Surface Rule.** Keep the admin shell calm and scannable; reserve spectacle for the spatial visualization surface.

## Colors

The palette is built around a single technical cyan accent, cool neutral shells, and a deep blue-black visualization ground. Supporting colors are generated as theme ramps from the configured primary color, so the accent remains user-configurable.

### Primary
- **Signal Cyan**: the configurable primary action color, active navigation signal, map marker, and visualization glow.

### Neutral
- **Visualization Space**: the full-bleed ground for the earth scene and scroll showcase.
- **Shell Light**: the default light content canvas for the operational shell.
- **Shell Dark**: the dark content canvas when dark mode is active.
- **Structural Ink**: the dark structural surface used by inverted navigation and dark controls.
- **Signal Cyan Light**: telemetry text, title glow, and high-contrast labels on the visualization surface.
- **White**: primary text and high-contrast content against dark surfaces.
- **Border Light**: quiet separators, tab borders, and search-result edges.
- **Placeholder**: low-emphasis input and empty-state copy.

**The Signal Rarity Rule.** Use Signal Cyan to direct action or attention; keep large areas neutral or deep-space so the signal remains meaningful.

## Typography

**Display Font:** System sans stack (`ui-sans-serif`, `system-ui`, `Segoe UI`, Roboto, Arial, sans-serif)
**Body Font:** The same system sans stack
**Label/Mono Font:** No distinct label or mono family is established.

**Character:** The system sans pairing is neutral and dependable in operational flows, then becomes compressed and emphatic at visualization scale. Weight and contrast carry hierarchy more than decorative type treatment.

### Hierarchy
- **Display** (900, `clamp(52px, 7.5vw, 88px)`, 0.92): visualization section titles such as “掌上植保” and “经营布局”.
- **Headline** (700, 36px, 1.2): prominent operational or visualization headings.
- **Title** (600, 16px, 1.5): shell branding, card titles, navigation labels, and action text.
- **Body** (400, 14px, 1.5): forms, tables, descriptions, and general interface copy.
- **Label** (500, 11px, 1.4, 0.1em tracking): telemetry, statistic captions, and secondary metadata.

**The Scale Split Rule.** Large display type belongs to the visualization layer; operational screens stay compact enough for scanning and comparison.

## Layout

The operational shell is a full-height Naive UI layout with a 220px default sider, a 64px collapsed sider, a 56px header, and an optional 52px multi-tab strip. Content uses a 16px page inset and a pale or charcoal canvas. The shell supports vertical, horizontal, and mixed menu modes, mobile sider overlays, configurable header breadcrumbs, and an optional settings drawer.

The visualization layout is a full-bleed, scroll-owned experience. A 75px proportional head bar overlays a persistent Three.js earth stage. Content sections are positioned over the scene, with wide two-column compositions on larger screens and reduced-width content on mobile. The earth changes view as sections enter the scroll range; the head bar hides while scrolling down and returns near the top.

Spacing follows a compact 4/8/12/16 rhythm for controls and cards, with 22px section offsets and 40px-plus gaps for visualization storytelling. Responsive type uses stable `clamp()` bounds rather than viewport-only sizing.

## Elevation & Depth

The system uses a hybrid depth model. Operational surfaces are lightly lifted with small ambient shadows and tonal contrast between the shell, tabs, cards, and content canvas. The visualization surface is intentionally flatter: depth comes from the earth scene, additive cyan light, translucent overlays, masks, scanlines, and selective glow rather than floating card stacks.

### Shadow Vocabulary
- **Header / sider separation** (`0 1px 2px rgba(0, 21, 41, 0.08)` and `2px 0 8px rgba(29, 35, 41, 0.05)`): separates fixed shell chrome from content.
- **Card lift** (`shadow-sm`): gives standard operational cards a quiet resting edge.
- **Visualization signal glow** (`0 0 8px var(--project-marker-color)`): marks geographic project points without creating a panel.

**The Layered Depth Rule.** Use shadow for operational separation and light for visualization emphasis; do not use both to make the same element feel heavy.

## Shapes

The operational shell uses gently rounded rectangles: 3px tabs, 4px search and result affordances, 8px cards and primary actions, and 10px statistic tiles. Borders are quiet and usually inherit their current text color or use a pale neutral. The visualization layer uses the same small radii for chips, actions, and stats, with translucent fills and thin cyan-mixed borders. Circular geometry is reserved for compact icon controls, markers, and color swatches.

## Components

### Buttons
- **Shape:** compact rounded rectangles, usually 8px for primary actions and 4px or text-only treatment for utility actions.
- **Primary:** Signal Cyan fill with white text; custom visualization CTA uses 14px 26px padding and a restrained scan sweep on hover.
- **Hover / Focus:** transition over roughly 250-300ms; primary actions deepen the cyan surface or reveal a scan highlight. Focus must remain visible through the component library's focus treatment.
- **Secondary / Ghost / Tertiary:** Naive UI text and secondary variants keep the surface quiet, using Signal Cyan for text or border rather than a second brand accent.

### Chips
- **Style:** visualization feature chips use a 6% cyan wash, a thin cyan-mixed border, white text at reduced opacity, and a 6px radius.
- **State:** hover raises the cyan wash and border contrast; chips remain labels or filters rather than masquerading as primary actions.

### Cards / Containers
- **Corner Style:** 8px standard operational cards; 10px visualization statistic tiles.
- **Background:** white or theme surface in the shell; translucent cyan-mixed charcoal on the visualization layer.
- **Shadow Strategy:** standard cards use the quiet `shadow-sm` lift; visualization tiles rely on tonal layering and backdrop blur.
- **Border:** absent or library-controlled in the shell; thin cyan-mixed strokes on visualization tiles.
- **Internal Padding:** 16px is the default card rhythm, with 18px horizontal padding on visualization statistics.

### Inputs / Fields
- **Style:** Naive UI fields inherit the active light/dark theme, with compact control sizing and rounded library geometry. Search result rows use a 4px radius and a pale neutral fill.
- **Focus:** use the library's Signal Cyan focus state; avoid adding independent glows to routine fields.
- **Error / Disabled:** preserve Naive UI semantic colors and opacity so error, warning, and disabled states remain distinguishable from the primary accent.

### Navigation
- **Style:** the default shell is a vertical menu with a 220px sider, 22px collapsed icons, a 56px header, breadcrumbs, global search, fullscreen, theme, settings, and user controls. Active items use the generated primary palette and an understated surface tint.
- **Visualization navigation:** section navigation is a small, high-contrast overlay that follows scroll state; the earth and content remain the visual authority.
- **Mobile:** the sider collapses to an overlay with a dark translucent mask; content remains full width.

### Earth Visualization
The signature component is a persistent Three.js earth stage behind scroll-linked sections. Project markers carry labels, descriptions, geographic coordinates, and route targets. The stage supports direct and scrubbed view transitions, reduced-motion behavior, and a sticky mode after the hero scene. Keep content readable through masks and local contrast rather than placing opaque cards over the globe.

## Do's and Don'ts

### Do:
- **Do** keep operational layouts predictable, dense, and configurable.
- **Do** use Signal Cyan for actions, active states, geographic signals, and meaningful emphasis.
- **Do** preserve the distinction between pale/charcoal shell surfaces and the deep-space visualization ground.
- **Do** use scroll-linked motion to explain spatial relationships, with a reduced-motion path.
- **Do** use thin borders, translucent fills, and selective glow on the visualization layer.

### Don't:
- **Don't** turn routine admin cards into dramatic floating panels.
- **Don't** spread Signal Cyan across every surface; its rarity creates hierarchy.
- **Don't** introduce a second decorative typeface without an explicit identity decision.
- **Don't** replace the earth scene with an opaque dashboard canvas when the visualization surface is in use.
- **Don't** rely on motion alone to communicate state or navigation.
