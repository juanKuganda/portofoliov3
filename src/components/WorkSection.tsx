import { useRef, useState } from "react";
import { useFitText } from "../hooks/useFitText";
import { projects } from "../data/projects";
import ProjectAccordion from "./ProjectAccordion";

export default function WorkSection() {
  const fitRef = useRef<HTMLHeadingElement>(null);
  useFitText(fitRef);

  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="block" id="work" aria-label="Selected work">
      <h2 className="fit sec-fit" ref={fitRef}>
        SELECTED WORK
      </h2>
      <div className="sec-sub rv">
        <span>Index of projects</span>
        <span>2024 – 2026 · 04</span>
      </div>

      {projects.map((proj) => (
        <ProjectAccordion
          key={proj.id}
          project={proj}
          isOpen={openId === proj.id}
          onToggle={() => handleToggle(proj.id)}
        />
      ))}
    </section>
  );
}
