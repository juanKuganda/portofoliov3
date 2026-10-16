import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * HERO — Swiss specimen.
 *
 * Concept: the portfolio as a technical document. A 12-column hairline
 * grid, one grotesque (Inter Tight), index numbers, a meta strip, an
 * info table, and the portrait filed as FIG.01. No stickers, no cursors,
 * no parallax — the entrance is a quiet mask reveal + stagger, then the
 * hero scrolls away naturally. THE BLOOM (grayscale → color, once) is
 * kept as the single color moment. Fully static under reduced motion.
 */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  // Entrance (<1.5s): title lines mask-reveal, portrait rises, meta /
  // table / cue stagger in. transform/opacity only.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    const ctx = gsap.context(() => {
      gsap.set(".sw-line > span", { yPercent: 115 });
      gsap.set(".sw-fade", { y: 18, opacity: 0 });
      gsap.set(".sw-fig", { y: 34, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(".sw-line > span", { yPercent: 0, duration: 0.9, stagger: 0.09 }, 0.1)
        .to(".sw-fig", { y: 0, opacity: 1, duration: 0.9 }, 0.35)
        .to(".sw-fade", { y: 0, opacity: 1, duration: 0.6, stagger: 0.06 }, 0.5)
        // THE BLOOM: the grayscale layer fades once — the blazer turns
        // blue as the single color moment. opacity-only.
        .to(
          ".sw-photo-gray",
          { opacity: 0, duration: 1.2, ease: "power2.inOut" },
          1.1
        );

      tl.eventCallback("onComplete", () => {
        gsap.set(".sw-line > span", { clearProps: "transform" });
        gsap.set(".sw-fade", { clearProps: "transform,opacity" });
        gsap.set(".sw-fig", { clearProps: "transform,opacity" });
      });
    }, root);
    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <header className="hero-swiss" id="top" ref={rootRef}>
      {/* 12-column hairline grid, the document's skeleton. */}
      <div className="sw-grid" aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} />
        ))}
      </div>

      <div className="sw-meta sw-fade">
        <span>Folio ©2026</span>
        <span>Palu, ID · WITA</span>
        <span className="sw-meta-status">
          <span className="sw-dot" aria-hidden="true" />
          Open to work
        </span>
      </div>

      <div className="sw-main">
        <div className="sw-head">
          <p className="sw-kicker sw-fade">[ Engineer · Design · People ]</p>
          <h1 className="sw-title" aria-label="Juan Kuganda">
            <span className="sw-line" aria-hidden="true">
              <span>Juan</span>
            </span>
            <span className="sw-line" aria-hidden="true">
              <span>Kuganda</span>
            </span>
          </h1>
          <p className="sw-sub sw-fade">
            Software developer &amp; designer — interfaces people understand
            at a glance.
          </p>
        </div>

        <figure className="sw-fig">
          <div className="sw-photo">
            <img
              className="sw-photo-color"
              src="/hero-portrait.webp"
              alt="Portrait of Juan Pablo Putra Kuganda"
              width={925}
              height={1233}
              fetchPriority="high"
            />
            <img
              className="sw-photo-gray"
              src="/hero-portrait.webp"
              alt=""
              aria-hidden="true"
              width={925}
              height={1233}
            />
          </div>
          <figcaption className="sw-cap">Fig.01 — Juan, Palu · 2026</figcaption>
        </figure>
      </div>

      <dl className="sw-table sw-fade">
        <div className="sw-row">
          <dt>Based in</dt>
          <dd>Palu, Indonesia — on-site / hybrid locally, remote anywhere</dd>
        </div>
        <div className="sw-row">
          <dt>Education</dt>
          <dd>Universitas Tadulako, Informatics ’27</dd>
        </div>
        <div className="sw-row">
          <dt>Focus</dt>
          <dd>Web3 · UI/UX · AI agent workflows</dd>
        </div>
        <div className="sw-row">
          <dt>Elsewhere</dt>
          <dd className="sw-links">
            <a
              href="https://github.com/juanKuganda"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </a>
            <a
              href="https://dribbble.com/jjuuaannnnnn"
              target="_blank"
              rel="noopener"
            >
              Dribbble
            </a>
            <a
              href="https://www.linkedin.com/in/juann04"
              target="_blank"
              rel="noopener"
            >
              LinkedIn
            </a>
          </dd>
        </div>
      </dl>

      <a className="sw-scroll sw-fade" href="#work">
        <span>Scroll</span>
        <span aria-hidden="true">↓</span>
      </a>
    </header>
  );
}
