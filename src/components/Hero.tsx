import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFitText } from "../hooks/useFitText";
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
      <span className="tick-sq" aria-hidden="true" />
      <span className="tick-bracket" aria-hidden="true">[</span>
      <span className="tick-word" key={idx}>
        {ROLES[idx]}
      </span>
      <span className="tick-bracket" aria-hidden="true">]</span>
    </p>
  );
}

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  useFitText(nameRef);

  // Choreographed hero entrance: kicker → name chars → statement/meta → portrait,
  // plus the amber © pop with an expanding hairline ring (the signature beat).
  // One easing language (power3.out), transform/opacity only, respects reduced motion.
  // Runs in useLayoutEffect so the initial states apply before first paint (no flash).
  // Cleanup uses ctx.revert() (not tl.kill()): it removes every inline style GSAP
  // added, so an interrupted entrance can never leave content stuck invisible.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const el = nameRef.current;
    if (!root || !el) return;

    // Split headline into per-char spans (layout only — no animation here).
    // The © glyph gets its own class + an expanding ring element.
    const text = el.textContent || "";
    el.textContent = "";
    text.split("").forEach((chr) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = chr === " " ? " " : chr;
      if (chr === "©") {
        s.classList.add("ch-copy");
        const ring = document.createElement("span");
        ring.className = "copy-ring";
        ring.setAttribute("aria-hidden", "true");
        s.appendChild(ring);
      }
      el.appendChild(s);
    });

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-kicker", { y: 14, opacity: 0, duration: 0.35 }, 0.05)
        .from(".role-ticker", { y: 10, opacity: 0, duration: 0.4 }, 0.15)
        .from(
          ".hero-name .ch",
          { yPercent: 70, opacity: 0, duration: 0.55, stagger: 0.016 },
          0.12
        )
        .fromTo(
          ".hero-name .ch-copy",
          { scale: 0 },
          { scale: 1, duration: 0.6, ease: "back.out(2.2)" },
          0.85
        )
        .fromTo(
          ".hero-name .copy-ring",
          { scale: 0.4, opacity: 0.9 },
          { scale: 1.7, opacity: 0, duration: 0.9, ease: "power2.out" },
          0.95
        )
        .from(
          ".hero-side .statement",
          { y: 22, opacity: 0, duration: 0.5 },
          0.5
        )
        .from(".hero-meta", { y: 22, opacity: 0, duration: 0.5 }, 0.58)
        .from(".hero-portrait", { y: 48, opacity: 0, duration: 0.7 }, 0.55)
        .from(".hero-scroll-strip", { opacity: 0, duration: 0.5 }, 1.0);
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

  // THE HOOK — per-character magnetic headline. Chars near the pointer lift
  // (max ~10px) with a smooth falloff; the headline feels alive and answers
  // the visitor. transform/opacity only, one layout read per pointermove,
  // rAF-free (CSS transition smooths the direct writes). Enabled after the
  // entrance settles; skipped on touch / reduced motion.
  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!fine || reduced) return;

    let chars: HTMLElement[] = [];
    let offsets: { x: number; y: number }[] = [];
    let enabled = false;

    const measure = () => {
      const h1 = el.getBoundingClientRect();
      chars = Array.from(el.querySelectorAll<HTMLElement>(".ch"));
      offsets = chars.map((ch) => {
        const r = ch.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - h1.left,
          y: r.top + r.height / 2 - h1.top,
        };
      });
    };

    const enable = () => {
      if (enabled) return;
      enabled = true;
      measure();
      el.classList.add("magnetic-on");
    };
    // After the entrance timeline (+ © pop) has settled.
    const timer = window.setTimeout(enable, 1600);

    const RADIUS = 130;
    const LIFT = 10;
    const onMove = (e: PointerEvent) => {
      if (!enabled || !chars.length) return;
      const h1 = el.getBoundingClientRect();
      const px = e.clientX - h1.left;
      const py = e.clientY - h1.top;
      for (let i = 0; i < chars.length; i++) {
        const dx = px - offsets[i].x;
        const dy = py - offsets[i].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const lift = d < RADIUS ? (1 - d / RADIUS) * LIFT : 0;
        chars[i].style.transform =
          lift > 0.4 ? `translate3d(0, ${(-lift).toFixed(1)}px, 0)` : "";
      }
    };
    const onLeave = () => {
      if (!enabled) return;
      for (const ch of chars) ch.style.transform = "";
    };

    window.addEventListener("resize", measure);
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", measure);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Pinned hero exit (desktop): the hero holds while its content lifts and
  // fades, then the Work section wipes up over it — the scroll payoff.
  // Mobile: simple drift, no pin (a pinned hero is exhausting on small screens).
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=70%",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });
      tl.to(".hero-kicker, .role-ticker", { y: -50, opacity: 0, duration: 0.35 }, 0)
        .to(".hero-grid", { y: -90, opacity: 0, scale: 0.985, duration: 0.6 }, 0)
        .to(".hero-scroll-strip", { opacity: 0, duration: 0.3 }, 0)
        .to(
          ".hero-portrait",
          { y: -70, scale: 1.03, opacity: 0.12, duration: 0.7 },
          0.1
        );
    });

    mm.add("(max-width: 767px)", () => {
      gsap.to(".hero-grid", {
        y: -40,
        opacity: 0.3,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
      gsap.fromTo(
        ".hero-portrait img",
        { scale: 1.07 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero-portrait",
            start: "top bottom",
            end: "+=600",
            scrub: true,
          },
        }
      );
    });

    return () => {
      mm.revert();
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
      <RoleTicker />
      <div className="hero-grid">
        <h1 className="fit hero-name" ref={nameRef}>
          JUAN KUGANDA©
        </h1>
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
          </div>
        </div>
      </div>

      <a className="hero-scroll-strip" href="#work">
        <span className="rule" aria-hidden="true" />
        <span className="scroll-cue">
          Scroll for selected work{" "}
          <span className="arrow" aria-hidden="true">↓</span>
        </span>
        <span className="rule" aria-hidden="true" />
      </a>

      {/* TODO: ganti dengan foto Juan — cukup tukar src di bawah */}
      <figure className="hero-portrait">
        <img src="/hero-portrait.png" alt="Architectural brutalist portrait" />
        <figcaption className="tag">Portrait.jpg · abstract</figcaption>
      </figure>
    </header>
  );
}
