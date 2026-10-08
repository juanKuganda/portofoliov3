import { useLayoutEffect, useEffect, useRef } from "react";
import gsap from "gsap";

const endpoints = [
  {
    method: "GET",
    cls: "get",
    url: "/api/v1/projects",
    lat: "12ms",
    status: "200 OK",
  },
  {
    method: "POST",
    cls: "post",
    url: "/api/v1/auth/session",
    lat: "48ms",
    status: "201 Created",
  },
  {
    method: "GET",
    cls: "get",
    url: "/api/v1/diplomas/verify",
    lat: "9ms",
    status: "200 OK",
  },
];

// API console: requests RACE through the endpoint rows one after another —
// a glowing packet sweeps each row as it "fires", then the status pill
// pops with a big spring. Rows enter with a stagger + drift each loop,
// and the avg-latency ticker jitters 18–28ms per loop. Loops gently;
// pauses off-screen; fully static under reduced motion.
export default function BackendVisual({ active = true }: { active?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const reducedRef = useRef(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    reducedRef.current = reduced;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const avgEl = root.querySelector<HTMLElement>(".bar-right");
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.0,
        defaults: { ease: "power2.out" },
        paused: true,
      });

      // Latency ticker jitters every loop; rows drift in staggered.
      tl.call(
        () => {
          if (avgEl)
            avgEl.textContent = `avg ${gsap.utils.random(18, 28, 1)}ms`;
        },
        undefined,
        0,
      ).fromTo(
        ".sv-api-row",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.12 },
        0.05,
      );

      const rows = gsap.utils.toArray<HTMLElement>(".sv-api-row");
      const rowW = rows[0]?.offsetWidth || 300;
      rows.forEach((row, i) => {
        const glow = row.querySelector(".row-glow");
        const pill = row.querySelector(".status-pill");
        const packet = row.querySelector(".packet");
        const at = 0.55 + i * 0.75;
        // Packet sweep: the shot racing left → right down the row.
        // immediateRender false — packets stay hidden until fired.
        tl.fromTo(
          packet,
          { x: 0, yPercent: -50, opacity: 1 },
          {
            x: rowW - 20,
            duration: 0.5,
            ease: "power2.in",
            immediateRender: false,
          },
          at,
        )
          .to(packet, { opacity: 0, duration: 0.12 }, at + 0.5)
          .fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 0.3 }, at + 0.35)
          .fromTo(
            pill,
            { scale: 0.6 },
            { scale: 1, duration: 0.5, ease: "back.out(3.5)" },
            at + 0.45,
          )
          .to(glow, { opacity: 0, duration: 0.45 }, at + 0.9);
      });

      // Rows bow out before the next batch races in.
      tl.to(
        ".sv-api-row",
        { opacity: 0, y: -10, duration: 0.35, stagger: 0.08 },
        "+=0.8",
      );

      tlRef.current = tl;
    }, root);

    return () => {
      ctx.revert();
      tlRef.current = null;
    };
  }, []);
  // Play/pause is driven by the parent's `active` prop — NOT by a geometric
  // ScrollTrigger gate. The old gate broke under sticky stacking: a covered
  // card never left the viewport band, so its infinite loop kept running.
  useEffect(() => {
    if (reducedRef.current) return;
    const tl = tlRef.current;
    if (!tl) return;
    if (active) tl.play();
    else tl.pause();
  }, [active]);

  return (
    <div className="sv-stage" ref={rootRef} aria-hidden="true">
      <div className="sv-stage-bar">
        <span>● api · production</span>
        <span className="bar-right">avg 23ms</span>
      </div>
      <div className="sv-stage-body">
        <div className="sv-api-rows">
          {endpoints.map((ep) => (
            <div className="sv-api-row" key={ep.url}>
              <span className="row-glow"></span>
              <span
                className="packet"
                style={{
                  position: "absolute",
                  left: 6,
                  top: "50%",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#f59e0b",
                  boxShadow: "0 0 10px 2px rgba(245,158,11,0.8)",
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />
              <span className={`http-badge ${ep.cls}`}>{ep.method}</span>
              <span className="url">{ep.url}</span>
              <span className="lat">{ep.lat}</span>
              <span className="status-pill">{ep.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
