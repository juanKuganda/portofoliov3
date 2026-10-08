import { useEffect, useRef } from "react";
import { useLenis } from "./hooks/useLenis";
import { useScrollReveal } from "./hooks/useScrollReveal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Ticker from "./components/Ticker";
import Statement from "./components/Statement";
import WorkSection from "./components/WorkSection";
import AboutSection from "./components/AboutSection";
import BentoSection from "./components/BentoSection";
import ServicesSection from "./components/ServicesSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import CursorPill from "./components/CursorPill";

gsap.registerPlugin(ScrollTrigger);

/** Thin amber reading-progress hairline. transform-only, scrubbed. */
function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
          },
        }
      );
    });
    return () => {
      ctx.revert();
    };
  }, []);

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}

export default function App() {
  useLenis();
  useScrollReveal();

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <Hero />
      <Ticker />
      <Statement />
      <main>
        <WorkSection />
        <AboutSection />
        <BentoSection />
        <ServicesSection />
      </main>
      <ContactSection />
      <Footer />
      <CursorPill />
    </>
  );
}
