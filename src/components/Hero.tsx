import { useEffect, useRef } from "react";
import { useFitText } from "../hooks/useFitText";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import MagneticText from "./MagneticText";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const portraitImgRef = useRef<HTMLImageElement>(null);
  useFitText(nameRef);

  // Per-character split reveal animation
  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const text = el.textContent || "";
    el.textContent = "";

    text.split("").forEach((chr, i) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = chr === " " ? "\u00A0" : chr;
      if (!reduced) {
        s.style.animationDelay = `${0.3 + i * 0.018}s`;
      }
      el.appendChild(s);
    });
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
    <header className="hero" id="top">
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
          <p className="statement rv">
            I build interfaces for the web —{" "}
            <span className="grey">
              dashboards, design systems, and interactive digital products.
            </span>
          </p>
          <div className="hero-meta rv rv-d1">
            <span>Informatics · UNTAD '27</span>
            <span>Mentor · Palu communities</span>
            <span className="hero-scroll-arrow">
              Scroll <span className="arrow">↓</span>
            </span>
          </div>
        </div>
      </div>

      {/* TODO: ganti dengan foto Juan — cukup tukar src di bawah */}
      <figure className="hero-portrait rv">
        <img src="/hero-portrait.png" alt="Architectural brutalist portrait" />
        <figcaption className="tag">Portrait.jpg · abstract</figcaption>
      </figure>
    </header>
  );
}
