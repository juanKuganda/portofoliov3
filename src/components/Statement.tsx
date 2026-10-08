import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SKILLS = [
  { label: "Web Development", tone: "pink" },
  { label: "UI/UX Design", tone: "blue" },
  { label: "Design Systems", tone: "green" },
  { label: "Mentoring", tone: "purple" },
] as const;

/**
 * STATEMENT — "what i do", Benjamin-style, kept clean & simple.
 * Giant statement typography with inline photo chips + skill pills
 * in full playful color (pink / blue / green / purple).
 * Animation is minimal and meaningful: line-mask reveal + a soft
 * pill stagger on scroll-enter, hover lift on pills/chips.
 * transform/opacity only; static under reduced motion.
 */
export default function Statement() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      // Initial states — transform/opacity only, no layout properties.
      gsap.set(".st-label", { opacity: 0, y: 12, willChange: "transform, opacity" });
      gsap.set(".st-line-inner", { yPercent: 115, willChange: "transform" });
      gsap.set(".st-pill", { y: 24, opacity: 0, willChange: "transform, opacity" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 78%",
          once: true,
        },
      });

      tl.to(".st-label", {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
      })
        // Line-mask reveal — the one signature motion.
        .to(
          ".st-line-inner",
          { yPercent: 0, duration: 0.9, stagger: 0.09, ease: "power4.out" },
          "-=0.25"
        )
        // Soft pill stagger, no spring.
        .to(
          ".st-pill",
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: "power3.out" },
          "-=0.5"
        );

      tl.eventCallback("onComplete", () => {
        gsap.set(".st-label, .st-line-inner, .st-pill", {
          clearProps: "all",
        });
      });
    }, root);
    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section className="statement" aria-label="What I do" ref={rootRef}>
      <p className="st-label">[ what i do ]</p>
      <h2 className="st-headline">
        <span className="st-line">
          <span className="st-line-inner">
            I build{" "}
            <img
              className="st-chip"
              src="/hero-portrait.webp"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />{" "}
            interfaces
          </span>
        </span>
        <span className="st-line">
          <span className="st-line-inner">for the web —</span>
        </span>
        <span className="st-line">
          <span className="st-line-inner">
            dashboards,{" "}
            <img
              className="st-chip"
              src="/hero-portrait.webp"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />{" "}
            design
          </span>
        </span>
        <span className="st-line">
          <span className="st-line-inner">systems, and interactive</span>
        </span>
        <span className="st-line">
          <span className="st-line-inner">digital products.</span>
        </span>
      </h2>
      <div className="st-pills">
        {SKILLS.map((s) => (
          <span key={s.label} className={`st-pill tone-${s.tone}`}>
            {s.label}
          </span>
        ))}
        <span className="st-pill st-pattern" aria-hidden="true">
          <svg viewBox="0 0 40 40" width="40" height="40">
            <defs>
              <pattern
                id="st-dots"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.6" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="40" height="40" fill="url(#st-dots)" />
          </svg>
        </span>
        <span className="st-pill st-pattern" aria-hidden="true">
          <svg viewBox="0 0 40 40" width="40" height="40">
            <path
              d="M-8 8 L8 -8 M0 40 L40 0 M32 48 L48 32"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
        </span>
      </div>
    </section>
  );
}
