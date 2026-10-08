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

// Each card's signature pop color (text color paired for contrast).
const CARD_COLORS = [
  { bg: "var(--pop-pink)", fg: "#ffffff" },
  { bg: "var(--pop-blue)", fg: "#ffffff" },
  { bg: "var(--pop-green)", fg: "var(--ink)" },
  { bg: "var(--pop-purple)", fg: "#ffffff" },
];

/**
 * SERVICES — "04 disciplines" as a STACKING DECK of color cards.
 * Each service is a full card in its signature pop color
 * (pink / blue / green / purple) with the dark animated visual
 * embedded in a rounded frame. Cards are position:sticky with a
 * stepped top offset, so scrolling stacks them like a deck.
 * All visuals play while the section is on-screen (transform/
 * opacity only). Reduced motion: static cards, no entrance.
 */
export default function ServicesSection() {
  const fitRef = useRef<HTMLHeadingElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [sectionVisible, setSectionVisible] = useState(true);
  useFitText(fitRef);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Pause all visuals while the whole section is off-screen.
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

  // Entrance: each card slides in as it approaches, then sticks.
  useEffect(() => {
    if (reduced) return;
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    const ctx = gsap.context(() => {
      cards.forEach((card) => {
        gsap.from(card, {
          y: 70,
          opacity: 0,
          duration: 0.75,
          ease: "power3.out",
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: card, start: "top 90%", once: true },
        });
      });
    });
    return () => ctx.revert();
  }, [reduced]);

  const renderVisual = (i: number) => {
    switch (i) {
      case 0:
        return <WebDevVisual active={sectionVisible} />;
      case 1:
        return <DesignVisual active={sectionVisible} />;
      case 2:
        return <BackendVisual active={sectionVisible} />;
      default:
        return <CommunityVisual active={sectionVisible} />;
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
        <span>Scroll — the deck stacks</span>
      </div>

      <div className="svc-deck">
        {services.map((s, i) => (
          <article
            key={s.num}
            className="svc-card"
            style={
              {
                "--card-bg": CARD_COLORS[i].bg,
                "--card-fg": CARD_COLORS[i].fg,
                "--i": i,
              } as React.CSSProperties
            }
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            aria-label={`${s.num} — ${s.name}`}
          >
            <div className="svc-card-head">
              <span className="svc-card-num" aria-hidden="true">
                {s.num}
              </span>
              <div className="svc-card-titles">
                <h3 className="svc-card-name">{s.name}</h3>
                <p className="svc-card-tags">{s.tags}</p>
              </div>
            </div>
            <p className="svc-card-desc">{s.description}</p>
            <div className="svc-card-visual">{renderVisual(i)}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
