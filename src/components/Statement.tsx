import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HeadlineWordItem {
  type: "word";
  text: string;
}
interface HeadlineChipItem {
  type: "chip";
  src: string;
  alt: string;
}
type HeadlineItem = HeadlineWordItem | HeadlineChipItem;

const HEADLINE_LINES: Array<{ words: HeadlineItem[] }> = [
  {
    words: [
      { type: "word", text: "I" },
      { type: "word", text: "build" },
      { type: "chip", src: "/hero-portrait.webp", alt: "Juan portrait" },
      { type: "word", text: "interfaces" },
    ],
  },
  {
    words: [
      { type: "word", text: "for" },
      { type: "word", text: "the" },
      { type: "word", text: "web" },
      { type: "word", text: "—" },
    ],
  },
  {
    words: [
      { type: "word", text: "dashboards," },
      { type: "chip", src: "/hero-portrait.webp", alt: "Juan in blazer" },
      { type: "word", text: "design" },
    ],
  },
  {
    words: [
      { type: "word", text: "systems," },
      { type: "word", text: "and" },
      { type: "word", text: "interactive" },
    ],
  },
  {
    words: [
      { type: "word", text: "digital" },
      { type: "word", text: "products." },
    ],
  },
];

const PATHS_DESKTOP = {
  viewBox: "0 0 1440 900",
  pink: "M 1480,130 C 1000,130 500,135 240,140 C 90,145 90,290 220,330 C 500,410 950,470 1240,510 C 1370,530 1370,650 1240,690 C 950,730 500,750 240,770 C 90,785 90,875 240,875 C 600,875 1100,860 1520,860",
  blue: "M -60,780 C 120,780 180,240 360,200 C 520,160 680,220 720,360 C 760,520 840,760 1020,760 C 1200,760 1380,500 1520,240",
  green: "M -60,80 C 140,80 120,540 140,740 C 160,840 320,840 480,800 C 700,740 880,320 1080,280 C 1240,240 1380,480 1520,700",
  purple: "M 1520,800 C 1260,800 1040,620 820,440 C 620,280 440,180 260,240 C 100,280 120,480 240,560 C 360,640 180,820 -60,640",
  arrowD: "M -16,-7 L 6,0 L -16,7 L -11,0 Z",
  strokeWidth: 1.5,
};

const PATHS_MOBILE = {
  viewBox: "0 0 420 860",
  pink: "M 450,110 C 320,110 180,115 80,120 C 20,125 15,220 70,250 C 160,290 310,330 365,370 C 415,410 415,490 365,530 C 290,580 160,620 70,665 C 15,700 20,780 80,800 C 180,820 320,825 450,825",
  blue: "M -30,780 C 60,770 70,520 90,400 C 110,240 180,150 260,155 C 330,160 375,220 360,310 C 340,440 280,600 340,730 C 380,800 410,840 450,860",
  green: "M -30,80 C 50,90 35,320 45,510 C 55,660 110,770 200,795 C 290,820 375,790 395,680 C 410,590 415,460 450,380",
  purple: "M 450,70 C 360,95 270,180 190,280 C 110,380 65,490 100,580 C 150,670 270,720 340,755 C 400,785 410,830 390,880",
  arrowD: "M -10,-4.5 L 3.5,0 L -10,4.5 L -7,0 Z",
  strokeWidth: 1.2,
};

export default function Statement() {
  const rootRef = useRef<HTMLElement>(null);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile((prev) => (prev !== mobile ? mobile : prev));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const config = isMobile ? PATHS_MOBILE : PATHS_DESKTOP;

  // 4 Asymmetric Lines
  const pathPinkRef = useRef<SVGPathElement>(null);
  const pathBlueRef = useRef<SVGPathElement>(null);
  const pathGreenRef = useRef<SVGPathElement>(null);
  const pathPurpleRef = useRef<SVGPathElement>(null);

  // Directional Arrowheads
  const arrowPinkRef = useRef<SVGGElement>(null);
  const arrowBlueRef = useRef<SVGGElement>(null);
  const arrowGreenRef = useRef<SVGGElement>(null);
  const arrowPurpleRef = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      const paths = [
        pathPinkRef.current,
        pathBlueRef.current,
        pathGreenRef.current,
        pathPurpleRef.current,
      ].filter(Boolean) as SVGPathElement[];

      const arrows = [
        arrowPinkRef.current,
        arrowBlueRef.current,
        arrowGreenRef.current,
        arrowPurpleRef.current,
      ];

      const lengths = paths.map((p) => p.getTotalLength());

      if (reduced) {
        gsap.set(".st-char", { color: "#111318", opacity: 1 });
        gsap.set(".st-chip", { filter: "grayscale(0%) opacity(1)" });
        paths.forEach((p) => gsap.set(p, { strokeDasharray: "none", strokeDashoffset: 0 }));
        return;
      }

      // Initialize all 4 lines
      paths.forEach((p, idx) => {
        gsap.set(p, {
          strokeDasharray: lengths[idx],
          strokeDashoffset: lengths[idx],
        });
      });

      // Initialize arrowheads
      arrows.forEach((arr, idx) => {
        if (arr && paths[idx]) {
          const pt = paths[idx].getPointAtLength(0);
          arr.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
          arr.style.opacity = "0";
        }
      });

      const flowElements = gsap.utils.toArray<HTMLElement>(".st-char, .st-chip");
      const totalElements = flowElements.length;

      // Master Pinned Scroll Timeline (duration normalized to 1.0)
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          pin: true,
          start: "top top",
          end: "+=1700",
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;

            // Update all 4 arrowheads to follow the head of each line smoothly
            paths.forEach((path, idx) => {
              const arrow = arrows[idx];
              if (!arrow) return;
              const len = lengths[idx];
              const curLen = p * len;
              const pt = path.getPointAtLength(Math.min(len, Math.max(0, curLen)));
              const delta = isMobile ? 2 : 4;
              const ptAhead = path.getPointAtLength(Math.min(len, curLen + delta));
              const angle = Math.atan2(ptAhead.y - pt.y, ptAhead.x - pt.x) * (180 / Math.PI);

              arrow.setAttribute(
                "transform",
                `translate(${pt.x}, ${pt.y}) rotate(${angle})`
              );
              arrow.style.opacity = p > 0.008 && p < 0.995 ? "1" : "0";
            });
          },
        },
      });

      // 1. Draw all 4 lines across the timeline (duration: 1.0)
      masterTl.to(
        paths,
        {
          strokeDashoffset: 0,
          ease: "none",
          duration: 1.0,
        },
        0
      );

      // 2. Text Character Reveal synchronized 1:1 across scroll
      const charAnimDuration = 0.04;
      const charStagger = (1.0 - charAnimDuration) / Math.max(1, totalElements - 1);

      masterTl.fromTo(
        flowElements,
        {
          color: "rgba(17, 19, 24, 0.12)",
          opacity: 0.22,
        },
        {
          color: "#111318",
          opacity: 1,
          stagger: charStagger,
          ease: "none",
          duration: charAnimDuration,
        },
        0
      );

      // 3. Photo chips bloom
      masterTl.fromTo(
        ".st-chip",
        {
          filter: "grayscale(100%) opacity(0.35)",
          scale: 0.9,
        },
        {
          filter: "grayscale(0%) opacity(1)",
          scale: 1,
          stagger: 0.2,
          ease: "power2.out",
          duration: 0.35,
        },
        0.2
      );

      // Recalculate all page trigger points after layout is pinned with new paths
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, [isMobile]);

  return (
    <section className="statement" aria-label="What I do" ref={rootRef}>
      {/* 4 Distinct Asymmetric Vector Lines (Behind text) */}
      <div className="st-vector-canvas" aria-hidden="true">
        <svg
          viewBox={config.viewBox}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="st-spline-svg"
        >
          {/* TRACK 1 (PINK): Continuous Horizontal Zigzag Ribbon directly from user reference */}
          <path
            ref={pathPinkRef}
            d={config.pink}
            className="st-line-pink"
          />

          {/* TRACK 2 (BLUE): Asymmetric Loose Upward Loop & Wave */}
          <path
            ref={pathBlueRef}
            d={config.blue}
            className="st-line-blue"
          />

          {/* TRACK 3 (GREEN): Asymmetric Serpentine Dropping Down the Left and Hugging Bottom */}
          <path
            ref={pathGreenRef}
            d={config.green}
            className="st-line-green"
          />

          {/* TRACK 4 (PURPLE): Dynamic Cross-Diagonal Ribbon */}
          <path
            ref={pathPurpleRef}
            d={config.purple}
            className="st-line-purple"
          />

          {/* 4 DIRECTIONAL ARROWHEADS (Crisp vector heads) */}
          {/* Arrow 1: Pink */}
          <g ref={arrowPinkRef} className="st-spline-arrow">
            <path
              d={config.arrowD}
              fill="var(--pop-pink)"
              stroke="#ffffff"
              strokeWidth={config.strokeWidth}
            />
          </g>

          {/* Arrow 2: Blue */}
          <g ref={arrowBlueRef} className="st-spline-arrow">
            <path
              d={config.arrowD}
              fill="var(--pop-blue)"
              stroke="#ffffff"
              strokeWidth={config.strokeWidth}
            />
          </g>

          {/* Arrow 3: Green */}
          <g ref={arrowGreenRef} className="st-spline-arrow">
            <path
              d={config.arrowD}
              fill="var(--pop-green)"
              stroke="#ffffff"
              strokeWidth={config.strokeWidth}
            />
          </g>

          {/* Arrow 4: Purple */}
          <g ref={arrowPurpleRef} className="st-spline-arrow">
            <path
              d={config.arrowD}
              fill="var(--pop-purple)"
              stroke="#ffffff"
              strokeWidth={config.strokeWidth}
            />
          </g>
        </svg>
      </div>

      <div className="statement-inner">
        <p className="st-label">[ what i do ]</p>
        <h2 className="st-headline">
          {HEADLINE_LINES.map((line, lIdx) => (
            <span className="st-line" key={lIdx}>
              {line.words.map((item, wIdx) => {
                if (item.type === "chip") {
                  return (
                    <span className="st-chip-wrap" key={`chip-${lIdx}-${wIdx}`}>
                      <img
                        className="st-chip"
                        src={item.src}
                        alt={item.alt}
                        aria-hidden="true"
                        loading="lazy"
                      />
                    </span>
                  );
                }
                return (
                  <span className="st-word" key={`word-${lIdx}-${wIdx}`}>
                    {item.text.split("").map((char, cIdx) => (
                      <span className="st-char" key={`c-${lIdx}-${wIdx}-${cIdx}`}>
                        {char}
                      </span>
                    ))}
                  </span>
                );
              })}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
