import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({ title, content, onClose }) {
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const [openAnim, setOpenAnim] = useState(false);
  const lastActiveEl = useRef(null);

  useEffect(() => {
    lastActiveEl.current = document.activeElement;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => setOpenAnim(true), 10);
    const f = setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lastActiveEl.current?.focus?.();
      clearTimeout(t);
      clearTimeout(f);
    };
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const node = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-200 ${
        openAnim ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onMouseDown={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        ref={dialogRef}
        className={`w-[92vw] max-w-2xl transform rounded-xl border shadow-2xl transition-all duration-200 ${
          openAnim ? "scale-100" : "scale-95"
        }`}
        style={{
          backgroundColor: "var(--dark-brown)",
          borderColor: "var(--medium-brown)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 rounded-t-xl"
          style={{ backgroundColor: "var(--darkest-brown)" }}
        >
          <h2 id="modal-title" className="text-lg md:text-xl font-semibold" style={{ color: "white" }}>
            {title}
          </h2>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ color: "var(--light-brown)" }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 text-sm md:text-base leading-relaxed" style={{ color: "var(--light-brown)" }}>
          {content}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-lg font-semibold transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: "var(--medium-brown)", color: "white" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
