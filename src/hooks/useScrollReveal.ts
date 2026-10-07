import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Observes all `.rv` elements and animates them in on scroll.
 * Supports `.rv-d1` and `.rv-d2` delay modifiers.
 * Supports `.rv-left` and `.rv-right` for horizontal reveals.
 * Fires once per element. Respects reduced motion.
 */
export function useScrollReveal() {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    // Small delay to ensure DOM is populated
    const timer = setTimeout(() => {
      const els = document.querySelectorAll<HTMLElement>(".rv");

      els.forEach((el) => {
        let delay = 0;
        if (el.classList.contains("rv-d1")) delay = 0.08;
        if (el.classList.contains("rv-d2")) delay = 0.16;

        // Determine direction
        let xFrom = 0;
        let yFrom = 30;
        if (el.classList.contains("rv-left")) {
          xFrom = -40;
          yFrom = 0;
        } else if (el.classList.contains("rv-right")) {
          xFrom = 40;
          yFrom = 0;
        }

        gsap.fromTo(
          el,
          { opacity: 0, y: yFrom, x: xFrom },
          {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 0.9,
            delay,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 94%",
              once: true,
            },
          }
        );
      });

      // Section title parallax — all .fit.sec-fit elements
      const sectionTitles = document.querySelectorAll<HTMLElement>(".fit.sec-fit");
      sectionTitles.forEach((title) => {
        gsap.fromTo(
          title,
          { x: -30 },
          {
            x: 0,
            ease: "none",
            scrollTrigger: {
              trigger: title,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );
      });

      // Status strip — slide in from left
      const statusStrip = document.querySelector<HTMLElement>(".status-strip");
      if (statusStrip) {
        gsap.fromTo(
          statusStrip,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: statusStrip,
              start: "top 90%",
              once: true,
            },
          }
        );
      }

      // Resume rows — stagger in
      const resumeRows = document.querySelectorAll<HTMLElement>(".resume-row");
      if (resumeRows.length) {
        gsap.set(resumeRows, { opacity: 0, x: -20 });
        gsap.to(resumeRows, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: resumeRows[0],
            start: "top 90%",
            once: true,
          },
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);
}
