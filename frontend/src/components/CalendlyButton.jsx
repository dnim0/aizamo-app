// frontend/src/components/CalendlyButton.jsx
import React from "react";
import { useCalendly } from "./useCalendly";

export default function CalendlyButton({
  url = "https://calendly.com/dnizamov/aizamo-website-appointment-booking",
  name,
  email,
  utm = {},
  children = "Book Free Consultation",
  className = "",
  style,
}) {
  const { openCalendly } = useCalendly({ url });

  const handleClick = () => {
    const prefill = {};
    if (name) prefill.name = name;
    if (email) prefill.email = email;

    const utmFinal = {
      utmCampaign: utm.campaign,
      utmSource: utm.source,
      utmMedium: utm.medium,
      utmContent: utm.content,
      utmTerm: utm.term,
    };

    openCalendly({ prefill, utm: utmFinal });
  };

  return (
    <button
      type="button" // important: avoid form submission
      onClick={handleClick}
      className={`px-8 py-4 rounded-lg font-semibold transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      style={{ backgroundColor: "var(--medium-brown)", color: "white", ...style }}
      aria-label="Book Free Consultation"
    >
      {children}
    </button>
  );
}
