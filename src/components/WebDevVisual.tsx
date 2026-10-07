import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// "The component that builds itself" — a living micro-interaction demo for the
// Web Development folder, replacing the static code-window cliché.
// A miniature UI assembles with stagger, a cursor glides in and clicks Deploy
// (spring press), a toast confirms. Loops gently; pauses off-screen; renders
// fully static when the user prefers reduced motion.
export default function WebDevVisual() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.8,
        defaults: { ease: "power3.out" },
        paused: true,
      });

      tl.from(".demo-build", {
        opacity: 0,
        y: 12,
        scale: 0.97,
        duration: 0.35,
        stagger: 0.09,
      })
        .from(
          ".demo-cursor",
          { opacity: 0, x: 90, y: -60, duration: 0.5 },
          "-=0.15"
        )
        .to(".demo-cta", { scale: 0.88, duration: 0.12 }, "+=0.2")
        .to(".demo-cta", { scale: 1, duration: 0.5, ease: "back.out(2.5)" })
        .from(".demo-toast", { opacity: 0, y: 10, duration: 0.3 }, "-=0.3")
        .to(".demo-toast", { opacity: 0, y: 6, duration: 0.3 }, "+=1.5")
        .to(".demo-cursor", { opacity: 0, x: 50, y: -40, duration: 0.4 }, "<")
        .to(
          ".demo-build",
          { opacity: 0, y: -8, duration: 0.3, stagger: 0.04 },
          "+=0.15"
        );

      // Only run the loop while the card is actually on screen.
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
    <div className="service-visual-inner visual-webdev" ref={rootRef}>
      <div className="sv-ide-window">
        <div className="sv-ide-header">
          <span className="sv-dot red"></span>
          <span className="sv-dot yellow"></span>
          <span className="sv-dot green"></span>
          <span className="sv-tab-name">preview · live</span>
          <span className="sv-live-badge" aria-hidden="true">
            <span className="sv-live-dot"></span>live
          </span>
        </div>
        <div className="sv-live-body">
          <div className="demo-nav demo-build" aria-hidden="true">
            <span className="demo-logo"></span>
            <span className="demo-link"></span>
            <span className="demo-link"></span>
            <span className="demo-link"></span>
          </div>
          <div className="demo-hero" aria-hidden="true">
            <span className="demo-bar demo-build bar-title"></span>
            <span className="demo-bar demo-build"></span>
            <span className="demo-bar demo-build bar-short"></span>
          </div>
          <div className="demo-actions">
            <span className="demo-cta demo-build">Deploy</span>
            <span className="demo-bar demo-build bar-tiny" aria-hidden="true"></span>
            <span className="demo-cursor" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5.636 4.223a.75.75 0 0 1 .843-.14l13.5 7.5a.75.75 0 0 1-.365 1.411l-5.642.593 3.652 5.643a.75.75 0 1 1-1.256.814l-3.65-5.642-3.83 4.148a.75.75 0 0 1-1.29-.607V4.223z"
                  fill="#f5f5f5"
                />
              </svg>
            </span>
          </div>
          <div className="demo-toast" aria-hidden="true">
            <span className="demo-toast-pill">✓ Deployed to production</span>
          </div>
        </div>
      </div>
    </div>
  );
}
