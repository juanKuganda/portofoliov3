import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFitText } from "../hooks/useFitText";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Card 1 — Theme Lab: press a token, the whole card re-themes         */
/* ------------------------------------------------------------------ */
const themes = [
  { name: "Paper", hex: "#F6F6F6", bg: "#f6f6f6", fg: "#0a0a0a", muted: "#737373" },
  { name: "Grape", hex: "#9775FA", bg: "#9775fa", fg: "#ffffff", muted: "#e6defc" },
  { name: "Ink", hex: "#0A0A0A", bg: "#0a0a0a", fg: "#f5f5f5", muted: "#a3a3a3" },
];

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Card 4 — fake execution transcript                                 */
/* ------------------------------------------------------------------ */
const codeLines = [
  'export const createExperience = () => {',
  '  return "wow";',
  '}',
];

export default function BentoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const fitRef = useRef<HTMLHeadingElement>(null);
  useFitText(fitRef);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Card 1 state ---- */
  const [theme, setTheme] = useState(0);
  const themeCardRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const switching = useRef(false);
  // Party button: cycles pop colors + confetti burst on every press.
  const [partyIdx, setPartyIdx] = useState(0);
  const PARTY_COLORS = ["#ff4d6d", "#4dabf7", "#51cf66", "#9775fa"];
  const partyPop = (e: React.MouseEvent<HTMLButtonElement>) => {
    const b = e.currentTarget;
    setPartyIdx((i) => (i + 1) % PARTY_COLORS.length);
    if (reduced) return;
    gsap.fromTo(
      b,
      { scale: 0.85, rotate: -4 },
      { scale: 1, rotate: 0, duration: 0.5, ease: "back.out(3)" }
    );
    const card = b.closest(".tl-visual") as HTMLElement | null;
    if (!card) return;
    const r = b.getBoundingClientRect();
    const cr = card.getBoundingClientRect();
    const cx = r.left - cr.left + r.width / 2;
    const cy = r.top - cr.top + r.height / 2;
    for (let i = 0; i < 16; i++) {
      const d = document.createElement("span");
      d.className = "tl-confetti";
      d.style.background = PARTY_COLORS[(partyIdx + i) % PARTY_COLORS.length];
      d.style.left = `${cx}px`;
      d.style.top = `${cy}px`;
      card.appendChild(d);
      gsap.to(d, {
        x: gsap.utils.random(-120, 120),
        y: gsap.utils.random(-100, 70),
        opacity: 0,
        scale: gsap.utils.random(0.4, 1.1),
        duration: gsap.utils.random(0.6, 1.1),
        ease: "power2.out",
        onComplete: () => d.remove(),
      });
    }
  };

  /* ---- Card 2 state: whack-a-cockroach ---- */
  const arenaRef = useRef<HTMLDivElement>(null);
  const [roaches, setRoaches] = useState<{ id: number; x: number; y: number; rot: number }[]>([]);
  const [squishes, setSquishes] = useState<{ id: number; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const roachId = useRef(0);

  /* ---- Card 3 state ---- */
  const [signals, setSignals] = useState(0);
  const [lineFlash, setLineFlash] = useState(false);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mockupRef = useRef<HTMLDivElement>(null);
  const signalDotRef = useRef<HTMLDivElement>(null);
  const relaying = useRef(false);
  // Node centers as % of the mockup: mentor center-top, 4 satellites.
  const NODE_POS: [number, number][] = [
    [15, 62], // n1 mentee
    [50, 24], // n2 Juan (Mentor)
    [85, 62], // n3 mentee
    [36, 86], // n4 mentee
    [64, 86], // n5 community
  ];

  /* ---- Card 4 state ---- */
  const [runState, setRunState] = useState<"idle" | "running" | "done">("idle");
  const [execLine, setExecLine] = useState(-1);
  const [outLines, setOutLines] = useState<string[]>([]);
  const runTl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (reduced) return;
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
    return () => {
      runTl.current?.kill();
    };
  }, [reduced]);

  /* ---- 3D tilt + spotlight ---- */
  // Rects cached on mouseenter: getBoundingClientRect per mousemove forces
  // a synchronous layout on every event (layout thrash at 60-120Hz).
  const tiltRects = useRef<(DOMRect | null)[]>([]);
  const cacheTiltRect = (idx: number) => {
    const card = cardsRef.current[idx];
    if (card) tiltRects.current[idx] = card.getBoundingClientRect();
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const card = cardsRef.current[idx];
    const rect = tiltRects.current[idx];
    if (!card || !rect || reduced) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    gsap.to(card, {
      rotateX: ((y - centerY) / centerY) * -5,
      rotateY: ((x - centerX) / centerX) * 5,
      transformPerspective: 1000,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
  };
  const handleMouseLeave = (idx: number) => {
    const card = cardsRef.current[idx];
    if (!card || reduced) return;
    tiltRects.current[idx] = null;
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
  };

  /* ---- Card 1: theme wipe ---- */
  const pressToken = (i: number, btn: HTMLButtonElement) => {
    if (i === theme || switching.current) return;
    if (!reduced) {
      gsap.fromTo(btn, { scale: 0.82 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
    }
    const wipe = wipeRef.current;
    if (!wipe || reduced) {
      setTheme(i);
      return;
    }
    switching.current = true;
    gsap.set(wipe, { backgroundColor: themes[i].bg, opacity: 1 });
    const tl = gsap.timeline({
      onComplete: () => {
        switching.current = false;
      },
    });
    tl.set(wipe, { transformOrigin: "left center", scaleX: 0 })
      .to(wipe, { scaleX: 1, duration: 0.25, ease: "power2.in" })
      .add(() => setTheme(i))
      .set(wipe, { transformOrigin: "right center" })
      .to(wipe, { scaleX: 0, duration: 0.45, ease: "power3.out" })
      .set(wipe, { opacity: 0 });
  };

  /* ---- Card 2: whack-a-cockroach ---- */
  // Spawner: a roach pops up every ~1.5s (max 3 alive); ignored roaches
  // scurry away after ~2.8s. transform/opacity only; static when reduced.
  useEffect(() => {
    if (reduced) return;
    const spawn = () => {
      const arena = arenaRef.current;
      if (!arena) return;
      const r = arena.getBoundingClientRect();
      if (r.width < 80) return;
      const id = ++roachId.current;
      const x = gsap.utils.random(46, Math.max(66, r.width - 46));
      const y = gsap.utils.random(60, Math.max(80, r.height - 46));
      setRoaches((prev) =>
        prev.length >= 3
          ? prev
          : [...prev, { id, x, y, rot: gsap.utils.random(-18, 18) }]
      );
      window.setTimeout(() => {
        setRoaches((prev) => prev.filter((rc) => rc.id !== id));
      }, 2800);
    };
    spawn();
    const iv = window.setInterval(spawn, 1500);
    return () => window.clearInterval(iv);
  }, [reduced]);

  const squishRoach = (id: number, x: number, y: number) => {
    setRoaches((prev) => prev.filter((r) => r.id !== id));
    setScore((sc) => sc + 1);
    const sid = ++roachId.current;
    setSquishes((prev) => [...prev.slice(-4), { id: sid, x, y }]);
    window.setTimeout(() => {
      setSquishes((prev) => prev.filter((sq) => sq.id !== sid));
    }, 850);
  };

  /** Tap a roach: stop its wiggle, squash flat, then score it. */
  const onRoachTap = (
    e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
    rc: { id: number; x: number; y: number }
  ) => {
    const b = e.currentTarget as HTMLButtonElement;
    if (reduced || typeof (e as React.KeyboardEvent).key === "string") {
      squishRoach(rc.id, rc.x, rc.y);
      return;
    }
    b.style.animation = "none";
    gsap.to(b, {
      scaleY: 0.12,
      scaleX: 1.6,
      opacity: 0,
      duration: 0.16,
      ease: "power2.in",
      overwrite: "auto",
      onComplete: () => squishRoach(rc.id, rc.x, rc.y),
    });
  };

  /* ---- Card 3: chain-reaction network ---- */
  const doPing = (i: number) => {
    const node = nodeRefs.current[i];
    if (node && !reduced) {
      node.classList.remove("ping");
      void node.offsetWidth;
      node.classList.add("ping");
    }
  };

  const nodeCenter = (i: number) => {
    const mockup = mockupRef.current;
    if (!mockup) return { x: 0, y: 0 };
    const r = mockup.getBoundingClientRect();
    return {
      x: (NODE_POS[i][0] / 100) * r.width,
      y: (NODE_POS[i][1] / 100) * r.height,
    };
  };

  /** Tap a node → a signal dot hops along the lines to the mentor, who
      re-broadcasts to the other nodes. The card finally behaves like a network. */
  const relaySignal = (from: number) => {
    if (relaying.current) return;
    if (reduced) {
      setLineFlash(true);
      window.setTimeout(() => setLineFlash(false), 450);
      setSignals((s) => s + 1);
      return;
    }
    const dot = signalDotRef.current;
    if (!dot) return;
    relaying.current = true;
    setLineFlash(true);

    const hop = (a: number, b: number, dur = 0.3) => {
      const pa = nodeCenter(a);
      const pb = nodeCenter(b);
      const tl = gsap.timeline();
      tl.set(dot, {
        x: pa.x,
        y: pa.y,
        xPercent: -50,
        yPercent: -50,
        opacity: 1,
        scale: 1,
      })
        .to(dot, { x: pb.x, y: pb.y, duration: dur, ease: "power2.in" })
        .add(() => doPing(b))
        .to(dot, { opacity: 0, scale: 0.4, duration: 0.15 }, "-=0.05");
      return tl;
    };

    const tl = gsap.timeline({
      onComplete: () => {
        relaying.current = false;
      },
    });
    if (from === 1) {
      // Mentor broadcasts to all satellites, slightly staggered.
      [0, 2, 3, 4].forEach((o, k) => tl.add(hop(1, o, 0.35), k * 0.08));
    } else {
      // Node → mentor → rebroadcast to the other nodes.
      tl.add(hop(from, 1, 0.3));
      [0, 2, 3, 4]
        .filter((i) => i !== from)
        .forEach((o) => tl.add(hop(1, o, 0.32), "+=0.1"));
    }
    tl.add(() => {
      setLineFlash(false);
      setSignals((s) => s + 1);
    });
  };

  // Pause the network's idle CSS animations while off-screen.
  useEffect(() => {
    const mockup = mockupRef.current;
    if (!mockup || reduced) return;
    const st = ScrollTrigger.create({
      trigger: mockup,
      start: "top 95%",
      end: "bottom 5%",
      onEnter: () => mockup.classList.remove("anims-paused"),
      onLeave: () => mockup.classList.add("anims-paused"),
      onEnterBack: () => mockup.classList.remove("anims-paused"),
      onLeaveBack: () => mockup.classList.add("anims-paused"),
    });
    return () => {
      st.kill();
    };
  }, [reduced]);

  // Ambient life: the network relays a signal on its own every few
  // seconds (paused off-screen / reduced-motion via the guards).
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      const mockup = mockupRef.current;
      if (!mockup || mockup.classList.contains("anims-paused")) return;
      if (relaying.current) return;
      relaySignal(Math.floor(Math.random() * 5));
    }, 3400);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  /* ---- Card 4: run the code ---- */
  const runCode = () => {
    if (runState === "running") return;
    runTl.current?.kill();
    setOutLines([]);
    if (reduced) {
      setRunState("done");
      setOutLines(["$ tsc --noEmit", "✓ 0 errors", "$ vite build", "✓ built in 842ms", '→ "wow"']);
      return;
    }
    setRunState("running");
    const tl = gsap.timeline();
    runTl.current = tl;
    codeLines.forEach((_, i) => {
      tl.call(() => setExecLine(i));
      tl.to({}, { duration: 0.35 });
    });
    tl.call(() => {
      setExecLine(-1);
      setOutLines(["$ tsc --noEmit"]);
    });
    tl.to({}, { duration: 0.3 });
    tl.call(() => setOutLines((o) => [...o, "✓ 0 errors"]));
    tl.to({}, { duration: 0.25 });
    tl.call(() => setOutLines((o) => [...o, "$ vite build"]));
    tl.to({}, { duration: 0.35 });
    tl.call(() => setOutLines((o) => [...o, "✓ built in 842ms"]));
    tl.to({}, { duration: 0.25 });
    tl.call(() => {
      setOutLines((o) => [...o, '→ "wow"']);
      setRunState("done");
    });
  };

  const t = themes[theme];

  return (
    <section className="bento-section block" id="bento" ref={sectionRef}>
      <div className="bento-header rv">
        <h2 className="fit sec-fit" ref={fitRef}>CAPABILITIES</h2>
        <p className="bento-desc">Building digital products that feel alive. Go ahead — press things.</p>
      </div>

      <div className="bento-grid">
        {/* Card 1: Theme Lab */}
        <div
          className="bento-card span-7 theme-lab"
          ref={(el) => { cardsRef.current[0] = el; }}
          onMouseEnter={() => cacheTiltRect(0)}
          onMouseMove={(e) => handleMouseMove(e, 0)}
          onMouseLeave={() => handleMouseLeave(0)}
        >
          <div
            className="tl-theme"
            ref={themeCardRef}
            style={
              {
                "--tl-bg": t.bg,
                "--tl-fg": t.fg,
                "--tl-muted": t.muted,
              } as React.CSSProperties
            }
          >
            <div className="theme-wipe" ref={wipeRef} aria-hidden="true" />
            <div className="bento-content">
              <div className="bc-top">
                <span className="bento-badge tl-badge">Theme Lab</span>
                <h3 className="bc-title">Design Systems</h3>
                <p className="bc-desc">
                  Cohesive, scalable tokens — press a swatch and watch the whole
                  card re-theme itself.
                </p>
              </div>
              <div className="bc-visual tl-visual">
                <div className="tl-chips" role="group" aria-label="Theme tokens">
                  {themes.map((th, i) => (
                    <button
                      key={th.name}
                      type="button"
                      className={`tl-chip ${theme === i ? "active" : ""}`}
                      style={{ backgroundColor: th.hex }}
                      onClick={(e) => pressToken(i, e.currentTarget)}
                      aria-label={`Apply ${th.name} theme`}
                      aria-pressed={theme === i}
                    >
                      {theme === i && <span className="tl-check">✓</span>}
                    </button>
                  ))}
                </div>
                <div className="tl-specimen">
                  <span className="tl-aa">Aa</span>
                  <div className="tl-meta">
                    <span className="tl-name">{t.name}</span>
                    <span className="tl-hex">{t.hex}</span>
                  </div>
                  <button
                    type="button"
                    className="tl-sample-btn"
                    style={{ background: PARTY_COLORS[partyIdx], color: "#fff" }}
                    onClick={partyPop}
                    aria-label="Party! Confetti burst"
                  >
                    Press me
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Whack-a-cockroach */}
        <div
          className="bento-card span-5 tall"
          ref={(el) => { cardsRef.current[1] = el; }}
          onMouseMove={(e) => { handleMouseMove(e, 1); }}
          onMouseLeave={() => handleMouseLeave(1)}
        >
          <div className="bento-content">
            <div className="bc-top">
              <span className="bento-badge">Pest Control</span>
              <h3 className="bc-title">Micro-Interactions</h3>
              <p className="bc-desc">
                Bugs in the code? Tap the cockroach to squish it — every tap scores.
              </p>
            </div>
            <div className="bc-visual roach-visual">
              <div className="roach-arena" ref={arenaRef}>
                <div className="pg-counter" aria-live="polite">
                  <span key={score} className="pg-count-pop">{score}</span>
                  <span className="pg-count-lbl">squished</span>
                </div>
                {roaches.map((rc) => (
                  <button
                    key={rc.id}
                    type="button"
                    className="roach"
                    style={{ left: rc.x, top: rc.y, ["--rr" as string]: `${rc.rot}deg` }}
                    onClick={(e) => onRoachTap(e, rc)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRoachTap(e, rc);
                      }
                    }}
                    aria-label="Squish the cockroach"
                  >
                    <svg viewBox="0 0 48 46" aria-hidden="true">
                      <g stroke="#5b3a24" strokeWidth="2.2" strokeLinecap="round">
                        <line x1="15" y1="20" x2="6" y2="13" />
                        <line x1="14" y1="27" x2="5" y2="28" />
                        <line x1="15" y1="34" x2="8" y2="41" />
                        <line x1="33" y1="20" x2="42" y2="13" />
                        <line x1="34" y1="27" x2="43" y2="28" />
                        <line x1="33" y1="34" x2="40" y2="41" />
                      </g>
                      <path d="M24 10 C 20 4, 14 2, 9 1" stroke="#5b3a24" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                      <path d="M24 10 C 28 4, 34 2, 39 1" stroke="#5b3a24" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                      <ellipse cx="24" cy="28" rx="12" ry="11" fill="#7a5230" />
                      <ellipse cx="24" cy="28" rx="12" ry="11" fill="none" stroke="#5b3a24" strokeWidth="2" />
                      <line x1="24" y1="18" x2="24" y2="38" stroke="#5b3a24" strokeWidth="1.6" />
                      <circle cx="24" cy="12" r="6.5" fill="#5b3a24" />
                      <circle cx="21.8" cy="11" r="1.6" fill="#fff" />
                      <circle cx="26.2" cy="11" r="1.6" fill="#fff" />
                      <circle cx="21.8" cy="11" r="0.8" fill="#0a0a0a" />
                      <circle cx="26.2" cy="11" r="0.8" fill="#0a0a0a" />
                    </svg>
                  </button>
                ))}
                {squishes.map((sq) => (
                  <span key={sq.id} className="squish-pop" style={{ left: sq.x, top: sq.y }} aria-hidden="true">
                    +1
                  </span>
                ))}
                <div className="pg-hint">Tap the roach &#10022;</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Mentorship network */}
        <div
          className="bento-card span-3"
          ref={(el) => { cardsRef.current[2] = el; }}
          onMouseEnter={() => cacheTiltRect(2)}
          onMouseMove={(e) => handleMouseMove(e, 2)}
          onMouseLeave={() => handleMouseLeave(2)}
        >
          <div className="bento-content">
            <div className="bc-top">
              <span className="bento-badge">Community & Growth</span>
              <h3 className="bc-title">Mentorship</h3>
              <p className="bc-desc">Growing Palu's developer ecosystem. Tap a node, watch the signal relay.</p>
            </div>
            <div className="bc-visual net-visual">
              <div className="nodes-mockup" ref={mockupRef}>
                {[
                  { label: "Mentee", cls: "n1" },
                  { label: "Juan (Mentor)", cls: "n2 main-mentor" },
                  { label: "Mentee", cls: "n3" },
                  { label: "Mentee", cls: "n4" },
                  { label: "Community", cls: "n5" },
                ].map((n, i) => (
                  <button
                    key={n.label}
                    type="button"
                    ref={(el) => { nodeRefs.current[i] = el; }}
                    className={`node ${n.cls}`}
                    data-label={n.label}
                    aria-label={`Relay a signal from ${n.label}`}
                    onClick={() => relaySignal(i)}
                  >
                    <span className="node-ping" aria-hidden="true" />
                  </button>
                ))}
                <div className="signal-dot" ref={signalDotRef} aria-hidden="true" />
                <svg className="node-lines" width="100%" height="100%" aria-hidden="true">
                  <line x1="50%" y1="24%" x2="15%" y2="62%" className={`animated-path ${lineFlash ? "flash" : ""}`} />
                  <line x1="50%" y1="24%" x2="85%" y2="62%" className={`animated-path ${lineFlash ? "flash" : ""}`} />
                  <line x1="50%" y1="24%" x2="36%" y2="86%" className={`animated-path delay ${lineFlash ? "flash" : ""}`} />
                  <line x1="50%" y1="24%" x2="64%" y2="86%" className={`animated-path delay ${lineFlash ? "flash" : ""}`} />
                </svg>
              </div>
              <div className="net-counter">
                <span key={signals} className="net-pop">{signals}</span> signals relayed
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Code runner */}
        <div
          className="bento-card span-4"
          ref={(el) => { cardsRef.current[3] = el; }}
          onMouseEnter={() => cacheTiltRect(3)}
          onMouseMove={(e) => handleMouseMove(e, 3)}
          onMouseLeave={() => handleMouseLeave(3)}
        >
          <div className="bento-content">
            <div className="bc-top">
              <span className="bento-badge">Type-Safe & Scalable</span>
              <h3 className="bc-title">Frontend Architecture</h3>
              <p className="bc-desc">
                TypeScript, React, modern tooling. Press run and watch it execute.
              </p>
            </div>
            <div className="bc-visual code-visual">
              <div className="code-card">
                <div className="code-header">
                  <div className="code-dots">
                    <span className="c-dot red" />
                    <span className="c-dot yellow" />
                    <span className="c-dot green" />
                  </div>
                  <button type="button" className="run-btn" onClick={runCode} disabled={runState === "running"}>
                    {runState === "running" ? "● Running…" : runState === "done" ? "↻ Run again" : "▶ Run Code"}
                  </button>
                </div>
                <div className="code-mockup" aria-hidden="true">
                  {codeLines.map((ln, i) => (
                    <div key={i} className={`code-line ${execLine === i ? "exec" : ""}`}>
                      <code dangerouslySetInnerHTML={{ __html: highlight(ln) }} />
                    </div>
                  ))}
                </div>
                {(outLines.length > 0 || runState === "running") && (
                  <div className="code-output" aria-live="polite">
                    {outLines.map((ln, i) => (
                      <div key={`${i}-${ln}`} className="out-line">
                        {ln.startsWith("✓") || ln.startsWith("→") ? (
                          <span className="ok">{ln}</span>
                        ) : (
                          <span className="cmd">{ln}</span>
                        )}
                      </div>
                    ))}
                    {runState === "running" && <span className="caret" aria-hidden="true" />}
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

/* tiny syntax highlighter for the 3 demo lines */
function highlight(line: string): string {
  return line
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/export const/g, '<span class="kw">export const</span>')
    .replace(/createExperience/g, '<span class="fn">createExperience</span>')
    .replace(/return/g, '<span class="kw">return</span>')
    .replace(/"wow"/g, '<span class="str">"wow"</span>');
}
