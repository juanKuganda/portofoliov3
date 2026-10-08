import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SKILLS = [
  { label: "Web Development", tone: "ink" },
  { label: "UI/UX Design", tone: "amber" },
  { label: "Design Systems", tone: "paper" },
  { label: "Mentoring", tone: "ink" },
] as const;

/**
 * STATEMENT — "what i do", Benjamin-style.
 * Giant statement typography with inline photo chips + skill blocks
 * in identity colors only (ink / amber / paper). transform/opacity
 * animation, static under reduced motion.
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
      // Initial states
      gsap.set(".st-label", { opacity: 0, x: -20, letterSpacing: "0.5em" });
      gsap.set(".st-line-inner", { yPercent: 115, rotateX: 12, scale: 0.97 });
      gsap.set(".st-pill", { y: 40, opacity: 0, scale: 0.85, rotation: -3 });

      // ---- Entrance timeline ----
      const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
        scrollTrigger: {
          trigger: root,
          start: "top 78%",
          once: true,
        },
      });

      // Label draws in with spacing animation
      tl.to(".st-label", {
        opacity: 1,
        x: 0,
        letterSpacing: "0.22em",
        duration: 0.7,
        ease: "expo.out",
      })
        // Lines reveal with cinematic unfolding
        .to(
          ".st-line-inner",
          {
            yPercent: 0,
            rotateX: 0,
            scale: 1,
            duration: 1.0,
            stagger: 0.1,
            ease: "expo.out",
          },
          "-=0.4"
        )
        // Pills pop in with spring overshoot
        .to(
          ".st-pill",
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.7,
            stagger: 0.07,
            ease: "back.out(1.4)",
          },
          "-=0.5"
        );

      tl.eventCallback("onComplete", () => {
        gsap.set(".st-line-inner, .st-pill, .st-label", {
          clearProps: "all",
        });
      });

      // ---- Slow parallax scrub on headline as user scrolls ----
      gsap.to(".st-headline", {
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top 60%",
          end: "bottom 20%",
          scrub: 1.5,
        },
      });

      // ---- Parallax on pills (slower layer) ----
      gsap.to(".st-pills", {
        y: -16,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top 60%",
          end: "bottom 20%",
          scrub: 2,
        },
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
