import { useRef, useState, useCallback } from "react";
import type { ProjectTile } from "../data/projects";

type Density = "featured" | "uniform" | "dense";

interface Props {
  tiles: ProjectTile[];
}

export default function GalleryDensity({ tiles }: Props) {
  const [density, setDensity] = useState<Density>("featured");
  const galleryRef = useRef<HTMLDivElement>(null);

  const handleDensityChange = useCallback(
    (newDensity: Density) => {
      if (newDensity === density) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const gallery = galleryRef.current;
      if (!gallery) {
        setDensity(newDensity);
        return;
      }

      const tileEls = Array.from(
        gallery.querySelectorAll<HTMLElement>(".tile"),
      );

      // Capture "first" positions for FLIP
      const firstRects = new Map<HTMLElement, DOMRect>();
      if (!reduced) {
        tileEls.forEach((t) => firstRects.set(t, t.getBoundingClientRect()));
      }

      // Apply new density
      setDensity(newDensity);

      if (reduced) return;

      // After React re-render, animate FLIP
      requestAnimationFrame(() => {
        tileEls.forEach((t) => {
          const a = firstRects.get(t);
          const b = t.getBoundingClientRect();
          if (!a) return;

          const dx = a.left - b.left;
          const dy = a.top - b.top;
          const sx = a.width / b.width;
          const sy = a.height / b.height;
          if (!dx && !dy && sx === 1 && sy === 1) return;

          t.animate(
            [
              {
                transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})`,
              },
              { transform: "translate(0,0) scale(1,1)" },
            ],
            { duration: 650, easing: "cubic-bezier(.22,1,.36,1)" },
          );
        });
      });
    },
    [density],
  );

  const densities: Density[] = ["featured", "uniform", "dense"];

  return (
    <>
      <div className="density" role="group" aria-label="Gallery density">
        <span className="mono">View</span>
        {densities.map((d) => (
          <button
            key={d}
            aria-pressed={density === d}
            data-density={d}
            onClick={() => handleDensityChange(d)}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>
      <div className="gallery" data-density={density} ref={galleryRef}>
        {tiles.map((tile) => (
          <figure className="tile" key={tile.seed}>
            <img
              src={`https://picsum.photos/seed/${tile.seed}/800/600?grayscale`}
              alt={`Placeholder image - ${tile.cap}`}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="tile-overlay">
              <span className="tile-big">{tile.big}</span>
              <figcaption className="tile-cap">{tile.cap}</figcaption>
            </div>
          </figure>
        ))}
      </div>
    </>
  );
}
