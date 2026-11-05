import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialises Lenis smooth scroll, driven by the GSAP ticker so scroll
 * and scrubbed animations stay in sync (no tearing). Respects
 * prefers-reduced-motion. Recalibrates dynamically on window resize.
 * Tuning (v14): lerp 0.05 — the glide is deliberately long (~1.2 s
 * settle) so the smooth scroll is actually FELT, not mistaken for
 * native; wheelMultiplier 1.15 gives each notch more travel to show
 * the glide; syncTouch smooths touch scrolling too (Lenis 1.3 leaves
 * touch native by default).
 */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const lenis = new Lenis({
      lerp: 0.05, // Long, feelable glide (~1.2 s settle) — not native-fast
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.15,
      touchMultiplier: 2,
      syncTouch: true,
      syncTouchLerp: 0.075,
      infinite: false,
    });
    lenisRef.current = lenis;

    // Initially stop scroll while preloader is active
    lenis.stop();

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Expose lenis on window for debugging & coordination
    (window as unknown as { lenis: Lenis }).lenis = lenis;

    let resizeTimer: number;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      }, 150);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.clearTimeout(resizeTimer);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
