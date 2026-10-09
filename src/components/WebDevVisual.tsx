import { useLayoutEffect, useEffect, useRef } from "react";
import gsap from "gsap";

const LINES = [
  { t: "<Button color=", c: "#ff4d6d", rest: '"pink" />' },
  { t: "<Card ", c: "#4dabf7", rest: "tilt />" },
  { t: "<Confetti ", c: "#51cf66", rest: "burst />" },
  { t: "ship", c: "#9775fa", rest: "(it) →" },
];

const BLOCK_COLORS = ["#ff4d6d", "#4dabf7", "#51cf66", "#9775fa"];

// Web dev as live coding: code lines appear one by one in the editor,
// and each finished line pops a matching colorful block into the
// browser preview beside it. A caret blinks along. Loops; pauses
// off-screen; fully static under reduced motion. transform/opacity only.
export default function WebDevVisual({ active = true }: { active?: boolean }) {
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
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.8,
        paused: true,
      });

      tl.call(() => {
        gsap.set(".sv-code-line", { opacity: 0, x: -10 });
        gsap.set(".pv-block", { scale: 0, opacity: 0 });
        gsap.set(".sv-caret", { opacity: 1 });
      });

      LINES.forEach((_, i) => {
        const at = 0.25 + i * 0.55;
        // Line types in…
        tl.to(
          `.sv-code-line[data-i="${i}"]`,
          { opacity: 1, x: 0, duration: 0.32, ease: "power2.out" },
          at,
        )
          // …and its preview block pops with a spring.
          .fromTo(
            `.pv-block[data-i="${i}"]`,
            { scale: 0, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              ease: "back.out(2.4)",
            },
            at + 0.28,
          );
      });

      // Caret blinks while typing, then everything bows out.
      tl.to(".sv-caret", { opacity: 0.15, duration: 0.25 }, "+=0.4")
        .to(".sv-caret", { opacity: 1, duration: 0.25 })
        .to(".sv-caret", { opacity: 0, duration: 0.2 })
        .to(
          [".sv-code-line", ".pv-block"],
          { opacity: 0, y: -8, duration: 0.3, stagger: 0.04 },
          "<+=0.1",
        )
        .set([".sv-code-line", ".pv-block"], { y: 0 });

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
        <span className="sv-dot red"></span>
        <span className="sv-dot yellow"></span>
        <span className="sv-dot green"></span>
        <span>app.tsx → preview</span>
        <span className="bar-right">
          <span className="sv-live-dot"></span>live
        </span>
      </div>
      <div className="sv-stage-body sv-codeflow">
        <div className="sv-pane">
          <div className="sv-pane-label">editor</div>
          <div className="sv-code">
            {LINES.map((l, i) => (
              <div key={i} className="sv-code-line" data-i={i}>
                <span style={{ color: l.c }}>{l.t}</span>
                <span className="sv-code-rest">{l.rest}</span>
              </div>
            ))}
            <span className="sv-caret" />
          </div>
        </div>
        <div className="sv-pane">
          <div className="sv-pane-label">preview</div>
          <div className="sv-preview">
            <div className="pv-nav">
              <span className="pv-logo" />
              <span className="pv-link" />
              <span className="pv-link" />
            </div>
            <div className="pv-blocks">
              {BLOCK_COLORS.map((c, i) => (
                <span
                  key={i}
                  className={`pv-block b${i}`}
                  data-i={i}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
