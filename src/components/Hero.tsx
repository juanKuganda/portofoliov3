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
        // Photo wipe: the frame unveils bottom-to-top via clip-path while
        // the figure itself just fades — one crisp reveal, no double motion.
        .from(".hero-photo", { opacity: 0, duration: 0.5 }, 0.35)
        .from(".hero-photo-cap.cap-a", { opacity: 0, y: 8, duration: 0.5 }, 0.9)
        .from(".hero-scroll-strip", { opacity: 0, duration: 0.5 }, 1.0);
      // The wipe's initial state is set via GSAP (not CSS) so no-JS still
      // shows the photo.
      gsap.set(".hero-photo-frame", { clipPath: "inset(100% 0% 0% 0%)" });
      tl.to(
        ".hero-photo-frame",
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power3.inOut" },
        0.35
      );
      // THE BLOOM: the grayscale layer fades once, ~1.6s in — the blazer
      // turns blue as the single color moment on the page. opacity-only,
      // compositor-cheap (two stacked <img>, one file).
      tl.to(
        ".photo-gray",
        { opacity: 0, duration: 1.2, ease: "power2.inOut" },
        1.6
      );
      // Once done, wipe GSAP's inline styles — nothing lingers in the DOM.
      // NOTE: surgical clearProps — "all" on .hero-name would wipe the
      // font-size that useFitText sets inline. .photo-gray is NOT cleared:
      // its opacity:0 is the final (color) state.
      tl.eventCallback("onComplete", () => {
        gsap.set(
          ".hero-kicker, .role-ticker, .hero-side .statement, .hero-meta, .hero-photo, .hero-photo-cap.cap-a, .hero-scroll-strip, .hero-name .ch-copy, .hero-name .copy-ring",
          { clearProps: "all" }
        );
        gsap.set(".hero-photo-frame", { clearProps: "clipPath" });
        gsap.set(".hero-name", { clearProps: "transform" });
        gsap.set(".hero-name .ch", { clearProps: "opacity" });
        // Idle drift: the frame breathes on y (x is reserved for the
        // pointer parallax). Barely-there, transform-only.
        gsap.to(".hero-photo-frame", {
          y: 8,
          duration: 7,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
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

  // Photo pointer parallax (desktop): the frame counter-moves on x only —
  // y belongs to the idle drift, so the two never fight. Lerped, ±12px.
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 769px)", () => {
      const xTo = gsap.quickTo(".hero-photo-frame", "x", {
        duration: 0.9,
        ease: "power3.out",
      });
      const onMove = (e: PointerEvent) => {
        xTo((e.clientX / window.innerWidth - 0.5) * -24);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    });
    return () => {
      mm.revert();
    };
  }, []);

  // Scroll film (desktop): the hero pins while the photo plays three
  // scenes — words leave, Ken Burns push-in, cinematic handoff.
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
      // SCROLL FILM — the hero is pinned for +=160% and the photo plays
      // three scenes as you scroll, like a video:
      //   1. the words leave (kicker/ticker/strip, then name, then statement)
      //   2. the Ken Burns — the photo slowly pushes in and drifts
      //   3. the handoff — the photo darkens cinematically, then the pin
      //      releases and Work wipes up over it.
      // All transform/opacity; the idle drift (frame y) and pointer
      // parallax (frame x) live on the frame, the scrub on the figure/imgs —
      // the layers never fight.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=160%",
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
        },
      });
      tl.to(
        ".hero-kicker, .role-ticker, .hero-scroll-strip",
        { y: -60, opacity: 0, duration: 0.22 },
        0
      )
        .to(".name-mask", { y: -90, opacity: 0, duration: 0.3 }, 0.04)
        .to(".hero-side", { y: -70, opacity: 0, duration: 0.28 }, 0.08)
        .fromTo(
          ".hero-photo .photo-color, .hero-photo .photo-gray",
          { scale: 1, yPercent: 0 },
          { scale: 1.14, yPercent: -4, duration: 0.6 },
          0.1
        )
        .to(".hero-photo-cap.cap-a", { opacity: 0, duration: 0.12 }, 0.32)
        .to(".hero-photo-cap.cap-b", { opacity: 1, duration: 0.12 }, 0.4)
        .to(".photo-shade", { opacity: 0.55, duration: 0.35 }, 0.6)
        .to(
          ".hero-photo",
          { scale: 0.96, opacity: 0.9, duration: 0.35 },
          0.65
        );
    });

    mm.add("(max-width: 767px)", () => {
      gsap.to(".hero-stage", {
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
        ".hero-photo .photo-color",
        { scale: 1.07 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero-photo",
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
      <div className="hero-stage">
        <figure className="hero-photo">
          <div className="hero-photo-frame">
            <img
              className="photo-color"
              src="/hero-portrait.webp"
              alt="Portrait of Juan Pablo Putra Kuganda"
              width={925}
              height={1600}
              fetchPriority="high"
            />
            <img
              className="photo-gray"
              src="/hero-portrait.webp"
              alt=""
              aria-hidden="true"
              width={925}
              height={1600}
            />
            <div className="photo-shade" aria-hidden="true" />
          </div>
          <figcaption className="hero-photo-cap cap-a" aria-hidden="true">
            FIG.01 — JUAN, PALU · 2026
          </figcaption>
          <figcaption className="hero-photo-cap cap-b" aria-hidden="true">
            DEVELOPER · DESIGNER · MENTOR
          </figcaption>
        </figure>
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
    </header>
  );
}
