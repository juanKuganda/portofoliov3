import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ROLES = ["Developer", "Designer", "Mentor"];

/** Kicker role ticker: [ Developer ] → [ Designer ] → [ Mentor ], every 2.5s. */
function RoleTicker() {
  const [idx, setIdx] = useState(0);
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(
      () => setIdx((i) => (i + 1) % ROLES.length),
      2500
    );
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <p className="role-ticker" aria-live="polite">
      <span className="tick-bracket" aria-hidden="true">[</span>
      <span className="tick-word" key={idx}>
        {ROLES[idx]}
      </span>
      <span className="tick-bracket" aria-hidden="true">]</span>
    </p>
  );
}

/**
 * THE REEL v3 — portrait card, dropped from above.
 *
 * Scene 1: a centered 3:4 portrait card on paper that ENTERS FROM THE
 * TOP, greeted by "Hai, I'm Juan" (plain mask reveal).
 * Scroll pins the hero and PUNCHES IN: the card dissolves while the
 * full-bleed 16:10 crop fades up beneath it — a dolly-zoom into the
 * face. Then the statement crossfades over the darkening photo, and
 * the shade deepens for the handoff to Work.
 * (A uniform card→full-bleed scale would re-crop the 3:4 portrait and
 * blow the face up again — the punch-in keeps both framings honest.)
 * Mobile: no pin, quiet exit. Reduced motion: one static frame.
 */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  // Measure the sticky nav so scene-1 content can pad clear of it.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const setH = () => {
      const nav = document.querySelector(".nav");
      const navH = nav ? Math.round(nav.getBoundingClientRect().height) : 60;
      root.style.setProperty("--nav-h", `${navH}px`);
      ScrollTrigger.refresh();
    };
    setH();
    window.addEventListener("resize", setH);
    return () => window.removeEventListener("resize", setH);
  }, []);

  // Entrance: the card DROPS FROM ABOVE, the headline reveals through
  // its mask, then THE BLOOM (grayscale → color, once).
  // transform/opacity only.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.set(".reel-card", { y: -170, opacity: 0, scale: 0.98 });
      gsap.set(".reel-hi", { yPercent: 112 });
      gsap.set(".reel-top > *, .reel-bottom-row > *", { y: 12, opacity: 0 });
      gsap.set(".reel-full", { autoAlpha: 0 });
      gsap.set(".reel-scene2", { autoAlpha: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(
        ".reel-card",
        { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: "expo.out" },
        0.05
      )
        .to(".reel-hi", { yPercent: 0, duration: 0.85, ease: "power4.out" }, 0.45)
        .to(
          ".reel-top > *, .reel-bottom-row > *",
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.07 },
          0.75
        )
        // THE BLOOM: the grayscale layer fades once — the blazer turns
        // blue as the single color moment. opacity-only, compositor-cheap.
        .to(
          ".reel-card .photo-gray",
          { opacity: 0, duration: 1.2, ease: "power2.inOut" },
          1.6
        );

      tl.eventCallback("onComplete", () => {
        gsap.set(".reel-top > *, .reel-bottom-row > *", { clearProps: "all" });
        gsap.set(".reel-hi", { clearProps: "transform" });
        gsap.set(".reel-card", { clearProps: "transform,opacity" });
      });
    }, root);
    return () => {
      ctx.revert();
    };
  }, []);

  // Scroll film. Desktop: pin +=260%; the punch-in — card dissolves as
  // the full-bleed crop rises beneath it — then the statement plays.
  // Mobile: no pin — quiet compressed exit.
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=260%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
      // Act 1 — the punch-in: a fast whip-cut. The card accelerates
      // away as the full-bleed punches in beneath it; the brief overlap
      // reads as motion, not a double exposure.
      tl.to(".reel-card", {
        scale: 1.3, autoAlpha: 0, duration: 0.32, ease: "power2.in",
        immediateRender: false,
      }, 0)
        .fromTo(".reel-full", { autoAlpha: 0, scale: 1.16 }, {
          autoAlpha: 1, scale: 1.06, duration: 0.4, immediateRender: false,
        }, 0.14)
        .to(".reel-hi-mask", { yPercent: -45, autoAlpha: 0, duration: 0.4 }, 0.05)
        .to(".reel-top > *, .reel-bottom-row > *", {
          y: -24, autoAlpha: 0, duration: 0.35,
        }, 0.05)
        // Act 2 — statement over the darkening photo; the push continues.
        .to(".reel-full", { scale: 1.12, duration: 1.6 }, 0.8)
        .to(".reel-shade", { opacity: 0.38, duration: 0.4 }, 0.9)
        .fromTo(".reel-scene2", { autoAlpha: 0, y: 44 }, {
          autoAlpha: 1, y: 0, duration: 0.4, immediateRender: false,
        }, 1.0)
        .to(".reel-scene2", { autoAlpha: 0, y: -44, duration: 0.4 }, 1.8)
        // Act 3 — handoff: shade deepens, release to Work.
        .to(".reel-shade", { opacity: 0.62, duration: 0.5 }, 2.15)
        .to(".reel-full", { scale: 1.18, duration: 0.55 }, 2.15);
    });

    mm.add("(max-width: 768px)", () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      tl.to(".reel-card", { scale: 1.05, y: -30, duration: 1, immediateRender: false }, 0)
        .to(".reel-hi-mask", { yPercent: -30, autoAlpha: 0, duration: 0.6 }, 0.1)
        .to(".reel-top > *, .reel-bottom-row > *", { autoAlpha: 0, duration: 0.4 }, 0.1);
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <header className="hero-reel" id="top" ref={rootRef}>
      {/* Full-bleed layer for the punch-in (rises beneath the card).
          Portrait photo shown full-height and centered; the sides are
          filled with a dark blurred copy of the same photo so nothing
          gets cropped or over-zoomed. */}
      <div className="reel-full" aria-hidden="true">
        <img
          className="full-bg"
          src="/hero-portrait.webp"
          alt=""
          width={925}
          height={1233}
        />
        <img
          className="full-main"
          src="/hero-portrait.webp"
          alt=""
          width={925}
          height={1233}
        />
        <div className="reel-shade" />
      </div>

      <div className="reel-top">
        <p className="reel-kicker">
          <span className="dot" aria-hidden="true" />
          <span>Open to work</span>
          <span className="sep" aria-hidden="true">·</span>
          <span>Folio ©2026</span>
          <span className="sep" aria-hidden="true">·</span>
          <span>Palu, ID</span>
        </p>
        <RoleTicker />
      </div>

      <div className="reel-center">
        <div className="reel-hi-mask">
          <h1 className="reel-hi">Hai, I&rsquo;m Juan</h1>
        </div>

        <figure className="reel-card">
          <img
            className="card-photo photo-color"
            src="/hero-portrait.webp"
            alt="Portrait of Juan Pablo Putra Kuganda"
            width={925}
            height={1233}
            fetchPriority="high"
          />
          <img
            className="card-photo photo-gray"
            src="/hero-portrait.webp"
            alt=""
            aria-hidden="true"
            width={925}
            height={1233}
          />
        </figure>

        <div className="reel-bottom-row">
          <p className="reel-cap">FIG.01 — JUAN, PALU · 2026</p>
          <a className="reel-scroll" href="#work">
            <span>Scroll</span>
            <span className="arrow" aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      <div className="reel-scene2" aria-hidden="true">
        <p className="reel-roles">Developer · Designer · Mentor</p>
        <p className="reel-statement">
          I build interfaces for the web —{" "}
          <span>
            dashboards, design systems, and interactive digital products.
          </span>
        </p>
        <p className="reel-meta">
          <span>Informatics · UNTAD '27</span>
          <span className="sep" aria-hidden="true">·</span>
          <span>Mentor · Palu communities</span>
        </p>
      </div>
    </header>
  );
}
