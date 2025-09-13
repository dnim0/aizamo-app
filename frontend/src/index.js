import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

/* WHY: prevent stale UI — nuke any old Service Worker + caches once, then reload with cache-buster. */
async function cleanupStaleShell() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if (window.caches?.keys) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    if (!sessionStorage.getItem("__sw_cleanup_done__")) {
      sessionStorage.setItem("__sw_cleanup_done__", "1");
      const u = new URL(window.location.href);
      u.searchParams.set("v", String(Date.now()));
      window.location.replace(u.toString());
      return;
    }
  } catch {}
}
void cleanupStaleShell();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
