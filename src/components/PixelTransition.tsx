import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Authentic 8x8 Bayer matrix for structured retro dithering
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

interface PixelTransitionProps {
  /** "black-to-white" (dark to light) or "white-to-black" (light to dark) */
  direction?: "black-to-white" | "white-to-black";
}

export default function PixelTransition({
  direction = "black-to-white",
}: PixelTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -999,
    y: -999,
    active: false,
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let cellW = 24;
    let cellH = 24;

    // Precomputed deterministic dither matrix
    let ditherMatrix: number[][] = [];

    const isWhiteToBlack = direction === "white-to-black";
    const baseColor = isWhiteToBlack ? "#ffffff" : "#0a0a0a";
    const targetColor = isWhiteToBlack ? "#0a0a0a" : "#ffffff";

    let st: ScrollTrigger | null = null;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      if (width <= 0 || height <= 0) return;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Adaptive pixel density: smaller pixels on mobile, chunkier retro on desktop
      const baseSize = width < 768 ? 16 : 22;
      cols = Math.round(width / baseSize);
      rows = Math.round(height / baseSize);
      cellW = width / cols;
      cellH = height / rows;

      // Build balanced dither threshold table
      ditherMatrix = [];
      for (let c = 0; c < cols; c++) {
        ditherMatrix[c] = [];
        for (let r = 0; r < rows; r++) {
          const bayer = BAYER_8X8[r % 8][c % 8] / 64;
          // Deterministic organic pseudo-jitter
          const jitter =
            Math.abs(Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1;
          ditherMatrix[c][r] = bayer * 0.65 + jitter * 0.35;
        }
      }
      render();
      st?.refresh();
    };

    const render = () => {
      if (!ctx || width === 0 || height === 0) return;

      const p = progressRef.current;
      const mouse = mouseRef.current;

      // Fill base background
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, width, height);

      // Draw target pixel squares
      ctx.fillStyle = targetColor;

      for (let c = 0; c < cols; c++) {
        const x = c * cellW;
        for (let r = 0; r < rows; r++) {
          const y = r * cellH;

          // Top row always baseColor to merge seamlessly with section above
          if (r === 0) continue;

          // Bottom row always targetColor to merge seamlessly with section below
          if (r >= rows - 1) {
            ctx.fillRect(x, y, cellW + 0.6, cellH + 0.6);
            continue;
          }

          const normY = r / (rows - 1); // 0 at top, 1 at bottom
          const dither = ditherMatrix[c]?.[r] ?? 0.5;

          // As user scrolls down (p increases from 0 to 1), the target infection spreads upwards
          const bias = p * 1.45 - 0.22;
          let activation = normY * 0.78 + bias * 0.78;

          // Interactive mouse cursor scatter: pixels ripple around cursor
          if (mouse.active) {
            const cx = x + cellW / 2;
            const cy = y + cellH / 2;
            const dx = cx - mouse.x;
            const dy = cy - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              activation += (1 - dist / 100) * 0.42;
            }
          }

          // If activation crosses dither threshold, turn into target square
          if (activation >= dither) {
            // +0.6 ensures no floating-point subpixel hairline gaps between adjacent squares
            ctx.fillRect(x, y, cellW + 0.6, cellH + 0.6);
          }
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);

    // ScrollTrigger to scrub the pixel dissolve live with the user's scroll position
    st = ScrollTrigger.create({
      trigger: container,
      start: "top 95%",
      end: "bottom 5%",
      scrub: 0.15,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        render();
      },
    });

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
      render();
    };

    const onMouseLeave = () => {
      mouseRef.current.active = false;
      render();
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      st?.kill();
    };
  }, [direction]);

  return (
    <div
      ref={containerRef}
      className={`pixel-transition-container ${
        direction === "white-to-black" ? "is-white-to-black" : ""
      }`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="pixel-transition-canvas" />
    </div>
  );
}
