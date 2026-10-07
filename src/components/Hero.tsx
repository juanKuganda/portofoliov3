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
  useLayoutEffect(() => {
    const root = rootRef.current;
    const el = nameRef.current;
    if (!root || !el) return;

    // Split headline into per-char spans (layout only — no animation here)
    const text = el.textContent || "";
    el.textContent = "";
    const chars: HTMLSpanElement[] = [];
    text.split("").forEach((chr) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = chr === " " ? " " : chr;
      el.appendChild(s);
      chars.push(s);
    });

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const q = gsap.utils.selector(root);
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(q(".hero-kicker"), { y: 14, opacity: 0, duration: 0.35 }, 0.05)
      .from(
        chars,
        { yPercent: 70, opacity: 0, duration: 0.55, stagger: 0.016 },
        0.12
      )
      .from(
        q(".hero-side .statement"),
        { y: 22, opacity: 0, duration: 0.5 },
        0.5
      )
      .from(q(".hero-meta"), { y: 22, opacity: 0, duration: 0.5 }, 0.58)
      .from(q(".hero-portrait"), { y: 48, opacity: 0, duration: 0.7 }, 0.55);

    return () => {
      tl.kill();
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
