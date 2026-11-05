import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { useFitText } from "../hooks/useFitText";
import { projects } from "../data/projects";
import type { Audience } from "../data/projects";
import ProjectAccordion from "./ProjectAccordion";

gsap.registerPlugin(ScrollTrigger, CustomEase);
try {
  CustomEase.create("punch", "0.16, 1, 0.3, 1");
} catch {
  // already created by useScrollReveal
}

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
  const firstFilterRun = useRef(true);
  const outTweenRef = useRef<gsap.core.Tween | null>(null);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  // Two-phase filter transition: the current cards cascade OUT
  // (0.22s, stagger 0.03) and only then does the list swap — the
  // new cards cascade IN via the effect below. Without the out-phase
  // the swap reads as an instant cut; without the in-effect the
  // fresh mounts stay invisible (see below).
  const handleFilter = (f: Filter) => {
    if (f === filter) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      setFilter(f);
      setOpenId(null);
      return;
    }
    outTweenRef.current?.kill();
    const cards = gsap.utils.toArray<HTMLElement>(".proj");
    if (!cards.length) {
      setFilter(f);
      setOpenId(null);
      return;
    }
    outTweenRef.current = gsap.to(cards, {
      opacity: 0,
      y: -12,
      duration: 0.22,
      stagger: 0.03,
      ease: "power2.in",
      overwrite: "auto",
      onComplete: () => {
        setFilter(f);
        setOpenId(null);
      },
    });
  };

  // Stagger-in on every filter change (skipped on first mount, where
  // the global .rv scroll reveal owns the entrance).
  //
  // BUG IT FIXES: each accordion carries class .rv, whose CSS initial
  // state is opacity 0 — and useScrollReveal only builds ScrollTriggers
  // for the .rv nodes that exist at mount. A filtered-out card that
  // re-mounts is a FRESH node with no trigger, so after dev → design →
  // all every card sat at opacity 0 forever ("hilang semuanya"). This
  // effect re-reveals whatever is mounted, with a stagger.
  useEffect(() => {
    if (firstFilterRun.current) {
      firstFilterRun.current = false;
      return;
    }
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;
    // The list just swapped, so the page height changed — recalculate
    // every ScrollTrigger below (Services, Statement, ...) first.
    ScrollTrigger.refresh();
    const cards = gsap.utils.toArray<HTMLElement>(".proj");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.07,
        ease: "punch",
        overwrite: "auto",
      }
    );
  }, [filter]);

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
