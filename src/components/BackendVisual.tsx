import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const endpoints = [
  { method: "GET", cls: "get", url: "/api/v1/projects", lat: "12ms", status: "200 OK" },
  { method: "POST", cls: "post", url: "/api/v1/auth/session", lat: "48ms", status: "201 Created" },
  { method: "GET", cls: "get", url: "/api/v1/diplomas/verify", lat: "9ms", status: "200 OK" },
];

// API console: requests sweep through the endpoint rows one after another —
// each row glows as its status pill pops. Loops gently; pauses off-screen;
// fully static under reduced motion.
export default function BackendVisual() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
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
        tl.fromTo(
          glow,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 },
          at
        )
          .fromTo(
            pill,
            { scale: 0.85 },
            { scale: 1, duration: 0.4, ease: "back.out(2.5)" },
            at + 0.1
          )
          .to(glow, { opacity: 0, duration: 0.45 }, at + 0.45);
      });

      ScrollTrigger.create({
        trigger: root,
        start: "top 88%",
        end: "bottom 12%",
        onEnter: () => tl.play(),
        onLeave: () => tl.pause(),
        onEnterBack: () => tl.play(),
        onLeaveBack: () => tl.pause(),
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, []);

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
