import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

interface PageLoaderProps {
  onHeroReady: () => void;
  onComplete: () => void;
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

/** Colorful loader bands — one brand color per ~20% of the counter,
    GSAP-tweened (never a hard cut): pink → blue → orange → green →
    purple. The dither canvas repaints with the live band color, so
    the dissolve punches holes in a purple field. */
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

export default function PageLoader({ onHeroReady, onComplete }: PageLoaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const roleRef = useRef<HTMLSpanElement>(null);

  const heroReadyFiredRef = useRef(false);
  const masterTlRef = useRef<gsap.core.Timeline | null>(null);
  /** Live dither-field color — starts pink (band 1), tweened through
      COLOR_BANDS by the master timeline. */
  const bgColorRef = useRef<string>(COLOR_BANDS[0]);

  const canvasDataRef = useRef<{
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    cols: number;
    rows: number;
    cellW: number;
    cellH: number;
    matrix: number[][];
  } | null>(null);

  const triggerHeroReady = useCallback(() => {
    if (!heroReadyFiredRef.current) {
      heroReadyFiredRef.current = true;
      onHeroReady();
    }
  }, [onHeroReady]);

  // Transparent pixel dissolve: punches transparent holes from top to bottom
  // directly revealing the Hero section underneath without any snap or flash!
  const renderDither = useCallback((p: number) => {
    const data = canvasDataRef.current;
    if (!data) return;
    const { ctx, width, height, cols, rows, cellW, cellH, matrix } = data;

    if (p >= 0.999) {
      ctx.clearRect(0, 0, width, height);
      return;
    }

    // Reset background to the live color band
    ctx.fillStyle = bgColorRef.current;
    ctx.fillRect(0, 0, width, height);

    if (p <= 0.001) return;

    // Organic top-to-bottom pixel cascade
    const bias = p * 1.5 - 0.25;
    for (let c = 0; c < cols; c++) {
      const x = c * cellW;
      for (let r = 0; r < rows; r++) {
        const y = r * cellH;
        const normY = r / (rows - 1);
        const dither = matrix[c]?.[r] ?? 0.5;
        // Top pixels clear first, cascading downwards
        const activation = (1 - normY) * 0.78 + bias * 0.78;
        if (activation >= dither) {
          ctx.clearRect(x, y, cellW + 0.6, cellH + 0.6);
        }
      }
    }
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

          const matrix: number[][] = [];
          for (let c = 0; c < cols; c++) {
            matrix[c] = [];
            for (let r = 0; r < rows; r++) {
              const bayer = BAYER_8X8[r % 8][c % 8] / 64;
              const jitter = Math.abs(Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1;
              matrix[c][r] = bayer * 0.65 + jitter * 0.35;
            }
          }

          canvasDataRef.current = { ctx, width: w, height: h, cols, rows, cellW, cellH, matrix };
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

    /** Repaint the dither field with the live band color. During Act 1
        (dissolve progress 0) this is a full-field repaint. */
    const paintBand = () => {
      bgColorRef.current = colorProxy.c;
      renderDither(pixelProgress.val);
    };

    const updateCounter = () => {
      const v = Math.round(progressProxy.val);
      if (counterRef.current) {
        counterRef.current.textContent = String(v).padStart(3, "0");
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

    // ── STEP 0: Logo shapes pop in one by one (0s – ~1.0s) ──
    masterTl.from(
      ".loader-logo path",
      {
        scale: 0,
        transformOrigin: "50% 50%",
        duration: 0.55,
        ease: "back.out(2.2)",
        stagger: 0.09,
      },
      0
    );

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
        onUpdate: paintBand,
      }, 0.48)
      .to(colorProxy, {
        c: COLOR_BANDS[2],
        duration: 0.48,
        ease: "power2.inOut",
        onUpdate: paintBand,
      }, 0.96)
      .to(colorProxy, {
        c: COLOR_BANDS[3],
        duration: 0.48,
        ease: "power2.inOut",
        onUpdate: paintBand,
      }, 1.44)
      .to(colorProxy, {
        c: COLOR_BANDS[4],
        duration: 0.48,
        ease: "power2.inOut",
        onUpdate: paintBand,
      }, 1.92);

    // ── STEP 2: Seamless Pixel Dissolve directly into Hero (2.4s – 3.3s) ──
    masterTl.addLabel("dissolve", 2.4);

    // Fade counter + role gently
    masterTl.to(".loader-content", {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: "power2.in",
    }, "dissolve");

    // START Hero entrance IMMEDIATELY as pixel dissolve begins (zero jeda, zero snap)
    masterTl.call(() => {
      triggerHeroReady();
    }, undefined, "dissolve");

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

      {/* Central logo, counter & dynamic role ticker */}
      <div className="loader-content">
        {/* Logo mark: the 6 shapes pop in one by one (see STEP 0).
            Inline SVG (paths from favicon.svg) so each shape can
            animate on its own — a raster could only pop as one block. */}
        <svg
          className="loader-logo"
          viewBox="0 0 517 501"
          width="120"
          height="116"
          aria-hidden="true"
        >
          {LOGO_PATHS.map((p) => (
            <path key={p.fill + p.d.slice(0, 12)} d={p.d} fill={p.fill} />
          ))}
        </svg>
        <div className="loader-counter-wrap">
          <span ref={counterRef} className="loader-counter">000</span>
          <span className="loader-pct">%</span>
        </div>
        <div className="loader-role-ticker" aria-hidden="true">
          <span className="tick-bracket">[</span>
          <span ref={roleRef} className="loader-role">{ROLES[0]}</span>
          <span className="tick-bracket">]</span>
        </div>
      </div>
    </div>
  );
}
