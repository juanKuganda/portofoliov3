import { useState, useEffect } from "react";

/**
 * Live clock formatted in WITA (Asia/Makassar) timezone.
 * Updates every 15 seconds.
 */
export function useClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function tick() {
      try {
        const t = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Makassar",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date());
        setTime(t);
      } catch {
        setTime("");
      }
    }
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  return time;
}
