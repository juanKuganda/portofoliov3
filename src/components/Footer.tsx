import { useEffect, useRef } from "react";
import { useClock } from "../hooks/useClock";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Row {
  label: string;
  href: string;
  cls: "pink" | "orange" | "blue" | "purple";
  external: boolean;
}

const ROWS: Row[] = [
  { label: "Email", href: "mailto:jp1jn04@gmail.com", cls: "pink", external: false },
  { label: "GitHub", href: "https://github.com/juanKuganda", cls: "orange", external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/juann04", cls: "blue", external: true },
  { label: "Instagram", href: "https://www.instagram.com/juann04", cls: "purple", external: true },
];

/**
 * FOOTER v3 — giant social rows on dark neutral.
 * Each row is full-width display type; hover floods the row with its
 * pop color. A pink cursor arrow bobs over the Email row. Colophon
 * with live WITA clock + back-to-top. transform/opacity only;
 * static under prefers-reduced-motion.
 */
export default function Footer() {
  const time = useClock();
  const rootRef = useRef<HTMLElement>(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;
    // Entrance via IntersectionObserver (not gsap.from + once): IO fires
    // reliably even on mid-page reload, where ScrollTrigger once-triggers
    // can leave elements stuck invisible.
    const rows = root.querySelectorAll<HTMLElement>(".foot-row");
    gsap.set(rows, { y: 48, opacity: 0 });
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          io.disconnect();
          gsap.to(rows, {
            y: 0,
            opacity: 1,
            duration: 0.65,
            ease: "power3.out",
            stagger: 0.08,
            clearProps: "transform,opacity",
          });
        }
      },
      { threshold: 0.08 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <footer className="site foot-rows" aria-label="Footer" ref={rootRef}>
      <div className="foot-else">
        <span className="mono">[ Elsewhere ]</span>
      </div>

      <nav className="foot-nav" aria-label="Social links">
        {ROWS.map((r, i) => (
          <div key={r.label} className="foot-row-wrap">
            <a
              className={`foot-row ${r.cls}`}
              href={r.href}
              {...(r.external ? { target: "_blank", rel: "noopener" } : {})}
            >
              <span className="foot-row-idx" aria-hidden="true">
                0{i + 1}
              </span>
              <span className="foot-row-label">{r.label}</span>
              <span className="foot-row-arrow" aria-hidden="true">
                {"\u2197"}
              </span>
            </a>
          </div>
        ))}
      </nav>

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
