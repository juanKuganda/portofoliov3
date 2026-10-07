import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function BentoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // State for Card 1: Design System Token Preview
  const [activeToken, setActiveToken] = useState<number>(1);
  const tokens = [
    { name: "Ink Primary", val: "#0a0a0a", text: "#ffffff", border: "#333" },
    { name: "Signal Amber", val: "#f59e0b", text: "#0a0a0a", border: "#f59e0b" },
    { name: "Subtle Gray", val: "#f6f6f6", text: "#0a0a0a", border: "#e9e9e9" },
  ];

  // State for Card 2: Interactive Ripple Rings
  const interactiveBoxRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [clickCount, setClickCount] = useState<number>(0);

  // State for Card 4: Terminal Runner
  const [codeStatus, setCodeStatus] = useState<"idle" | "running" | "done">("idle");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Stagger in cards with scroll trigger
    if (cardsRef.current.length > 0) {
      gsap.fromTo(
        cardsRef.current.filter(Boolean),
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    }
  }, []);

  // 3D Tilt + Spotlight logic for cards
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const card = cardsRef.current[idx];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      transformPerspective: 1000,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = (idx: number) => {
    const card = cardsRef.current[idx];
    if (!card) return;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  // Card 2 interactive physics ball & ripples
  const handleCard2MouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = interactiveBoxRef.current;
    const ball = ballRef.current;
    if (!box || !ball) return;
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left - 14;
    const y = e.clientY - rect.top - 14;

    gsap.to(ball, {
      x: x,
      y: y,
      duration: 0.4,
      ease: "back.out(2)",
    });
  };

  const handleCard2Click = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = interactiveBoxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { id: Date.now(), x, y };
    setRipples((prev) => [...prev.slice(-4), newRipple]);
    setClickCount((c) => c + 1);
  };

  // Card 4 Run Code Trigger
  const handleRunCode = () => {
    if (codeStatus === "running") return;
    setCodeStatus("running");
    setTimeout(() => {
      setCodeStatus("done");
    }, 600);
  };

  return (
    <section className="bento-section block" id="bento" ref={sectionRef}>
      <div className="bento-header rv">
        <h2 className="fit sec-fit">CAPABILITIES</h2>
        <p className="bento-desc">Building digital products that feel alive.</p>
      </div>

      <div className="bento-grid">
        {/* Card 1: Design Systems */}
        <div
          className="bento-card span-2"
          ref={(el) => { cardsRef.current[0] = el; }}
          onMouseMove={(e) => handleMouseMove(e, 0)}
          onMouseLeave={() => handleMouseLeave(0)}
        >
          <div className="bento-content">
            <div className="bc-top">
              <span className="bento-badge">Design System Tokens</span>
              <h3 className="bc-title">Design Systems</h3>
              <p className="bc-desc">
                Crafting cohesive, scalable, and accessible UI tokens that empower developers and delight users. 
                Click colors below to test token switching live.
              </p>
            </div>
            
            <div className="bc-visual design-visual">
              <div 
                className="ds-mockup" 
                style={{ 
                  backgroundColor: tokens[activeToken].val, 
                  borderColor: tokens[activeToken].border,
                  color: tokens[activeToken].text
                }}
              >
                <div className="ds-tokens">
                  {tokens.map((tok, i) => (
                    <button
                      key={tok.name}
                      type="button"
                      className={`ds-color-btn ${activeToken === i ? "active" : ""}`}
                      style={{ backgroundColor: tok.val }}
                      onClick={() => setActiveToken(i)}
                      title={`Select ${tok.name}`}
                      aria-label={`Select ${tok.name}`}
                    >
                      {activeToken === i && <span className="active-dot"></span>}
                    </button>
                  ))}
                </div>
                <div className="ds-preview-info">
                  <span className="ds-tag-label">{tokens[activeToken].name}</span>
                  <span className="ds-tag-hex">{tokens[activeToken].val}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Micro-Interactions */}
        <div
          className="bento-card"
          ref={(el) => { cardsRef.current[1] = el; }}
          onMouseMove={(e) => {
            handleMouseMove(e, 1);
            handleCard2MouseMove(e);
          }}
          onMouseLeave={() => handleMouseLeave(1)}
          onClick={handleCard2Click}
        >
          <div className="bento-content">
            <div className="bc-top">
              <span className="bento-badge">Spring & Physics</span>
              <h3 className="bc-title">Micro-Interactions</h3>
              <p className="bc-desc">Every hover, scroll, and click is an opportunity. Move mouse & click card!</p>
            </div>
            
            <div className="bc-visual interactive-visual" ref={interactiveBoxRef}>
              <div className="interactive-canvas">
                <div className="interactive-ball" ref={ballRef}></div>
                {ripples.map((r) => (
                  <span
                    key={r.id}
                    className="click-ripple"
                    style={{ left: r.x, top: r.y }}
                  ></span>
                ))}
                <div className="interactive-hint">
                  {clickCount > 0 ? `Clicked ${clickCount}× ✦` : "Hover & Click Canvas"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Mentorship & Network */}
        <div
          className="bento-card"
          ref={(el) => { cardsRef.current[2] = el; }}
          onMouseMove={(e) => handleMouseMove(e, 2)}
          onMouseLeave={() => handleMouseLeave(2)}
        >
          <div className="bento-content">
            <div className="bc-top">
              <span className="bento-badge">Community & Growth</span>
              <h3 className="bc-title">Mentorship</h3>
              <p className="bc-desc">Growing Palu's developer ecosystem & student tech communities.</p>
            </div>

            <div className="bc-visual mentor-visual">
              <div className="nodes-mockup">
                <div className="node n1" data-label="Mentee">
                  <span className="node-ping"></span>
                </div>
                <div className="node n2 main-mentor" data-label="Juan (Mentor)">
                  <span className="node-ping"></span>
                </div>
                <div className="node n3" data-label="Community">
                  <span className="node-ping"></span>
                </div>
                <svg className="node-lines" width="100%" height="100%">
                  <line x1="25%" y1="65%" x2="50%" y2="35%" className="animated-path" />
                  <line x1="50%" y1="35%" x2="75%" y2="65%" className="animated-path delay" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Frontend Architecture */}
        <div
          className="bento-card span-2"
          ref={(el) => { cardsRef.current[3] = el; }}
          onMouseMove={(e) => handleMouseMove(e, 3)}
          onMouseLeave={() => handleMouseLeave(3)}
        >
          <div className="bento-content">
            <div className="bc-top">
              <span className="bento-badge">Type-Safe & Scalable</span>
              <h3 className="bc-title">Frontend Architecture</h3>
              <p className="bc-desc">
                TypeScript, React, and modern tooling built for high performance and zero friction.
              </p>
            </div>

            <div className="bc-visual code-visual">
              <div className="code-card">
                <div className="code-header">
                  <div className="code-dots">
                    <span className="c-dot red"></span>
                    <span className="c-dot yellow"></span>
                    <span className="c-dot green"></span>
                  </div>
                  <button 
                    type="button" 
                    className="run-btn"
                    onClick={handleRunCode}
                  >
                    {codeStatus === "running" ? "Compiling..." : "▶ Run Code"}
                  </button>
                </div>
                <pre className="code-mockup">
                  <code>
                    <span className="kw">export const</span> <span className="fn">createExperience</span> = () =&gt; {"{"} <br/>
                    &nbsp;&nbsp;<span className="kw">return</span> <span className="str">"wow"</span>;<br/>
                    {"}"}
                  </code>
                </pre>
                {codeStatus !== "idle" && (
                  <div className={`code-output ${codeStatus}`}>
                    {codeStatus === "running" ? (
                      <span className="compiling-text">⚡ Compiling TypeScript...</span>
                    ) : (
                      <span className="success-text">
                        ✓ Executed in 12ms &rarr; <strong className="val">"wow"</strong> ✨
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
