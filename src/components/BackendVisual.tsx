import { useLayoutEffect, useEffect, useRef } from "react";
import gsap from "gsap";

const GATES = [
  { label: "client", sub: "POST /login" },
  { label: "auth", sub: "verify jwt" },
  { label: "api", sub: "router" },
  { label: "db", sub: "query" },
];

// Backend as a request pipeline: a glowing packet travels left → right
// through client → auth → api → db, each gate lighting up as it passes,
// then races back — and a "200 OK" pill pops at the client. Loops;
// pauses off-screen; fully static under reduced motion.
// transform/opacity only (+ class toggles with CSS transitions).
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
      const packet = ".pl-packet";
      const gates = gsap.utils.toArray<HTMLElement>(".pl-gate");

      const stopX = (i: number) => {
        const track = root.querySelector(".pl-track") as HTMLElement;
        const g = gates[i];
        if (!track || !g) return 0;
        const tr = track.getBoundingClientRect();
        const gr = g.getBoundingClientRect();
        return gr.left + gr.width / 2 - tr.left;
      };

      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.4,
        paused: true,
      });

      tl.call(() => {
        gates.forEach((g) => g.classList.remove("lit"));
        gsap.set(packet, { x: 0, opacity: 0, scale: 1 });
        gsap.set(".pl-ok", { scale: 0, opacity: 0 });
      })
        .to(packet, { opacity: 1, duration: 0.2 }, 0.2);

      // Outbound: light each gate as the packet passes.
      GATES.forEach((_, i) => {
        const at = 0.35 + i * 0.5;
        tl.to(packet, {
          x: () => stopX(i),
          duration: 0.45,
          ease: "power2.inOut",
        }, at)
          .call(() => gates[i]?.classList.add("lit"), undefined, at + 0.4);
      });

      // Inbound: packet races back, then 200 OK pops.
      const backAt = 0.35 + GATES.length * 0.5 + 0.15;
      tl.to(packet, {
        x: () => stopX(0),
        duration: 0.6,
        ease: "power2.in",
      }, backAt)
        .to(packet, { opacity: 0, scale: 0.4, duration: 0.15 }, backAt + 0.6)
        .fromTo(
          ".pl-ok",
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(3)" },
          backAt + 0.65,
        )
        .to({}, { duration: 0.9 })
        .to(".pl-ok", { opacity: 0, scale: 0.6, duration: 0.25 }, "+=0.1")
        .call(() => gates.forEach((g) => g.classList.remove("lit")));

      tlRef.current = tl;
    }, root);

    return () => {
      ctx.revert();
      tlRef.current = null;
    };
  }, []);

  // Play/pause is driven by the parent's `active` prop.
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
        <span>● pipeline · production</span>
        <span className="bar-right">request lifecycle</span>
      </div>
      <div className="sv-stage-body pl-body">
        <div className="pl-track">
          <span className="pl-line" />
          {GATES.map((g, i) => (
            <div key={g.label} className="pl-gate" data-i={i}>
              <span className="pl-gate-dot" />
              <span className="pl-gate-label">{g.label}</span>
              <span className="pl-gate-sub">{g.sub}</span>
            </div>
          ))}
          <span className="pl-packet" />
          <span className="pl-ok">200 OK</span>
        </div>
      </div>
    </div>
  );
}
