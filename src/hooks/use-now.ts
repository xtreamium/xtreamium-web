import { useEffect, useState } from "react";

/**
 * A ticking clock. Progress bars are driven from this rather than from pushed events: a local
 * timer is smoother than any push cadence, costs nothing, and keeps working when the proxy is
 * old, busy or unreachable.
 */
export const useNow = (intervalMs = 1000): number => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
};
