import { useCallback, useEffect, type RefObject } from "react";

/**
 * Scales the font-size of `ref` to fill its container width.
 * Re-runs on resize, fonts.ready, and window load.
 *
 * Target: the parent's content width; for block-level elements (e.g.
 * `.sec-fit`, which has negative margins + its own padding) the element's
 * own content-box width is used when smaller.
 * Measurement is padding-proof: horizontal padding is zeroed while
 * measuring, because with border-box `width: max-content` folds the
 * padding into scrollWidth and the text comes out too big.
 * A verify-and-shrink pass guards against late font swaps.
 */
export function useFitText(ref: RefObject<HTMLElement | null>) {
  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const cs = getComputedStyle(el);
    const padX =
      (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);

    // Target width: parent's content width first. For block elements the
    // element's own content-box can be narrower (negative margins), so
    // prefer it when smaller. (Inline-block spans report their *text*
    // width via getBoundingClientRect, so never use that as the target.)
    let target = el.parentElement?.clientWidth ?? 0;
    if (cs.display === "block") {
      const own = el.getBoundingClientRect().width - padX;
      if (own > 0 && own < target) target = own;
    }
    // If the layout isn't ready (parent has no width yet), bail out —
    // the fonts.ready / load / resize retries will fit once it's laid out.
    // Without this guard we'd compute a bogus minimum-size font.
    if (target < 50) return;
    target = Math.max(1, target);

    // Kill transitions on the element AND its descendants first: the
    // reduced-motion reset sets `transition-duration: 0.001s !important`
    // on `*`, so spans would transition their inherited font-size and
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
      const avail =
        cs.display === "block"
          ? Math.max(1, el.getBoundingClientRect().width - padX)
          : target;
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
