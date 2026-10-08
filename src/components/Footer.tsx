import { useEffect, useRef } from "react";
import { useClock } from "../hooks/useClock";
import { useFitText } from "../hooks/useFitText";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Pill {
  label: string;
  href: string;
  cls: "pink" | "paper" | "blue" | "purple";
  tilt: number;
  external: boolean;
}

const PILLS: Pill[] = [
  { label: "Email", href: "mailto:jp1jn04@gmail.com", cls: "pink", tilt: -3, external: false },
  { label: "GitHub", href: "https://github.com/juanKuganda", cls: "paper", tilt: 2.5, external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/juann04", cls: "blue", tilt: -2, external: true },
  { label: "Instagram", href: "https://www.instagram.com/juann04", cls: "purple", tilt: 3, external: true },
];

/**
 * FOOTER — playful full-color finale on dark neutral.
 * Giant "LET'S TALK" fit-text headline, four tilted color pills
 * (Email=pink, GitHub=paper, LinkedIn=blue, Instagram=purple) that
 * pop in with back.out stagger, a pink cursor arrow bobbing over the
 * Email pill, and a colophon with live WITA clock + yellow
 * back-to-top pill. transform/opacity only; static under
 * prefers-reduced-motion.
 */
export default function Footer() {
  const time = useClock();
  const fitRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  useFitText(fitRef);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      // Pills pop in, staggered. clearProps restores the CSS tilt
      // (inline transforms would override it).
      gsap.from(".foot-pill", {
        scale: 0,
        opacity: 0,
        duration: 0.55,
        ease: "back.out(2.2)",
        stagger: 0.09,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: root, start: "top 82%", once: true },
      });
      gsap.from(".foot-cursor-arrow", {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(2.5)",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: root, start: "top 82%", once: true },
      });
      gsap.from(".foot-talk", {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: root, start: "top 85%", once: true },
      });
      // Idle bob on the arrow (inner wrapper — entrance owns the outer).
      gsap.to(".foot-cursor-bob", {
        y: -8,
        duration: 1.1,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <footer className="site foot-play" aria-label="Footer" ref={rootRef}>
      <div className="foot-else">
        <span className="mono">[ Elsewhere ]</span>
      </div>

      <h2 className="fit foot-talk" ref={fitRef}>
        LET&rsquo;S TALK
      </h2>
      <p className="foot-sub">
        Got a project? <strong>Say hi.</strong> <span className="foot-sub-by">— Juan</span>
      </p>

      <div className="foot-pills">
        {PILLS.map((p, i) => (
          <span
            key={p.label}
            className="foot-pill-wrap"
            style={{ ["--tilt" as string]: `${p.tilt}deg` }}
          >
            {i === 0 && (
              <span className="foot-cursor-arrow" aria-hidden="true">
                <span className="foot-cursor-bob">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6.2 3.4 19.6 12l-7.2 1.1-2.9 6.7z"
                      fill="var(--pop-pink)"
                      stroke="var(--ink)"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
            )}
            <a
              className={`foot-pill ${p.cls}`}
              href={p.href}
              {...(p.external
                ? { target: "_blank", rel: "noopener" }
                : {})}
            >
              {p.label}
            </a>
          </span>
        ))}
      </div>

      <div className="colophon">
        <span>&copy; 2026 Juan Kuganda &middot; Palu, ID</span>
        <span>{time ? `${time} WITA` : "--:-- WITA"}</span>
        <span>v3.0</span>
        <button
          type="button"
          className="foot-top"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
          }
        >
          Back to top &uarr;
        </button>
      </div>
    </footer>
  );
}
