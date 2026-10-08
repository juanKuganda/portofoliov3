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

/* Shared gradient defs for the precision doodles — one block, unique
   ids, referenced by every icon. Identity colors only: ink + amber. */
function DoodleDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <linearGradient id="dz-ink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#333333" />
          <stop offset="1" stopColor="#0a0a0a" />
        </linearGradient>
        <linearGradient id="dz-ink-soft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#262626" />
          <stop offset="1" stopColor="#141414" />
        </linearGradient>
        <linearGradient id="dz-amber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb62e" />
          <stop offset="1" stopColor="#e8930c" />
        </linearGradient>
        <linearGradient id="dz-amber-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffb62e" />
          <stop offset="1" stopColor="#e8930c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Apple-precision vector doodles: geometric, crisp, subtle depth via
   gradients + one soft highlight each. Ink + amber only. */
function DoodleIcon({ kind }: { kind: "folder" | "pencil" | "code" | "pin" | "cap" }) {
  if (kind === "folder")
    return (
      <svg viewBox="0 0 64 64" className="doodle-svg" aria-hidden="true">
        <rect x="13" y="9" width="17" height="13" rx="3.5" fill="url(#dz-amber)" />
        <rect x="9" y="13" width="46" height="33" rx="5" fill="url(#dz-ink-soft)" />
        <rect x="6" y="21" width="52" height="33" rx="6.5" fill="url(#dz-ink)" />
        <rect x="11" y="25.5" width="42" height="3.4" rx="1.7" fill="#ffffff" opacity="0.16" />
      </svg>
    );
  if (kind === "pencil")
    return (
      <svg viewBox="0 0 64 64" className="doodle-svg" aria-hidden="true">
        <g transform="rotate(45 32 32)">
          <rect x="26" y="5" width="12" height="37" rx="3.5" fill="url(#dz-amber-h)" />
          <rect x="28.6" y="8" width="2.6" height="30" rx="1.3" fill="#ffffff" opacity="0.28" />
          <rect x="26" y="42" width="12" height="6.5" fill="url(#dz-ink-soft)" />
          <path d="M26 48.5 L32 59 L38 48.5 Z" fill="url(#dz-ink)" />
        </g>
      </svg>
    );
  if (kind === "code")
    return (
      <svg viewBox="0 0 64 64" className="doodle-svg" aria-hidden="true">
        <rect x="7" y="7" width="50" height="50" rx="13" fill="url(#dz-ink)" />
        <rect x="13" y="12.5" width="38" height="4" rx="2" fill="#ffffff" opacity="0.13" />
        <path d="M27 24 L18.5 32 L27 40" stroke="url(#dz-amber)" strokeWidth="4.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M37 24 L45.5 32 L37 40" stroke="url(#dz-amber)" strokeWidth="4.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M35.5 22.5 L28.5 41.5" stroke="url(#dz-amber)" strokeWidth="4" fill="none" strokeLinecap="round" />
      </svg>
    );
  if (kind === "pin")
    return (
      <svg viewBox="0 0 64 64" className="doodle-svg" aria-hidden="true">
        <path
          d="M32 5 C20.5 5 12 14.5 12 26 C12 40.5 32 59 32 59 C32 59 52 40.5 52 26 C52 14.5 43.5 5 32 5 Z"
          fill="url(#dz-ink)"
        />
        <ellipse cx="23.5" cy="18" rx="3.6" ry="6" fill="#ffffff" opacity="0.18" transform="rotate(-18 23.5 18)" />
        <circle cx="32" cy="26" r="8.5" fill="url(#dz-amber)" />
        <circle cx="29.5" cy="23.5" r="2.4" fill="#ffffff" opacity="0.35" />
      </svg>
    );
  return (
    <svg viewBox="0 0 64 64" className="doodle-svg" aria-hidden="true">
      <rect x="22" y="27" width="20" height="13" rx="3.5" fill="url(#dz-ink-soft)" />
      <line x1="53" y1="21" x2="53" y2="37" stroke="url(#dz-amber)" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 6 L59 19 L32 32 L5 19 Z" fill="url(#dz-ink)" />
      <path d="M32 6 L59 19 L46 24.5 L32 17 Z" fill="#ffffff" opacity="0.07" />
      <circle cx="53" cy="40.5" r="4.2" fill="url(#dz-amber)" />
    </svg>
  );
}

/**
 * Doodle stickers: five Apple-precision vector icons + one status
 * pill. `at` — desktop absolute position, anchored to `.reel-center`
 * (the card's own stage), ~80–140px from the card edge; `rot` —
 * resting tilt in degrees; `side` — scroll-explode direction.
 * Transform layers: outer `.sticker` = entrance pop + scroll explode;
 * inner `.sticker-par` = magnetic parallax. They never fight.
 */
type StickerSpec = {
  kind: "folder" | "pencil" | "code" | "pin" | "cap" | "pill";
  label: string;
  at: React.CSSProperties;
  rot: number;
  side: "l" | "r";
};

const STICKERS: StickerSpec[] = [
  { kind: "folder", label: "projects", at: { top: "calc(50% - 165px)", left: "calc(50% - 300px)" }, rot: -8, side: "l" },
  { kind: "pencil", label: "design", at: { top: "calc(50% + 25px)", left: "calc(50% - 305px)" }, rot: 7, side: "l" },
  { kind: "cap", label: "untad ’27", at: { top: "calc(50% + 215px)", left: "calc(50% - 290px)" }, rot: -5, side: "l" },
  { kind: "pin", label: "palu, id", at: { top: "calc(50% - 165px)", left: "calc(50% + 300px)" }, rot: 8, side: "r" },
  { kind: "code", label: "code", at: { top: "calc(50% + 25px)", left: "calc(50% + 305px)" }, rot: -7, side: "r" },
  { kind: "pill", label: "open to work", at: { top: "calc(50% + 215px)", left: "calc(50% + 290px)" }, rot: 5, side: "r" },
];

/* Ruler numbers: 0–1400 in steps of 100, tripled for a seamless loop. */
const RULER_NUMS: number[] = Array.from({ length: 15 }, (_, i) => i * 100);

/**
 * THE REEL v5 — clean & personal.
 *
 * Scene 1: faint static grid on paper; "Hai, I'm Juan" mask reveal +
 * a one-time Figma-style selection choreography (cursor sweeps, blue
 * selection box + handles stay as a design element); a 3:4 portrait
 * card DROPPED FROM ABOVE; five Apple-precision vector doodles +
 * one status pill floating around the card at a medium distance.
 * Bottom: a Figma-like ruler that shifts as you scroll.
 * Interaction: magnetic parallax — one rAF loop, quickSetter per
 * element, lerped, writing to inner wrappers. Paused on
 * reduced-motion, mobile, or off-viewport.
 * Scroll: NO PIN — the card JOINS the stickers in the explode
 * (card flies up + shrinks + fades, headline drifts, stickers burst
 * outward + upward), scrubbed, finished at "bottom 70%".
 * Mobile: no parallax, no explode, quiet exit. Reduced motion: one
 * static frame (selection box shown, ruler static).
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
  // viewport. Parallax writes to dedicated wrappers (`.par-hi`,
  // `.par-card`, `.sticker-par`) so it never fights the entrance
  // or the scroll-explode timeline, which own the outer elements.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const desktopMq = window.matchMedia("(min-width: 769px)");
    if (!desktopMq.matches) return;

    const parHi = root.querySelector<HTMLElement>(".par-hi");
    const parCard = root.querySelector<HTMLElement>(".par-card");
    const stickerEls = Array.from(
      root.querySelectorAll<HTMLElement>(".reel-stickers .sticker-par")
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
      baseRot: parseFloat(
        el.closest(".sticker")?.getAttribute("data-rot") || "0"
      ),
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
  // transform/opacity only. After ~1.6s: the Figma-select choreography
  // — a cursor sweeps across the headline, drawing the blue selection
  // box + handles, which stay as a design element.
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

      // FIGMA-SELECT: cursor sweeps left→right across the headline,
      // drawing the blue selection box; handles pop in; cursor leaves.
      // The box + handles stay — a personal designer signature.
      const box = root.querySelector<HTMLElement>(".hi-box");
      const cursor = root.querySelector<HTMLElement>(".hi-cursor");
      const handles = gsap.utils.toArray<HTMLElement>(".hi-handle");
      if (box && cursor && handles.length > 0) {
        gsap.set(box, { scaleX: 0, opacity: 0, transformOrigin: "left center" });
        gsap.set(cursor, { opacity: 0, x: 0 });
        gsap.set(handles, { scale: 0, transformOrigin: "center" });

        const sel = gsap.timeline({ delay: 1.6 });
        sel
          .to(cursor, { opacity: 1, duration: 0.22 }, 0)
          .to(
            cursor,
            {
              x: () => box.offsetWidth + 6,
              duration: 0.9,
              ease: "power2.inOut",
            },
            0.22
          )
          .to(
            box,
            { opacity: 1, scaleX: 1, duration: 0.9, ease: "power2.inOut" },
            0.22
          )
          .to(
            handles,
            { scale: 1, duration: 0.28, ease: "back.out(2.2)", stagger: 0.04 },
            0.95
          )
          .to(cursor, { opacity: 0, duration: 0.3 }, 1.3);
      }

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

  // Scroll explode: NO PIN. The CARD joins the stickers — it flies up,
  // shrinks slightly and fades; the headline (+ its selection box)
  // drifts up; stickers BURST outward + upward and fade. Finished
  // before the statement fully arrives (end "bottom 70%").
  // Deterministic per-index vectors (no random per render).
  // transform/opacity only, ease none, scrubbed. fromTo +
  // immediateRender:false keeps the resting state exact no matter
  // when the entrance finished. Desktop only for the burst;
  // reduced-motion skips everything.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom 70%",
          scrub: true,
        },
      });

      if (isMobile) {
        // Quiet exit on mobile: gentle drift only, no burst.
        tl.to(".reel-card", { y: -40, duration: 1 }, 0).to(
          ".reel-hi-mask",
          { y: -70, duration: 1 },
          0
        );
      } else {
        // Card joins the explosion: up, shrink, tilt, fade.
        tl.fromTo(
          ".reel-card",
          { y: 0, scale: 1, rotation: 0, opacity: 1 },
          {
            y: -130,
            scale: 0.92,
            rotation: -2,
            opacity: 0,
            duration: 1,
            immediateRender: false,
          },
          0
        ).to(".reel-hi-mask", { y: -90, duration: 1 }, 0);

        const stickers = gsap.utils.toArray<HTMLElement>(
          ".reel-stickers .sticker"
        );
        stickers.forEach((el, i) => {
          const dir = el.dataset.side === "l" ? -1 : 1;
          tl.fromTo(
            el,
            { x: 0, y: 0, rotation: 0, opacity: 1 },
            {
              x: dir * (90 + (i % 3) * 30), // ±90..150, outward
              y: -(70 + (i % 4) * 24), // -70..-142, upward
              rotation: dir * (15 + (i % 3) * 10), // ±15..35
              opacity: 0,
              duration: 1,
              immediateRender: false,
            },
            0.05 + i * 0.03
          );
        });
      }

      // The ruler fades out with the hero exit.
      tl.to(".reel-ruler", { opacity: 0, duration: 0.4 }, 0.6);
    }, root);

    // Ruler shift: the canvas slides under the ruler as you scroll.
    // Transform-only scrub; static under reduced motion.
    const rulerCtx = gsap.context(() => {
      gsap.to(".ruler-track", {
        x: -160,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, root);

    return () => {
      ctx.revert();
      rulerCtx.revert();
    };
  }, []);

  return (
    <header className="hero-reel" id="top" ref={rootRef}>
      <DoodleDefs />
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
            {/* Figma-select: the headline lives inside a selection
                wrapper — the blue box + handles stay as a designer
                signature after the one-time cursor sweep. */}
            <span className="hi-select">
              <h1 className="reel-hi">Hai, I&rsquo;m Juan</h1>
              <span className="hi-box" aria-hidden="true">
                <span className="hi-handle h-nw" />
                <span className="hi-handle h-n" />
                <span className="hi-handle h-ne" />
                <span className="hi-handle h-w" />
                <span className="hi-handle h-e" />
                <span className="hi-handle h-sw" />
                <span className="hi-handle h-s" />
                <span className="hi-handle h-se" />
              </span>
              <svg
                className="hi-cursor"
                viewBox="0 0 24 24"
                width="22"
                height="22"
                aria-hidden="true"
              >
                <path
                  d="M6.5 3.5 L19.5 12.5 L12.3 13.8 L9.2 21.5 Z"
                  fill="var(--ink)"
                  stroke="#ffffff"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
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

        {/* Sticker field: five Apple-precision vector doodles + one
            status pill, floating around the card at a medium distance
            (~80–140px). Anchored to .reel-center so the gap holds at
            any viewport height. Outer .sticker = entrance pop + scroll
            explode; inner .sticker-par = magnetic parallax. Desktop
            absolute, mobile wrapped row. */}
        <div className="reel-stickers" aria-hidden="true">
          {STICKERS.map((s) => (
            <span
              key={s.label}
              className="sticker"
              style={s.at}
              data-rot={s.rot}
              data-side={s.side}
            >
              <span className="sticker-par">
                {s.kind === "pill" ? (
                  <span className="doodle-pill">
                    <span className="sdot" />
                    {s.label}
                  </span>
                ) : (
                  <span className="doodle">
                    <DoodleIcon kind={s.kind} />
                    <span className="doodle-label">{s.label}</span>
                  </span>
                )}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Figma-like ruler pinned to the hero bottom: the canvas slides
          under it as you scroll. Fades out with the hero exit. */}
      <div className="reel-ruler" aria-hidden="true">
        <div className="ruler-track">
          {[0, 1, 2].map((copy) => (
            <span className="ruler-copy" key={copy}>
              {RULER_NUMS.map((n) => (
                <span className="rnum" key={`${copy}-${n}`}>
                  {n}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
