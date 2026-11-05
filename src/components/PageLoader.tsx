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

export default function PageLoader({ onHeroReady, onComplete }: PageLoaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const roleRef = useRef<HTMLSpanElement>(null);

  const heroReadyFiredRef = useRef(false);
  const masterTlRef = useRef<gsap.core.Timeline | null>(null);

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

    // Reset black background
    ctx.fillStyle = "#0a0a0a";
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
    let currentRoleIdx = 0;
    let scrambleTimer: number | null = null;

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

    // ── STEP 1: Counter 000 → 100 + Role Ticker (0s – 1.35s) ──
    masterTl.to(progressProxy, {
      val: 100,
      duration: 1.35,
      ease: "power2.inOut",
      onUpdate: () => {
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
      },
    });

    // ── STEP 2: Seamless Pixel Dissolve directly into Hero (1.35s – 2.25s) ──
    masterTl.addLabel("dissolve");

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

    preloadPromise.then(() => masterTl.play());

    return () => {
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

      {/* Central counter & dynamic role ticker */}
      <div className="loader-content">
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
