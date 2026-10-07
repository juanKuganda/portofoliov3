import { useCallback, useEffect, type RefObject } from "react";

/**
 * Scales the font-size of `ref` to fill its container width.
 * Re-runs on resize, fonts.ready, and window load.
 */
export function useFitText(ref: RefObject<HTMLElement | null>) {
  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    // Temporarily set a reference font-size to measure natural width
    el.style.fontSize = "100px";
    const w = el.scrollWidth || 1;

    // Target width = parent width (for block elements, use own content box)
    let target = el.parentElement?.clientWidth ?? w;
    const cs = getComputedStyle(el);
    if (cs.display === "block") {
      const padX =
        (parseFloat(cs.paddingLeft) || 0) +
        (parseFloat(cs.paddingRight) || 0);
      const own = el.getBoundingClientRect().width - padX;
      if (own > 0 && own < target) target = own;
    }

    el.style.fontSize = `${Math.max(20, (100 * target) / w)}px`;
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
