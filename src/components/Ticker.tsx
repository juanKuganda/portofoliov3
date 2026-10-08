import "./Ticker.css";

const ITEMS = [
  "Developer",
  "Designer",
  "Mentor",
  "Open to work",
  "Palu, ID",
] as const;

/**
 * Ticker — editorial bridge band between the hero and the statement.
 * A slow infinite marquee of who Juan is, in the site's mono voice.
 * Pure CSS (transform-only); the duplicate sequence is aria-hidden;
 * static under prefers-reduced-motion. No JS animation.
 */
export default function Ticker() {
  return (
    <div className="ticker" aria-label="Roles ticker">
      <div className="ticker-viewport">
        <div className="ticker-track">
          {[false, true].map((hidden) => (
            <div
              key={hidden ? "dup" : "main"}
              className="ticker-seq"
              aria-hidden={hidden || undefined}
            >
              {ITEMS.map((label) => (
                <span className="ticker-seq-item" key={label}>
                  <span className="ticker-item">{label}</span>
                  <span className="ticker-star" aria-hidden="true">
                    ✦
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
