import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Impact strip: the numbers count up once when the card scrolls into view.
// Calm by design — no loop here. Fully static under reduced motion.
export default function CommunityVisual() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const counters = gsap.utils.toArray<HTMLElement>("[data-count]");
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 88%",
          once: true,
        },
      });
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
          i * 0.15
        );
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div className="sv-stage" ref={rootRef} aria-hidden="true">
      <div className="sv-stage-bar">
        <span>◐ community · palu-dev</span>
        <span className="bar-right">workshops · talks</span>
      </div>
      <div className="sv-stage-body">
        <div className="sv-stats">
          <div className="sv-stat">
            <span className="sv-stat-val" data-count="100">100+</span>
            <span className="sv-stat-lbl">Mentees</span>
          </div>
          <div className="sv-stat">
            <span className="sv-stat-val" data-count="3">3+</span>
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
