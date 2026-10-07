import { useClock } from "../hooks/useClock";

export default function Footer() {
  const time = useClock();

  return (
    <footer className="site" aria-label="Footer">
      <div className="foot-else">
        <span className="mono">[ Elsewhere ]</span>
      </div>
      <div className="foot-mono">
        <a className="rv" href="mailto:jp1jn04@gmail.com">
          <span className="fm-letter">E</span>
          <span className="fm-label">Email</span>
        </a>
        <a
          className="rv"
          href="https://github.com/juanKuganda"
          target="_blank"
          rel="noopener"
        >
          <span className="fm-letter">G</span>
          <span className="fm-label">GitHub</span>
        </a>
        <a
          className="rv"
          href="https://www.linkedin.com/in/juann04"
          target="_blank"
          rel="noopener"
        >
          <span className="fm-letter">L</span>
          <span className="fm-label">LinkedIn</span>
        </a>
        <a
          className="rv"
          href="https://www.instagram.com/juann04"
          target="_blank"
          rel="noopener"
        >
          <span className="fm-letter">I</span>
          <span className="fm-label">Instagram</span>
        </a>
      </div>
      <div className="colophon">
        <span>&copy; 2026 Juan Kuganda &middot; Palu, ID</span>
        <span>{time ? `${time} WITA - Palu` : "--:-- WITA"}</span>
        <span>v6.3 &middot; built with intent</span>
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Back to top &uarr;
        </a>
      </div>
    </footer>
  );
}
