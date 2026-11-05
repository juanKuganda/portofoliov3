import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(ScrollTrigger, CustomEase);
try {
  CustomEase.create("punch", "0.16, 1, 0.3, 1");
} catch {
  // already created
}

/**
 * Observes all `.rv` elements and animates them in on scroll.
 * Supports `.rv-d1` and `.rv-d2` delay modifiers.
 * Supports `.rv-left` and `.rv-right` for horizontal reveals.
 * Fires once per element. Respects reduced motion.
 *
 * All animations live in a gsap.context — cleanup reverts ONLY this
 * hook's triggers, never ScrollTriggers owned by other components.
 */
export function useScrollReveal() {
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    // Small delay to ensure DOM is populated
    const timer = setTimeout(() => {
      ctxRef.current = gsap.context(() => {
        const els = document.querySelectorAll<HTMLElement>(".rv");

        els.forEach((el) => {
          let delay = 0;
          if (el.classList.contains("rv-d1")) delay = 0.05;
          if (el.classList.contains("rv-d2")) delay = 0.1;

          // Determine direction - punchy tight offsets
          let xFrom = 0;
          let yFrom = 22;
          if (el.classList.contains("rv-left")) {
            xFrom = -24;
            yFrom = 0;
          } else if (el.classList.contains("rv-right")) {
            xFrom = 24;
            yFrom = 0;
          }

          gsap.fromTo(
            el,
            { opacity: 0, y: yFrom, x: xFrom },
            {
              opacity: 1,
              y: 0,
              x: 0,
              duration: 0.52,
              delay,
              ease: "punch",
              scrollTrigger: {
                trigger: el,
                start: "top 92%",
                once: true,
              },
            }
          );
        });

        // Section title parallax — all .fit.sec-fit elements.
        // The slide completes while the title is still entering (top 75%
        // of the viewport) so it always rests at x: 0 when actually read —
        // a scrub that ends at "bottom top" would leave it offset (and the
        // first letter clipped) for most of its visible life.
        const sectionTitles =
          document.querySelectorAll<HTMLElement>(".fit.sec-fit");
        sectionTitles.forEach((title) => {
          gsap.fromTo(
            title,
            { x: -24 },
            {
              x: 0,
              ease: "none",
              scrollTrigger: {
                trigger: title,
                start: "top 100%",
                end: "top 72%",
                scrub: 0.6,
              },
            }
          );
        });

        // Status strip — slide in from left with punchy easing
        const statusStrip =
          document.querySelector<HTMLElement>(".status-strip");
        if (statusStrip) {
          gsap.fromTo(
            statusStrip,
            { scaleX: 0, transformOrigin: "left center" },
            {
              scaleX: 1,
              duration: 0.65,
              ease: "punch",
              scrollTrigger: {
                trigger: statusStrip,
                start: "top 92%",
                once: true,
              },
            }
          );
        }

        // Resume rows — stagger in with punchy snap
        const resumeRows =
          document.querySelectorAll<HTMLElement>(".resume-row");
        if (resumeRows.length) {
          gsap.set(resumeRows, { opacity: 0, x: -16 });
          gsap.to(resumeRows, {
            opacity: 1,
            x: 0,
            duration: 0.48,
            stagger: 0.05,
            ease: "punch",
            scrollTrigger: {
              trigger: resumeRows[0],
              start: "top 92%",
              once: true,
            },
          });
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, []);
}
