// File: src/pages/GetStarted.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Send,
  Calendar,
  CheckCircle,
  Shield,
  BadgeCheck,
  BookOpen,
  Clock,
  Lock,
  Users,
  Sparkles,
  Target,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import CalendlyButton from "../components/CalendlyButton";
import ThankYouModal from "../components/ThankYouModal";
import CTAButton from "../components/CTAButton";
import { mockData } from "../data/mock";

// ----- helpers -----
const onlyDigits = (s) => (s || "").replace(/\D/g, "");
const formatUSPhone = (value) => {
  const s = String(value || "").trim();
  if (s.startsWith("+")) return s;
  const d = onlyDigits(s).slice(0, 10);
  const len = d.length;
  if (len === 0) return "";
  if (len < 4) return `(${d}`;
  if (len < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
};

// API base resolver (Vite → VITE_API_BASE, CRA → REACT_APP_BACKEND_URL, or window.__API_BASE__)
const getApiBase = () => {
  if (typeof window !== "undefined" && window.__API_BASE__) return String(window.__API_BASE__).trim();
  const vite =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_API_BASE) ||
    "";
  const cra =
    (typeof process !== "undefined" &&
      process.env &&
      process.env.REACT_APP_BACKEND_URL) ||
    "";
  return String(vite || cra || "").trim();
};

// build URL
const joinUrl = (base, path) => {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!base) return p;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${b}${p}`;
};

// minimal analytics multiplexer
const track = (name, params = {}) => {
  try {
    const page = typeof window !== "undefined" ? window.location.pathname : "";
    const common = { page, ...params };
    if (typeof window !== "undefined") {
      if (typeof window.gtag === "function") {
        window.gtag("event", name, { ...common, debug_mode: window.location.search.includes("debug=1") });
      }
      if (typeof window.plausible === "function") {
        window.plausible(name, { props: common });
      }
      if (window.posthog?.capture) {
        window.posthog.capture(name, common);
      }
    }
  } catch {}
};

const STORAGE_KEY = "aizamo:get-started";

const GetStarted = () => {
  // ----- form state -----
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    service: "",
    message: "",
    budget: "",
    timeline: "",
    website: "",
    hearAbout: "",
    // tracking
    source: "get-started",
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    consent: true,
    // anti-spam
    hp: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [showThanks, setShowThanks] = useState(false);

  // debug banner state
  const [debugInfo, setDebugInfo] = useState(null);
  const debugMode = typeof window !== "undefined" && window.location.search.includes("debug=1");

  // anti-spam time-to-complete
  const firstInteractTsRef = useRef(null);

  // ----- options -----
  const serviceField = mockData?.contactFields?.find((f) => f?.name === "service");
  const serviceOptions = Array.isArray(serviceField?.options) ? serviceField.options : [];
  const budgetOptions = ["Exploring / Not sure", "Under $2,500", "$2,500 – $5,000", "$5,000 – $15,000", "$15,000+"];
  const timelineOptions = ["ASAP", "2–4 weeks", "1–3 months", "3+ months"];

  // ----- validation -----
  const emailStr = (formData.email || "").trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailPattern.test(emailStr);
  const showEmailHint = emailStr.length > 0 && !isEmailValid;
  const isMessageValid = (formData.message || "").trim().length >= 2;
  const isFormValid =
    ["firstName", "lastName", "service"].every((k) => (formData[k] || "").trim().length > 0) &&
    isEmailValid &&
    isMessageValid &&
    !!formData.consent;

  // ----- hydrate from localStorage -----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setFormData((prev) => ({ ...prev, ...saved }));
      }
    } catch {}
  }, []);

  // ----- UTM capture (if present) -----
  useEffect(() => {
    try {
      const usp = new URLSearchParams(window.location.search);
      setFormData((prev) => ({
        ...prev,
        utm_source: usp.get("utm_source") || prev.utm_source,
        utm_medium: usp.get("utm_medium") || prev.utm_medium,
        utm_campaign: usp.get("utm_campaign") || prev.utm_campaign,
      }));
    } catch {}
  }, []);

  // ----- persist to localStorage -----
  useEffect(() => {
    try {
      const toSave = { ...formData };
      delete toSave.hp; // don't persist honeypot
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {}
  }, [formData]);

  // ----- handlers -----
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (!firstInteractTsRef.current) firstInteractTsRef.current = Date.now();
    if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: formatUSPhone(value) }));
      return;
    }
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhonePaste = (e) => {
    const clip = (e.clipboardData || window.clipboardData)?.getData("text") || "";
    e.preventDefault();
    if (!firstInteractTsRef.current) firstInteractTsRef.current = Date.now();
    setFormData((prev) => ({ ...prev, phone: formatUSPhone(clip) }));
  };

  const handleCalendlyClick = () => {
    track("calendly_click", {
      utm_source: formData.utm_source,
      utm_medium: formData.utm_medium,
      utm_campaign: formData.utm_campaign,
      service: formData.service || "(none)",
      location: "get-started-sidebar",
    });
  };

  // ----- submit -----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");
    setDebugInfo(null);

    const now = Date.now();
    const ttc_ms = firstInteractTsRef.current ? now - firstInteractTsRef.current : null;
    const page_path = typeof window !== "undefined" ? window.location.pathname : "";
       const referrer = typeof document !== "undefined" ? document.referrer : "";
    const user_agent = typeof navigator !== "undefined" ? navigator.userAgent : "";

    const endpoint = joinUrl(getApiBase(), "/api/contact"); // unified API base
    const isBot = !!formData.hp || (ttc_ms !== null && ttc_ms < 4000);

    let respStatus = null;
    let respBodyPreview = "";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...formData,
          ttc_ms,
          page_path,
          referrer,
          user_agent,
          is_bot_flag: isBot,
        }),
      });

      respStatus = response.status;
      const contentType = response.headers.get("content-type") || "";

      let data = null;
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        respBodyPreview = text.slice(0, 200);
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            `Non-JSON response (status ${response.status}). Body starts with: ${respBodyPreview}`
          );
        }
      }

      if (!response.ok) {
        throw new Error((data && (data.detail || data.error)) || `HTTP ${response.status}`);
      }
      if (!data?.success) {
        throw new Error("Unexpected response from server (missing success=true).");
      }

      setIsSubmitting(false);
      setSubmitMessage("Thanks! We received your message.");
      setShowThanks(true);

      track("contact_submit_success", {
        utm_source: formData.utm_source,
        utm_medium: formData.utm_medium,
        utm_campaign: formData.utm_campaign,
        service: formData.service || "(none)",
        budget: formData.budget || "(none)",
        timeline: formData.timeline || "(none)",
        ttc_ms,
        bot_flag: isBot ? 1 : 0,
      });

      // clear form + storage
      setFormData((prev) => ({
        ...prev,
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        phone: "",
        service: "",
        message: "",
        budget: "",
        timeline: "",
        website: "",
        hearAbout: "",
        consent: true,
        hp: "",
      }));
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      firstInteractTsRef.current = null;

      setTimeout(() => setSubmitMessage(""), 6000);
    } catch (error) {
      console.error("Form submission error:", error);
      setIsSubmitting(false);
      setSubmitMessage(
        `Error: ${error.message}. Please try again or contact us directly at automate@aizamo.com`
      );
      if (debugMode) {
        setDebugInfo({
          endpoint,
          status: respStatus,
          preview: respBodyPreview,
        });
      }
      setTimeout(() => setSubmitMessage(""), 10000);
      track("contact_submit_error", {
        message: String(error?.message || error),
        endpoint,
        status: respStatus || "(none)",
      });
    }
  };

  const prefillName = useMemo(
    () => `${formData.firstName} ${formData.lastName}`.trim(),
    [formData.firstName, formData.lastName]
  );
  const calendlyUrl = "https://calendly.com/dnizamov/aizamo-website-appointment-booking";
  const pageUrl =
    typeof window !== "undefined" ? window.location.href : "https://www.aizamo.com/get-started";

  // ----- JSON-LD -----
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AIzamo",
    url: "https://www.aizamo.com/",
    logo: "https://www.aizamo.com/static/brand/logo.png",
    sameAs: ["https://www.linkedin.com/company/aizamo", "https://x.com/aizamo"],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        areaServed: "US",
        availableLanguage: ["en"],
        email: "automate@aizamo.com",
      },
    ],
  };

  const contactPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: pageUrl,
    name: "Get Started - Contact AIzamo",
    breadcrumb: "Get Started",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How soon can we start?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Typically within 1–2 weeks after scoping. We’ll confirm timeline on our first call.",
        },
      },
      {
        "@type": "Question",
        name: "Do you work with our stack?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most likely. We integrate with popular CRMs, ERPs, data tools, and custom systems.",
        },
      },
      {
        "@type": "Question",
        name: "Can you sign an NDA?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes—our privacy-first approach includes NDA on request prior to deep scoping.",
        },
      },
    ],
  };

  return (
    <>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Optional debug banner */}
      {debugMode && debugInfo && (
        <div className="container mt-4">
          <pre
            className="p-3 rounded-lg overflow-auto text-xs"
            style={{ background: "#fff4f4", border: "1px solid #fca5a5", color: "#7f1d1d" }}
          >
{`[DEBUG] contact POST failed
endpoint: ${debugInfo.endpoint}
status: ${debugInfo.status}
body preview: ${debugInfo.preview}`}
          </pre>
        </div>
      )}

      <ThankYouModal
        open={showThanks}
        onClose={() => setShowThanks(false)}
        name={prefillName}
        calendlyUrl={calendlyUrl}
        prefillName={prefillName}
        prefillEmail={formData.email}
      />

      {/* PAGE WRAPPER */}
      <section id="get-started-page" className="section" style={{ backgroundColor: "var(--cream)" }}>
        <div className="container page-pad">
          {/* Header — match About page */}
          <div className="text-center mb-16">
            <h1
              className="text-4xl md:text-5xl font-bold mb-6 section-header-underline animate-in"
              style={{ color: "var(--darkest-brown)" }}
            >
              Get Started
            </h1>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Share your goals and constraints—We’ll propose the fastest path to value with automation tailored to your
              workflows.
            </p>
          </div>

          {/* Quick facts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: <Clock size={18} />, title: "Response Time", text: "Under 24 hours" },
              { icon: <BadgeCheck size={18} />, title: "Kickoff Speed", text: "1–2 weeks from scoping" },
              { icon: <Lock size={18} />, title: "Privacy-First", text: "NDA available on request" },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border-2 text-center"
                style={{ backgroundColor: "var(--white)", borderColor: "var(--light-brown)" }}
              >
                <div
                  className="mx-auto mb-2 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--medium-brown)", color: "#fff" }}
                >
                  {item.icon}
                </div>
                <div className="font-semibold" style={{ color: "var(--darkest-brown)" }}>
                  {item.title}
                </div>
                <div style={{ color: "var(--text-secondary)" }}>{item.text}</div>
              </div>
            ))}
          </div>

          {/* Trusted strip */}
          <div
            className="p-4 rounded-xl mb-14"
            style={{ backgroundColor: "var(--white)", border: "2px solid var(--light-brown)" }}
          >
            <div className="text-center mb-3" style={{ color: "var(--text-light)" }}>
              Trusted by teams who value speed and security
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 opacity-80">
              <span className="text-sm">• Fintech</span>
              <span className="text-sm">• Childcare</span>
              <span className="text-sm">• Housing Services</span>
              <span className="text-sm">• Real Estate</span>
              <span className="text-sm">• SaaS</span>
            </div>
          </div>

          {/* Process */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {[
              { icon: <CheckCircle size={28} />, title: "Tell Us Your Goals", text: "A few quick fields help us understand workflows and outcomes." },
              { icon: <Calendar size={28} />, title: "Book a Call", text: "Align on scope, timeline, and success metrics together." },
              { icon: <BadgeCheck size={28} />, title: "Start Fast", text: "Kick off with a clear plan and a pilot that proves ROI early." },
            ].map((s, i) => (
              <div key={i} className="p-6 rounded-2xl border-2" style={{ backgroundColor: "var(--white)", borderColor: "var(--light-brown)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "var(--medium-brown)", color: "#fff" }}>
                  {s.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--darkest-brown)" }}>
                  {s.title}
                </h3>
                <p style={{ color: "var(--text-secondary)" }}>{s.text}</p>
              </div>
            ))}
          </div>

          {/* Typical engagements */}
          <div className="mb-14">
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--darkest-brown)" }}>
              Typical Engagements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <Sparkles size={22} />, title: "Pilot & Prove", text: "2–4 weeks to prove impact on one high-leverage workflow." },
                { icon: <Target size={22} />, title: "Rev-Ops & Lead Flow", text: "Routing, scoring, nurturing, and follow-ups that convert." },
                { icon: <Users size={22} />, title: "Team-wide Automation", text: "From support to ops: consolidate repetitive tasks with guardrails." },
              ].map((c, i) => (
                <div key={i} className="p-6 rounded-2xl border-2" style={{ backgroundColor: "var(--cream)", borderColor: "var(--light-brown)" }}>
                  <div className="flex items-center gap-2 mb-2" style={{ color: "var(--darkest-brown)" }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--medium-brown)", color: "#fff" }}>
                      {c.icon}
                    </div>
                    <div className="font-semibold">{c.title}</div>
                  </div>
                  <p style={{ color: "var(--text-secondary)" }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What you get */}
          <div className="p-6 rounded-2xl mb-14" style={{ backgroundColor: "var(--white)", border: "2px solid var(--light-brown)" }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--darkest-brown)" }}>
              What You’ll Get
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Clear success metrics & milestones",
                "Outcome-driven pilot where it counts",
                "Documentation & handover (no black boxes)",
                "Privacy-first data handling; NDA available",
                "Async check-ins + weekly progress",
                "Post-launch support & measurement",
              ].map((li, idx) => (
                <li key={idx} className="flex items-center">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: "var(--medium-brown)", color: "#fff" }}>
                    <Shield size={14} />
                  </div>
                  <span style={{ color: "var(--text-secondary)" }}>{li}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main grid: Form + Calendly/Contact/Why/FAQs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="p-8 rounded-2xl" style={{ backgroundColor: "var(--white)" }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--darkest-brown)" }}>
                Tell us about your project
              </h2>

              {submitMessage && (
                <div
                  className="p-4 rounded-lg mb-6 border"
                  style={{
                    backgroundColor: "var(--light-brown)",
                    borderColor: "var(--medium-brown)",
                    color: "var(--darkest-brown)",
                  }}
                >
                  {submitMessage}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
                noValidate
                onFocusCapture={() => !firstInteractTsRef.current && (firstInteractTsRef.current = Date.now())}
              >
                {/* honeypot (visually hidden) */}
                <div
                  aria-hidden="true"
                  style={{ position: "absolute", left: "-10000px", top: "auto", width: "1px", height: "1px", overflow: "hidden" }}
                >
                  <label htmlFor="company_website">Company Website</label>
                  <input
                    id="company_website"
                    type="text"
                    name="hp"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.hp}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors"
                      style={{ backgroundColor: "var(--cream)", borderColor: "var(--light-brown)" }}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors"
                      style={{ backgroundColor: "var(--cream)", borderColor: "var(--light-brown)" }}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      aria-invalid={showEmailHint ? "true" : "false"}
                      aria-describedby="email-hint"
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors"
                      style={{
                        backgroundColor: "var(--cream)",
                        borderColor: showEmailHint ? "#ef4444" : "var(--light-brown)",
                      }}
                      placeholder="john@company.com"
                    />
                    <div className="min-h-[20px]">
                      <p
                        id="email-hint"
                        className={`text-sm transition-opacity duration-200 ${showEmailHint ? "opacity-100" : "opacity-0"}`}
                        style={{ color: "#ef4444" }}
                        aria-live="polite"
                      >
                        Enter a valid email (name@domain).
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onPaste={handlePhonePaste}
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={formData.phone.startsWith("+") ? 25 : 14}
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors"
                      style={{ backgroundColor: "var(--cream)", borderColor: "var(--light-brown)" }}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors"
                      style={{ backgroundColor: "var(--cream)", borderColor: "var(--light-brown)" }}
                      placeholder="Your Company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Website / LinkedIn
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors"
                      style={{ backgroundColor: "var(--cream)", borderColor: "var(--light-brown)" }}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Service Interest *
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors"
                      style={{ backgroundColor: "var(--cream)", borderColor: "var(--light-brown)" }}
                    >
                      <option value="">Select a service</option>
                      {serviceOptions.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Budget Range
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors"
                      style={{ backgroundColor: "var(--cream)", borderColor: "var(--light-brown)" }}
                    >
                      <option value="">Select budget</option>
                      {budgetOptions.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Timeline
                    </label>
                    <select
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors"
                      style={{ backgroundColor: "var(--cream)", borderColor: "var(--light-brown)" }}
                    >
                      <option value="">Select timeline</option>
                      {timelineOptions.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      How did you hear about us?
                    </label>
                    <input
                      type="text"
                      name="hearAbout"
                      value={formData.hearAbout}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors"
                      style={{ backgroundColor: "var(--cream)", borderColor: "var(--light-brown)" }}
                      placeholder="Google, LinkedIn, referral, etc."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    {"We're listening - Start typing! *"}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    minLength={2}
                    rows={4}
                    aria-invalid={!isMessageValid ? "true" : "false"}
                    aria-describedby="message-hint"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-medium-brown transition-colors resize-vertical"
                    style={{ backgroundColor: "var(--cream)", borderColor: "var(--light-brown)" }}
                    placeholder="What challenges are you hoping to solve?"
                  />
                  <div className="min-h-[20px]">
                    <p
                      id="message-hint"
                      className={`text-sm transition-opacity duration-200 ${isMessageValid ? "opacity-0" : "opacity-100"}`}
                      style={{ color: "var(--text-secondary)" }}
                      aria-live="polite"
                    >
                      Minimum 2 characters required.
                    </p>
                  </div>
                </div>

                {/* Consent + legal links */}
                <label className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <input type="checkbox" name="consent" checked={!!formData.consent} onChange={handleChange} className="mt-1" />
                  <span>
                    I agree to be contacted about my inquiry and understand AIzamo’s privacy-first approach.{" "}
                    <a
                      href="/#privacy"
                      className="underline"
                      onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                      }}
                    >
                      Privacy Policy
                    </a>{" "}
                    &{" "}
                    <a
                      href="/#terms"
                      className="underline"
                      onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
                      }}
                    >
                      Terms &amp; Conditions
                    </a>
                    .
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className="w-full btn btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {isSubmitting ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span>Send Message</span>
                      <Send size={20} />
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Side: Calendly + Get in Touch + Why + FAQs + extra CTAs */}
            <div className="space-y-8">
              {/* Book a call */}
              <div className="p-8 rounded-2xl text-center" style={{ backgroundColor: "var(--light-brown)" }}>
                <Calendar size={48} className="mx-auto mb-4" style={{ color: "var(--medium-brown)" }} />
                <h3 className="text-2xl font-bold mb-4" style={{ color: "var(--darkest-brown)" }}>
                  Prefer to talk?
                </h3>
                <p className="text-lg mb-6" style={{ color: "var(--text-secondary)" }}>
                  Book a free 30-minute consultation to discuss priorities and next steps.
                </p>

                <CalendlyButton
                  url={calendlyUrl}
                  name={prefillName}
                  email={formData.email}
                  utm={{ source: "website", campaign: "get-started-cta" }}
                  className="btn btn-primary text-lg px-8 py-4"
                  onClick={handleCalendlyClick}
                >
                  Book Free Consultation
                </CalendlyButton>
              </div>

              {/* NEW: Get in Touch (direct contact info) */}
              <div className="p-8 rounded-2xl" style={{ backgroundColor: "var(--white)" }}>
                <h3 className="text-2xl font-bold mb-6" style={{ color: "var(--darkest-brown)" }}>
                  Get in Touch
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail size={20} className="mr-4" style={{ color: "var(--medium-brown)" }} />
                    <a
                      href="mailto:automate@aizamo.com"
                      style={{ color: "var(--text-secondary)" }}
                      className="hover:underline"
                      onClick={() => track("contact_link_click", { type: "email", location: "get-started-sidebar" })}
                    >
                      automate@aizamo.com
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone size={20} className="mr-4" style={{ color: "var(--medium-brown)" }} />
                    <a
                      href="tel:+14038003135"
                      style={{ color: "var(--text-secondary)" }}
                      className="hover:underline"
                      onClick={() => track("contact_link_click", { type: "phone", location: "get-started-sidebar" })}
                    >
                      +1 (403) 800-3135
                    </a>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={20} className="mr-4" style={{ color: "var(--medium-brown)" }} />
                    <span style={{ color: "var(--text-secondary)" }}>Remote Services Globally</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t" style={{ borderColor: "var(--light-brown)" }}>
                  <h4 className="font-semibold mb-2" style={{ color: "var(--darkest-brown)" }}>
              
                  </h4>
                  
                </div>
              </div>

              {/* Why choose us */}
              <div className="p-8 rounded-2xl" style={{ backgroundColor: "var(--white)" }}>
                <h3 className="text-2xl font-bold mb-4" style={{ color: "var(--darkest-brown)" }}>
                  Why AIzamo?
                </h3>
                <ul className="space-y-3">
                  {[
                    { icon: <Shield size={18} />, text: "Privacy-first approach to your data." },
                    { icon: <BadgeCheck size={18} />, text: "Outcome-driven pilots that show ROI early." },
                    { icon: <BookOpen size={18} />, text: "Clear documentation and handover—no black boxes." },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: "var(--medium-brown)", color: "#fff" }}>
                        {item.icon}
                      </div>
                      <span style={{ color: "var(--text-secondary)" }}>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* FAQs */}
              <div className="p-6 rounded-2xl" style={{ backgroundColor: "var(--white)" }}>
                <h4 className="text-lg font-semibold mb-3" style={{ color: "var(--darkest-brown)" }}>
                  FAQs
                </h4>
                <details className="mb-2" onToggle={(e) => e.currentTarget.open && track("faq_expand", { question: "How soon can we start?" })}>
                  <summary className="cursor-pointer">How soon can we start?</summary>
                  <p style={{ color: "var(--text-secondary)" }} className="mt-2">
                    Typically within 1–2 weeks after scoping. We’ll confirm timeline on our first call.
                  </p>
                </details>
                <details className="mb-2" onToggle={(e) => e.currentTarget.open && track("faq_expand", { question: "Do you work with our stack?" })}>
                  <summary className="cursor-pointer">Do you work with our stack?</summary>
                  <p style={{ color: "var(--text-secondary)" }} className="mt-2">
                    Most likely. We integrate with popular CRMs, ERPs, data tools, and custom systems.
                  </p>
                </details>
                <details onToggle={(e) => e.currentTarget.open && track("faq_expand", { question: "Can you sign an NDA?" })}>
                  <summary className="cursor-pointer">Can you sign an NDA?</summary>
                  <p style={{ color: "var(--text-secondary)" }} className="mt-2">
                    Yes—our privacy-first approach includes NDA on request prior to deep scoping.
                  </p>
                </details>
              </div>

              {/* Extra CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <CTAButton to="/solutions" label="View Solutions" variant="light" fullWidth />
                <CTAButton to="/pricing" label="View Pricing" variant="light" fullWidth />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default GetStarted;
