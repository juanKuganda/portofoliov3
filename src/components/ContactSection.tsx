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
      <span className="contact-cursor" aria-hidden="true">
        <svg
          className="cursor-arrow contact-arrow"
          viewBox="0 0 24 24"
          width="36"
          height="36"
          aria-hidden="true"
        >
          <path
            d="M17.5 3.5 L4.5 12.5 L11.7 13.8 L14.8 21.5 Z"
            fill="var(--pop-pink)"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        <span className="contact-pill">SAY HI →</span>
      </span>
    </section>
  );
}
