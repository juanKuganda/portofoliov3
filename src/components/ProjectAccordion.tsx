import { useRef } from "react";
import type { Project } from "../data/projects";
import GalleryDensity from "./GalleryDensity";

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
          </div>
          <GalleryDensity tiles={project.tiles} />
        </div>
      </div>
    </article>
  );
}
