// File: frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

/**
 * WHY: If a service worker from any previous setup exists, it can pin an old
 * app shell. We nuke SW + caches once, then reload with a cache-buster.
 */
async function cleanupStaleShell() {
  try {
    // Unregister any existing Service Workers
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }

    // Clear all caches (drop old JS/CSS)
    if (window.caches?.keys) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }

    // Reload once with ?v=timestamp to ensure fresh HTML/assets
    if (!sessionStorage.getItem("__sw_cleanup_done__")) {
      sessionStorage.setItem("__sw_cleanup_done__", "1");
      const u = new URL(window.location.href);
      u.searchParams.set("v", String(Date.now()));
      window.location.replace(u.toString());
      return; // stop rendering this pass; next load is clean
    }
  } catch {
    // swallow; rendering continues even if cleanup fails
  }
}

// Kick off cleanup ASAP
void cleanupStaleShell();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
