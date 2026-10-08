import { useCallback, useEffect, type RefObject } from "react";

/**
 * Scales the font-size of `ref` to fill its container width.
 * Re-runs on resize, fonts.ready, and window load.
 */
export function useFitText(ref: RefObject<HTMLElement | null>) {
  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    // Target width first, in normal layout.
    let target = el.parentElement?.clientWidth ?? 1;
    const cs = getComputedStyle(el);
    if (cs.display === "block") {
      const padX =
        (parseFloat(cs.paddingLeft) || 0) +
        (parseFloat(cs.paddingRight) || 0);
      const own = el.getBoundingClientRect().width - padX;
      if (own > 0 && own < target) target = own;
    }

    // Measure natural text width at a reference font-size. Shrink to
    // max-content first: otherwise scrollWidth is clamped to the element's
    // own box when the text is narrower than it, and the computed font-size
    // comes out too small (text never fills the container).
    // Kill transitions on the element AND its descendants first: the
    // reduced-motion reset sets `transition-duration: 0.001s !important`
    // on `*`, so the spans would transition their inherited font-size and
    // the synchronous read below would see the stale (pre-change) width.
    const prevWidth = el.style.width;
    const killTransition = (target: HTMLElement) =>
      target.style.setProperty("transition", "none", "important");
    killTransition(el);
    el.querySelectorAll<HTMLElement>("*").forEach(killTransition);
    el.style.fontSize = "100px";
    el.style.width = "max-content";
    const w = el.scrollWidth || 1;
    el.style.width = prevWidth;

    el.style.fontSize = `${Math.max(20, (100 * target) / w)}px`;
    el.style.removeProperty("transition");
    el.querySelectorAll<HTMLElement>("*").forEach((d) =>
      d.style.removeProperty("transition")
    );
  }, [ref]);

  useEffect(() => {
    fit();

    // Re-fit when fonts load
    if (document.fonts?.ready) {
      document.fonts.ready.then(fit);
    }

    const handleLoad = () => {
      fit();
      requestAnimationFrame(fit);
    };
    window.addEventListener("load", handleLoad);

    // Debounced resize
    let rzT: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(rzT);
      rzT = setTimeout(fit, 150);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("load", handleLoad);
      window.removeEventListener("resize", handleResize);
      clearTimeout(rzT);
    };
  }, [fit]);

  return fit;
}
