import { useRef } from "react";
import { useFitText } from "../hooks/useFitText";
import ServiceCard from "./ServiceCard";
import type { ServiceData } from "./ServiceCard";

const services: ServiceData[] = [
  {
    tabName: "01_web_development.folder",
    visualClass: "gv-1",
    name: "Web Development",
    description:
      "Interfaces, dashboards, and interactive web apps. Built clean, responsive, and fast.",
    tags: "React · Next.js · TypeScript · Tailwind",
    ghost: "01",
  },
  {
    tabName: "02_ui_ux_design.folder",
    visualClass: "gv-2",
    name: "UI / UX Design",
    description:
      "Layouts and user flows people understand at a glance. From wireframes to design systems.",
    tags: "Figma · Design Systems · Micro-interactions",
    ghost: "02",
  },
  {
    tabName: "03_backend_architecture.folder",
    visualClass: "gv-3",
    name: "Backend Architecture",
    description:
      "RESTful APIs, authentication systems, and database structures built to scale reliably.",
    tags: "Node.js · Laravel · PostgreSQL · REST APIs",
    ghost: "03",
  },
  {
    tabName: "04_mentorship_community.folder",
    visualClass: "gv-4",
    name: "Mentorship & Community",
    description:
      "Empowering local developer talent, hosting tech workshops, and leading Palu Dev.",
    tags: "Palu Dev · Code Workshops · Community Leadership",
    ghost: "04",
  },
];

export default function ServicesSection() {
  const fitRef = useRef<HTMLHeadingElement>(null);
  useFitText(fitRef);

  return (
    <section
      className="block"
      id="services"
      aria-label="Services"
      style={{ paddingLeft: 0, paddingRight: 0 }}
    >
      <div style={{ padding: "0 var(--pad)" }}>
        <h2 className="fit sec-fit" ref={fitRef}>
          SERVICES
        </h2>
        <div className="sec-sub rv">
          <span>04 files</span>
          <span>Scroll · they stack</span>
        </div>
      </div>
      <div className="svc-deck">
        {services.map((svc, i) => (
          <ServiceCard key={svc.ghost} service={svc} index={i} />
        ))}
      </div>
    </section>
  );
}
