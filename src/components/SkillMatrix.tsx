const TECH_STACK = [
  "Next.js 15",
  "React 19",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "JavaScript ES6+",
  "GSAP Motion",
  "Figma",
  "Web3",
  "Git",
];

export default function SkillMatrix() {
  return (
    <div className="about-tech-stack" aria-label="Tech Stack">
      {TECH_STACK.map((tech) => (
        <span key={tech} className="tech-badge">
          {tech}
        </span>
      ))}
    </div>
  );
}
