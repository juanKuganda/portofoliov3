import { useLayoutEffect, useEffect, useRef } from "react";
import gsap from "gsap";

const CENTER = { x: 0.5, y: 0.54 };
const SATS = [
  { x: 0.2, y: 0.3, label: "A", msg: "makasih!" },
  { x: 0.8, y: 0.28, label: "R", msg: "got the job!" },
  { x: 0.18, y: 0.78, label: "D", msg: "shipped it!" },
  { x: 0.82, y: 0.76, label: "S", msg: "lulus!" },
];

// Mentorship as a living signal-relay network: Juan (center node) fires
// pulses to mentee satellites; each arrival pops a chat bubble and ticks
// the relay counter. Playful, people-first. Loops; pauses off-screen;
// fully static under reduced motion. transform/opacity (+ SVG attrs) only.
export default function CommunityVisual({
  active = true,
}: {
  active?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const reducedRef = useRef(false);
  const totalRef = useRef(0);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    reducedRef.current = reduced;
    if (reduced) return;

    const svg = root.querySelector(".cm-svg") as SVGSVGElement;
    const body = root.querySelector(".cm-body") as HTMLElement;
    const countEl = root.querySelector(".cm-count") as HTMLElement;
    // Live pixel coords (SVG user units); refreshed on resize.
    const coords = { w: 300, h: 200 };
    const P = (fx: number, fy: number) => ({
      x: fx * coords.w,
      y: fy * coords.h,
    });

    const layout = () => {
      const r = body.getBoundingClientRect();
      coords.w = Math.max(1, r.width);
      coords.h = Math.max(1, r.height);
      svg.setAttribute("viewBox", `0 0 ${coords.w} ${coords.h}`);
      const c = P(CENTER.x, CENTER.y);
      gsap.set(root.querySelector('.cm-node[data-i="c"]'), { x: c.x, y: c.y });
      SATS.forEach((s, i) => {
        const p = P(s.x, s.y);
        gsap.set(root.querySelector(`.cm-node[data-i="${i}"]`), {
          x: p.x,
          y: p.y,
        });
        const link = root.querySelector(
          `.cm-link[data-i="${i}"]`,
        ) as SVGLineElement;
        link.setAttribute("x1", String(c.x));
        link.setAttribute("y1", String(c.y));
        link.setAttribute("x2", String(p.x));
        link.setAttribute("y2", String(p.y));
      });
    };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.6,
        paused: true,
      });

      const reset = () => {
        gsap.set(".cm-node", { scale: 0, opacity: 0 });
        gsap.set(".cm-link", { opacity: 0 });
        gsap.set(".cm-pulse", { opacity: 0 });
        gsap.set(".cm-bubble", { scale: 0, opacity: 0 });
      };

      tl.call(reset)
        // Nodes pop in, center first.
        .to(".cm-node", {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(2)",
          stagger: 0.1,
        })
        .to(".cm-link", { opacity: 1, duration: 0.4, stagger: 0.08 }, "-=0.35");

      // Pulses fly center → satellite; each arrival ticks the counter.
      SATS.forEach((s, i) => {
        const at = 1.15 + i * 0.24;
        tl.fromTo(
          `.cm-pulse[data-i="${i}"]`,
          {
            opacity: 1,
            attr: {
              cx: () => P(CENTER.x, CENTER.y).x,
              cy: () => P(CENTER.x, CENTER.y).y,
            },
          },
          {
            attr: { cx: () => P(s.x, s.y).x, cy: () => P(s.x, s.y).y },
            duration: 0.65,
            ease: "power2.in",
          },
          at,
        )
          .to(`.cm-pulse[data-i="${i}"]`, { opacity: 0, duration: 0.18 }, at + 0.65)
          .call(
            () => {
              totalRef.current += 1;
              if (countEl)
                countEl.textContent = String(totalRef.current).padStart(3, "0");
            },
            undefined,
            at + 0.65,
          );
      });

      // Mentees reply — chat bubbles pop.
      tl.fromTo(
        ".cm-bubble",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.45,
          ease: "back.out(2.5)",
          stagger: 0.16,
        },
        1.6,
      )
        .to({}, { duration: 1.5 })
        .to(".cm-bubble", {
          scale: 0,
          opacity: 0,
          duration: 0.3,
          stagger: 0.06,
        })
        .to(".cm-node", { scale: 0, opacity: 0, duration: 0.3, stagger: 0.05 }, "<")
        .to(".cm-link", { opacity: 0, duration: 0.3 }, "<");

      tlRef.current = tl;

      // Initial hidden state (before first play) + correct geometry.
      layout();
      reset();
    }, root);

    const ro = new ResizeObserver(layout);
    ro.observe(body);

    return () => {
      ro.disconnect();
      ctx.revert();
      tlRef.current = null;
    };
  }, []);

  // Play/pause driven by the parent's `active` prop.
  useEffect(() => {
    if (reducedRef.current) return;
    const tl = tlRef.current;
    if (!tl) return;
    if (active) tl.play(0);
    else tl.pause();
  }, [active]);

  return (
    <div className="sv-stage" ref={rootRef} aria-hidden="true">
      <div className="sv-stage-bar">
        <span>◐ community · palu-dev</span>
        <span className="bar-right">signal relay · live</span>
      </div>
      <div className="sv-stage-body cm-body">
        <svg className="cm-svg" aria-hidden="true">
          {SATS.map((_, i) => (
            <line
              key={`l${i}`}
              className="cm-link"
              data-i={i}
              x1={0}
              y1={0}
              x2={0}
              y2={0}
            />
          ))}
          {SATS.map((_, i) => (
            <circle
              key={`p${i}`}
              className="cm-pulse"
              data-i={i}
              r={5}
              cx={-20}
              cy={-20}
            />
          ))}
          <g className="cm-node cm-center" data-i="c">
            <circle r={22} />
            <text>J</text>
          </g>
          {SATS.map((s, i) => (
            <g key={`n${i}`} className="cm-node" data-i={i}>
              <circle r={16} />
              <text>{s.label}</text>
            </g>
          ))}
        </svg>
        {SATS.map((s, i) => (
          <span
            key={`b${i}`}
            className="cm-bubble-pos"
            style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%` }}
          >
            <span className="cm-bubble">{s.msg}</span>
          </span>
        ))}
        <div className="cm-counter">
          <span className="cm-count">000</span> signals relayed
        </div>
      </div>
    </div>
  );
}
