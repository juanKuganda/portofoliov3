import { useEffect, useLayoutEffect, useRef } from "react";
import { useFitText } from "../hooks/useFitText";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticText from "./MagneticText";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const portraitImgRef = useRef<HTMLImageElement>(null);
  useFitText(nameRef);

  // Choreographed hero entrance: kicker → name chars → statement/meta → portrait.
  // One easing language (power3.out), transform/opacity only, respects reduced motion.
  // Runs in useLayoutEffect so the initial states apply before first paint (no flash).
  // Cleanup uses ctx.revert() (not tl.kill()): it removes every inline style GSAP
  // added, so an interrupted entrance can never leave content stuck invisible.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const el = nameRef.current;
    if (!root || !el) return;

    // Split headline into per-char spans (layout only — no animation here)
    const text = el.textContent || "";
    el.textContent = "";
    text.split("").forEach((chr) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = chr === " " ? " " : chr;
      el.appendChild(s);
    });

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-kicker", { y: 14, opacity: 0, duration: 0.35 }, 0.05)
        .from(
          ".hero-name .ch",
          { yPercent: 70, opacity: 0, duration: 0.55, stagger: 0.016 },
          0.12
        )
        .from(
          ".hero-side .statement",
          { y: 22, opacity: 0, duration: 0.5 },
          0.5
        )
        .from(".hero-meta", { y: 22, opacity: 0, duration: 0.5 }, 0.58)
        .from(".hero-portrait", { y: 48, opacity: 0, duration: 0.7 }, 0.55);
      // Once done, wipe GSAP's inline styles — nothing lingers in the DOM.
      tl.eventCallback("onComplete", () => {
        tl.getChildren().forEach((child) => {
          const targets = (child as gsap.core.Tween).targets?.() ?? [];
          if (targets.length) gsap.set(targets, { clearProps: "all" });
        });
      });
    }, root);

    // Revert (don't just kill): removes every inline style GSAP added,
    // so an interrupted entrance can never leave content stuck invisible.
    return () => {
      ctx.revert();
    };
  }, []);

  // Scroll-linked hero parallax
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const heroName = nameRef.current;
    const heroImg = portraitImgRef.current;

    if (heroName) {
      gsap.to(heroName, {
        y: 60,
        scale: 0.96,
        opacity: 0.75,
        ease: "none",
        scrollTrigger: {
          trigger: heroName,
          start: "top top",
          end: "+=650",
          scrub: true,
        },
      });
    }

    if (heroImg) {
      gsap.fromTo(
        heroImg,
        { scale: 1.07 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: heroImg,
            start: "top bottom",
            end: "+=600",
            scrub: true,
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <header className="hero" id="top" ref={rootRef}>
      <div className="hero-kicker">
        <span>
          <span className="dot"></span>&nbsp; Open to work
        </span>
        <span>Folio ©2026</span>
        <span>Palu, ID</span>
      </div>
      <div className="hero-grid">
        <MagneticText intensity={0.1} style={{ display: "block", width: "100%" }}>
          <h1 className="fit hero-name" ref={nameRef}>
            JUAN KUGANDA©
          </h1>
        </MagneticText>
        <div className="hero-side">
          <p className="statement">
            I build interfaces for the web —{" "}
            <span className="grey">
              dashboards, design systems, and interactive digital products.
            </span>
          </p>
          <div className="hero-meta">
            <span>Informatics · UNTAD '27</span>
            <span>Mentor · Palu communities</span>
            <span className="hero-scroll-arrow">
              Scroll <span className="arrow">↓</span>
            </span>
          </div>
        </div>
      </div>

      {/* TODO: ganti dengan foto Juan — cukup tukar src di bawah */}
      <figure className="hero-portrait">
        <img src="/hero-portrait.png" alt="Architectural brutalist portrait" />
        <figcaption className="tag">Portrait.jpg · abstract</figcaption>
      </figure>
    </header>
  );
}
