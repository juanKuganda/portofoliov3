import { useRef } from "react";
import { useFitText } from "../hooks/useFitText";

export default function ContactSection() {
  const fitRef = useRef<HTMLSpanElement>(null);
  useFitText(fitRef);

  return (
    <section className="contact" id="contact" aria-label="Contact">
      <p className="contact-kicker rv">
        <span className="brk">[</span> Have an idea?{" "}
        <span className="brk">]</span>
      </p>
      <a className="contact-email rv" href="mailto:jp1jn04@gmail.com">
        <span className="fit" ref={fitRef}>
          jp1jn04@gmail.com
        </span>
      </a>
      <p className="contact-sub rv">
        Open for freelance, internships &amp; collaborations
      </p>
    </section>
  );
}
