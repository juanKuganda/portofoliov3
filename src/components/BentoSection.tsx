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
  { name: "Signal Amber", hex: "#F59E0B", bg: "#f59e0b", fg: "#171204", muted: "#6b4e0a" },
  { name: "Ink", hex: "#0A0A0A", bg: "#0a0a0a", fg: "#f5f5f5", muted: "#a3a3a3" },
];

/* ------------------------------------------------------------------ */
/* Card 2 — particle burst rendered at the tap point                   */
/* ------------------------------------------------------------------ */
function Burst({
  x,
  y,
  count = 12,
  onDone,
}: {
  x: number;
  y: number;
  count?: number;
  onDone: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.to(".bp", {
        x: () => gsap.utils.random(-110, 110),
        y: () => gsap.utils.random(-110, 50),
        opacity: 0,
        scale: 0.2,
        rotation: () => gsap.utils.random(-180, 180),
        duration: 0.75,
        ease: "power2.out",
        stagger: 0.012,
        onComplete: onDone,
      });
    }, el);
    return () => ctx.revert();
    // onDone is stable per burst (b.id never changes) — empty deps so
    // rapid taps re-rendering the parent can't kill mid-flight particles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className="burst" style={{ left: x, top: y }} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="bp" />
      ))}
    </div>
  );
}

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

  /* ---- Card 2 state ---- */
  const canvasRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number; count: number }[]>([]);
  const [trails, setTrails] = useState<{ id: number; x: number; y: number }[]>([]);
  const [charge, setCharge] = useState<{ id: number; x: number; y: number } | null>(null);
  const [taps, setTaps] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hint, setHint] = useState("Tap anywhere ✦");
  const pressStart = useRef<{ t: number; x: number; y: number } | null>(null);
  const lastTapAt = useRef(0);
  const comboTimer = useRef(0);

  /* ---- Card 3 state ---- */
  const [signals, setSignals] = useState(0);
  const [lineFlash, setLineFlash] = useState(false);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mockupRef = useRef<HTMLDivElement>(null);
  const signalDotRef = useRef<HTMLDivElement>(null);
  const relaying = useRef(false);
  // Node centers as % of the mockup: n1 Mentee, n2 Mentor, n3 Community
  const NODE_POS: [number, number][] = [
    [25, 65],
    [50, 35],
    [75, 65],
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
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const card = cardsRef.current[idx];
    if (!card || reduced) return;
    const rect = card.getBoundingClientRect();
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

  /* ---- Card 2: playground ---- */
  const handleBallMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = canvasRef.current;
    const ball = ballRef.current;
    if (!box || !ball || reduced) return;
    const rect = box.getBoundingClientRect();
    gsap.to(ball, {
      x: e.clientX - rect.left - 14,
      y: e.clientY - rect.top - 14,
      duration: 0.4,
      ease: "back.out(2)",
      overwrite: "auto",
    });
  };
  const removeBurst = (id: number) =>
    setBursts((prev) => prev.filter((b) => b.id !== id));

  const spawnBurst = (x: number, y: number, count: number) => {
    const id = Date.now() + Math.random();
    setBursts((prev) => [...prev.slice(-2), { id, x, y, count }]);
  };

  /** Combo + tap counting (shared by tap and charge-burst). */
  const registerTap = () => {
    const now = performance.now();
    setCombo((c) => (now - lastTapAt.current < 500 ? c + 1 : 1));
    lastTapAt.current = now;
    window.clearTimeout(comboTimer.current);
    comboTimer.current = window.setTimeout(() => setCombo(0), 900);
    setTaps((c) => {
      const n = c + 1;
      if (n % 10 === 0) {
        setHint("Deca-tap! ✦");
        window.setTimeout(() => setHint("Tap anywhere ✦"), 2200);
      }
      return n;
    });
  };

  /** Directional squash & stretch of the ball toward the tap point. */
  const squashBall = (x: number, y: number) => {
    const ball = ballRef.current;
    const box = canvasRef.current;
    if (!ball || !box) return;
    const br = ball.getBoundingClientRect();
    const r = box.getBoundingClientRect();
    const ang =
      (Math.atan2(
        r.top + y - (br.top + br.height / 2),
        r.left + x - (br.left + br.width / 2)
      ) *
        180) /
      Math.PI;
    gsap
      .timeline()
      .set(ball, { rotation: ang })
      .to(ball, {
        scaleX: 1.45,
        scaleY: 0.6,
        duration: 0.12,
        ease: "power2.out",
        overwrite: "auto",
      })
      .to(ball, { scaleX: 1, scaleY: 1, duration: 0.55, ease: "back.out(3)" });
  };

  /** Fading motion-trail dots at the ball's position. */
  const spawnTrail = () => {
    const ball = ballRef.current;
    const box = canvasRef.current;
    if (!ball || !box) return;
    const br = ball.getBoundingClientRect();
    const r = box.getBoundingClientRect();
    const id = Date.now() + Math.random();
    const x = br.left + br.width / 2 - r.left;
    const y = br.top + br.height / 2 - r.top;
    setTrails((prev) => [...prev.slice(-5), { id, x, y }]);
    window.setTimeout(() => {
      setTrails((prev) => prev.filter((t) => t.id !== id));
    }, 650);
  };

  /** A standard tap: ripple + burst + squash + trail. */
  const fireTap = (x: number, y: number, big = false) => {
    const id = Date.now() + Math.random();
    if (!reduced) {
      setRipples((prev) => [...prev.slice(-4), { id, x, y }]);
      spawnBurst(x, y, big ? 24 : 12);
      squashBall(x, y);
      spawnTrail();
    }
    registerTap();
  };

  /* Press-and-hold: charge ring grows, ball magnetizes; release fires a
     burst sized by hold time (cap ~1s). Quick taps fall through to fireTap. */
  const onCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const box = canvasRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pressStart.current = { t: performance.now(), x, y };
    if (reduced) return;
    setCharge({ id: Date.now() + Math.random(), x, y });
    const ball = ballRef.current;
    if (ball) {
      gsap.to(ball, {
        x: x - 14,
        y: y - 14,
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  };
  const onCanvasPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const press = pressStart.current;
    pressStart.current = null;
    setCharge(null);
    if (!press) return;
    const box = canvasRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const held = performance.now() - press.t;
    if (held >= 180 && !reduced) {
      const power = Math.min(held / 1000, 1);
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev.slice(-4), { id, x, y }]);
      spawnBurst(x, y, Math.round(12 + power * 12));
      squashBall(x, y);
      gsap.fromTo(
        box,
        { scale: 0.985 },
        { scale: 1, duration: 0.5, ease: "back.out(3)", overwrite: "auto" }
      );
      registerTap();
    } else {
      fireTap(x, y);
    }
  };
  const cancelCharge = () => {
    pressStart.current = null;
    setCharge(null);
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
      // Mentor broadcasts to both nodes, slightly staggered.
      tl.add(hop(1, 0, 0.35));
      tl.add(hop(1, 2, 0.35), "+=0.08");
    } else {
      // Node → mentor → rebroadcast to the other nodes.
      tl.add(hop(from, 1, 0.3));
      [0, 2]
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
                    onClick={(e) => {
                      const b = e.currentTarget;
                      if (!reduced)
                        gsap.fromTo(b, { scale: 0.9 }, { scale: 1, duration: 0.45, ease: "back.out(3)" });
                    }}
                  >
                    Press me
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Press Playground */}
        <div
          className="bento-card span-5 tall"
          ref={(el) => { cardsRef.current[1] = el; }}
          onMouseMove={(e) => { handleMouseMove(e, 1); handleBallMove(e); }}
          onMouseLeave={() => handleMouseLeave(1)}
        >
          <div className="bento-content">
            <div className="bc-top">
              <span className="bento-badge">Spring & Physics</span>
              <h3 className="bc-title">Micro-Interactions</h3>
              <p className="bc-desc">
                Every hover, scroll, and click is an opportunity. Tap — or press and hold.
              </p>
            </div>
            <div className="bc-visual pg-visual">
              <div
                className="playground-canvas"
                ref={canvasRef}
                onPointerDown={onCanvasPointerDown}
                onPointerUp={onCanvasPointerUp}
                onPointerLeave={cancelCharge}
                role="button"
                tabIndex={0}
                aria-label="Interactive canvas. Press Enter to tap, or press and hold for a charge burst."
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    const r = canvasRef.current?.getBoundingClientRect();
                    if (r) fireTap(r.width / 2, r.height / 2);
                  }
                }}
              >
                <div className="pg-counter" aria-live="polite">
                  <span key={taps} className="pg-count-pop">{taps}</span>
                  <span className="pg-count-lbl">taps</span>
                  {combo >= 2 && (
                    <span key={combo} className="pg-combo">×{combo}</span>
                  )}
                </div>
                <div className="pg-ball" ref={ballRef} aria-hidden="true" />
                {trails.map((tr) => (
                  <span key={tr.id} className="trail-wrap" style={{ left: tr.x, top: tr.y }} aria-hidden="true">
                    <span className="trail-dot" />
                    <span className="trail-dot d2" />
                    <span className="trail-dot d3" />
                  </span>
                ))}
                {ripples.map((r) => (
                  <span key={r.id} className="click-ripple" style={{ left: r.x, top: r.y }} />
                ))}
                {charge && (
                  <span key={charge.id} className="charge-ring" style={{ left: charge.x, top: charge.y }} aria-hidden="true" />
                )}
                {bursts.map((b) => (
                  <Burst key={b.id} x={b.x} y={b.y} count={b.count} onDone={() => removeBurst(b.id)} />
                ))}
                <div className="pg-hint">{hint}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Mentorship network */}
        <div
          className="bento-card span-3"
          ref={(el) => { cardsRef.current[2] = el; }}
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
                  { label: "Community", cls: "n3" },
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
                  <line x1="25%" y1="65%" x2="50%" y2="35%" className={`animated-path ${lineFlash ? "flash" : ""}`} />
                  <line x1="50%" y1="35%" x2="75%" y2="65%" className={`animated-path delay ${lineFlash ? "flash" : ""}`} />
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
