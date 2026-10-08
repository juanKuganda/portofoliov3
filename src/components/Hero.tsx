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
 * Sticker pills: the six that mean something. `at` — desktop absolute
 * position; `rot` — resting tilt in degrees.
 */
type StickerSpec = {
  label: string;
  variant: "ink" | "paper" | "amber";
  at: React.CSSProperties;
  rot: number;
};

const STICKERS: StickerSpec[] = [
  { label: "Open to work", variant: "ink", at: { top: "23%", left: "5.5%" }, rot: -6 },
  { label: "Designer", variant: "paper", at: { top: "46%", left: "3%" }, rot: 5 },
  { label: "UNTAD ’27", variant: "amber", at: { top: "69%", left: "7.5%" }, rot: -4 },
  { label: "Palu, ID", variant: "paper", at: { top: "21%", right: "5.5%" }, rot: 6 },
  { label: "Developer", variant: "ink", at: { top: "44%", right: "3%" }, rot: -5 },
  { label: "Mentor", variant: "paper", at: { top: "67%", right: "7.5%" }, rot: 4 },
];

/** Hand-drawn squiggle arrow pointing at the card (ink stroke, static). */
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
 * THE REEL v5 — clean & personal.
 *
 * Scene 1: faint static grid on paper; "Hai, I'm Juan" mask reveal;
 * a 3:4 portrait card DROPPED FROM ABOVE; six meaningful sticker
 * pills + one static squiggle around the card (desktop absolute,
 * mobile wrapped row).
 * Interaction: magnetic parallax — one rAF loop, quickSetter per
 * element, lerped. Stickers ±14px alternating, card ±8px + tilt ≤4°,
 * headline ±4px. Paused on reduced-motion, mobile, or off-viewport.
 * Scroll: NO PIN — a single scrub timeline eases everything out
 * (card y:-40, headline y:-70, stickers y:-100 → opacity 0.2).
 * Mobile: no parallax, no pin, quiet exit. Reduced motion: one
 * static frame.
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

  // Magnetic parallax: ONE rAF loop, gsap.quickSetter per element,
  // lerped toward the pointer. Transform-only. The loop runs only
  // while the pointer moves (stops when settled), only on desktop,
  // never with reduced motion, and pauses when the hero leaves the
  // viewport. Parallax writes to dedicated `.par-*` wrappers so it
  // never fights the entrance or scroll timelines.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const desktopMq = window.matchMedia("(min-width: 769px)");
    if (!desktopMq.matches) return;

    const parHi = root.querySelector<HTMLElement>(".par-hi");
    const parCard = root.querySelector<HTMLElement>(".par-card");
    const stickerEls = Array.from(
      root.querySelectorAll<HTMLElement>(".reel-stickers .sticker")
    );
    if (!parHi || !parCard || stickerEls.length === 0) return;

    gsap.set(parCard, { transformPerspective: 900 });

    const setHiX = gsap.quickSetter(parHi, "x", "px");
    const setHiY = gsap.quickSetter(parHi, "y", "px");
    const setCardX = gsap.quickSetter(parCard, "x", "px");
    const setCardY = gsap.quickSetter(parCard, "y", "px");
    const setCardRX = gsap.quickSetter(parCard, "rotationX", "deg");
    const setCardRY = gsap.quickSetter(parCard, "rotationY", "deg");
    const stickers = stickerEls.map((el, i) => ({
      baseRot: parseFloat(el.dataset.rot || "0"),
      dir: i % 2 === 0 ? 1 : -1,
      setX: gsap.quickSetter(el, "x", "px"),
      setR: gsap.quickSetter(el, "rotation", "deg"),
    }));

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let inView = true;
    let disposed = false;

    const apply = () => {
      setHiX(cx * 4);
      setHiY(cy * 4);
      setCardX(cx * 8);
      setCardY(cy * 8);
      setCardRY(cx * 4);
      setCardRX(-cy * 4);
      for (const s of stickers) {
        s.setX(cx * 14 * s.dir);
        s.setR(s.baseRot + cx * 2 * s.dir);
      }
    };

    const loop = () => {
      raf = 0;
      if (disposed || !inView || !desktopMq.matches) return;
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      if (Math.abs(tx - cx) < 0.005 && Math.abs(ty - cy) < 0.005) {
        cx = tx;
        cy = ty;
        apply();
        return; // settled — loop sleeps until the next pointermove
      }
      apply();
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf && !disposed && inView && desktopMq.matches) {
        raf = requestAnimationFrame(loop);
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      kick();
    };
    // Ease back to center when the pointer leaves the hero.
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        if (!inView && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 }
    );
    const onMq = () => {
      if (!desktopMq.matches && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    io.observe(root);
    desktopMq.addEventListener("change", onMq);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);

    return () => {
      disposed = true;
      io.disconnect();
      desktopMq.removeEventListener("change", onMq);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      gsap.set([parHi, parCard, ...stickerEls], { clearProps: "transform" });
    };
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
        gsap.set(".reel-hi", { clearProps: "transform" });
        gsap.set(".reel-card", { clearProps: "transform,opacity" });
        gsap.set(stickers, { clearProps: "transform,opacity" });
      });
    }, root);
    return () => {
      ctx.revert();
    };
  }, []);

  // Scroll exit: NO PIN. One scrub timeline eases the hero out as the
  // page scrolls past — card, headline and stickers drift up and fade.
  // This is the only scroll animation on the hero.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      tl.to(".reel-card", { y: -40, duration: 1 }, 0)
        .to(".reel-hi-mask", { y: -70, duration: 1 }, 0)
        .to(
          ".reel-stickers .sticker",
          { y: -100, opacity: 0.2, duration: 1, stagger: 0.05 },
          0
        );
    }, root);
    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <header className="hero-reel" id="top" ref={rootRef}>
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
          <div className="par-hi">
            <h1 className="reel-hi">Hai, I&rsquo;m Juan</h1>
          </div>
        </div>

        <div className="par-card">
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
        </div>

        <div className="reel-bottom-row">
          <p className="reel-cap">FIG.01 — JUAN, PALU · 2026</p>
          <a className="reel-scroll" href="#work">
            <span>Scroll</span>
            <span className="arrow" aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      {/* Sticker field: six meaningful pills + one static squiggle.
          Absolute around the card on desktop, a tidy wrapped row
          under the card on mobile. */}
      <div className="reel-stickers" aria-hidden="true">
        {STICKERS.map((s) => (
          <span
            key={s.label}
            className={`sticker sticker-${s.variant}`}
            style={s.at}
            data-rot={s.rot}
          >
            {s.variant === "ink" && <span className="sdot" />}
            {s.label}
          </span>
        ))}
        <span
          className="sticker sticker-squiggle"
          style={{ top: "76%", left: "11%" }}
          data-rot={0}
        >
          <Squiggle />
        </span>
      </div>
    </header>
  );
}
