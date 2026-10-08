import { useLayoutEffect, useEffect, useRef } from "react";
import gsap from "gsap";

const SELECT_BLUE = "#0D99FF";
const HANDLE_CORNERS = ["nw", "ne", "sw", "se"] as const;

const handlePos: Record<(typeof HANDLE_CORNERS)[number], React.CSSProperties> =
  {
    nw: { top: -5, left: -5 },
    ne: { top: -5, right: -5 },
    sw: { bottom: -5, left: -5 },
    se: { bottom: -5, right: -5 },
  };

// Design happens here: a cursor grabs an amber token from the tokens column,
// drags it onto a wireframe box, and the box fills - on a full-width canvas.
// Juice: once the box is filled, the site's signature Figma-select moment
// plays — a blue selection box draws around the filled target and four
// corner handles pop in, held for a beat, then the loop resets as usual.
// Loops gently; pauses off-screen; fully static under reduced motion.
export default function DesignVisual({ active = true }: { active?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const reducedRef = useRef(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    reducedRef.current = reduced;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const cursor = ".sv-design-cursor";
      const chip = ".ds-chip";

      // Measure swatch → target-box centers relative to the stage body.
      // Cached + throttled: measure() does 3 getBoundingClientRect reads,
      // and the tween below evaluates its x/y on EVERY tick — uncached
      // that is a forced synchronous layout per frame.
      let cachedPos: { sx: number; sy: number; ex: number; ey: number } | null =
        null;
      let lastMeasure = 0;
      const measure = () => {
        const body = root.querySelector(".sv-stage-body") as HTMLElement;
        const swatch = root.querySelector(".ds-swatch.amber") as HTMLElement;
        const target = root.querySelector(".ds-target") as HTMLElement;
        if (!body || !swatch || !target) return null;
        const br = body.getBoundingClientRect();
        const sr = swatch.getBoundingClientRect();
        const tr = target.getBoundingClientRect();
        return {
          sx: sr.left + sr.width / 2 - br.left,
          sy: sr.top + sr.height / 2 - br.top,
          ex: tr.left + tr.width / 2 - br.left,
          ey: tr.top + tr.height / 2 - br.top,
        };
      };
      const measureThrottled = () => {
        const now = performance.now();
        if (!cachedPos || now - lastMeasure > 500) {
          cachedPos = measure();
          lastMeasure = now;
        }
        return cachedPos;
      };

      const placeAtStart = () => {
        const p = measureThrottled();
        if (!p) return;
        gsap.set(cursor, { x: p.sx, y: p.sy, opacity: 0 });
        gsap.set(chip, { opacity: 0, scale: 0.6 });
        gsap.set(".ds-target-fill", { opacity: 0 });
        gsap.set(".ds-selectbox", {
          opacity: 0,
          scaleX: 0,
          transformOrigin: "left center",
        });
        gsap.set(".ds-handle", { scale: 0 });
      };
      placeAtStart();

      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.6,
        paused: true,
      });

      tl.call(placeAtStart)
        .to(cursor, { opacity: 1, duration: 0.25 })
        .to(chip, { opacity: 1, scale: 1, duration: 0.25 }, "<")
        .to(cursor, {
          x: () => measureThrottled()?.ex ?? 0,
          y: () => measureThrottled()?.ey ?? 0,
          duration: 0.85,
          ease: "power2.inOut",
        })
        .to(cursor, { y: "+=7", duration: 0.14, ease: "power2.in" })
        .to(".ds-target-fill", { opacity: 1, duration: 0.45 }, "<")
        .to(chip, { opacity: 0, scale: 0.6, duration: 0.2 }, "<")
        // Figma-select moment: the blue box draws around the filled
        // target, corner handles pop in with a spring.
        .to(".ds-selectbox", {
          opacity: 1,
          scaleX: 1,
          duration: 0.4,
          ease: "power2.out",
        })
        .to(
          ".ds-handle",
          { scale: 1, duration: 0.32, ease: "back.out(2)", stagger: 0.06 },
          "-=0.2",
        )
        .to({}, { duration: 1.0 })
        .to(".ds-selectbox", { opacity: 0, duration: 0.3 })
        .to(".ds-target-fill", { opacity: 0, duration: 0.4 }, "-=0.1")
        .to(cursor, { opacity: 0, y: "-=30", duration: 0.35 }, "<");

      tlRef.current = tl;
    }, root);

    return () => {
      ctx.revert();
      tlRef.current = null;
    };
  }, []);
  // Play/pause is driven by the parent's `active` prop — NOT by a geometric
  // ScrollTrigger gate. The old gate broke under sticky stacking: a covered
  // card never left the viewport band, so its infinite loop kept running.
  useEffect(() => {
    if (reducedRef.current) return;
    const tl = tlRef.current;
    if (!tl) return;
    if (active) tl.play();
    else tl.pause();
  }, [active]);

  return (
    <div className="sv-stage" ref={rootRef} aria-hidden="true">
      <div className="sv-stage-bar">
        <span>◐ design-system.fig</span>
        <span className="bar-right">1440px</span>
      </div>
      <div className="sv-stage-body sv-design-flow">
        <div className="sv-canvas">
          <div className="sv-pane-label">canvas</div>
          <div
            className="ds-box ds-target tall"
            style={{ overflow: "visible" }}
          >
            <span className="ds-target-fill"></span>
            <span
              className="ds-selectbox"
              style={{
                position: "absolute",
                inset: "-9px",
                border: `1.5px solid ${SELECT_BLUE}`,
                borderRadius: 4,
                pointerEvents: "none",
                opacity: 0,
              }}
            >
              {HANDLE_CORNERS.map((c) => (
                <span
                  key={c}
                  className="ds-handle"
                  style={{
                    position: "absolute",
                    width: 8,
                    height: 8,
                    background: "#ffffff",
                    border: `1.5px solid ${SELECT_BLUE}`,
                    borderRadius: "1.5px",
                    ...handlePos[c],
                  }}
                />
              ))}
            </span>
            <span className="ds-box-label">hero · drop token</span>
          </div>
          <div className="ds-box">
            <span className="ds-box-label">card</span>
          </div>
        </div>
        <div className="sv-tokens">
          <div className="sv-pane-label">tokens</div>
          <div className="ds-swatches">
            <span className="ds-swatch amber"></span>
            <span className="ds-swatch green"></span>
            <span className="ds-swatch blue"></span>
          </div>
          <div className="ds-type">
            Aa
            <small>Inter · 12 / 16</small>
          </div>
        </div>
        <div className="sv-design-cursor">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5.636 4.223a.75.75 0 0 1 .843-.14l13.5 7.5a.75.75 0 0 1-.365 1.411l-5.642.593 3.652 5.643a.75.75 0 1 1-1.256.814l-3.65-5.642-3.83 4.148a.75.75 0 0 1-1.29-.607V4.223z"
              fill="#f59e0b"
            />
          </svg>
          <span className="ds-chip"></span>
          <span className="cursor-name">Juan (UI/UX)</span>
        </div>
      </div>
    </div>
  );
}
