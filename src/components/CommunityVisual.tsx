import { useLayoutEffect, useEffect, useRef } from "react";
import gsap from "gsap";

// Impact strip: the numbers count up every time this visual becomes the
// active one. Calm by design - no loop here. Fully static under reduced motion.
export default function CommunityVisual({ active = true }: { active?: boolean }) {
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
      const counters = gsap.utils.toArray<HTMLElement>("[data-count]");
      const tl = gsap.timeline({ paused: true });
      counters.forEach((el, i) => {
        const target = Number(el.dataset.count || 0);
        const obj = { v: 0 };
        tl.to(
          obj,
          {
            v: target,
            duration: 1.1,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = `${Math.round(obj.v)}+`;
            },
          },
          i * 0.15,
        );
      });
      tlRef.current = tl;
    }, root);

    return () => {
      ctx.revert();
      tlRef.current = null;
    };
  }, []);

  // Replays the count-up every time this visual becomes active.
  useEffect(() => {
    if (reducedRef.current) return;
    if (active) tlRef.current?.play(0);
  }, [active]);

  return (
    <div className="sv-stage" ref={rootRef} aria-hidden="true">
      <div className="sv-stage-bar">
        <span>◐ community · palu-dev</span>
        <span className="bar-right">workshops · talks</span>
      </div>
      <div className="sv-stage-body">
        <div className="sv-stats">
          <div className="sv-stat">
            <span className="sv-stat-val" data-count="100">
              100+
            </span>
            <span className="sv-stat-lbl">Mentees</span>
          </div>
          <div className="sv-stat">
            <span className="sv-stat-val" data-count="3">
              3+
            </span>
            <span className="sv-stat-lbl">Communities</span>
          </div>
          <div className="sv-stat">
            <span className="sv-stat-val accent">Chairman</span>
            <span className="sv-stat-lbl">Palu Dev</span>
          </div>
        </div>
      </div>
    </div>
  );
}
