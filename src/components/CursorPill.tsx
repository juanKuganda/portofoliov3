import { useEffect, useRef, useState } from "react";

/**
 * Custom cursor pill that follows the mouse with lerp smoothing.
 * Shows "Open"/"Close" on project accordion hover.
 * Hidden on touch devices and when reduced motion is preferred.
 */
export default function CursorPill() {
  const pillRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("Open");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!finePointer || reduced) return;

    const pill = pillRef.current;
    if (!pill) return;

    let pillX = 0,
      pillY = 0,
      pillTX = 0,
      pillTY = 0;
    let isActive = false;
    let animId: number;

    const projHeads = document.querySelectorAll<HTMLElement>(".proj-head");

    const handleEnter = (btn: HTMLElement) => {
      isActive = true;
      setLabel(
        btn.getAttribute("aria-expanded") === "true" ? "Close" : "Open"
      );
      setVisible(true);
    };

    const handleLeave = () => {
      isActive = false;
      setVisible(false);
    };

    // Track clicks to update label
    const handleClick = (btn: HTMLElement) => {
      if (!isActive) return;
      // After React re-renders, the aria-expanded will have toggled
      requestAnimationFrame(() => {
        setLabel(
          btn.getAttribute("aria-expanded") === "true" ? "Close" : "Open"
        );
      });
    };

    const enterHandlers: Array<() => void> = [];
    const leaveHandlers: Array<() => void> = [];
    const clickHandlers: Array<() => void> = [];

    projHeads.forEach((btn) => {
      const onEnter = () => handleEnter(btn);
      const onLeave = () => handleLeave();
      const onClick = () => handleClick(btn);
      btn.addEventListener("mouseenter", onEnter);
      btn.addEventListener("mouseleave", onLeave);
      btn.addEventListener("click", onClick);
      enterHandlers.push(onEnter);
      leaveHandlers.push(onLeave);
      clickHandlers.push(onClick);
    });

    const handleMouseMove = (e: MouseEvent) => {
      pillTX = e.clientX;
      pillTY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    function loop() {
      pillX += (pillTX - pillX) * 0.2;
      pillY += (pillTY - pillY) * 0.2;
      if (pill) {
        pill.style.left = `${pillX}px`;
        pill.style.top = `${pillY}px`;
      }
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      projHeads.forEach((btn, i) => {
        btn.removeEventListener("mouseenter", enterHandlers[i]);
        btn.removeEventListener("mouseleave", leaveHandlers[i]);
        btn.removeEventListener("click", clickHandlers[i]);
      });
    };
  }, []);

  return (
    <div
      ref={pillRef}
      className={`cursor-pill${visible ? " show" : ""}`}
      aria-hidden="true"
    >
      {label}
    </div>
  );
}
