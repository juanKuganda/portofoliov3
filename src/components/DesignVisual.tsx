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

const BOXES = [
  { label: "hero", color: "#ff4d6d", cls: "hero" },
  { label: "card", color: "#4dabf7", cls: "" },
  { label: "card", color: "#51cf66", cls: "" },
  { label: "card", color: "#9775fa", cls: "" },
];

// Design as painting: a brush cursor visits each gray wireframe box and
// a color wipe fills it — corners round up as the paint lands. Ends with
// the signature Figma-select moment around the whole composition.
// Loops; pauses off-screen; fully static under reduced motion.
// transform/opacity only.
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
      const cursor = ".sv-paint-cursor";
      const dot = ".pt-dot";

      // Box centers relative to the stage body — cached + throttled.
      let cached: { x: number; y: number }[] | null = null;
      let lastMeasure = 0;
      const measure = () => {
        const body = root.querySelector(".sv-stage-body") as HTMLElement;
        const els = root.querySelectorAll<HTMLElement>(".pt-box");
        if (!body || !els.length) return null;
        const br = body.getBoundingClientRect();
        return Array.from(els).map((el) => {
          const r = el.getBoundingClientRect();
          return {
            x: r.left + r.width / 2 - br.left,
            y: r.top + r.height / 2 - br.top,
          };
        });
      };
      const measureThrottled = () => {
        const now = performance.now();
        if (!cached || now - lastMeasure > 600) {
          cached = measure();
          lastMeasure = now;
        }
        return cached;
      };

      const placeAtStart = () => {
        const p = measureThrottled();
        if (p && p[0]) gsap.set(cursor, { x: p[0].x, y: p[0].y - 60, opacity: 0 });
        gsap.set(".pt-fill", { scaleX: 0 });
        gsap.set(".pt-box", { borderRadius: 6 });
        gsap.set(".pt-selectbox", { opacity: 0, scaleX: 0, transformOrigin: "left center" });
        gsap.set(".pt-handle", { scale: 0 });
        gsap.set(dot, { scale: 0, opacity: 0 });
      };
      placeAtStart();

      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.6,
        paused: true,
      });

      tl.call(placeAtStart).to(cursor, { opacity: 1, duration: 0.25 });

      BOXES.forEach((b, i) => {
        const at = 0.35 + i * 0.75;
        tl.to(cursor, {
          x: () => measureThrottled()?.[i]?.x ?? 0,
          y: () => measureThrottled()?.[i]?.y ?? 0,
          duration: 0.55,
          ease: "power2.inOut",
        }, at)
          // Paint splat on arrival…
          .fromTo(
            dot,
            { scale: 0.4, opacity: 1, backgroundColor: b.color },
            { scale: 2.1, opacity: 0, duration: 0.4, ease: "power2.out" },
            at + 0.5,
          )
          // …and the box fills with a color wipe, corners rounding up.
          .to(`.pt-box[data-i="${i}"] .pt-fill`, {
            scaleX: 1,
            duration: 0.45,
            ease: "power2.inOut",
          }, at + 0.5)
          .to(`.pt-box[data-i="${i}"]`, {
            borderRadius: 14,
            duration: 0.45,
            ease: "power2.out",
          }, at + 0.5);
      });

      // Figma-select moment around the finished composition.
      const endAt = 0.35 + BOXES.length * 0.75;
      tl.to(".pt-selectbox", {
        opacity: 1,
        scaleX: 1,
        duration: 0.4,
        ease: "power2.out",
      }, endAt)
        .to(".pt-handle", {
          scale: 1,
          duration: 0.32,
          ease: "back.out(2)",
          stagger: 0.06,
        }, endAt + 0.2)
        .to({}, { duration: 1.0 })
        .to([".pt-selectbox", ".pt-fill"], { opacity: 0, duration: 0.35 }, "+=0.1")
        .to(".pt-box", { borderRadius: 6, duration: 0.3 }, "<")
        .to(cursor, { opacity: 0, y: "-=30", duration: 0.35 }, "<");

      tlRef.current = tl;
    }, root);

    return () => {
      ctx.revert();
      tlRef.current = null;
    };
  }, []);

  // Play/pause is driven by the parent's `active` prop.
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
        <span className="bar-right">wireframe → hi-fi</span>
      </div>
      <div className="sv-stage-body">
        <div className="sv-pane-label">canvas</div>
        <div className="pt-grid">
          <span
            className="pt-selectbox"
            style={{
              position: "absolute",
              inset: "-9px",
              border: `1.5px solid ${SELECT_BLUE}`,
              borderRadius: 6,
              pointerEvents: "none",
              opacity: 0,
            }}
          >
            {HANDLE_CORNERS.map((c) => (
              <span
                key={c}
                className="pt-handle"
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
          {BOXES.map((b, i) => (
            <div key={i} className={`pt-box ${b.cls}`} data-i={i}>
              <span className="pt-fill" style={{ background: b.color }} />
              <span className="pt-label">{b.label}</span>
            </div>
          ))}
        </div>
        <div className="sv-paint-cursor">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M5.636 4.223a.75.75 0 0 1 .843-.14l13.5 7.5a.75.75 0 0 1-.365 1.411l-5.642.593 3.652 5.643a.75.75 0 1 1-1.256.814l-3.65-5.642-3.83 4.148a.75.75 0 0 1-1.29-.607V4.223z"
              fill="#f5f5f5"
              stroke="#0a0a0a"
              strokeWidth="1"
            />
          </svg>
          <span className="pt-dot" />
        </div>
      </div>
    </div>
  );
}
