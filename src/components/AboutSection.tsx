import { useEffect, useRef } from "react";
import { useFitText } from "../hooks/useFitText";
import MagneticText from "./MagneticText";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const fitRef = useRef<HTMLHeadingElement>(null);
  const statementRef = useRef<HTMLParagraphElement>(null);
  useFitText(fitRef);

  // Text-fill-on-scroll: the statement fills word by word as you scroll —
  // the editorial signature. Opacity only, scrubbed. Static if reduced motion.
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;
    const el = statementRef.current;
    if (!el) return;

    // Split into word spans, preserving the .dim / .cw-* styling.
    const frags: { text: string; cls: string }[] = [];
    el.childNodes.forEach((node) => {
      const words = (node.textContent || "").split(/\s+/).filter(Boolean);
      let cls = "";
      if (node.nodeType === Node.ELEMENT_NODE) {
        const cl = (node as HTMLElement).classList;
        if (cl.contains("dim")) cls = " dim";
        else {
          const cw = Array.from(cl).find((c) => c.startsWith("cw-"));
          if (cw) cls = " " + cw;
        }
      }
      words.forEach((w) => frags.push({ text: w, cls }));
    });
    el.innerHTML = "";
    frags.forEach((f) => {
      const s = document.createElement("span");
      s.className = "w" + f.cls;
      s.textContent = f.text;
      el.appendChild(s);
      el.appendChild(document.createTextNode(" "));
    });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll(".w"),
        { opacity: 0.13 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            end: "top 32%",
            scrub: 0.5,
          },
        }
      );
    });
    return () => {
      ctx.revert();
    };
  }, []);

  const stackItems = [
    "TypeScript",
    "React",
    "Next.js",
    "Tailwind CSS",
    "Figma",
    "Node.js",
    "Laravel",
    "Framer",
  ];

  return (
    <section className="block theme-dark" id="about" aria-label="About">
      <MagneticText
        intensity={0.08}
        style={{ display: "block", width: "100%" }}
      >
        <h2 className="fit sec-fit" ref={fitRef}>
          ABOUT
        </h2>
      </MagneticText>
      <div className="sec-sub rv">
        <span>The short version</span>
        <span>Palu, ID · WITA</span>
      </div>
      <p className="about-statement" ref={statementRef}>
        <span className="cw-pink">Engineer,</span>{" "}
        <span className="cw-blue">design,</span> <span className="cw-green">people</span>{" "}
        — <span className="dim">in that order, most days.</span>
      </p>
      <div className="about-grid">
        <div className="rv rv-left">
          <p>
            I&rsquo;m <strong>Juan Kuganda</strong>, an informatics undergrad at{" "}
            <strong>Universitas Tadulako</strong> (class of 2027, GPA 3.89)
            working at the intersection of development and design. I build
            interfaces people understand at a glance — engineered clean,
            designed with intent.
          </p>
          <p>
            Outside of code, I mentor web development across Palu&rsquo;s dev
            communities and chair Palu Dev. I care about software that is
            legible — in its interface, its architecture, and its intent.
          </p>
        </div>
        <div className="rv rv-right rv-d1">
          <p>
            Based in <strong>Palu, Indonesia</strong> (WITA) - happy on-site or
            hybrid locally, remote anywhere.
          </p>
          <div className="about-stack-wrap">
            <span className="stack-heading">Core Stack &amp; Tools:</span>
            <div className="stack-pills">
              {stackItems.map((item, i) => (
                <MagneticText key={item} intensity={0.2}>
                  <span className={`stack-pill sp-${i % 4}`}>{item}</span>
                </MagneticText>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="status-strip rv">
        <MagneticText intensity={0.15}>
          <span className="ss-label">Currently</span>
        </MagneticText>
        <MagneticText intensity={0.25} style={{ display: "inline-block" }}>
          <span className="ss-text hover-glow-text">
            Open for freelance, internships &amp; collaborations
          </span>
        </MagneticText>
      </div>
      <div className="resume-block rv">
        <div className="resume-label">
          <span className="mono">[ Experience ]</span>
        </div>
        <div>
          <div className="resume-row">
            <div>
              <div className="r-title">Software Developer Intern</div>
              <div className="r-sub">
                PT Bank Sulteng &middot; SIASTI asset dashboard
              </div>
            </div>
            <div className="r-date">Sep &ndash; Dec 2025</div>
          </div>
          <div className="resume-row">
            <div>
              <div className="r-title">Web Mentor</div>
              <div className="r-sub">
                Programming Tadulako &middot; HammerCode
              </div>
            </div>
            <div className="r-date">Jan 2025 &ndash;</div>
          </div>
          <div className="resume-row">
            <div>
              <div className="r-title">Front-End Developer</div>
              <div className="r-sub">HMTI UNTAD</div>
            </div>
            <div className="r-date">Jun 2024 &ndash;</div>
          </div>
        </div>
      </div>
      <div className="resume-block rv">
        <div className="resume-label">
          <span className="mono">[ Education ]</span>
        </div>
        <div>
          <div className="resume-row">
            <div>
              <div className="r-title">B.Sc. Informatics</div>
              <div className="r-sub">Universitas Tadulako · GPA 3.89</div>
            </div>
            <div className="r-date">2023 – 2027</div>
          </div>
        </div>
      </div>
    </section>
  );
}
