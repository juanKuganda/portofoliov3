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
 * Sticker pill config for the busy scene-1 composition.
 * `at`   — desktop absolute position (inline style).
 * `rot`  — resting rotation in degrees (-6..6, playful tilt).
 * `scatter` — where it flies when the pin starts (Luca-Mori beat):
 *             x/y pixels + extra rotation, fading out.
 */
type StickerSpec = {
  label: string;
  variant: "ink" | "paper" | "amber";
  at: React.CSSProperties;
  rot: number;
  scatter: { x: number; y: number; r: number };
};

const STICKERS: StickerSpec[] = [
  { label: "Open to work", variant: "ink", at: { top: "23%", left: "5.5%" }, rot: -6, scatter: { x: -340, y: -130, r: -26 } },
  { label: "Designer", variant: "paper", at: { top: "46%", left: "3%" }, rot: 5, scatter: { x: -430, y: 30, r: 30 } },
  { label: "UNTAD ’27", variant: "amber", at: { top: "69%", left: "7.5%" }, rot: -4, scatter: { x: -310, y: 190, r: -22 } },
  { label: "Palu, ID", variant: "paper", at: { top: "21%", right: "5.5%" }, rot: 6, scatter: { x: 330, y: -150, r: 24 } },
  { label: "Developer", variant: "ink", at: { top: "44%", right: "3%" }, rot: -5, scatter: { x: 430, y: 10, r: -30 } },
  { label: "Mentor", variant: "paper", at: { top: "67%", right: "7.5%" }, rot: 4, scatter: { x: 310, y: 180, r: 26 } },
];

/** Amber 12-point starburst (pure SVG, no emoji). */
function Starburst() {
  const pts: string[] = [];
  const n = 12;
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? 46 : 31;
    const a = (Math.PI * i) / n - Math.PI / 2;
    pts.push(`${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`);
  }
  return (
    <svg viewBox="0 0 100 100" className="burst-svg" aria-hidden="true">
      <polygon points={pts.join(" ")} />
    </svg>
  );
}

/** Hand-drawn squiggle arrow pointing at the card (ink stroke). */
function Squiggle() {
  return (
    <svg viewBox="0 0 120 84" className="squiggle-svg" aria-hidden="true">
      <path
        d="M10 14 C 52 8, 58 54, 100 46"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M88 38 L103 47 L90 58"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * THE REEL v4 — busy & playful, mono + amber only.
 *
 * Scene 1: faint grid + amber glow on paper; "Hai, I'm Juan" mask
 * reveal; a 3:4 portrait card DROPPED FROM ABOVE; sticker pills,
 * a starburst, a squiggle arrow and a FIG.01 tag scattered around
 * the card (desktop absolute, mobile wrapped row).
 * Scroll (desktop pin +=260%): stickers + headline SCATTER outward
 * like Luca Mori's flying photos; the card PUNCHES IN to full-bleed
 * (portrait full-height, dark blurred sides — never over-zoomed);
 * the full-bleed holds with a small caption, then releases to Work.
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

  // Entrance (<1.2s): card drops from above, headline reveals, stickers
  // pop in with stagger, then THE BLOOM (grayscale → color, once).
  // transform/opacity only.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const stickers = gsap.utils.toArray<HTMLElement>(
        ".reel-stickers .sticker"
      );
      // Resting tilt per sticker (data-rot), so scale pops keep it.
      stickers.forEach((el) =>
        gsap.set(el, { rotation: parseFloat(el.dataset.rot || "0") })
      );

      gsap.set(".reel-card", { y: -170, opacity: 0, scale: 0.98 });
      gsap.set(".reel-hi", { yPercent: 112 });
      gsap.set(".reel-top > *", { y: 12, opacity: 0 });
      gsap.set(stickers, { scale: 0, opacity: 0 });
      gsap.set(".reel-full", { autoAlpha: 0 });
      gsap.set(".reel-fullcap", { autoAlpha: 0 });
      // will-change lives only for the entrance — cleared onComplete.
      gsap.set([".reel-card", ".reel-hi", ".reel-top > *", ...stickers], {
        willChange: "transform, opacity",
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(
        ".reel-card",
        { y: 0, opacity: 1, scale: 1, duration: 1.0, ease: "expo.out" },
        0.05
      )
        .to(".reel-hi", { yPercent: 0, duration: 0.7, ease: "power4.out" }, 0.35)
        .to(
          stickers,
          { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.8)", stagger: 0.055 },
          0.5
        )
        .to(".reel-top > *", { y: 0, opacity: 1, duration: 0.45, stagger: 0.07 }, 0.6)
        // THE BLOOM: the grayscale layer fades once — the blazer turns
        // blue as the single color moment. opacity-only, compositor-cheap.
        .to(
          ".reel-card .photo-gray",
          { opacity: 0, duration: 1.2, ease: "power2.inOut" },
          1.5
        );

      tl.eventCallback("onComplete", () => {
        gsap.set(".reel-top > *", { clearProps: "all" });
        gsap.set(".reel-hi", { clearProps: "transform,willChange" });
        gsap.set(".reel-card", { clearProps: "transform,opacity,willChange" });
        gsap.set(stickers, { clearProps: "transform,opacity,willChange" });
      });
    }, root);
    return () => {
      ctx.revert();
    };
  }, []);

  // Scroll film. Desktop: pin +=260% — stickers scatter, headline
  // leaves, card punches in to full-bleed, caption holds, release.
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
      // will-change lives only while the pin is active — never as a
      // permanent CSS rule (that would pin a dozen composited layers,
      // some full-viewport, for the whole page lifetime).
      const wcTargets = () =>
        root.querySelectorAll(
          ".reel-card, .reel-full, .reel-fullcap, .reel-hi-mask, .reel-stickers .sticker"
        );
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=260%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          onToggle: (self) =>
            gsap.set(wcTargets(), {
              willChange: self.isActive ? "transform, opacity" : "auto",
            }),
        },
      });
      // The scatter: every sticker flies outward with its own vector.
      // NOTE: use opacity (not autoAlpha) here — in a scrubbed timeline
      // created at load, autoAlpha's visibility:hidden would apply at
      // init despite immediateRender:false, hiding the stickers.
      gsap.utils
        .toArray<HTMLElement>(".reel-stickers .sticker")
        .forEach((el, i) => {
          tl.to(
            el,
            {
              x: parseFloat(el.dataset.sx || "0"),
              y: parseFloat(el.dataset.sy || "0"),
              rotation: `+=${el.dataset.sr || "0"}`,
              opacity: 0,
              duration: 0.5,
              immediateRender: false,
            },
            0.03 * i
          );
        });
      // Headline + chrome leave with the stickers.
      // NOTE: plain opacity here, never autoAlpha — in a scrubbed
      // timeline created at load, autoAlpha's visibility:hidden can
      // apply at init despite immediateRender:false.
      tl.to(".reel-hi-mask", { yPercent: -45, opacity: 0, duration: 0.4 }, 0.05)
        .to(".reel-top > *, .reel-bottom-row > *", {
          y: -24, opacity: 0, duration: 0.35,
        }, 0.05)
        // The punch-in: a fast whip-cut. The card accelerates away as
        // the full-bleed punches in beneath it.
        .to(".reel-card", {
          scale: 1.3, opacity: 0, duration: 0.32, ease: "power2.in",
          immediateRender: false,
        }, 0)
        .fromTo(".reel-full", { opacity: 0, visibility: "hidden", scale: 1.16 }, {
          opacity: 1, visibility: "visible", scale: 1.06, duration: 0.4, immediateRender: false,
        }, 0.14)
        // Hold the full-bleed with its caption; the push continues.
        .to(".reel-full", { scale: 1.12, duration: 1.6 }, 0.8)
        .fromTo(".reel-fullcap", { opacity: 0, visibility: "hidden", y: 24 }, {
          opacity: 1, visibility: "visible", y: 0, duration: 0.35, immediateRender: false,
        }, 0.95)
        // Release: caption leaves, shade holds, handoff to Work.
        .to(".reel-fullcap", { opacity: 0, duration: 0.35 }, 2.0)
        .to(".reel-full", { scale: 1.18, duration: 0.6 }, 2.0);

      // matchMedia cleanup: drop the will-change hints (onToggle won't
      // fire again once the trigger is reverted).
      return () => {
        gsap.set(wcTargets(), { willChange: "auto" });
      };
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
        .to(".reel-hi-mask", { yPercent: -30, opacity: 0, duration: 0.6 }, 0.1)
        .to(".reel-top > *, .reel-bottom-row > *, .reel-stickers .sticker", {
          opacity: 0, y: -12, duration: 0.4,
        }, 0.1);
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

      {/* Playful sticker field: absolute around the card on desktop,
          a tidy wrapped row under the card on mobile. */}
      <div className="reel-stickers" aria-hidden="true">
        {STICKERS.map((s) => (
          <span
            key={s.label}
            className={`sticker sticker-${s.variant}`}
            style={s.at}
            data-rot={s.rot}
            data-sx={s.scatter.x}
            data-sy={s.scatter.y}
            data-sr={s.scatter.r}
          >
            {s.variant === "ink" && <span className="sdot" />}
            {s.label}
          </span>
        ))}
        <span
          className="sticker sticker-tag"
          style={{ top: "13%", left: "14%" }}
          data-rot={-8}
          data-sx={-260}
          data-sy={-180}
          data-sr={-18}
        >
          FIG.01
        </span>
        <span
          className="sticker sticker-burst"
          style={{ top: "11%", right: "15%" }}
          data-rot={12}
          data-sx={280}
          data-sy={-170}
          data-sr={40}
        >
          <Starburst />
        </span>
        <span
          className="sticker sticker-squiggle"
          style={{ top: "76%", left: "11%" }}
          data-rot={0}
          data-sx={-240}
          data-sy={200}
          data-sr={-14}
        >
          <Squiggle />
        </span>
      </div>

      {/* Caption that holds over the full-bleed before release. */}
      <div className="reel-fullcap" aria-hidden="true">
        <p>FIG.01 — JUAN, PALU · 2026</p>
      </div>
    </header>
  );
}
