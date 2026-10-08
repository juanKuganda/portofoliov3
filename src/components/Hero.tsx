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
      <span className="tick-bracket" aria-hidden="true">[</span>
      <span className="tick-word" key={idx}>
        {ROLES[idx]}
      </span>
      <span className="tick-bracket" aria-hidden="true">]</span>
    </p>
  );
}

/**
 * THE REEL — full-bleed cinematic hero.
 *
 * The portrait fills the viewport edge-to-edge. The giant name sits on top
 * in mix-blend-mode: difference, so it inverts live against the photo.
 * Scroll pins the hero for +=250% and plays three scenes like a film:
 *   1. push-in — the photo slowly zooms while the name/kicker exit;
 *   2. statement — roles + manifesto crossfade over the darkened photo;
 *   3. handoff — the shade deepens, the push continues, pin releases to Work.
 * Mobile gets the same frames compressed into a normal (unpinned) scroll;
 * reduced motion gets a single static frame.
 */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  useFitText(nameRef);

  // The sticky nav pushes the hero down by its height — size the reel to
  // exactly fill the remaining viewport so the bottom title card never
  // clips below the fold. Runs before the scroll triggers are created.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const setH = () => {
      const nav = document.querySelector(".nav");
      const navH = nav ? Math.round(nav.getBoundingClientRect().height) : 60;
      root.style.setProperty("--reel-h", `calc(100svh - ${navH}px)`);
      ScrollTrigger.refresh();
    };
    setH();
    window.addEventListener("resize", setH);
    return () => window.removeEventListener("resize", setH);
  }, []);

  // Split the headline into per-char spans (layout only — no animation).
  // Runs before the entrance so the mask reveal has chars to work with.
  useLayoutEffect(() => {
    const el = nameRef.current;
    if (!el || el.dataset.split === "1") return;
    el.dataset.split = "1";
    const text = el.textContent || "";
    el.textContent = "";
    text.split("").forEach((chr) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = chr === " " ? " " : chr;
      el.appendChild(s);
    });
  }, []);

  // Entrance: photo pushes in from 1.18, name rises through its mask,
  // chars inflate thin→black, then THE BLOOM (grayscale → color, once).
  // transform/opacity only; ctx.revert() cleanup so nothing sticks invisible.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const el = nameRef.current;
    if (!root || !el) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.set(".reel-photo", { scale: 1.18 });
      gsap.set(".reel-name", { yPercent: 112 });
      gsap.set(".reel-top > *, .reel-bottom-row > *", { y: 12, opacity: 0 });
      gsap.set(".reel-scene2", { autoAlpha: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(".reel-photo", { scale: 1, duration: 1.5, ease: "expo.out" }, 0)
        .to(".reel-name", { yPercent: 0, duration: 0.9, ease: "power4.out" }, 0.1)
        .fromTo(
          ".reel-name .ch",
          { fontVariationSettings: '"wght" 300', opacity: 0 },
          {
            fontVariationSettings: '"wght" 800',
            opacity: 1,
            duration: 0.9,
            stagger: 0.025,
          },
          0.16
        )
        .to(".reel-top > *, .reel-bottom-row > *", {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.07,
        }, 0.55)
        // THE BLOOM: the grayscale layer fades once — the blazer turns
        // blue as the single color moment. opacity-only, compositor-cheap.
        .to(".reel-photo .photo-gray", {
          opacity: 0,
          duration: 1.2,
          ease: "power2.inOut",
        }, 1.5);

      tl.eventCallback("onComplete", () => {
        gsap.set(
          ".reel-top > *, .reel-bottom-row > *, .reel-name .ch",
          { clearProps: "all" }
        );
        gsap.set(".reel-name", { clearProps: "transform" });
        // NOTE: .reel-photo scale is NOT cleared — the scroll film's
        // fromTo(scale 1 → 1.14) takes over from the settled state.
      });
    }, root);
    return () => {
      ctx.revert();
    };
  }, []);

  // THE HOOK — "Text Pressure": cursor proximity drives each char's
  // variable-font weight (560 → 900) plus a small physical lift.
  // An autonomous wave sweeps the name every ~6s so touch users get it too.
  // Static under reduced motion.
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
        const eased = p * p * (3 - 2 * p);
        const wght = Math.round(560 + eased * 340);
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
    const timer = window.setTimeout(enable, 1900);

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

  // Scroll film. Desktop: pin +=250%, scrubbed 3-scene timeline.
  // Mobile: no pin — the same beats compressed into the hero's exit.
  // immediateRender:false on fromTo tweens so the scrub never fights the
  // entrance at scroll position 0.
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
          end: "+=250%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
      // Scene 1 — push-in: photo zooms while the title card leaves.
      tl.fromTo(".reel-photo", { scale: 1 }, {
        scale: 1.14, duration: 2, immediateRender: false,
      }, 0)
        .to(".reel-name-mask", { yPercent: -55, autoAlpha: 0, duration: 0.5 }, 0.15)
        .to(".reel-top > *, .reel-bottom-row > *", {
          y: -24, autoAlpha: 0, duration: 0.4,
        }, 0.1)
        // Scene 2 — statement: roles + manifesto over the darkening photo.
        .to(".reel-shade", { opacity: 0.35, duration: 0.5 }, 0.8)
        .fromTo(".reel-scene2", { autoAlpha: 0, y: 44 }, {
          autoAlpha: 1, y: 0, duration: 0.4, immediateRender: false,
        }, 0.9)
        .to(".reel-scene2", { autoAlpha: 0, y: -44, duration: 0.4 }, 1.8)
        // Scene 3 — handoff: shade deepens, push continues, release to Work.
        .to(".reel-shade", { opacity: 0.62, duration: 0.6 }, 2.2)
        .to(".reel-photo", { scale: 1.18, duration: 0.8 }, 2.2);
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
      tl.fromTo(".reel-photo", { scale: 1 }, {
        scale: 1.1, duration: 1, immediateRender: false,
      }, 0)
        .to(".reel-name-mask", { yPercent: -35, autoAlpha: 0, duration: 0.6 }, 0.1)
        .to(".reel-top > *, .reel-bottom-row > *", { autoAlpha: 0, duration: 0.4 }, 0.1)
        .fromTo(".reel-scene2", { autoAlpha: 0 }, {
          autoAlpha: 1, duration: 0.4, immediateRender: false,
        }, 0.55)
        .to(".reel-shade", { opacity: 0.45, duration: 0.5 }, 0.55);
    });

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <header className="hero-reel" id="top" ref={rootRef}>
      <div className="reel-media">
        <picture className="reel-photo">
          <source
            media="(min-width: 769px)"
            srcSet="/hero-portrait-wide.webp"
            width={925}
            height={578}
          />
          <img
            className="photo-color"
            src="/hero-portrait.webp"
            alt="Portrait of Juan Pablo Putra Kuganda"
            width={925}
            height={1233}
            fetchPriority="high"
          />
        </picture>
        <picture className="reel-photo" aria-hidden="true">
          <source
            media="(min-width: 769px)"
            srcSet="/hero-portrait-wide.webp"
            width={925}
            height={578}
          />
          <img
            className="photo-gray"
            src="/hero-portrait.webp"
            alt=""
            width={925}
            height={1233}
          />
        </picture>
        <div className="reel-shade" aria-hidden="true" />
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

      <div className="reel-bottom">
        <div className="reel-name-mask">
          <h1 className="fit reel-name" ref={nameRef}>
            JUAN KUGANDA©
          </h1>
        </div>
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
