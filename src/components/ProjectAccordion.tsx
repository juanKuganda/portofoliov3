import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "../data/projects";
import GalleryDensity from "./GalleryDensity";

gsap.registerPlugin(ScrollTrigger);

/**
 * Minimal allowlist sanitizer for project descriptions.
 * The data is static and authored locally, but the pattern stays safe
 * even if descriptions ever come from elsewhere: only <strong>/<em>
 * survive, everything else (including attributes) is stripped.
 */
function sanitizeDescription(html: string): string {
  return html.replace(
    /<(\/?)([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g,
    (_m, close: string, tag: string) => {
      const t = tag.toLowerCase();
      return t === "strong" || t === "em" ? `<${close}${t}>` : "";
    }
  );
}

interface Props {
  project: Project;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ProjectAccordion({ project, isOpen, onToggle }: Props) {
  const headRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // The accordion changes the page height when it opens/closes — and
  // again when its lazy images arrive or the gallery density changes.
  // ScrollTrigger positions (the pixel scrub below Work, the .rv
  // reveals in About/Bento/...) are measured once at load, so without
  // a re-measure they go stale: the pixel dissolve runs ahead of its
  // container and freezes at the end state, and reveals below fire
  // while still off-screen. A ResizeObserver on the body re-measures
  // once the height settles (debounced) so every trigger lines up
  // with the layout again. (Lenis needs no help here — v1.3 watches
  // content size itself and updates its own scroll limit.)
  useEffect(() => {
    const body = bodyRef.current;
    if (!body || typeof ResizeObserver === "undefined") return;
    let timer: number | undefined;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 120);
    });
    ro.observe(body);
    return () => {
      window.clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  return (
    <article className="proj rv">
      <button
        ref={headRef}
        className="proj-head"
        aria-expanded={isOpen}
        aria-controls={project.id}
        onClick={onToggle}
      >
        <span className="proj-idx">{project.idx}</span>
        <span className="proj-title">{project.title}</span>
        <span className="proj-year">{project.year}</span>
        <span className="proj-plus" aria-hidden="true"></span>
      </button>
      <div
        ref={bodyRef}
        className="proj-body"
        id={project.id}
        role="region"
        aria-label={project.ariaLabel}
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
        }}
      >
        <div className="proj-inner">
          <p
            className="proj-desc"
            dangerouslySetInnerHTML={{ __html: sanitizeDescription(project.description) }}
          />
          <div className="proj-meta">
            {project.meta.map((m, i) => (
              <span key={m.label} className={`proj-meta-pill mp-${i % 4}`}>
                {m.label} <b>{m.value}</b>
              </span>
            ))}
            {project.links?.map((l) => (
              <a
                key={l.href}
                className="proj-meta-pill proj-meta-link"
                href={l.href}
                target="_blank"
                rel="noopener"
              >
                {l.label} <b aria-hidden="true">↗</b>
              </a>
            ))}
          </div>
          <GalleryDensity tiles={project.tiles} />
        </div>
      </div>
    </article>
  );
}
