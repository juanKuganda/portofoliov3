import { useEffect, useRef, useState } from "react";
import { useClock } from "../hooks/useClock";
import MagneticText from "./MagneticText";

export default function Navbar() {
  const time = useClock();
  const [active, setActive] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const linksRef = useRef<Record<string, HTMLAnchorElement | null>>({});

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    const sectionIds = ["work", "about", "services", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            setActive(en.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navItems = [
    { id: "work", label: "Work" },
    { id: "about", label: "About" },
    { id: "services", label: "Services" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <>
      <nav className="nav" aria-label="Primary">
        <MagneticText intensity={0.4}>
          <a
            className="nav-name"
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            JUAN KUGANDA<sup>©</sup>
          </a>
        </MagneticText>
        <span className="nav-clock desktop-only">
          {time ? `Palu — ${time} WITA` : "Palu — WITA"}
        </span>
        <div className="nav-links desktop-only">
          {navItems.map(({ id, label }) => (
            <MagneticText key={id} intensity={0.4}>
              <a
                href={`#${id}`}
                data-nav={id}
                className={active === id ? "active" : ""}
                ref={(el) => {
                  linksRef.current[id] = el;
                }}
                onClick={(e) => handleClick(e, id)}
              >
                {label}
              </a>
            </MagneticText>
          ))}
        </div>
        <button
          type="button"
          className="mobile-nav-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? "✕" : "MENU"}
        </button>
      </nav>

      {/* Mobile Drawer Menu Overlay */}
      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="nav-clock">
                {time ? `Palu — ${time} WITA` : "Palu — WITA"}
              </span>
              <button
                type="button"
                className="mobile-close-btn"
                onClick={() => setMenuOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="mobile-menu-links">
              {navItems.map(({ id, label }, i) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`mobile-menu-link ${active === id ? "active" : ""}`}
                  onClick={(e) => handleClick(e, id)}
                >
                  <span className="link-num">0{i + 1}</span>
                  <span className="link-label">{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
