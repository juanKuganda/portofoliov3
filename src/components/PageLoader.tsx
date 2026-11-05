import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

interface PageLoaderProps {
  onHeroReady: () => void;
  onComplete: () => void;
  /** Fired 0.2s before the overlay hides, so the navbar brand can
      fade in exactly as the flying logo lands on it. */
  onBrandReady: () => void;
}

// Authentic 8x8 Bayer matrix for retro dither pixel propagation
const BAYER_8X8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

const ROLES = ["Engineer", "Design", "People"];
const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#";

/** Accent colors for the loader chrome (progress hairline,
    ticker brackets) — one brand color per ~20% of the counter.
    The FIELD stays ink: these 5 colors are the logo's own colors,
    so a full-field cycle would swallow 1–2 logo shapes per band. */
const COLOR_BANDS = ["#ff4d6d", "#4dabf7", "#ff922b", "#51cf66", "#9775fa"];


/** The 6 logo shapes, copied verbatim from public/favicon.svg.
    Staggered pop order: orange dot → purple stem → blue K (upper,
    lower) → green pill → pink base. */
const LOGO_PATHS: { d: string; fill: string }[] = [
  { d: "M136 53.8068C136 24.0901 160.09 0 189.807 0C219.283 0 243.272 23.7157 243.61 53.1898L243.626 54.5682C243.969 84.5285 219.777 109 189.815 109C160.094 109 136 84.9063 136 55.1853V53.8068Z", fill: "#FEA654" },
  { d: "M136 447.5C136 477.047 159.953 501 189.5 501C219.047 501 243 477.047 243 447.5V136H236C180.772 136 136 180.772 136 236V447.5Z", fill: "#8059F4" },
  { d: "M273.25 258.121L327.902 228.298C360.018 210.772 380 177.105 380 140.517V53.375C380 23.8968 356.103 0 326.625 0C297.147 0 273.25 23.8968 273.25 53.375V258.121Z", fill: "#3DA2F3" },
  { d: "M326.625 501C356.103 501 380 477.103 380 447.625V379.457C380 343.411 360.601 310.155 329.225 292.411L273.25 260.757V447.625C273.25 477.103 297.147 501 326.625 501Z", fill: "#3DA2F3" },
  { d: "M463.5 0C433.953 0 410 23.9528 410 53.5V146.005C410 203.639 488.604 220.528 512.278 167.981C515.391 161.072 517 153.582 517 146.005V53.5C517 23.9528 493.047 0 463.5 0Z", fill: "#4FD966" },
  { d: "M93.5 314C41.8614 314 0 355.861 0 407.5V447.5C0 477.047 23.9528 501 53.5 501C83.0472 501 107 477.047 107 447.5V314H93.5Z", fill: "#FF4264" },
];

export default function PageLoader({
  onHeroReady,
  onComplete,
  onBrandReady,
}: PageLoaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const roleRef = useRef<HTMLSpanElement>(null);

  const heroReadyFiredRef = useRef(false);
  const masterTlRef = useRef<gsap.core.Timeline | null>(null);
  const logoRef = useRef<SVGSVGElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const logoWrapRef = useRef<HTMLDivElement>(null);
  /** Cached ticker brackets — paintAccents used to querySelectorAll
      the whole document on EVERY frame of the color tweens (~2s). */
  const bracketElsRef = useRef<HTMLElement[]>([]);

  const canvasDataRef = useRef<{
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    cols: number;
    rows: number;
    cellW: number;
    cellH: number;
    /** Cells sorted by the progress value at which they clear, so each
        frame only touches the cells that newly cross their threshold
        (see renderDither). Precomputed once at init. */
    cells: { x: number; y: number; threshold: number }[];
    /** How many of `cells` have already been cleared. */
    cleared: number;
    /** Last progress value rendered (guards the monotonic assumption). */
    lastP: number;
  } | null>(null);

  const triggerHeroReady = useCallback(() => {
    if (!heroReadyFiredRef.current) {
      heroReadyFiredRef.current = true;
      onHeroReady();
    }
  }, [onHeroReady]);

  // Transparent pixel dissolve: punches transparent holes from top to bottom
  // directly revealing the Hero section underneath without any snap or flash!
  //
  // PERF: incremental, not re-rendered from scratch. Each cell has a fixed
  // progress threshold at which it clears (activation >= dither, solved for
  // p — the tween only moves p 0 → 1, so clearing is monotonic). Cells are
  // pre-sorted by threshold at init; every frame just advances a pointer
  // and clears the newly-due cells (~50/frame instead of re-painting the
  // whole field + ~1300 clearRects/frame). Same cells clear at the same
  // progress values as the old full-loop version — pixel-identical output.
  // If p ever regresses (it never does in this tween), fall back to a
  // full re-render so the canvas can never show a stale frame.
  const renderDither = useCallback((p: number) => {
    const data = canvasDataRef.current;
    if (!data) return;
    const { ctx, width, height, cells } = data;

    if (p >= 0.999) {
      ctx.clearRect(0, 0, width, height);
      data.cleared = cells.length;
      data.lastP = p;
      return;
    }

    if (p <= 0.001) return;

    // p regressed (resize rebuilds state, so this is only a safety net):
    // repaint the field and re-clear everything due at this progress.
    if (p < data.lastP) {
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);
      data.cleared = 0;
    }
    data.lastP = p;

    const cellW = data.cellW;
    const cellH = data.cellH;
    let i = data.cleared;
    while (i < cells.length && cells[i].threshold <= p) {
      const c = cells[i];
      ctx.clearRect(c.x, c.y, cellW + 0.6, cellH + 0.6);
      i++;
    }
    data.cleared = i;
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      triggerHeroReady();
      onComplete();
      if (overlayRef.current) overlayRef.current.style.display = "none";
      return;
    }

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // Setup canvas
    const canvas = canvasRef.current;
    let removeResize: (() => void) | undefined;
    if (canvas) {
      const ctx = canvas.getContext("2d", { alpha: true });
      if (ctx) {
        const initCanvas = () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          const dpr = Math.min(window.devicePixelRatio || 1, 2);

          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
          canvas.style.width = `${w}px`;
          canvas.style.height = `${h}px`;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

          const baseSize = w < 768 ? 16 : 22;
          const cols = Math.round(w / baseSize);
          const rows = Math.round(h / baseSize);
          const cellW = w / cols;
          const cellH = h / rows;

          // Radial pixel bloom: cells clear in an expanding circle
          // from the LOGO (viewport center) outward — the reveal grows
          // out of the mark instead of cascading top-to-bottom.
          // Aspect-corrected so the circle is round on screen, not
          // elliptical. Each cell's clear threshold is solved for p:
          //   (1 - normDist) * 0.78 + (p * 1.5 - 0.25) * 0.78 >= dither
          //   ⟺ p >= ((dither - (1 - normDist) * 0.78) / 0.78 + 0.25) / 1.5
          // Cells are sorted by threshold once, so renderDither can
          // advance a pointer instead of re-scanning the whole field.
          const aspect = w / h;
          const maxDist = Math.hypot(0.5 * aspect, 0.5);
          const cells: { x: number; y: number; threshold: number }[] = [];
          for (let c = 0; c < cols; c++) {
            const x = c * cellW;
            const dx = ((c + 0.5) / cols - 0.5) * aspect;
            for (let r = 0; r < rows; r++) {
              const y = r * cellH;
              const dy = (r + 0.5) / rows - 0.5;
              const normDist = Math.hypot(dx, dy) / maxDist;
              const bayer = BAYER_8X8[r % 8][c % 8] / 64;
              const jitter =
                Math.abs(Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1;
              const dither = bayer * 0.65 + jitter * 0.35;
              const threshold =
                ((dither - (1 - normDist) * 0.78) / 0.78 + 0.25) / 1.5;
              cells.push({ x, y, threshold });
            }
          }
          cells.sort((a, b) => a.threshold - b.threshold);

          canvasDataRef.current = {
            ctx, width: w, height: h, cols, rows, cellW, cellH,
            cells, cleared: 0, lastP: 0,
          };
          // Paint the ink field once; renderDither only ever clears
          // cells from here on (it never repaints the background).
          ctx.fillStyle = "#0a0a0a";
          ctx.fillRect(0, 0, w, h);
          renderDither(0);
        };
        initCanvas();
        window.addEventListener("resize", initCanvas);
        removeResize = () => window.removeEventListener("resize", initCanvas);
      }
    }

    // Preload hero portrait and fonts
    const preloadPromise = Promise.all([
      new Promise<void>((resolve) => {
        const img = new Image();
        img.src = "/hero-portrait.webp";
        if (img.complete) resolve();
        else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      }),
      document.fonts ? document.fonts.ready : Promise.resolve(),
    ]);

    const overlay = overlayRef.current;
    const progressProxy = { val: 0 };
    const pixelProgress = { val: 0 };
    const colorProxy = { c: COLOR_BANDS[0] };
    let currentRoleIdx = 0;
    let scrambleTimer: number | null = null;

    /** Paint the live band color onto the loader ACCENTS only — the
        bottom progress hairline and the ticker brackets. The field
        stays ink so the colorful logo never dissolves into its own
        background. (No glow behind the logo anymore: its color
        cycling read as flicker.) Bracket elements are cached once at
        setup — the old version ran querySelectorAll over the whole
        document on every animation frame. */
    const paintAccents = () => {
      const c = colorProxy.c;
      if (fillRef.current) fillRef.current.style.backgroundColor = c;
      for (const el of bracketElsRef.current) el.style.color = c;
    };

    // Cache the static ticker brackets once (see paintAccents).
    bracketElsRef.current = Array.from(
      tickerRef.current?.querySelectorAll<HTMLElement>(".tick-bracket") ?? []
    );

    let lastCounter = -1;
    let lastScaleX = -1;
    const updateCounter = () => {
      const v = Math.round(progressProxy.val);
      // Skip redundant DOM writes: textContent only when the rounded
      // value changes, scaleX only when it moved (avoids style churn
      // on frames where the tween barely advanced).
      if (v !== lastCounter) {
        lastCounter = v;
        if (counterRef.current) {
          counterRef.current.textContent = String(v).padStart(3, "0");
        }
      }
      // Bottom progress hairline: transform-only, no layout thrash.
      const sx = v / 100;
      if (Math.abs(sx - lastScaleX) > 0.0005) {
        lastScaleX = sx;
        if (fillRef.current) {
          fillRef.current.style.transform = `scaleX(${sx})`;
        }
      }

      // Cycle through [ Engineer ] → [ Design ] → [ People ] with text scramble
      const nextRoleIdx = v < 35 ? 0 : v < 72 ? 1 : 2;
      if (nextRoleIdx !== currentRoleIdx) {
        currentRoleIdx = nextRoleIdx;
        runScramble(ROLES[nextRoleIdx]);
      }
    };

    const runScramble = (target: string) => {
      if (scrambleTimer) clearInterval(scrambleTimer);
      let frame = 0;
      const total = 8;
      scrambleTimer = window.setInterval(() => {
        frame += 1;
        const reveal = Math.floor((frame / total) * target.length);
        let out = target.slice(0, reveal);
        for (let i = reveal; i < target.length; i++) {
          out += SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
        }
        if (roleRef.current) roleRef.current.textContent = out;
        if (frame >= total) {
          if (scrambleTimer) clearInterval(scrambleTimer);
          if (roleRef.current) roleRef.current.textContent = target;
        }
      }, 24);
    };

    // Master Timeline: 100% seamless, continuous, zero-gap transition
    const masterTl = gsap.timeline({
      paused: true,
      onComplete: () => {
        if (overlay) overlay.style.display = "none";
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overflow = prevBodyOverflow;
        onComplete();
      },
    });
    masterTlRef.current = masterTl;

    // Logo: static at rest during loading — the whoosh entrance
    // + breathing were removed (Nov 2026, per Juan): the logo sits
    // still while the counter runs, then flies home at the dissolve.
    // Counter / bands / ticker / hairline below are untouched.

    // ── STEP 1: Counter 000 → 100 in four lived beats (0s – 2.4s) ──
    // Sprint 0→40, cruise 40→75, crawl 75→92, snap 92→100 — the
    // pauses in the middle are what make it feel alive, not linear.
    masterTl
      .to(progressProxy, {
        val: 40,
        duration: 0.5,
        ease: "power2.in",
        onUpdate: updateCounter,
      }, 0)
      .to(progressProxy, {
        val: 75,
        duration: 1.0,
        ease: "power1.inOut",
        onUpdate: updateCounter,
      }, 0.5)
      .to(progressProxy, {
        val: 92,
        duration: 0.6,
        ease: "power1.out",
        onUpdate: updateCounter,
      }, 1.5)
      .to(progressProxy, {
        val: 100,
        duration: 0.3,
        ease: "power3.in",
        onUpdate: updateCounter,
      }, 2.1);

    // Color bands: the whole field cycles pink → blue → orange →
    // green → purple, one color per 0.48 s, GSAP-tweened (no hard
    // cut). The dissolve later punches holes in a purple field.
    masterTl
      .to(colorProxy, {
        c: COLOR_BANDS[1],
        duration: 0.48,
        ease: "power2.inOut",
        onUpdate: paintAccents,
      }, 0.48)
      .to(colorProxy, {
        c: COLOR_BANDS[2],
        duration: 0.48,
        ease: "power2.inOut",
        onUpdate: paintAccents,
      }, 0.96)
      .to(colorProxy, {
        c: COLOR_BANDS[3],
        duration: 0.48,
        ease: "power2.inOut",
        onUpdate: paintAccents,
      }, 1.44)
      .to(colorProxy, {
        c: COLOR_BANDS[4],
        duration: 0.48,
        ease: "power2.inOut",
        onUpdate: paintAccents,
      }, 1.92);

    // ── STEP 2: Hold, then the logo flies HOME (2.65s – 3.55s) ──
    // 0.25s hold after the counter hits 100: an exit that starts
    // with no pause reads as an interruption; the pause makes it
    // read as a decision. Then ONE continuous exit (no "two deaths"):
    // the radial dissolve blooms from the logo while the logo itself
    // flies to the navbar brand and lands on it.
    masterTl.addLabel("dissolve", 2.65);

    // Small chrome leaves first (corners, hairline) — the LOGO
    // stays: it is the last thing to leave, and it leaves by flying.
    masterTl.to(".loader-corner, .loader-progress", {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    }, "dissolve");

    // Logo flight: from center stage to the navbar brand (manual
    // x/y/scale from rect deltas — visually identical to GSAP Flip,
    // no plugin/reparenting risk in React). The brand is parked at
    // opacity 0 only (no y shift), so its rect is its final rect.
    masterTl.call(() => {
      const wrap = logoWrapRef.current;
      const brand = document.querySelector(
        ".nav-brand img"
      ) as HTMLElement | null;
      if (!wrap || !brand) {
        gsap.to(".loader-logo-wrap", { opacity: 0, duration: 0.3 });
        return;
      }
      const wRect = wrap.getBoundingClientRect();
      const bRect = brand.getBoundingClientRect();
      // The art fills 517 of the 597 padded viewBox units.
      const artW = wRect.width * (517 / 597);
      const scale = bRect.width / artW;
      const dx =
        bRect.left + bRect.width / 2 - (wRect.left + wRect.width / 2);
      const dy =
        bRect.top + bRect.height / 2 - (wRect.top + wRect.height / 2);
      gsap.to(wrap, {
        x: `+=${dx}`,
        y: `+=${dy}`,
        scale,
        duration: 0.8,
        ease: "power3.inOut",
      });
    }, undefined, "dissolve");

    // Hero entrance starts 0.3s INTO the flight (overlap ≥ 0.3s):
    // the exit is the first tween of the hero timeline, not a
    // separate animation before it.
    masterTl.call(() => {
      triggerHeroReady();
    }, undefined, "dissolve+=0.3");

    // The navbar brand fades in during the last 0.2s of the flight,
    // so it is fully opaque exactly when the overlay hides.
    masterTl.call(() => {
      onBrandReady();
    }, undefined, "dissolve+=0.7");

    // Animate pixel dissolve progress 0 → 1
    // As pixels clear from top to bottom, Hero elements are seen animating through the matrix!
    masterTl.to(pixelProgress, {
      val: 1,
      duration: 0.9,
      ease: "power2.inOut",
      onUpdate: () => {
        renderDither(pixelProgress.val);
      },
    }, "dissolve+=0.05");

    // Final clean exit: canvas is fully transparent now
    if (overlay) {
      masterTl.to(overlay, {
        opacity: 0,
        duration: 0.2,
        ease: "none",
      }, "-=0.1");
    }

    // Start once the hero portrait + fonts are ready — but never hang
    // the page on a slow asset: a 4 s failsafe starts the timeline
    // regardless. (Guarded: play() on a finished timeline replays it.)
    let started = false;
    const startTl = () => {
      if (started) return;
      started = true;
      masterTl.play();
    };
    preloadPromise.then(startTl);
    const failsafeId = window.setTimeout(startTl, 4000);

    return () => {
      window.clearTimeout(failsafeId);
      if (scrambleTimer) clearInterval(scrambleTimer);
      masterTl.kill();
      removeResize?.();
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={overlayRef}
      className="page-loader"
      role="region"
      aria-label="Loading"
      aria-live="polite"
    >
      {/* Full-screen Bayer dither canvas punching holes to reveal Hero */}
      <canvas ref={canvasRef} className="loader-canvas" aria-hidden="true" />

      {/* The logo: big, center stage, static while loading (the
          whoosh entrance + breathing were removed Nov 2026) — in its
          own absolutely-positioned wrap, independent from the corners
          and hairline (dual absolute stages, per felich.dev), so
          fading the chrome can never shift or slice it. No glow
          behind it anymore — its color cycling read as flicker. */}
      <div ref={logoWrapRef} className="loader-logo-wrap">
        {/* Logo mark: static at rest during loading (whoosh removed
            Nov 2026). Inline SVG (paths from favicon.svg). Padded
            viewBox (-40 -40 597 581): the art is 517×501, the extra
            40 units per side are the safety margin so the flight
            home can travel outside the SVG frame without clipping. */}
        <svg
          ref={logoRef}
          className="loader-logo"
          viewBox="-40 -40 597 581"
          width="231"
          height="225"
          aria-hidden="true"
        >
          {LOGO_PATHS.map((p) => (
            <path key={p.fill + p.d.slice(0, 12)} d={p.d} fill={p.fill} />
          ))}
        </svg>
      </div>

      {/* Role ticker — small, bottom-left corner. */}
      <div className="loader-corner loader-corner-bl">
        <div ref={tickerRef} className="loader-role-ticker" aria-hidden="true">
          <span className="tick-bracket">[</span>
          <span ref={roleRef} className="loader-role">{ROLES[0]}</span>
          <span className="tick-bracket">]</span>
        </div>
      </div>

      {/* Counter — small, bottom-right corner. */}
      <div className="loader-corner loader-corner-br">
        <span ref={counterRef} className="loader-counter">000</span>
        <span className="loader-pct">%</span>
      </div>

      {/* Progress hairline along the bottom edge (scaleX, transform-only). */}
      <div className="loader-progress" aria-hidden="true">
        <div ref={fillRef} className="loader-progress-fill" />
      </div>
    </div>
  );
}
