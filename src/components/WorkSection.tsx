import { useRef, useState } from "react";
import { useFitText } from "../hooks/useFitText";
import { projects } from "../data/projects";
import type { Audience } from "../data/projects";
import ProjectAccordion from "./ProjectAccordion";

type Filter = "all" | Audience;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "dev", label: "For Developers" },
  { key: "design", label: "For Designers" },
];

/**
 * WORK — index of projects with an audience filter. Two lanes:
 * engineering work (SIJAGA → CSIRT) and design work (Tadulako Admin,
 * HMTI). A GitHub button sits in the toolbar — that's where the code
 * lives. Filter is id-safe: accordions track open state by project id,
 * and switching lanes closes any open row.
 */
export default function WorkSection() {
  const fitRef = useRef<HTMLHeadingElement>(null);
  useFitText(fitRef);

  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleFilter = (f: Filter) => {
    setFilter(f);
    setOpenId(null);
  };

  const visible = projects.filter(
    (p) => filter === "all" || p.audience === filter
  );
  const countFor = (f: Filter) =>
    f === "all"
      ? projects.length
      : projects.filter((p) => p.audience === f).length;

  return (
    <section className="block" id="work" aria-label="Selected work">
      <h2 className="fit sec-fit" ref={fitRef}>
        SELECTED WORK
      </h2>
      <div className="sec-sub rv">
        <span>Index of projects</span>
        <span>
          2024 – 2026 · {String(projects.length).padStart(2, "0")}
        </span>
      </div>

      <div className="work-tools rv">
        <div
          className="work-filter"
          role="group"
          aria-label="Filter projects by audience"
        >
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`wf-btn${filter === f.key ? " active" : ""}`}
              aria-pressed={filter === f.key}
              onClick={() => handleFilter(f.key)}
            >
              {f.label}
              <span className="wf-count" aria-hidden="true">
                {String(countFor(f.key)).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
        <a
          className="work-gh"
          href="https://github.com/juanKuganda"
          target="_blank"
          rel="noopener"
        >
          <span>github.com/juanKuganda</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      {visible.map((proj) => (
        <ProjectAccordion
          key={proj.id}
          project={proj}
          isOpen={openId === proj.id}
          onToggle={() => handleToggle(proj.id)}
        />
      ))}
    </section>
  );
}
