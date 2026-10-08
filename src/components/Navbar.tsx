import { useEffect, useRef, useState } from "react";
import { useClock } from "../hooks/useClock";

const NAV_ITEMS = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
];

/**
 * NAV — flat & transparent, LIGHT MODE.
 * Ink text, no background fill, no blur — always legible over the
 * paper sections. A 1px hairline fades in past 40px of scroll.
 * Mobile gets a full-screen paper overlay menu.
 */
export default function Navbar() {
  const time = useClock();
  const [active, setActive] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

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

  // Hairline past 40px of scroll + adaptive theme: when the section
  // directly under the nav is dark (.theme-dark / .contact), flip the
  // nav to paper text so it stays legible. rAF-throttled, passive.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        const navEl = navRef.current;
        if (navEl) {
          const h = navEl.getBoundingClientRect().height;
          // elementsFromPoint: skip fixed/sticky floaters (e.g. the
          // services demo CTA) so we read the section actually behind.
          const els = document.elementsFromPoint(
            window.innerWidth / 2,
            h + 2
          );
          let dark = false;
          for (const cand of els) {
            const pos = getComputedStyle(cand).position;
            if (pos === "fixed" || pos === "sticky") continue;
            dark = !!cand.closest(".theme-dark, .contact");
            break;
          }
          navEl.classList.toggle("on-dark", dark);
        }
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      <nav
        ref={navRef}
        className={`nav${scrolled ? " is-scrolled" : ""}`}
        aria-label="Primary"
      >
        <a
          className="nav-name"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            goTop();
          }}
        >
          JUAN KUGANDA<sup>©</sup>
        </a>
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
