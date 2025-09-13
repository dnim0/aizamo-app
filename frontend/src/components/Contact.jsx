// File: src/pages/Contact.jsx  (REPLACE ENTIRE FILE)
import React from "react";
import { Calendar, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import CTAButton from "../components/CTAButton";
import CalendlyButton from "../components/CalendlyButton";

const track = (name, props = {}) => {
  try {
    window.gtag?.("event", name, props);
    window.plausible?.(name, { props });
    window.posthog?.capture?.(name, props);
  } catch {}
};

export default function Contact() {
  const calendlyUrl = "https://calendly.com/dnizamov/aizamo-website-appointment-booking";

  return (
    <section id="contact" className="section" style={{ backgroundColor: "var(--cream)" }}>
      <div className="container page-pad">
        {/* Header */}
        <div className="text-center mb-16">
          <h1
            className="text-4xl md:text-5xl font-bold mb-6 section-header-underline animate-in"
            style={{ color: "var(--darkest-brown)" }}
          >
            Contact AIzamo
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Central intake for projects, questions, and quick estimates. Use the Get Started flow — or reach us directly.
          </p>
        </div>

        {/* CTA band */}
        <div
          className="p-8 md:p-10 rounded-2xl border-2 flex flex-col items-center text-center gap-6"
          style={{ backgroundColor: "var(--white)", borderColor: "var(--light-brown)" }}
        >
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: "var(--darkest-brown)" }}>
              Prove value before you scale.
            </h2>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              Tell us what you’re aiming for. We’ll map the shortest path to value within <strong>24 hours</strong>.
            </p>
            <div className="mt-3 text-sm" style={{ color: "var(--text-light)" }}>
              Prefer to talk directly? You can call or send us an email below.
            </div>
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* Slimmer/taller-tuned CTA (wider, less height) */}
            <CTAButton
              label="Get Started"
              to="/get-started"
              variant="dark"
              size="md"
              className="px-7 md:px-9 py-3 md:py-3.5 rounded-xl"
              onClick={() => track("contact_page_get_started_click", { location: "contact_page_band" })}
            />

            {/* Icon-only actions */}
            <a
              href="mailto:automate@aizamo.com"
              aria-label="Email us"
              title="Email us"
              className="inline-flex items-center justify-center rounded-full border"
              style={{
                width: 48,
                height: 48,
                borderColor: "var(--light-brown)",
                backgroundColor: "var(--cream)",
              }}
              onClick={() => track("contact_page_email_click", { location: "contact_page_band" })}
            >
              <Mail size={20} style={{ color: "var(--medium-brown)" }} />
              <span className="sr-only">Email</span>
            </a>

            <a
              href="tel:+14038003135"
              aria-label="Call us"
              title="+1 (403) 800-3135"
              className="inline-flex items-center justify-center rounded-full border"
              style={{
                width: 48,
                height: 48,
                borderColor: "var(--light-brown)",
                backgroundColor: "var(--cream)",
              }}
              onClick={() => track("contact_page_phone_click", { location: "contact_page_band" })}
            >
              <Phone size={20} style={{ color: "var(--medium-brown)" }} />
              <span className="sr-only">Phone</span>
            </a>
          </div>
        </div>

        {/* Prominent appointment card */}
        <div
          className="mt-8 p-8 md:p-10 rounded-2xl text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(150,114,89,0.08) 0%, rgba(99,72,50,0.08) 100%)",
            border: "2px solid var(--light-brown)",
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--light-brown)" }}
            >
              <Calendar size={28} style={{ color: "var(--medium-brown)" }} />
            </div>
            <h3 className="text-2xl font-bold" style={{ color: "var(--darkest-brown)" }}>
              Prefer to talk it through?
            </h3>
            <p className="text-lg max-w-2xl" style={{ color: "var(--text-secondary)" }}>
              Book a free <strong>30-minute consultation</strong> to discuss priorities and next steps.
            </p>
            <CalendlyButton
              url={calendlyUrl}
              className="btn btn-primary px-7 md:px-9 py-3 md:py-3.5 rounded-xl"
              onClick={() => track("contact_page_consult_click", { location: "appointment_card" })}
            >
              Book Appointment
            </CalendlyButton>
            <div className="text-sm" style={{ color: "var(--text-light)" }}>
              No pressure. We’ll align on goals, scope, and timeline.
            </div>
          </div>
        </div>

        {/* Secondary text link (optional, for SEO/semantics) */}
        <div className="mt-6 text-center">
          <Link
            to="/get-started"
            className="underline underline-offset-4"
            onClick={() => track("contact_page_consult_secondary", { location: "below_card" })}
          >
            Or start with the intake form →
          </Link>
        </div>
      </div>
    </section>
  );
}
