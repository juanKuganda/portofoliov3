import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WebDevVisual from "./WebDevVisual";

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
  const cardRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const tagsRef = useRef<HTMLParagraphElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);

  // Mouse-follow spotlight and 3D tilt on the folder card
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);

    const centerX = width / 2;
    const centerY = height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.removeProperty("--mx");
    card.style.removeProperty("--my");
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power3.out",
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

  // Render bespoke, meaningful visual illustrations for each service folder
  const renderVisualContent = () => {
    switch (index) {
      case 0: // Web Development — a living micro-interaction demo
        return <WebDevVisual />;

      case 1: // UI / UX Design
        return (
          <div className="service-visual-inner visual-design">
            <div className="sv-figma-artboard">
              <div className="sv-artboard-header">
                <span className="artboard-label">Frame — 1440px</span>
                <span className="artboard-grid-badge">Design Tokens</span>
              </div>
              <div className="sv-wireframe-grid">
                <div className="wf-box box-hero"></div>
                <div className="wf-box box-sidebar"></div>
                <div className="wf-box box-card"></div>
              </div>
              <div className="sv-figma-cursor">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5.636 4.223a.75.75 0 0 1 .843-.14l13.5 7.5a.75.75 0 0 1-.365 1.411l-5.642.593 3.652 5.643a.75.75 0 1 1-1.256.814l-3.65-5.642-3.83 4.148a.75.75 0 0 1-1.29-.607V4.223z" fill="#f59e0b"/>
                </svg>
                <span className="cursor-name">Juan (UI/UX)</span>
              </div>
            </div>
          </div>
        );

      case 2: // Backend Architecture
        return (
          <div className="service-visual-inner visual-backend">
            <div className="sv-api-window">
              <div className="sv-api-row">
                <span className="http-badge get">GET</span>
                <span className="endpoint-url">/api/v1/projects</span>
                <span className="status-pill ok">200 OK</span>
              </div>
              <div className="sv-api-row">
                <span className="http-badge post">POST</span>
                <span className="endpoint-url">/api/v1/auth/session</span>
                <span className="status-pill ok">201 Created</span>
              </div>
              <div className="sv-db-tag">
                <span>🐘 PostgreSQL DB · Latency 12ms</span>
              </div>
            </div>
          </div>
        );

      case 3: // Mentorship & Community
        return (
          <div className="service-visual-inner visual-community">
            <div className="sv-community-card">
              <div className="comm-badge">Palu Dev Leader</div>
              <h4 className="comm-title">Mentorship &amp; Workshops</h4>
              <div className="comm-stats">
                <div className="stat">
                  <span className="stat-val">100+</span>
                  <span className="stat-lbl">Mentees</span>
                </div>
                <div className="stat">
                  <span className="stat-val">3+</span>
                  <span className="stat-lbl">Communities</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="svc-folder-item"
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
      </article>
    </div>
  );
}

export type { ServiceData };
