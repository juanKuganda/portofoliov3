import { useLenis } from "./hooks/useLenis";
import { useScrollReveal } from "./hooks/useScrollReveal";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WorkSection from "./components/WorkSection";
import AboutSection from "./components/AboutSection";
import BentoSection from "./components/BentoSection";
import ServicesSection from "./components/ServicesSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import CursorPill from "./components/CursorPill";

export default function App() {
  useLenis();
  useScrollReveal();

  return (
    <>
      <Navbar />
      <Hero />
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
