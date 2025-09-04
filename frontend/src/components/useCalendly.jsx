// frontend/src/components/useCalendly.js
import { useCallback, useEffect } from "react";

const CALENDLY_SCRIPT_ID = "calendly-embed-script";
const CALENDLY_CSS_ID = "calendly-embed-css";
const CALENDLY_SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
const CALENDLY_CSS_HREF = "https://assets.calendly.com/assets/external/widget.css";

// Small readiness cache across renders
let readyPromise;
function ensureCalendlyLoaded() {
  if (readyPromise) return readyPromise;

  readyPromise = new Promise((resolve) => {
    // CSS
    if (!document.getElementById(CALENDLY_CSS_ID)) {
      const link = document.createElement("link");
      link.id = CALENDLY_CSS_ID;
      link.rel = "stylesheet";
      link.href = CALENDLY_CSS_HREF;
      document.head.appendChild(link);
    }

    // Script
    const existing = document.getElementById(CALENDLY_SCRIPT_ID);
    if (existing) {
      if (window.Calendly?.initPopupWidget) return resolve(true);
      existing.addEventListener("load", () => resolve(true), { once: true });
      // safety timeout if blockers prevent onload
      setTimeout(() => resolve(!!window.Calendly?.initPopupWidget), 1500);
      return;
    }

    const s = document.createElement("script");
    s.id = CALENDLY_SCRIPT_ID;
    s.src = CALENDLY_SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve(true);
    // safety timeout
    setTimeout(() => resolve(!!window.Calendly?.initPopupWidget), 2000);
    document.head.appendChild(s);
  });

  return readyPromise;
}

export function useCalendly({ url }) {
  useEffect(() => {
    // kick off loading early
    ensureCalendlyLoaded();
  }, []);

  const openCalendly = useCallback(async ({ prefill, utm } = {}) => {
    const ready = await ensureCalendlyLoaded();

    if (ready && window.Calendly?.initPopupWidget) {
      try {
        window.Calendly.initPopupWidget({ url, prefill, utm });
        return;
      } catch (_) {
        // fall through
      }
    }

    // Hard fallback: never leave the user with a dead click
    window.open(url, "_blank", "noopener,noreferrer");
  }, [url]);

  return { openCalendly };
}
