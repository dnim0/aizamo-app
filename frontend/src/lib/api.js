// File: src/lib/api.js
// Works with Vite, CRA, or a runtime <script> override.
// Falls back to same-origin when no base is provided.

export const getApiBase = () => {
  // Runtime override (e.g., in index.html before the bundle)
  if (typeof window !== "undefined" && window.__API_BASE__) {
    return String(window.__API_BASE__).trim();
  }

  // Vite env
  const viteBase =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_API_BASE) ||
    "";

  // CRA env
  const craBase =
    (typeof process !== "undefined" &&
      process.env &&
      process.env.REACT_APP_BACKEND_URL) ||
    "";

  return String(viteBase || craBase || "").trim();
};

export const joinUrl = (base, path) => {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!base) return p; // same-origin
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${b}${p}`;
};

export const CONTACT_ENDPOINT = joinUrl(getApiBase(), "/api/contact");
export const HEALTH_ENDPOINT  = joinUrl(getApiBase(), "/api/health");
