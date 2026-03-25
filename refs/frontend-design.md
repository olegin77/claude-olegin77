# Frontend Design Reference
> Read this when working on UI components, pages, dashboards, landing pages.

## Mandatory Design Process
1. Purpose -- What problem? Who uses it?
2. Tone -- Choose BOLD direction: brutalist, luxury, editorial, retro-futuristic, organic, etc.
3. Differentiation -- What makes this UNFORGETTABLE?
4. Constraints -- Framework, performance, accessibility

## Aesthetic Rules
- Typography -- Distinctive fonts ONLY. NEVER Arial/Inter/Roboto/system-ui. Pair strong display + refined body.
- Color -- Cohesive theme via CSS variables. Dominant + sharp accent beats timid palettes.
- Motion -- CSS-only for HTML. Motion library for React. Staggered reveals, scroll triggers, surprise hovers.
- Layout -- Asymmetry, overlap, diagonal flow, grid-breaking. Generous space OR controlled density.
- Depth -- Gradient meshes, noise textures, layered transparencies, dramatic shadows.

## Anti-Patterns (NEVER)
- Purple gradients on white -- the #1 AI cliche
- Space Grotesk / Inter / system fonts as defaults
- Cookie-cutter card grids with no personality
- Same aesthetic across different projects
- Flat, lifeless color palettes

## Stack
```
React:    Tailwind (core only) + CSS vars + Motion library
HTML:     Single-file, CSS-only animations preferred
Icons:    lucide-react@0.263.1
Charts:   recharts
3D:       Three.js r128 (CapsuleGeometry not available -- use CylinderGeometry)
```
