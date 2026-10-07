import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Design happens here: a cursor grabs an amber token from the tokens column,
// drags it onto a wireframe box, and the box fills - on a full-width canvas.
// Loops gently; pauses off-screen; fully static under reduced motion.
export default function DesignVisual() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const cursor = ".sv-design-cursor";
      const chip = ".ds-chip";

      // Measure swatch → target-box centers relative to the stage body.
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

      const placeAtStart = () => {
        const p = measure();
        if (!p) return;
        gsap.set(cursor, { x: p.sx, y: p.sy, opacity: 0 });
        gsap.set(chip, { opacity: 0, scale: 0.6 });
        gsap.set(".ds-target-fill", { opacity: 0 });
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
          x: () => measure()?.ex ?? 0,
          y: () => measure()?.ey ?? 0,
          duration: 0.85,
          ease: "power2.inOut",
        })
        .to(cursor, { y: "+=7", duration: 0.14, ease: "power2.in" })
        .to(".ds-target-fill", { opacity: 1, duration: 0.45 }, "<")
        .to(chip, { opacity: 0, scale: 0.6, duration: 0.2 }, "<")
        .to({}, { duration: 1.5 })
        .to(".ds-target-fill", { opacity: 0, duration: 0.4 })
        .to(cursor, { opacity: 0, y: "-=30", duration: 0.35 }, "<");

      ScrollTrigger.create({
        trigger: root,
        start: "top 88%",
        end: "bottom 12%",
        onEnter: () => tl.play(),
        onLeave: () => tl.pause(),
        onEnterBack: () => tl.play(),
        onLeaveBack: () => tl.pause(),
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div className="sv-stage" ref={rootRef} aria-hidden="true">
      <div className="sv-stage-bar">
        <span>◐ design-system.fig</span>
        <span className="bar-right">1440px</span>
      </div>
      <div className="sv-stage-body sv-design-flow">
        <div className="sv-canvas">
          <div className="sv-pane-label">canvas</div>
          <div className="ds-box ds-target tall">
            <span className="ds-target-fill"></span>
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
