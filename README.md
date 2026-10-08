# portofoliov3

Personal portfolio of **Juan Pablo Putra Kuganda** — junior software developer, UI/UX & graphic designer, web mentor. Monochrome editorial identity with a signal-amber accent.

Live: `main` branch (deploy target: Vercel).

## Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4 (`@tailwindcss/vite`)
- GSAP (ScrollTrigger) + Lenis for smooth scroll choreography
- Single-file build, no backend

## Sections

- **Hero — "The Reel"**: 3:4 portrait card drops in from above; scroll pins and punches in to a full-bleed cinematic hero ("Hai, I'm Juan"), then a darkened handoff into Work.
- **Services**: index rows opening full-bleed animated dark stages (deploy pipeline, token drag-and-drop, API console, impact stats).
- **Work**: featured SIJAGA project + project rows (`src/data/projects.ts`).
- **Capabilities**: asymmetric interactive bento (Theme Lab, Press Playground, Network, Code Runner).
- **Gallery / About / Contact / Footer**: footer CTA included.

Identity rule: monochrome + amber only. No rainbow bento — held by design.

## Develop

```bash
npm install
npm run dev      # local preview
npm run build    # tsc -b && vite build
npm run lint     # eslint .
```

Motion notes: animate only `transform`/`opacity`; respect `prefers-reduced-motion` (static frame fallback).

## Branch workflow

- `main` — stable, reviewed, deployable.
- `pablo/dev` — assistant working branch. Changes are pushed here in reviewable batches, then opened as a PR to `main` for Juan's review before merge.
- Pushing from this VM goes through the GitHub API (SSH egress is blocked), and **binary assets can't go through the API** — images like `public/hero-portrait.webp` must be uploaded by Juan via GitHub web → Add file → Upload files (branch `pablo/dev`).

## Content TODOs

- Gallery still uses Picsum placeholders — replace with real work.
- `public/hero-portrait-wide.webp` (desktop 16:10 crop) is in the repo but currently unused (hero uses the portrait crop with blur-filled sides).
- Instagram profile link not verified.
