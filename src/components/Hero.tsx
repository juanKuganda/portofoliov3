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
        // Line-mask reveal: the name slides up from behind its mask…
        .from(
          ".hero-name",
          { yPercent: 112, duration: 0.85, ease: "power4.out" },
          0.12
        )
        // …while its weight inflates from thin to black, char by char.
        .fromTo(
          ".hero-name .ch",
          { fontVariationSettings: '"wght" 300', opacity: 0 },
          {
            fontVariationSettings: '"wght" 800',
            opacity: 1,
            duration: 0.9,
            stagger: 0.02,
            ease: "power3.out",
          },
          0.18
        )
        .fromTo(
          ".hero-name .ch-copy",
          { scale: 0 },
          { scale: 1, duration: 0.6, ease: "back.out(2.2)" },
          0.9
        )
        .fromTo(
          ".hero-name .copy-ring",
          { scale: 0.4, opacity: 0.9 },
          { scale: 1.7, opacity: 0, duration: 0.9, ease: "power2.out" },
          1.0
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
      // NOTE: surgical clearProps — "all" on .hero-name would wipe the
      // font-size that useFitText sets inline.
      tl.eventCallback("onComplete", () => {
        gsap.set(
          ".hero-kicker, .role-ticker, .hero-side .statement, .hero-meta, .hero-portrait, .hero-scroll-strip, .hero-name .ch-copy, .hero-name .copy-ring",
          { clearProps: "all" }
        );
        gsap.set(".hero-name", { clearProps: "transform" });
        gsap.set(".hero-name .ch", { clearProps: "opacity" });
      });
    }, root);

    // Revert (don't just kill): removes every inline style GSAP added,
    // so an interrupted entrance can never leave content stuck invisible.
    return () => {
      ctx.revert();
    };
  }, []);

  // THE HOOK — "Text Pressure": cursor proximity drives each char's
  // variable-font weight (560 → 900) plus a small physical lift.
  // An autonomous wave sweeps the name every ~6s so touch users get the
  // hook too. transform + font-variation-settings writes only, offsets
  // cached, 1 layout read per pointermove. Static under reduced motion.
  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const RADIUS = 150;
    let chars: HTMLElement[] = [];
    let offsets: { x: number; y: number }[] = [];
    let enabled = false;
    let pointerActive = false;
    let waveTween: gsap.core.Tween | null = null;

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

    const applyPressure = (px: number, py: number) => {
      for (let i = 0; i < chars.length; i++) {
        const dx = px - offsets[i].x;
        const dy = py - offsets[i].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const p = d < RADIUS ? 1 - d / RADIUS : 0;
        const eased = p * p * (3 - 2 * p); // smoothstep: fatter peak
        const wght = Math.round(560 + eased * 340); // 560 → 900
        chars[i].style.fontVariationSettings = `"wght" ${wght}`;
        chars[i].style.transform =
          eased > 0.02 ? `translate3d(0, ${(-eased * 6).toFixed(1)}px, 0)` : "";
      }
    };

    const releaseAll = () => {
      for (const ch of chars) {
        ch.style.fontVariationSettings = '"wght" 800';
        ch.style.transform = "";
      }
    };

    // Autonomous wave: a virtual cursor sweeps the name every ~6s.
    const sweep = () => {
      if (!enabled) return;
      const w = el.getBoundingClientRect().width;
      const h2 = el.getBoundingClientRect().height / 2;
      const proxy = { x: -RADIUS - 20 };
      waveTween = gsap.to(proxy, {
        x: w + RADIUS + 20,
        duration: 2.2,
        ease: "power2.inOut",
        onUpdate: () => {
          if (!pointerActive && enabled) applyPressure(proxy.x, h2);
        },
        onComplete: () => {
          if (!pointerActive && enabled) releaseAll();
          if (enabled) waveTween = gsap.delayedCall(4.2, sweep);
        },
      });
    };

    const enable = () => {
      if (enabled) return;
      enabled = true;
      measure();
      el.classList.add("magnetic-on");
      waveTween = gsap.delayedCall(2.2, sweep);
    };
    // After the entrance timeline (+ © pop) has settled.
    const timer = window.setTimeout(enable, 1700);

    const onMove = (e: PointerEvent) => {
      if (!enabled || !chars.length) return;
      pointerActive = true;
      waveTween?.kill();
      const h1 = el.getBoundingClientRect();
      applyPressure(e.clientX - h1.left, e.clientY - h1.top);
    };
    const onLeave = () => {
      pointerActive = false;
      if (enabled) {
        releaseAll();
        // resume the wave after a beat
        waveTween?.kill();
        waveTween = gsap.delayedCall(3, sweep);
      }
    };

    window.addEventListener("resize", measure);
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      window.clearTimeout(timer);
      waveTween?.kill();
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
      // Multi-speed parallax exit: each layer leaves at its own pace —
      // chips/kicker fastest, name fast, portrait lingers. Depth you feel.
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
      tl.to(
        ".hero-kicker, .role-ticker, .hero-scroll-strip",
        { y: -60, opacity: 0, duration: 0.3 },
        0
      )
        .to(
          ".hero-grid",
          { y: -110, opacity: 0, scale: 0.98, duration: 0.55 },
          0
        )
        .to(
          ".hero-portrait",
          { y: -30, scale: 1.05, opacity: 0.25, duration: 0.9 },
          0.05
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
        <div className="name-mask">
          <h1 className="fit hero-name" ref={nameRef}>
            JUAN KUGANDA©
          </h1>
        </div>
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
        <img
          src="/hero-portrait.png"
          alt="Architectural brutalist portrait"
          width={1024}
          height={1024}
          fetchPriority="high"
        />
        <figcaption className="tag">Portrait.jpg · abstract</figcaption>
      </figure>
    </header>
  );
}
