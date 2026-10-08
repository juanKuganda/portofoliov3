import { useEffect, useRef, useState } from "react";
import { useFitText } from "../hooks/useFitText";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WebDevVisual from "./WebDevVisual";
import DesignVisual from "./DesignVisual";
import BackendVisual from "./BackendVisual";
import CommunityVisual from "./CommunityVisual";

gsap.registerPlugin(ScrollTrigger);

interface ServiceData {
  num: string;
  name: string;
  description: string;
  tags: string;
}

const services: ServiceData[] = [
  {
    num: "01",
    name: "Web Development",
    description:
      "Interfaces, dashboards, and interactive web apps. Built clean, responsive, and fast.",
    tags: "React · Next.js · TypeScript · Tailwind",
  },
  {
    num: "02",
    name: "UI / UX Design",
    description:
      "Layouts and user flows people understand at a glance. From wireframes to design systems.",
    tags: "Figma · Design Systems · Micro-interactions",
  },
  {
    num: "03",
    name: "Backend Architecture",
    description:
      "RESTful APIs, authentication systems, and database structures built to scale reliably.",
    tags: "Node.js · Laravel · PostgreSQL · REST APIs",
  },
  {
    num: "04",
    name: "Mentorship & Community",
    description:
      "Empowering local developer talent, hosting tech workshops, and leading Palu Dev.",
    tags: "Palu Dev · Code Workshops · Community Leadership",
  },
];

/** Rail progress fill takes the active section's signature color. */
const RAIL_COLORS = [
  "var(--pop-pink)",
  "var(--pop-blue)",
  "var(--pop-green)",
  "var(--pop-purple)",
];

/**
 * SERVICES — "04 disciplines" as a TIMELINE.
 * Left: a vertical rail with node dots; generous spacing between points.
 * Scrolling a point through the viewport center activates it (hover /
 * tap still work as overrides). Right: one sticky stage (frame + caption
 * travel together) whose panels crossfade on `active` — the same state
 * that drives the node highlight, caption, rail color, and which visual
 * plays, so nothing can desync. Figma-Smart-Animate-style zoom-through,
 * transform/opacity only.
 * Mobile: rail kept, stage stacks below (relative). Reduced motion:
 * instant CSS swaps, no morph.
 */
export default function ServicesSection() {
  const fitRef = useRef<HTMLHeadingElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const railProgressRef = useRef<HTMLSpanElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [sectionVisible, setSectionVisible] = useState(true);
  useFitText(fitRef);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The single gate that matters: when the whole section is off-screen,
  // the active visual pauses. Only ONE visual is ever alive.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 95%",
      end: "bottom 5%",
      onToggle: (self) => setSectionVisible(self.isActive),
    });
    return () => {
      st.kill();
    };
  }, []);

  // Scroll-driven active: each timeline point takes over the stage as
  // it crosses the viewport center.
  useEffect(() => {
    if (reduced) return;
    const triggers = services.map((_, i) => {
      const row = rowRefs.current[i];
      if (!row) return null;
      return ScrollTrigger.create({
        trigger: row,
        start: "top 58%",
        end: "bottom 42%",
        onToggle: (self) => {
          if (self.isActive) setActive(i);
        },
      });
    });
    return () => {
      triggers.forEach((t) => t?.kill());
    };
  }, [reduced]);

  // Rail progress: section-colored fill grows as you travel the timeline.
  useEffect(() => {
    if (reduced) return;
    const bar = railProgressRef.current;
    const list = listRef.current;
    if (!bar || !list) return;
    const tween = gsap.to(bar, {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: list,
        start: "top 62%",
        end: "bottom 48%",
        scrub: 0.6,
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  // Panel crossfade follows `active` — the single source of truth that
  // also drives the node highlight, caption, rail color, and which
  // visual plays. Firing on the same state makes desync impossible:
  // the panel can never switch before (or after) its row activates.
  // The Figma-style zoom-through choreography is preserved —
  // transform/opacity only.
  const firstPanelRun = useRef(true);
  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;
    const panels = section.querySelectorAll<HTMLElement>(".svc-stage-panel");
    if (!panels.length) return;
    if (firstPanelRun.current) {
      firstPanelRun.current = false;
      gsap.set(panels, { autoAlpha: 0, scale: 0.95, y: 26 });
      gsap.set(panels[active], { autoAlpha: 1, scale: 1, y: 0 });
      return;
    }
    panels.forEach((p, i) => {
      if (i === active) {
        gsap.fromTo(
          p,
          { autoAlpha: 0, scale: 0.95, y: 26 },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            overwrite: "auto",
          }
        );
      } else {
        gsap.to(p, {
          autoAlpha: 0,
          scale: 1.04,
          y: -16,
          duration: 0.45,
          ease: "power2.in",
          overwrite: "auto",
        });
      }
    });
  }, [active, reduced]);

  // Entrance: rows stagger in, stage fades up.
  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const list = listRef.current;
    if (!section || !list) return;
    // Row stagger is scoped to the list; the stage frame lives in the
    // sibling column, so it gets its own unscoped tween (a scoped
    // selector here would silently find nothing).
    const ctx = gsap.context(() => {
      gsap.from(".svc-index-row", {
        y: 36,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: list, start: "top 82%", once: true },
      });
    }, list);
    const frameTween = gsap.from(".svc-stage-frame", {
      y: 48,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: section, start: "top 78%", once: true },
    });
    return () => {
      ctx.revert();
      frameTween.scrollTrigger?.kill();
      frameTween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderVisual = (i: number) => {
    const playing = sectionVisible;
    switch (i) {
      case 0:
        return <WebDevVisual active={playing && active === 0} />;
      case 1:
        return <DesignVisual active={playing && active === 1} />;
      case 2:
        return <BackendVisual active={playing && active === 2} />;
      default:
        return <CommunityVisual active={playing && active === 3} />;
    }
  };

  return (
    <section
      className="block"
      id="services"
      aria-label="Services"
      ref={sectionRef}
    >
      <h2 className="fit sec-fit" ref={fitRef}>
        SERVICES
      </h2>
      <div className="sec-sub rv">
        <span>04 disciplines</span>
        <span>Scroll the timeline — the stage follows</span>
      </div>

      <div className="svc-index-grid">
        <div
          className="svc-index-list"
          ref={listRef}
          role="tablist"
          aria-label="Services"
          style={{ "--rail-color": RAIL_COLORS[active] } as React.CSSProperties}
        >
          <span
            className="svc-rail-progress"
            ref={railProgressRef}
            aria-hidden="true"
          />
          {services.map((s, i) => (
            <button
              key={s.num}
              type="button"
              role="tab"
              aria-selected={i === active}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className={`svc-index-row${i === active ? " active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={(e) => {
                setActive(i);
                // Mouse click: release focus so the focus ring doesn't
                // look stuck. Keyboard (Enter, detail 0) keeps it.
                if (e.detail > 0) e.currentTarget.blur();
              }}
            >
              <span className="svc-node" aria-hidden="true" />
              <span className="svc-index-main">
                <span className="svc-index-num">{s.num}</span>
                <span className="svc-index-name">{s.name}</span>
                <span className="svc-index-tags">{s.tags}</span>
                <span className="svc-index-desc">{s.description}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="svc-stage-col">
          <div className="svc-stage-sticky">
            <div className="svc-stage-frame">
              {services.map((s, i) => (
                <div
                  key={s.num}
                  className={`svc-stage-panel${i === active ? " active" : ""}`}
                  aria-hidden={i !== active}
                >
                  {renderVisual(i)}
                </div>
              ))}
            </div>
            <p className="svc-stage-caption" aria-live="polite">
              <span className="tick-sq" aria-hidden="true" />
              <span>
                [{services[active].num}] {services[active].name}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
