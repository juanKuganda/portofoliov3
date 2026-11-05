import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useClock } from "../hooks/useClock";

const NAV_ITEMS = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
];

interface NavbarProps {
  isReady?: boolean;
  /** True when the loader logo has landed on the brand — the brand
      then fades in under it (the handoff). */
  isBrandReady?: boolean;
}

/**
 * NAV — flat & transparent, difference-blend.
 * White text + mix-blend-mode: difference = automatic contrast over
 * light AND dark sections, no background fill, no blur, no border.
 * Mobile gets a full-screen paper overlay menu (not blended).
 */
export default function Navbar({
  isReady = true,
  isBrandReady = false,
}: NavbarProps) {
  const time = useClock();
  const [active, setActive] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const hasAnimatedRef = useRef(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Nav bar (clock/links/menu): slides in at isHeroReady (dissolve).
  const brandAnimatedRef = useRef(false);
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    if (!isReady && !hasAnimatedRef.current) {
      gsap.set(el, { y: -24, opacity: 0 });
      return;
    }

    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    gsap.to(el, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.12,
    });
  }, [isReady]);

  // Brand mark: fades in ONLY when the loader logo lands on it.
  // Opacity-only park (no y shift) — the loader's flight measures
  // this element's rect, so the rect must be its final rect.
  useEffect(() => {
    const brand = brandRef.current;
    if (!brand) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    if (!isBrandReady && !brandAnimatedRef.current) {
      gsap.set(brand, { opacity: 0 });
      return;
    }

    if (brandAnimatedRef.current) return;
    brandAnimatedRef.current = true;

    gsap.to(brand, {
      opacity: 1,
      duration: 0.2,
      ease: "power2.out",
    });
  }, [isBrandReady]);

  const clockLabel = time ? `Palu · ${time} WITA` : "Palu · WITA";

  // Active section tracking via IntersectionObserver.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) setActive(en.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    for (const { id } of NAV_ITEMS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  // Mobile menu: Escape closes, body scroll locks, focus moves sanely.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
      menuBtnRef.current?.focus();
    };
  }, [menuOpen]);

  const goTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const goTop = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Brand mark: a separate FIXED sibling of <nav>, NOT a child.
          The nav blends with the page via mix-blend-mode: difference,
          and difference applies to the whole nav subtree — a logo
          inside it would have its colors inverted per backdrop.
          Fixed at the same top/left as the nav's padding so the two
          read as one bar. */}
      <a
        ref={brandRef}
        className="nav-brand"
        href="#top"
        aria-label="Juan Kuganda — back to top"
        onClick={(e) => {
          e.preventDefault();
          goTop();
        }}
      >
        <img src="/favicon.svg" alt="" width="31" height="30" />
      </a>
      <nav ref={navRef} className="nav" aria-label="Primary">
        <span className="nav-clock desktop-only" aria-hidden="true">
          {clockLabel}
        </span>
        <div className="nav-links desktop-only">
          {NAV_ITEMS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              data-nav={id}
              className={active === id ? "active" : ""}
              aria-current={active === id ? "true" : undefined}
              onClick={(e) => {
                e.preventDefault();
                goTo(id);
              }}
            >
              {label}
            </a>
          ))}
        </div>
        <button
          ref={menuBtnRef}
          type="button"
          className="nav-menu-btn mobile-only"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          Menu
        </button>
      </nav>

      {/* Mobile full-screen menu */}
      <div
        className={`mnav${menuOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className="mnav-top">
          <img
            className="mnav-logo"
            src="/favicon.svg"
            alt=""
            width="27"
            height="26"
          />
          <span className="mnav-clock">{clockLabel}</span>
          <button
            ref={closeBtnRef}
            type="button"
            className="mnav-close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <nav className="mnav-links" aria-label="Mobile">
          {NAV_ITEMS.map(({ id, label }, i) => (
            <a
              key={id}
              href={`#${id}`}
              className={`mnav-link${active === id ? " active" : ""}`}
              style={{ "--i": i } as React.CSSProperties}
              tabIndex={menuOpen ? 0 : -1}
              onClick={(e) => {
                e.preventDefault();
                goTo(id);
              }}
            >
              <span className="mnav-num" aria-hidden="true">
                0{i + 1}
              </span>
              <span className="mnav-label">{label}</span>
            </a>
          ))}
        </nav>
        <div className="mnav-foot" aria-hidden="true">
          <span className="mnav-status">
            <span className="dot" />
            Open to work
          </span>
          <span className="mnav-clock">{clockLabel}</span>
        </div>
      </div>
    </>
  );
}
