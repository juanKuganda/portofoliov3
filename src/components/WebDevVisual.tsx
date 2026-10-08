import { useLayoutEffect, useEffect, useRef } from "react";
import gsap from "gsap";

// Deploy pipeline: a live preview assembles on the left while build logs
// stream on the right - a full-width, left-to-right story of shipping.
// Loops gently; pauses off-screen; fully static under reduced motion.
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
        repeatDelay: 2.2,
        defaults: { ease: "power3.out" },
        paused: true,
      });

      tl.from(".demo-build", {
        opacity: 0,
        y: 12,
        scale: 0.97,
        duration: 0.35,
        stagger: 0.08,
      })
        .from(
          ".demo-cursor",
          { opacity: 0, x: 90, y: -60, duration: 0.5 },
          "-=0.15",
        )
        .to(".demo-cta", { scale: 0.88, duration: 0.12 }, "+=0.2")
        .to(".demo-cta", { scale: 1, duration: 0.5, ease: "back.out(2.5)" })
        .from(
          ".sv-log-line",
          { opacity: 0, x: -8, duration: 0.3, stagger: 0.28 },
          "-=0.2",
        )
        .to(
          ".demo-cursor",
          { opacity: 0, x: 50, y: -40, duration: 0.4 },
          "+=1.4",
        )
        .to(
          [".demo-build", ".sv-log-line"],
          { opacity: 0, y: -8, duration: 0.3, stagger: 0.03 },
          "<+=0.1",
        );

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
        <span className="sv-dot red"></span>
        <span className="sv-dot yellow"></span>
        <span className="sv-dot green"></span>
        <span>preview · live</span>
        <span className="bar-right">
          <span className="sv-live-dot"></span>live
        </span>
      </div>
      <div className="sv-stage-body sv-pipeline">
        <div className="sv-pane">
          <div className="sv-pane-label">component</div>
          <div className="demo-nav demo-build">
            <span className="demo-logo"></span>
            <span className="demo-link"></span>
            <span className="demo-link"></span>
            <span className="demo-link"></span>
          </div>
          <div className="demo-hero">
            <span className="demo-bar demo-build bar-title"></span>
            <span className="demo-bar demo-build"></span>
            <span className="demo-bar demo-build bar-short"></span>
          </div>
          <div className="demo-actions">
            <span className="demo-cta demo-build">Deploy</span>
            <span className="demo-cursor">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5.636 4.223a.75.75 0 0 1 .843-.14l13.5 7.5a.75.75 0 0 1-.365 1.411l-5.642.593 3.652 5.643a.75.75 0 1 1-1.256.814l-3.65-5.642-3.83 4.148a.75.75 0 0 1-1.29-.607V4.223z"
                  fill="#f5f5f5"
                />
              </svg>
            </span>
          </div>
        </div>
        <div className="sv-pane">
          <div className="sv-pane-label">build output</div>
          <div className="sv-log">
            <div className="sv-log-line">
              <span className="dim">$</span>{" "}
              <span className="cmd">npm run build</span>
            </div>
            <div className="sv-log-line">
              <span className="ok">✓</span> compiled in 1.2s
            </div>
            <div className="sv-log-line">
              <span className="ok">✓</span> deployed · production
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
