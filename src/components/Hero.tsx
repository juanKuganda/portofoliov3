import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ROLES = ["Engineer", "Design", "People"];
const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#";

/** Kicker role ticker: [ Engineer ] → [ Design ] → [ People ], with a
    text-scramble transition on every change. */
function RoleTicker() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState(ROLES[0]);
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    const id = window.setInterval(
      () => setIdx((i) => (i + 1) % ROLES.length),
      2800
    );
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const target = ROLES[idx];
    if (reduced) {
      setText(target);
      return;
    }
    let frame = 0;
    const total = 16;
    const id = window.setInterval(() => {
      frame += 1;
      const reveal = Math.floor((frame / total) * target.length);
      let out = target.slice(0, reveal);
      for (let i = reveal; i < target.length; i++)
        out += SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
      setText(out);
      if (frame >= total) {
        window.clearInterval(id);
        setText(target);
      }
    }, 28);
    return () => window.clearInterval(id);
  }, [idx, reduced]);

  return (
    <p className="role-ticker" aria-hidden="true">
      <span className="tick-bracket" aria-hidden="true">[</span>
      <span className="tick-word" key={idx}>
        {text}
      </span>
      <span className="tick-bracket" aria-hidden="true">]</span>
    </p>
  );
}

/* Shared gradient defs for the precision doodles — one block, unique
   ids, referenced by every icon. Full playful color; ink stays neutral. */
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
        <linearGradient id="dz-pink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff7a93" />
          <stop offset="1" stopColor="#f43f5e" />
        </linearGradient>
        <linearGradient id="dz-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7cc4f8" />
          <stop offset="1" stopColor="#2f9df0" />
        </linearGradient>
        <linearGradient id="dz-blue-h" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7cc4f8" />
          <stop offset="1" stopColor="#2f9df0" />
        </linearGradient>
        <linearGradient id="dz-green" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fe08f" />
          <stop offset="1" stopColor="#37b24d" />
        </linearGradient>
        <linearGradient id="dz-purple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b197fc" />
          <stop offset="1" stopColor="#845ef7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Apple-precision vector doodles: geometric, crisp, subtle depth via
   gradients + one soft highlight each. Ink + amber only. */
function DoodleIcon({ kind }: { kind: "folder" | "pencil" | "code" | "pin" | "cap" | "spark" | "squiggle" }) {
  if (kind === "spark")
    return (
      <svg viewBox="0 0 64 64" className="doodle-svg" aria-hidden="true">
        <path
          d="M32 4 C34.5 22 38 28 60 32 C38 36 34.5 42 32 60 C29.5 42 26 36 4 32 C26 28 29.5 22 32 4 Z"
          fill="url(#dz-amber)"
        />
        <path
          d="M32 13 C33.4 24 35.5 28.5 47 32 C35.5 35.5 33.4 40 32 51 C30.6 40 28.5 35.5 17 32 C28.5 28.5 30.6 24 32 13 Z"
          fill="#ffffff"
          opacity="0.35"
        />
      </svg>
    );
  if (kind === "squiggle")
    return (
      <svg viewBox="0 0 64 64" className="doodle-svg" aria-hidden="true">
        <path
          d="M10 52 C22 50 30 42 34 30 C37 20 44 13 55 13"
          stroke="url(#dz-pink)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M45 8 L57 13 L49 23"
          stroke="url(#dz-pink)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (kind === "folder")
    return (
      <svg viewBox="0 0 64 64" className="doodle-svg" aria-hidden="true">
        <rect x="13" y="9" width="17" height="13" rx="3.5" fill="url(#dz-pink)" />
        <rect x="9" y="13" width="46" height="33" rx="5" fill="url(#dz-ink-soft)" />
        <rect x="6" y="21" width="52" height="33" rx="6.5" fill="url(#dz-ink)" />
        <rect x="11" y="25.5" width="42" height="3.4" rx="1.7" fill="#ffffff" opacity="0.16" />
      </svg>
    );
  if (kind === "pencil")
    return (
      <svg viewBox="0 0 64 64" className="doodle-svg" aria-hidden="true">
        <g transform="rotate(45 32 32)">
          <rect x="26" y="5" width="12" height="37" rx="3.5" fill="url(#dz-blue-h)" />
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
        <path d="M27 24 L18.5 32 L27 40" stroke="url(#dz-green)" strokeWidth="4.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M37 24 L45.5 32 L37 40" stroke="url(#dz-green)" strokeWidth="4.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M35.5 22.5 L28.5 41.5" stroke="url(#dz-green)" strokeWidth="4" fill="none" strokeLinecap="round" />
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
        <circle cx="32" cy="26" r="8.5" fill="url(#dz-pink)" />
        <circle cx="29.5" cy="23.5" r="2.4" fill="#ffffff" opacity="0.35" />
      </svg>
    );
  return (
    <svg viewBox="0 0 64 64" className="doodle-svg" aria-hidden="true">
      <rect x="22" y="27" width="20" height="13" rx="3.5" fill="url(#dz-ink-soft)" />
      <line x1="53" y1="21" x2="53" y2="37" stroke="url(#dz-pink)" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 6 L59 19 L32 32 L5 19 Z" fill="url(#dz-ink)" />
      <path d="M32 6 L59 19 L46 24.5 L32 17 Z" fill="#ffffff" opacity="0.07" />
      <circle cx="53" cy="40.5" r="4.2" fill="url(#dz-purple)" />
    </svg>
  );
}

/**
 * Doodle stickers: art-directed into the left/right mid columns and
 * the top/bottom center gutters — the four corners belong to the
 * text blocks. `at` — desktop absolute position, percent of the full
 * hero canvas; `rot` — resting tilt in degrees; `side` — scroll-explode
 * direction. Transform layers: outer `.sticker` = entrance pop +
 * scroll explode; inner `.sticker-par` = magnetic parallax.
 */
type StickerSpec = {
  kind: "folder" | "pencil" | "code" | "pin" | "cap" | "spark" | "squiggle" | "pill";
  label: string;
  at: React.CSSProperties;
  rot: number;
  side: "l" | "r";
  /** When set, the sticker is a real navigation link — stickers are
      meaningful shortcuts, not just decoration. */
  href?: string;
  aria?: string;
};

/* Tidy columns: left stickers share one x, right stickers share one x,
   even vertical rhythm, clear of the corner text blocks and the card. */
const STICKERS: StickerSpec[] = [
  { kind: "folder", label: "projects", at: { top: "36%", left: "9%" }, rot: -8, side: "l", href: "#work", aria: "Go to selected work" },
  { kind: "pencil", label: "design", at: { top: "52%", left: "9%" }, rot: 7, side: "l", href: "#services", aria: "Go to services" },
  { kind: "cap", label: "untad ’27", at: { top: "68%", left: "9%" }, rot: -5, side: "l", href: "#about", aria: "Go to about" },
  { kind: "pin", label: "palu, id", at: { top: "32%", left: "91%" }, rot: 8, side: "r", href: "#contact", aria: "Go to contact" },
  { kind: "code", label: "code", at: { top: "50%", left: "91%" }, rot: -7, side: "r", href: "https://github.com/juanKuganda", aria: "Open GitHub profile" },
  { kind: "pill", label: "open to work", at: { top: "68%", left: "91%" }, rot: 5, side: "r", href: "#contact", aria: "Go to contact" },
  { kind: "spark", label: "ship it", at: { top: "10%", left: "50%" }, rot: 10, side: "r" },
  { kind: "squiggle", label: "this way", at: { top: "87%", left: "50%" }, rot: -10, side: "l" },
];

/* Floating cursors, reference-style: a colored arrow cursor + a
   rotated sticker pill (black outline, like the reference) + an
   optional mini "YOU" bubble. Decorative (aria-hidden).
   Outer .cursor-float = entrance + explode; .cursor-par =
   magnetic parallax; .cursor-inner = idle bob. */
const CURSORS = [
  {
    at: { top: "40%", left: "20%" }, rot: -6, side: "l",
    color: "var(--pop-pink)", pill: "PALU, ID", pillRot: -8, mini: "YOU",
  },
  {
    at: { top: "13%", left: "58%" }, rot: 8, side: "r",
    color: "var(--pop-blue)", pill: "OPEN TO WORK", pillRot: 7, mini: null,
  },
];

/* Ruler numbers: 0–1400 in steps of 100, tripled for a seamless loop. */
const RULER_NUMS: number[] = Array.from({ length: 15 }, (_, i) => i * 100);

/**
 * THE REEL v9 — the centered portrait.
 *
 * Concept: the portrait is the star, centered on the canvas; the four
 * corners hold the text like fixed UI chrome — top-left: greeting +
 * name (Figma-selected, kinetic letters, cursor sweep); top-right:
 * role ticker + availability; bottom-left: description + FIG.01
 * caption; bottom-right: scroll cue. Stickers orbit the mid columns
 * and gutters. Everything playful survives: magnetic parallax,
 * kinetic headline, scramble ticker, sticker hover, scroll explode,
 * THE BLOOM, ruler.
 * Interaction: magnetic parallax — one rAF loop, quickSetter per
 * element, lerped, writing to inner wrappers. Paused on
 * reduced-motion, mobile, or off-viewport.
 * Scroll: NO PIN — the card joins the stickers in the explode
 * (card flies up + shrinks + fades, corners burst outward + upward),
 * scrubbed, finished at "bottom 70%".
 * Mobile: corners stack in flow around the card; stickers sit on the
 * photo. Reduced motion: one static frame.
 */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  // The scroll-scrub timeline stays disabled until the entrance completes,
  // so the two never fight over the stickers/card (which left elements
  // stuck invisible when users scrolled mid-entrance).
  const scrollSTRef = useRef<{ enable(): void } | null>(null);

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
      root.querySelectorAll<HTMLElement>(
        ".reel-stickers .sticker-par, .reel-floaters .cursor-par"
      )
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
        el.closest(".sticker, .cursor-float")?.getAttribute("data-rot") || "0"
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

  // Kinetic headline: every letter of the name is gently repelled by
  // the pointer (magnetic push, lerped back to rest), and the name
  // skews with scroll velocity. One rAF loop, transform-only,
  // quickSetter per letter. Letters live inside .reel-hi — untouched
  // by the entrance (owns .reel-hi-line) and explode (owns the
  // corners) timelines, so nothing fights. Desktop + no reduced
  // motion only; sleeps when settled/off-view.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const desktopMq = window.matchMedia("(min-width: 769px)");
    if (!desktopMq.matches) return;

    const letters = Array.from(
      root.querySelectorAll<HTMLElement>(".hi-letter")
    );
    const hi = root.querySelector<HTMLElement>(".reel-hi");
    if (letters.length === 0 || !hi) return;

    const L = letters.map((el) => ({
      box: () => el.getBoundingClientRect(),
      sx: gsap.quickSetter(el, "x", "px"),
      sy: gsap.quickSetter(el, "y", "px"),
      cx: 0,
      cy: 0,
    }));
    const setSkew = gsap.quickSetter(hi, "skewX", "deg");

    const RADIUS = 160;
    const PUSH = 30;
    let px = -9999;
    let py = -9999;
    let skewTarget = 0;
    let skewCur = 0;
    let raf = 0;
    let inView = true;
    let disposed = false;

    const tick = () => {
      raf = 0;
      if (disposed || !inView || !desktopMq.matches) return;
      let active = false;
      for (const s of L) {
        const b = s.box();
        const dx = b.left + b.width / 2 - px;
        const dy = b.top + b.height / 2 - py;
        const d = Math.hypot(dx, dy);
        let tx = 0;
        let ty = 0;
        if (d < RADIUS && d > 1) {
          const f = 1 - d / RADIUS;
          tx = (dx / d) * PUSH * f * f;
          ty = (dy / d) * PUSH * f * f;
        }
        s.cx += (tx - s.cx) * 0.14;
        s.cy += (ty - s.cy) * 0.14;
        if (Math.abs(s.cx) > 0.05 || Math.abs(s.cy) > 0.05) active = true;
        s.sx(s.cx);
        s.sy(s.cy);
      }
      skewCur += (skewTarget - skewCur) * 0.12;
      skewTarget *= 0.92;
      if (Math.abs(skewCur) < 0.03 && Math.abs(skewTarget) < 0.03) {
        skewCur = 0;
        skewTarget = 0;
      } else {
        active = true;
      }
      setSkew(skewCur);
      if (active) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf && !disposed && inView && desktopMq.matches)
        raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      kick();
    };
    const onLeave = () => {
      px = -9999;
      py = -9999;
      kick();
    };
    const velST = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const v = self.getVelocity();
        skewTarget = Math.max(-7, Math.min(7, v / -350));
        kick();
      },
    });
    const io = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        if (!inView && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        } else if (inView) {
          kick();
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
      velST.kill();
      desktopMq.removeEventListener("change", onMq);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      gsap.set([...letters, hi], { clearProps: "transform" });
    };
  }, []);

  // Entrance (<1.2s): card drops from above, name lines reveal, the
  // four corners slide in from their corners, stickers pop in, then
  // THE BLOOM (grayscale → color, once). transform/opacity only.
  // After ~1.6s: the Figma-select choreography — a cursor sweeps
  // across the name, drawing the blue selection box + handles, which
  // stay as a design element.
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
      const floaters = gsap.utils.toArray<HTMLElement>(
        ".reel-floaters .cursor-float"
      );
      // Resting tilt per sticker (data-rot), so scale pops keep it.
      stickers.forEach((el) =>
        gsap.set(el, { rotation: parseFloat(el.dataset.rot || "0") })
      );
      floaters.forEach((el) =>
        gsap.set(el, { rotation: parseFloat(el.dataset.rot || "0") })
      );

      gsap.set(".reel-card", { y: -170, opacity: 0, scale: 0.98 });
      gsap.set(".reel-hi-line", { yPercent: 112 });
      gsap.set(".reel-hello, .reel-sub", { y: 14, opacity: 0 });
      gsap.set(".corner-tl", { x: -26, y: -18, opacity: 0 });
      gsap.set(".corner-tr", { x: 26, y: -18, opacity: 0 });
      gsap.set(".corner-bl", { x: -26, y: 18, opacity: 0 });
      gsap.set(".corner-br", { x: 26, y: 18, opacity: 0 });
      gsap.set(stickers, { scale: 0, opacity: 0 });
      gsap.set(floaters, { scale: 0, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(
        ".reel-card",
        { y: 0, opacity: 1, scale: 1, duration: 1.0, ease: "expo.out" },
        0.05
      )
        .to(
          ".reel-hi-line",
          { yPercent: 0, duration: 0.7, ease: "power4.out", stagger: 0.1 },
          0.35
        )
        .to(
          ".corner-tl, .corner-tr, .corner-bl, .corner-br",
          { x: 0, y: 0, opacity: 1, duration: 0.6, stagger: 0.08 },
          0.5
        )
        .to(
          ".reel-hello, .reel-sub",
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 },
          0.7
        )
        .to(
          stickers,
          { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.8)", stagger: 0.055 },
          0.5
        )
        .to(
          floaters,
          { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.8)", stagger: 0.09 },
          0.85
        )
        // THE BLOOM: the grayscale layer fades once — the blazer turns
        // blue as the single color moment. opacity-only, compositor-cheap.
        .to(
          ".reel-card .photo-gray",
          { opacity: 0, duration: 1.2, ease: "power2.inOut" },
          1.5
        );

      // FIGMA-SELECT: cursor sweeps left→right across the name,
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
        gsap.set(".reel-hello, .reel-sub", { clearProps: "transform,opacity" });
        gsap.set(".reel-hi-line", { clearProps: "transform" });
        // Keep the card's resting tilt: clear opacity only, so the
        // stylesheet rotate(-2deg) survives (GSAP preserved it through
        // the y/scale tween via matrix decomposition).
        gsap.set(".reel-card", { clearProps: "opacity" });
        gsap.set(".corner-tl, .corner-tr, .corner-bl, .corner-br", {
          clearProps: "transform,opacity",
        });
        gsap.set(stickers, { clearProps: "transform,opacity" });
        gsap.set(floaters, { clearProps: "transform,opacity" });
        // Entrance done: hand control to the scroll scrub. It was kept
        // disabled until now so a mid-entrance scroll can't leave the
        // stickers/card stuck invisible.
        scrollSTRef.current?.enable();
      });
    }, root);
    return () => {
      ctx.revert();
    };
  }, []);

  // Scroll explode: NO PIN. The CARD joins the stickers — it flies up,
  // shrinks slightly and fades; the four CORNERS burst outward +
  // upward and fade; stickers burst outward + upward. Finished before
  // the statement fully arrives (end "bottom 70%").
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
        // No overwrite here: the scroll scrub is disabled until this
        // entrance completes (see below), so the two never fight over
        // the stickers/card and nothing gets stuck invisible.
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom 70%",
          scrub: true,
        },
      });

      if (isMobile) {
        // Mini explode on mobile: everything joins the burst, but with
        // smaller vectors than desktop — no pin, no parallax here.
        tl.fromTo(
          ".reel-card",
          { y: 0, scale: 1, autoAlpha: 1 },
          {
            y: -70,
            scale: 0.96,
            autoAlpha: 0,
            duration: 1,
            immediateRender: false,
          },
          0
        ).to(".corner-tl", { y: -60, autoAlpha: 0, duration: 1 }, 0);
        const mCorners = gsap.utils.toArray<HTMLElement>(
          ".corner-tr, .corner-bl, .corner-br"
        );
        mCorners.forEach((el, i) => {
          tl.to(el, { y: -44, autoAlpha: 0, duration: 1 }, 0.05 + i * 0.04);
        });
        const mStickers = gsap.utils.toArray<HTMLElement>(
          ".reel-stickers .sticker"
        );
        mStickers.forEach((el, i) => {
          // Vertical scatter (no horizontal push): the wrapped row is
          // tight, so sideways vectors would collide mid-flight.
          // From-state is complete (scale/rotation) so a mid-entrance
          // scroll normalizes instead of freezing the pop-in mid-way.
          const dir = i % 2 === 0 ? -1 : 1;
          tl.fromTo(
            el,
            {
              x: 0,
              y: 0,
              scale: 1,
              rotation: parseFloat(el.dataset.rot || "0"),
              autoAlpha: 1,
            },
            {
              x: 0,
              y: -(44 + (i % 3) * 22),
              rotation: dir * 8,
              autoAlpha: 0,
              duration: 1,
              immediateRender: false,
            },
            0.05 + i * 0.04
          );
        });
      } else {
        // Card joins the explosion: up, shrink, tilt, fade. Resting
        // tilt is -2deg (stylesheet); the burst adds to it.
        tl.fromTo(
          ".reel-card",
          { y: 0, scale: 1, rotation: -2, autoAlpha: 1 },
          {
            y: -130,
            scale: 0.92,
            rotation: -8,
            autoAlpha: 0,
            duration: 1,
            immediateRender: false,
          },
          0
        );

        // Corners burst outward + upward, fading.
        const cornerBurst: Array<[string, number, number]> = [
          [".corner-tl", -90, -70],
          [".corner-tr", 90, -70],
          [".corner-bl", -90, -30],
          [".corner-br", 90, -30],
        ];
        cornerBurst.forEach(([sel, x, y], i) => {
          tl.fromTo(
            sel,
            { x: 0, y: 0, autoAlpha: 1 },
            {
              x,
              y,
              autoAlpha: 0,
              duration: 1,
              immediateRender: false,
            },
            0.05 + i * 0.05
          );
        });

        const stickers = gsap.utils.toArray<HTMLElement>(
          ".reel-stickers .sticker"
        );
        stickers.forEach((el, i) => {
          const dir = el.dataset.side === "l" ? -1 : 1;
          tl.fromTo(
            el,
            {
              x: 0,
              y: 0,
              scale: 1,
              rotation: parseFloat(el.dataset.rot || "0"),
              autoAlpha: 1,
            },
            {
              x: dir * (90 + (i % 3) * 30), // ±90..150, outward
              y: -(70 + (i % 4) * 24), // -70..-142, upward
              autoAlpha: 0,
              duration: 1,
              immediateRender: false,
            },
            0.05 + i * 0.03
          );
        });

        // Floating cursors burst too — wider vectors, they live at
        // the canvas edges.
        const floaters = gsap.utils.toArray<HTMLElement>(
          ".reel-floaters .cursor-float"
        );
        floaters.forEach((el, i) => {
          const dir = el.dataset.side === "l" ? -1 : 1;
          tl.fromTo(
            el,
            {
              x: 0,
              y: 0,
              scale: 1,
              rotation: parseFloat(el.dataset.rot || "0"),
              autoAlpha: 1,
            },
            {
              x: dir * (110 + i * 24),
              y: -(90 + i * 30),
              rotation: dir * 18,
              autoAlpha: 0,
              duration: 1,
              immediateRender: false,
            },
            0.12 + i * 0.05
          );
        });
      }

      // The ruler stays visible through the explode — it only leaves
      // naturally as the hero scrolls away. (No opacity fade.)

      // Keep the scrub disabled until the entrance completes (the
      // entrance timeline enables it via scrollSTRef). Prevents a
      // mid-entrance scroll from leaving stickers/card stuck invisible.
      if (tl.scrollTrigger) {
        tl.scrollTrigger.disable();
        scrollSTRef.current = tl.scrollTrigger;
      }
    }, root);

    // Ruler shift: the canvas slides under the ruler as you scroll.
    // Transform-only scrub; static under reduced motion.
    const rulerCtx = gsap.context(() => {
      gsap.to(".ruler-track", {
        x: -260,
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

      <div className="reel-center">
        {/* TOP-LEFT: greeting + name, Figma-selected like a designer
            signature. Kinetic letters repel the pointer. */}
        <div className="corner corner-tl">
          <div className="par-hi">
            <p className="reel-hello">Hai, I&rsquo;m —</p>
            <span className="hi-select">
              <h1 className="reel-hi" aria-label="Juan Kuganda">
                {["Juan", "Kuganda"].map((word) => (
                  <span className="reel-hi-line" key={word} aria-hidden="true">
                    {word.split("").map((ch, i) => (
                      <span className="hi-letter" key={i}>
                        {ch}
                      </span>
                    ))}
                  </span>
                ))}
              </h1>
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

        {/* TOP-RIGHT: role ticker + availability. */}
        <div className="corner corner-tr">
          <RoleTicker />
          <p className="corner-line">
            <span className="dot" aria-hidden="true" />
            <span>Open to work</span>
          </p>
          <p className="corner-line dim">Folio ©2026</p>
        </div>

        {/* BOTTOM-LEFT: description + figure caption. */}
        <div className="corner corner-bl">
          <p className="reel-sub">
            Software developer &amp; designer — interfaces people
            understand at a glance.
          </p>
          <p className="reel-cap">FIG.01 — JUAN, PALU · 2026</p>
        </div>

        {/* BOTTOM-RIGHT: scroll cue + coordinates. */}
        <div className="corner corner-br">
          <a className="reel-scroll" href="#work">
            <span>Scroll</span>
            <span className="arrow" aria-hidden="true">↓</span>
          </a>
          <p className="corner-line dim">0.90°S — 119.86°E</p>
        </div>

        {/* CENTER: the portrait star, washi-taped like a pinned photo. */}
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
      </div>

      {/* Sticker field: the six main stickers are real navigation
          links (meaningful shortcuts, not just decoration); spark +
          squiggle stay pure decoration. Art-directed into tidy mid
          columns and gutters — the corners belong to the text, nothing
          overlaps the card.
          Outer .sticker = entrance pop + scroll explode; inner
          .sticker-par = magnetic parallax.
          Desktop absolute, mobile on the photo. */}
      <div className="reel-stickers">
        {STICKERS.map((s) => {
          const inner = (
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
          );
          return s.href ? (
            <a
              key={s.label}
              className="sticker sticker-link"
              style={s.at}
              data-rot={s.rot}
              data-side={s.side}
              href={s.href}
              aria-label={s.aria || s.label}
            >
              {inner}
            </a>
          ) : (
            <span
              key={s.label}
              className="sticker"
              style={s.at}
              data-rot={s.rot}
              data-side={s.side}
              aria-hidden="true"
            >
              {inner}
            </span>
          );
        })}
      </div>

      {/* Floating cursors, reference-style: colored arrow + rotated
          sticker pill + mini bubble. Layers: outer .cursor-float =
          entrance pop + scroll explode; .cursor-par = magnetic
          parallax; .cursor-inner = idle bob. Decorative. */}
      <div className="reel-floaters" aria-hidden="true">
        {CURSORS.map((c) => (
          <span
            key={c.pill}
            className="cursor-float"
            style={c.at}
            data-rot={c.rot}
            data-side={c.side}
          >
            <span className="cursor-par">
              <span className="cursor-inner">
                {c.mini && <span className="cursor-mini">{c.mini}</span>}
                <svg
                  className="cursor-arrow"
                  viewBox="0 0 24 24"
                  width="30"
                  height="30"
                  aria-hidden="true"
                >
                  <path
                    d="M17.5 3.5 L4.5 12.5 L11.7 13.8 L14.8 21.5 Z"
                    fill={c.color}
                    stroke="var(--ink)"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className="cursor-pill-tag"
                  style={
                    {
                      background: c.color,
                      "--pill-rot": `${c.pillRot}deg`,
                    } as React.CSSProperties
                  }
                >
                  {c.pill}
                </span>
              </span>
            </span>
          </span>
        ))}
      </div>

      {/* Figma-like ruler pinned to the hero bottom: the canvas slides
          under it as the hero scrolls away. Stays visible through the explode. */}
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
