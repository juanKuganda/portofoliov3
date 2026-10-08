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

// API console: requests sweep through the endpoint rows one after another -
// each row glows as its status pill pops. Loops gently; pauses off-screen;
// fully static under reduced motion.
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
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.4,
        defaults: { ease: "power2.out" },
        paused: true,
      });

      const rows = gsap.utils.toArray<HTMLElement>(".sv-api-row");
      rows.forEach((row, i) => {
        const glow = row.querySelector(".row-glow");
        const pill = row.querySelector(".status-pill");
        const at = i * 0.75;
        tl.fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 0.3 }, at)
          .fromTo(
            pill,
            { scale: 0.85 },
            { scale: 1, duration: 0.4, ease: "back.out(2.5)" },
            at + 0.1,
          )
          .to(glow, { opacity: 0, duration: 0.45 }, at + 0.45);
      });

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
