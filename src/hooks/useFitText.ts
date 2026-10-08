import { useCallback, useEffect, type RefObject } from "react";

/**
 * Scales the font-size of `ref` to fill its container width.
 * Re-runs on resize, fonts.ready, and window load.
 *
 * Measurement is padding-proof: the element's own horizontal padding is
 * zeroed while measuring (with border-box, `width: max-content` otherwise
 * folds the padding into the measured width and the text comes out too
 * big — e.g. `.sec-fit` headings overflowing ~40px on mobile).
 * A verify-and-shrink pass guards against late font swaps.
 */
export function useFitText(ref: RefObject<HTMLElement | null>) {
  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const cs = getComputedStyle(el);
    const padX =
      (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
    // Content width actually available to the text.
    const target = Math.max(1, el.getBoundingClientRect().width - padX);

    // Kill transitions on the element AND its descendants first: the
    // reduced-motion reset sets `transition-duration: 0.001s !important`
    // on `*`, so the spans would transition their inherited font-size and
    // the synchronous read below would see the stale (pre-change) width.
    const killTransition = (t: HTMLElement) =>
      t.style.setProperty("transition", "none", "important");
    killTransition(el);
    el.querySelectorAll<HTMLElement>("*").forEach(killTransition);

    // Measure the pure text width at 100px: zero horizontal padding so
    // max-content reflects the text alone, not text + padding.
    const prevFontSize = el.style.fontSize;
    const prevWidth = el.style.width;
    const prevPadL = el.style.paddingLeft;
    const prevPadR = el.style.paddingRight;
    el.style.fontSize = "100px";
    el.style.paddingLeft = "0px";
    el.style.paddingRight = "0px";
    el.style.width = "max-content";
    const w = el.scrollWidth || 1;
    el.style.fontSize = prevFontSize;
    el.style.width = prevWidth;
    el.style.paddingLeft = prevPadL;
    el.style.paddingRight = prevPadR;

    el.style.fontSize = `${Math.max(20, (100 * target) / w)}px`;
    el.style.removeProperty("transition");
    el.querySelectorAll<HTMLElement>("*").forEach((d) =>
      d.style.removeProperty("transition")
    );

    // Verify pass: if a late font swap (fallback -> webfont) made the text
    // wider than the target, shrink to fit. Runs async so layout settles.
    requestAnimationFrame(() => {
      const cur = parseFloat(getComputedStyle(el).fontSize) || 0;
      if (cur <= 0) return;
      const avail = Math.max(1, el.getBoundingClientRect().width - padX);
      const need = el.scrollWidth || 1;
      if (need > avail + 1) {
        el.style.fontSize = `${Math.max(16, (cur * avail) / need)}px`;
      }
    });
  }, [ref]);

  useEffect(() => {
    fit();

    // Re-fit when fonts load (and once more shortly after, in case a
    // display font swaps in late and widens the text).
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        fit();
        setTimeout(fit, 600);
      });
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
