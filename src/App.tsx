import { useEffect, useRef, useState, useCallback } from "react";
import { useLenis } from "./hooks/useLenis";
import { useScrollReveal } from "./hooks/useScrollReveal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Statement from "./components/Statement";
import WorkSection from "./components/WorkSection";
import AboutSection from "./components/AboutSection";
import PixelTransition from "./components/PixelTransition";
import BentoSection from "./components/BentoSection";
import ServicesSection from "./components/ServicesSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import CursorPill from "./components/CursorPill";
import PageLoader from "./components/PageLoader";

gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create("punch", "0.16, 1, 0.3, 1");

/** Thin amber reading-progress hairline. transform-only, scrubbed. */
function ScrollProgress({ isVisible = true }: { isVisible?: boolean }) {
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

  return (
    <div
      ref={ref}
      className="scroll-progress"
      style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.4s ease" }}
      aria-hidden="true"
    />
  );
}

export default function App() {
  const lenisRef = useLenis();
  useScrollReveal();

  const [isHeroReady, setIsHeroReady] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBrandReady, setIsBrandReady] = useState(false);

  // Stop Lenis initially until loader finishes
  useEffect(() => {
    if (!isLoaded && lenisRef.current) {
      lenisRef.current.stop();
    }
  }, [isLoaded, lenisRef]);

  const handleHeroReady = useCallback(() => {
    setIsHeroReady(true);
  }, []);

  const handleLoaderComplete = useCallback(() => {
    setIsLoaded(true);
    if (lenisRef.current) {
      lenisRef.current.start();
      lenisRef.current.resize();
    }
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  }, [lenisRef]);

  return (
    <>
      <PageLoader
        onHeroReady={handleHeroReady}
        onComplete={handleLoaderComplete}
        onBrandReady={() => setIsBrandReady(true)}
      />
      <ScrollProgress isVisible={isHeroReady} />
      <Navbar isReady={isHeroReady} isBrandReady={isBrandReady} />
      {/* Hero waits for isLoaded (loader fully gone), not isHeroReady:
          the hero must start EMPTY and pop in one by one. Navbar and
          the progress hairline may appear during the dissolve. */}
      <Hero isReady={isLoaded} />
      <Statement />
      <main>
        <WorkSection />
        <PixelTransition direction="white-to-black" />
        <AboutSection />
        <PixelTransition direction="black-to-white" />
        <BentoSection />
        <ServicesSection />
      </main>
      <ContactSection />
      <PixelTransition direction="white-to-black" />
      <Footer />
      <CursorPill />
    </>
  );
}
