import { useLayoutEffect, useEffect, useRef } from "react";
import gsap from "gsap";

const PROMPT = "build a landing page with a signup form";
const STEPS = [
  { label: "Plan", time: "0:12" },
  { label: "Code", time: "1:38" },
  { label: "Test", time: "0:24" },
];

// AI agent session as a loop: a prompt types in, the agent's checklist
// ticks Plan → Code → Test, a mini page assembles beside it, then a
// green "shipped" pill stamps with the brief-to-live time. The default
// DOM is the completed frame, so reduced motion (and any JS failure)
// still shows the finished state. transform/opacity only.
export default function AgentVisual({ active = true }: { active?: boolean }) {
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
      const textEl = root.querySelector(".ag-prompt-text") as HTMLElement;
      const steps = gsap.utils.toArray<HTMLElement>(".ag-step");
      const blocks = gsap.utils.toArray<HTMLElement>(".ag-block");
      const counter = { n: 0 };

      const reset = () => {
        counter.n = 0;
        if (textEl) textEl.textContent = "";
        steps.forEach((s) => s.classList.remove("done"));
        gsap.set(blocks, { opacity: 0, scaleY: 0.4 });
        gsap.set(".ag-shipped", { scale: 0, opacity: 0 });
        gsap.set(".ag-stat", { opacity: 0, y: 6 });
      };

      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 1.6,
        paused: true,
      });

      tl.call(reset)
        // Prompt types in, character by character.
        .to(counter, {
          n: PROMPT.length,
          duration: 1.5,
          ease: "none",
          onUpdate: () => {
            if (textEl)
              textEl.textContent = PROMPT.slice(0, Math.round(counter.n));
          },
        })
        .to({}, { duration: 0.3 });

      // Checklist ticks one by one.
      STEPS.forEach((_, i) => {
        tl.call(
          () => steps[i]?.classList.add("done"),
          undefined,
          `>`,
        ).to({}, { duration: i === 1 ? 1.0 : 0.55 });
      });

      // Preview assembles, then the shipped stamp + stat land.
      tl.fromTo(
        blocks,
        { opacity: 0, scaleY: 0.4 },
        { opacity: 1, scaleY: 1, duration: 0.45, stagger: 0.09, ease: "power2.out" },
        ">-0.2",
      )
        .fromTo(
          ".ag-shipped",
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(3)" },
          ">+0.15",
        )
        .to(".ag-stat", { opacity: 1, y: 0, duration: 0.4 }, ">+0.1")
        .to({}, { duration: 1.5 });

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
        <span>● agent · session</span>
        <span className="bar-right">prompt → shipped</span>
      </div>
      <div className="sv-stage-body">
        <div className="ag-wrap">
          <div className="ag-left">
            <div className="ag-prompt">
              <span className="ag-prompt-arrow">&gt;</span>{" "}
              <span className="ag-prompt-text">{PROMPT}</span>
              <span className="ag-caret" />
            </div>
            <div className="ag-steps">
              {STEPS.map((s) => (
                <div key={s.label} className="ag-step done">
                  <span className="ag-step-ico">✓</span>
                  <span className="ag-step-label">{s.label}</span>
                  <span className="ag-step-time">{s.time}</span>
                </div>
              ))}
            </div>
            <p className="ag-stat">2h 14m · brief to live</p>
          </div>
          <div className="ag-right">
            <div className="ag-preview">
              <span className="ag-block ag-block-nav" />
              <span className="ag-block ag-block-hero" />
              <span className="ag-block ag-block-line" />
              <span className="ag-block ag-block-line short" />
              <span className="ag-block ag-block-btn" />
            </div>
            <span className="ag-shipped">shipped ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
