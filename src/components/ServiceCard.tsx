import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WebDevVisual from "./WebDevVisual";
import DesignVisual from "./DesignVisual";
import BackendVisual from "./BackendVisual";
import CommunityVisual from "./CommunityVisual";

gsap.registerPlugin(ScrollTrigger);

interface ServiceData {
  tabName: string;
  visualClass: string;
  name: string;
  description: string;
  tags: string;
  ghost: string;
}

interface Props {
  service: ServiceData;
  index: number;
}

export default function ServiceCard({ service, index }: Props) {
  const itemRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const tagsRef = useRef<HTMLParagraphElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);

  // Mouse-follow spotlight and 3D tilt on the folder card.
  // The card rect is cached on mouseenter — reading it per mousemove would
  // force a synchronous layout on every event (layout thrash).
  const tiltRect = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const cacheTiltRect = () => {
    const card = cardRef.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    tiltRect.current = { left, top, width, height };
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    const r = tiltRect.current;
    if (!card || !r) return;
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);

    const centerX = r.width / 2;
    const centerY = r.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    tiltRect.current = null;
    card.style.removeProperty("--mx");
    card.style.removeProperty("--my");
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  // Scroll-triggered stagger entrance
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const card = cardRef.current;
    if (!card) return;

    const targets = [
      visualRef.current,
      nameRef.current,
      descRef.current,
      tagsRef.current,
    ].filter(Boolean);

    gsap.set(targets, { opacity: 0, y: 30 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        once: true,
      },
    });

    tl.to(targets, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
    });

    if (ghostRef.current) {
      gsap.set(ghostRef.current, { scale: 0.7, opacity: 0 });
      tl.to(
        ghostRef.current,
        {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
        },
        "-=0.4"
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  // Depth scrub: as the next folder slides over this one, this folder
  // sinks back — slight scale-down + black overlay fade. transform/opacity
  // only, scrubbed. Skipped for the last card (nothing covers it).
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const item = itemRef.current;
    const next = item?.nextElementSibling as HTMLElement | null;
    if (!item || !next) return;

    const ctx = gsap.context(() => {
      const st = {
        trigger: next,
        start: "top 88%",
        end: "top 38%",
        scrub: 0.5,
      };
      gsap.to(item, {
        scale: 0.965,
        transformOrigin: "center top",
        ease: "none",
        scrollTrigger: st,
      });
      gsap.to(item.querySelector(".svc-depth"), {
        opacity: 0.32,
        ease: "none",
        scrollTrigger: { ...st },
      });
    });
    return () => {
      ctx.revert();
    };
  }, []);

  // Render full-bleed animated workspace stages for each service folder.
  // Each stage fills the visual area edge to edge with a left-to-right story
  // relevant to its service: deploy pipeline, design flow, api console, stats.
  const renderVisualContent = () => {
    switch (index) {
      case 0: // Web Development — deploy pipeline
        return <WebDevVisual />;
      case 1: // UI / UX Design — token drag & drop
        return <DesignVisual />;
      case 2: // Backend Architecture — api console
        return <BackendVisual />;
      case 3: // Mentorship & Community — impact stats
        return <CommunityVisual />;
      default:
        return null;
    }
  };

  return (
    <div
      className="svc-folder-item"
      ref={itemRef}
      style={{ "--i": index } as React.CSSProperties}
    >
      <div className="svc-folder-tab-bar">
        <div
          className="svc-folder-tab"
          style={{ "--i": index } as React.CSSProperties}
        >
          <span className="folder-tab-icon">📁</span>
          <span className="folder-tab-title">{service.tabName}</span>
        </div>
      </div>

      <article
        ref={cardRef}
        className="svc-folder-card"
        onMouseEnter={cacheTiltRect}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Paper sheets sticking out top */}
        <div className="folder-paper-sheets" aria-hidden="true">
          <div className="paper-sheet sheet-back"></div>
          <div className="paper-sheet sheet-front"></div>
        </div>

        {/* Folder Header Bar */}
        <div className="folder-header-bar">
          <div className="folder-meta-code">
            <span className="folder-dot"></span>
            <span>DIRECTORY // VOL_0{index + 1}</span>
          </div>
          <div className="folder-metal-clip"></div>
        </div>

        <div className={`svc-visual ${service.visualClass}`} ref={visualRef}>
          {renderVisualContent()}
        </div>

        <div className="svc-card-body">
          <h3 className="svc-name" ref={nameRef}>{service.name}</h3>
          <p className="svc-desc" ref={descRef}>{service.description}</p>
          <p className="svc-tags" ref={tagsRef}>{service.tags}</p>
          <span className="svc-ghost" aria-hidden="true" ref={ghostRef}>
            {service.ghost}
          </span>
        </div>
        {/* Depth dimmer: fades in as the next folder slides over this one */}
        <div className="svc-depth" aria-hidden="true" />
      </article>
    </div>
  );
}

export type { ServiceData };
