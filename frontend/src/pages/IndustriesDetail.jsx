// frontend/src/pages/IndustriesDetail.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { industries } from '@/data/industries';
import CTAButton from '@/components/CTAButton';
import NotFound from '@/pages/NotFound';

/* -------------------------------------------------------------------------- */
/* Analytics small helper (safe no-op)                                        */
/* -------------------------------------------------------------------------- */
const track = (name, props = {}) => {
  try {
    if (window?.gtag) window.gtag('event', name, props);
    if (window?.plausible) window.plausible(name, { props });
    if (window?.posthog?.capture) window.posthog.capture(name, props);
  } catch {}
};

/* -------------------------------------------------------------------------- */
/* Tech Stack (old layout with hover tooltips)                                */
/* -------------------------------------------------------------------------- */
function TechStack({ items }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {items.map((t, i) => (
        <div key={`${t.name}-${i}`} className="relative group">
          <div
            className="px-3 py-2 rounded-lg border text-sm text-center transition-transform"
            style={{
              borderColor: 'var(--light-brown)',
              background: 'var(--white)',
              color: 'var(--darkest-brown)',
            }}
          >
            {t.name}
          </div>
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-2 w-56 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg border p-3 shadow-lg z-10"
            style={{ background: 'var(--cream)', borderColor: 'var(--light-brown)' }}
          >
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--darkest-brown)' }}>
              {t.name}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {t.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FAQ (old layout)                                                           */
/* -------------------------------------------------------------------------- */
function FAQ({ items }) {
  return (
    <div className="space-y-2">
      {items.map((f, idx) => (
        <details
          key={idx}
          className="rounded-lg border p-3"
          style={{ borderColor: 'var(--light-brown)', background: 'var(--white)' }}
          onToggle={(e) => e.currentTarget.open && track('faq_expand', { question: f.q })}
        >
          <summary className="cursor-pointer font-medium" style={{ color: 'var(--darkest-brown)' }}>
            {f.q}
          </summary>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {f.a}
          </p>
        </details>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dot-Reveal Timeline (center dots + sliding card; no overlap)               */
/* -------------------------------------------------------------------------- */
function DotRevealTimeline({ items }) {
  const [active, setActive] = useState(0);
  const dotRefs = useRef([]);
  const indicatorRef = useRef(null);

  useEffect(() => {
    const el = dotRefs.current[active];
    const ind = indicatorRef.current;
    if (!el || !ind) return;
    const r = el.getBoundingClientRect();
    const pr = el.parentElement.getBoundingClientRect();
    const left = r.left - pr.left + r.width / 2 - 8; // center indicator (16px)
    ind.style.transform = `translateX(${left}px)`;
  }, [active]);

  return (
    <div className="w-full">
      {/* Track + movable indicator */}
      <div className="relative my-6">
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] rounded"
          style={{ background: 'rgba(150,114,89,0.2)' }}
        />
        <div ref={indicatorRef}
             className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-transform duration-300"
             style={{ background: 'var(--medium-brown)' }} />
        <div className="grid grid-cols-4 gap-0 relative">
          {items.map((it, idx) => (
            <button
              key={idx}
              type="button"
              ref={(el) => (dotRefs.current[idx] = el)}
              onClick={() => setActive(idx)}
              className="relative mx-auto"
              aria-label={`Show ${it.w}`}
              style={{ width: 24, height: 24, background: 'transparent' }}
            >
              <span
                className="block w-3 h-3 rounded-full transition-all mx-auto"
                style={{
                  background: idx <= active ? 'var(--medium-brown)' : 'var(--light-brown)',
                  boxShadow: idx === active ? '0 0 0 6px rgba(150,114,89,0.18)' : 'none',
                }}
              />
              <span
                className="block mt-3 text-xs font-medium whitespace-nowrap text-center"
                style={{ color: 'var(--darkest-brown)' }}
              >
                {it.w.split('—')[0].trim()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sliding panel */}
      <div
        className="relative overflow-hidden rounded-2xl border-2"
        style={{ borderColor: 'var(--light-brown)', background: 'var(--white)' }}
      >
        <div
          className="p-6 transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(${active * -100}%)`,
            width: `${items.length * 100}%`,
            display: 'grid',
            gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
          }}
        >
          {items.map((it, idx) => (
            <div key={idx} className="grid md:grid-cols-2 gap-6 px-2">
              <div className="rounded-xl p-4 border"
                   style={{ borderColor: 'var(--light-brown)', background: 'var(--cream)' }}>
                <div className="text-sm uppercase tracking-wide mb-1" style={{ color: 'var(--text-light)' }}>
                  Before
                </div>
                <div className="text-base" style={{ color: 'var(--text-secondary)' }}>{it.before}</div>
              </div>
              <div className="rounded-xl p-4 border"
                   style={{ borderColor: 'var(--light-brown)', background: 'var(--white)' }}>
                <div className="text-sm uppercase tracking-wide mb-1" style={{ color: 'var(--text-light)' }}>
                  After
                </div>
                <div className="text-base" style={{ color: 'var(--text-secondary)' }}>{it.after}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 border-t"
             style={{ borderColor: 'var(--light-brown)', background: 'var(--cream)' }}>
          <div className="text-sm font-semibold" style={{ color: 'var(--darkest-brown)' }}>
            {items[active]?.w}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Automation Console (slower typing; per-industry lines; no window dots)     */
/* -------------------------------------------------------------------------- */
function AutomationConsole({ seed, headline = 'Live Automation Console' }) {
  const [phase, setPhase] = useState('idle'); // idle | step | logs | done
  const [progress, setProgress] = useState(0);
  const [typedLines, setTypedLines] = useState([]);
  const [cursorOn, setCursorOn] = useState(true);
  const [pinned, setPinned] = useState(null);

  const stepCard = useMemo(
    () => ({
      title: seed?.title || 'Lead Intake & Routing',
      sub: seed?.sub || 'Form → GHL → Webhook → Normalize → Enrich → Route → CRM → Notify',
      est: seed?.est || '~4.1s execution',
    }),
    [seed]
  );

  const LINES = useMemo(() => {
    if (Array.isArray(seed?.lines) && seed.lines.length) return seed.lines;
    // Fallback generic
    return [
      'POST / — webhook received (form or ad lead)',
      'GoHighLevel: contact upsert, opportunity created/updated, assigned user alerted, welcome SMS+email sent',
      'Normalize fields… ok',
      'Enrich email… ok',
      'Route lead (round-robin)… ok',
      'Write to CRM timeline + sheet… ok',
      'Set up email/SMS subscriptions… ok',
      'Execution finished — success',
    ];
  }, [seed]);

  useEffect(() => {
    const t = setInterval(() => setCursorOn((v) => !v), 520);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (phase !== 'step') return;
    setProgress(0);
    const h = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(h);
          setPinned(stepCard);
          setTimeout(() => setPhase('logs'), 420);
          return 100;
        }
        const inc = p < 70 ? 6 : p < 90 ? 4 : 2;
        return Math.min(100, p + inc);
      });
    }, 150);
    return () => clearInterval(h);
  }, [phase, stepCard]);

  useEffect(() => {
    if (phase !== 'logs') return;
    setTypedLines([]);
    let i = 0;
    const push = () => {
      setTypedLines((prev) => [...prev, LINES[i]]);
      i++;
      if (i < LINES.length) {
        setTimeout(push, 650 + Math.random() * 300); // slower, readable
      } else {
        setPhase('done');
      }
    };
    setTimeout(push, 420);
  }, [phase, LINES]);

  const start = () => {
    setPhase('step');
    track('automation_console_start', { console: seed?.id || 'default' });
  };

  return (
    <div
      className="rounded-2xl border-2 overflow-hidden"
      style={{
        borderColor: 'var(--light-brown)',
        background: 'linear-gradient(180deg, #0f0f0f 0%, #161616 100%)',
      }}
    >
      {/* Header (no traffic light dots) */}
      <div className="px-4 py-3 flex items-center justify-between"
           style={{ borderBottom: '1px solid rgba(150,114,89,0.25)' }}>
        <div className="text-sm font-semibold" style={{ color: '#f5f5f5' }}>
          {headline}
        </div>
      </div>

      {/* Pinned summary after init */}
      {pinned && (
        <div className="px-4 pt-4">
          <div className="rounded-xl border p-3 bg-white/5 backdrop-blur"
               style={{ borderColor: 'rgba(150,114,89,0.35)' }}>
            <div className="text-sm font-semibold" style={{ color: '#f0eae6' }}>{pinned.title}</div>
            <div className="text-xs mt-1" style={{ color: '#d7cfc9' }}>{pinned.sub}</div>
            <div className="text-[11px] mt-2" style={{ color: '#c1b6ae' }}>{pinned.est}</div>
          </div>
        </div>
      )}

      <div className="p-4">
        {phase === 'idle' && (
          <div className="py-16 flex items-center justify-center">
            <button
              type="button"
              onClick={start}
              className="px-5 py-3 rounded-xl font-semibold transition-all hover:-translate-y-[1px]"
              style={{
                background: 'var(--medium-brown)',
                color: 'white',
                boxShadow: '0 8px 24px rgba(150,114,89,0.35)',
              }}
            >
              Start Automation Workflow
            </button>
          </div>
        )}

        {phase === 'step' && (
          <div className="py-10 flex items-center justify-center">
            <div className="rounded-xl border bg-white/10 backdrop-blur p-4 w-full max-w-md"
                 style={{ borderColor: 'rgba(150,114,89,0.35)' }}>
              <div className="text-sm font-semibold mb-1" style={{ color: '#f0eae6' }}>{stepCard.title}</div>
              <div className="text-xs mb-3" style={{ color: '#d7cfc9' }}>{stepCard.sub}</div>
              <div className="w-full h-2 rounded-full" style={{ background: '#2a2a2a' }}>
                <div className="h-2 rounded-full transition-all"
                     style={{ width: `${progress}%`, background: 'var(--medium-brown)' }} />
              </div>
              <div className="mt-2 text-[11px]" style={{ color: '#c1b6ae' }}>
                Initializing… {progress}%
              </div>
            </div>
          </div>
        )}

        {(phase === 'logs' || phase === 'done') && (
          <div className="rounded-lg border bg-black/30 p-3 font-mono text-[12px] leading-relaxed"
               style={{ borderColor: 'rgba(150,114,89,0.25)', color: '#dcd7d3' }}>
            {typedLines.map((ln, i) => (
              <div key={i} className="whitespace-pre-wrap">{ln}</div>
            ))}
            <div className="opacity-70">
              {phase !== 'done' ? (cursorOn ? '▍' : ' ') : '— end —'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Content (per industry)                                                     */
/* -------------------------------------------------------------------------- */
const CONTENT = {
  'real-estate': {
    heroTitle: 'Automations that win more deals in Real Estate',
    heroSub: 'From lead capture to follow-up and bookings — done for you in weeks, not months.',
    outcomes: [
      'Sub-60s speed-to-lead with 24/7 replies',
      '+25–60% more booked appointments',
      '40–120 admin hours saved per month',
    ],
    packages: [
      {
        key: 'starter',
        name: 'Starter',
        who: 'Solo agents / new teams',
        outcomes: ['Faster reply times', 'Cleaner pipeline', 'Fewer no-shows'],
        includes: [
          'Lead capture pages + forms',
          'GHL pipeline with stages + alerts',
          'Immediate SMS/email + 2-day smart follow-up',
          'Booking page + calendar sync',
          'Review booster + Google Business prompts',
        ],
        weeks: 2, setup: '$1.5k–$3k', monthly: '$300–$600',
      },
      {
        key: 'growth',
        name: 'Growth',
        who: 'Established agents / teams',
        outcomes: ['Lead-to-appointment up', 'Hands-off nurture', 'Stronger brand'],
        includes: [
          'Everything in Starter',
          'Multi-channel nurture (SMS/email/VM)',
          'No-show reduction (smart reminders)',
          'Listings/landing page templates',
          'Ads pipeline + lead routing rules',
          'Lightweight SEO + GMB optimization',
        ],
        weeks: 3, setup: '$3k–$6k', monthly: '$600–$1.2k',
      },
      {
        key: 'scale',
        name: 'Scale',
        who: 'Teams / brokerages',
        outcomes: ['Team routing', 'Reporting & QA', 'Always-on growth'],
        includes: [
          'Everything in Growth',
          'Round-robin + lead scoring',
          'AI agent for listing inquiries (beta)',
          'Call tracking + whisper + recordings',
          'Quarterly campaign sprints (ads + email)',
          'Dashboards (appointments, speed-to-lead, ROI)',
        ],
        weeks: 4, setup: '$6k–$12k', monthly: '$1.2k–$3k',
      },
    ],
    timeline: [
      { w: 'Week 1 — Discover', before: 'Leads scattered, slow replies, mixed adoption.', after: 'Clear goals, mapped stack, audit + intake complete.' },
      { w: 'Week 2 — Design',   before: 'No shared flows or templates.',                 after: 'Approved flowchart + copy + booking play, roles set.' },
      { w: 'Week 3–4 — Build',  before: 'Manual follow-ups, missed handoffs.',           after: 'Automations live: instant reply, nurture, routing, reminders.' },
      { w: 'Week 5 — Launch',   before: 'No visibility on ROI.',                          after: 'Dashboards + training + 30-day optimization window.' },
    ],
    impact: {
      client: 'Comox Realty — Calgary',
      problem:
        'Leads slipping through cracks without nurturing; slow response due to manual admin; open house/event engagement underperforming.',
      solution:
        'Implemented Growth package: unified capture, sub-60s replies, GHL pipeline/opportunities, booking + reminders, event follow-ups.',
      metrics: [
        { k: 'Speed-to-lead', v: '-58%' },
        { k: 'Booked appts', v: '+44%' },
        { k: 'Open-house RSVPs', v: '+27%' },
      ],
      quote: '“Nothing falls through—agents get assignments instantly and prospects hear from us fast.”',
      note: 'Pilot over 60 days; anonymized metrics.',
    },
    tech: [
      // original stack
      { name: 'GoHighLevel', desc: 'All-in-one CRM, pipelines, calendars, SMS/email.' },
      { name: 'Make.com', desc: 'Advanced workflow automation across apps.' },
      { name: 'Zapier', desc: 'Fast connectors for simple app-to-app tasks.' },
      { name: 'Twilio', desc: 'Programmable calls/SMS for routing and alerts.' },
      { name: 'Google Business', desc: 'Reviews, local presence, messaging.' },
      // added stack you wanted kept + new ones
      { name: 'Instantly AI', desc: 'Cold email at scale (warming, rotation, analytics).' },
      { name: 'n8n', desc: 'Self-hostable automation workflows with nodes.' },
      { name: 'Figma', desc: 'Design systems, landing pages, assets.' },
      { name: 'OpenAI', desc: 'Generative text + assistants for FAQs and replies.' },
      { name: 'ElevenLabs', desc: 'Realistic voice for IVR/voicemail/overviews.' },
      { name: 'QuickBooks', desc: 'Invoicing + bookkeeping sync.' },
      { name: 'Calendly', desc: 'Scheduling with round-robin and buffers.' },
    ],
    faq: [
      { q: 'How fast is setup?', a: 'Typically 2–4 weeks depending on tier and integrations.' },
      { q: 'Do you replace our CRM?', a: 'We can build on GoHighLevel or integrate with your current CRM.' },
      { q: 'What about IDX?', a: 'We can integrate IDX or use high-converting non-IDX funnels.' },
      { q: 'Who owns the data?', a: 'You do. We work under your accounts and deliver documentation.' },
      { q: 'What about training?', a: 'SOPs + Looms + 30-day calibration are included.' },
      { q: 'Can we start small?', a: 'Yes—Starter tier lands quick wins, then expand.' },
    ],
    consoleSeed: {
      id: 're',
      title: 'Lead Intake & Routing',
      sub: 'Form Filled → GHL → Webhook → Normalize → Enrich → Route → Write to CRM → Notify',
      est: '~4.1s execution',
      lines: [
        'Form Filled — Facebook Lead Ad or Website Form',
        'GoHighLevel:',
        '  • Contact created/updated',
        '  • Pipeline opportunity created/updated (stage: New Lead)',
        '  • Designated user assigned & alerted',
        '  • Welcome SMS + Email sent to lead',
        'Webhook received — validating payload… ok',
        'Normalize: name, email, phone, desired area, price, bedrooms… ok',
        'Enrich email (Hunter/Clearbit)… ok',
        'Route: Buyer vs Seller → round-robin to on-duty agent… assigned Agent 1',
        'Write to CRM timeline + Google Sheet row… ok',
        'Set up Email/SMS subscriptions (nurture, reminders)… ok',
        'Execution finished — success',
      ],
    },
  },

  'home-services': {
    heroTitle: 'Automations that win more jobs in Home Services',
    heroSub: 'From quote requests to dispatch and reviews — in weeks, not months.',
    outcomes: ['Faster dispatch with fewer cancellations', '+20–50% more booked jobs', 'Lower admin load for CSRs and techs'],
    packages: [
      { key: 'starter', name: 'Starter', who: 'Small crews',
        outcomes: ['Faster replies', 'On-my-way texts'],
        includes: ['Estimate request forms', 'Immediate SMS/email + 2-day follow-up', 'Calendar booking + tech reminders', 'Review booster'],
        weeks: 2, setup: '$1.5k–$3k', monthly: '$300–$600' },
      { key: 'growth', name: 'Growth', who: 'Growing teams',
        outcomes: ['More booked jobs', 'Reduced no-shows'],
        includes: ['Everything in Starter', 'Multi-channel nurture', 'No-show reduction flow', 'Ads pipeline + routing rules', 'Local SEO tune-up'],
        weeks: 3, setup: '$3k–$6k', monthly: '$600–$1.2k' },
      { key: 'scale', name: 'Scale', who: 'Multi-crew ops',
        outcomes: ['Routing + scoring', 'QA + reporting'],
        includes: ['Everything in Growth', 'Round-robin + lead scoring', 'Call tracking + recordings', 'Quarterly campaign sprints', 'Ops dashboards'],
        weeks: 4, setup: '$6k–$12k', monthly: '$1.2k–$3k' },
    ],
    timeline: [
      { w: 'Week 1 — Discover', before: 'Unstructured intake; missed calls.', after: 'Audit, intake, priorities set.' },
      { w: 'Week 2 — Design',   before: 'No standardized quotes.',         after: 'Templates + flowchart approved.' },
      { w: 'Week 3–4 — Build',  before: 'Manual follow-ups.',               after: 'Auto-reply, nurture, reminders live.' },
      { w: 'Week 5 — Launch',   before: 'No metrics.',                      after: 'Dashboards + training in place.' },
    ],
    impact: {
      client: 'North Peak Plumbing — Edmonton',
      problem: 'Missed calls and slow follow-up led to lost jobs.',
      solution: 'Starter → Growth path: instant SMS, on-my-way texts, reminders, review engine.',
      metrics: [
        { k: 'Booked jobs', v: '+29%' },
        { k: 'Cancellations', v: '-18%' },
        { k: 'CSR hours', v: '-25h/mo' },
      ],
      quote: '“We look bigger and move faster—calls don’t get lost anymore.”',
      note: 'Snapshot over 45 days.',
    },
    tech: [
      { name: 'GoHighLevel', desc: 'CRM + calendars + automation.' },
      { name: 'Make.com', desc: 'Cross-tool automation.' },
      { name: 'Zapier', desc: 'Quick app connectors.' },
      { name: 'Twilio', desc: 'Call/SMS routing + alerts.' },
      { name: 'Google Business', desc: 'Reviews + local pack visibility.' },
      { name: 'Instantly AI', desc: 'Outbound follow-ups and sequences.' },
      { name: 'n8n', desc: 'Self-host workflow engine.' },
      { name: 'Figma', desc: 'Visuals, estimates, landing blocks.' },
      { name: 'OpenAI', desc: 'Assistants for replies/scripts.' },
      { name: 'ElevenLabs', desc: 'Voice snippets / IVR.' },
      { name: 'QuickBooks', desc: 'Invoices/payments sync.' },
      { name: 'Calendly', desc: 'Scheduling with buffers.' },
    ],
    faq: [
      { q: 'How fast can we go live?', a: '2–4 weeks for core setup depending on tiers/integrations.' },
      { q: 'Do you work with our phone system?', a: 'Yes—Twilio or your carrier via forwarding/integrations.' },
      { q: 'What KPIs do we see?', a: 'Speed-to-lead, booked jobs, no-show rate, review velocity, and more.' },
      { q: 'Do you run ads?', a: 'We can—optionally add LSA/Google/Meta with reporting and call tracking.' },
      { q: 'Who manages reviews?', a: 'We set the engine; your team approves/replies as needed.' },
      { q: 'Support?', a: 'Training, SOPs, and a 30-day calibration period are included.' },
    ],
    consoleSeed: {
      id: 'hs',
      title: 'Job Request Intake',
      sub: 'Quote Request → GHL → Webhook → Normalize → Route → Confirm → Review Ask',
      est: '~3.7s execution',
      lines: [
        'Quote Request — Website form or Call-in transcript',
        'GoHighLevel:',
        '  • Contact created/updated',
        '  • Opportunity created/updated (stage: New Job)',
        '  • On-call dispatcher assigned & alerted',
        '  • SMS + Email confirmation sent to customer',
        'Webhook received — validating payload… ok',
        'Normalize: name, phone, service, location, preferred time… ok',
        'Route: by zip/postal code & schedule… assigned Tech A',
        'Write job to CRM + calendar block… ok',
        'Set reminders & review request sequence… ok',
        'Execution finished — success',
      ],
    },
  },

  'childcare-education': {
    heroTitle: 'Automations that grow enrollments in Childcare & Education',
    heroSub: 'From tour requests to waitlists and parent comms — live in weeks.',
    outcomes: ['More tours booked (and showed)', 'Lower admin time for staff', 'Steady enrollment pipeline'],
    packages: [
      { key: 'starter', name: 'Starter', who: 'Single location',
        outcomes: ['Faster replies', 'More tours'],
        includes: ['Program pages + forms', 'Immediate SMS/email + 2-day follow-up', 'Tour booking + reminders', 'Review prompts'],
        weeks: 2, setup: '$1.5k–$3k', monthly: '$300–$600' },
      { key: 'growth', name: 'Growth', who: 'Multi-programs',
        outcomes: ['No-show ↓', 'Hands-off nurture'],
        includes: ['Everything in Starter', 'Multi-channel nurture', 'No-show reduction', 'Landing templates', 'Light SEO + GMB optimization'],
        weeks: 3, setup: '$3k–$6k', monthly: '$600–$1.2k' },
      { key: 'scale', name: 'Scale', who: 'Multi-site orgs',
        outcomes: ['Routing + reporting', 'Always-on growth'],
        includes: ['Everything in Growth', 'Round-robin + scoring (by program/site)', 'Quarterly enrollment sprints', 'Dashboards'],
        weeks: 4, setup: '$6k–$12k', monthly: '$1.2k–$3k' },
    ],
    timeline: [
      { w: 'Week 1 — Discover', before: 'Manual replies; long waitlist spreadsheets.', after: 'Audit + goals; intake captured.' },
      { w: 'Week 2 — Design',   before: 'No unified tour journey.',                    after: 'Flows + templates approved.' },
      { w: 'Week 3–4 — Build',  before: 'Missed tours; poor follow-ups.',              after: 'Auto-reply, reminders, updates live.' },
      { w: 'Week 5 — Launch',   before: 'Scattered comms; limited insight.',           after: 'Dashboards + SOPs; steady cadence.' },
    ],
    impact: {
      client: 'Sunvalley Kids Montessori — Calgary',
      problem:
        'Ads attracting out-of-area parents; slow/incomplete responses by email/SMS; hard to batch invoices and request reviews. QuickBooks + automation fixed billing, reviews, and tracking.',
      solution:
        'Growth package: tour booking + reminders, geo-targeted ad intake, QuickBooks integration for invoices, review engine, parent comms.',
      metrics: [
        { k: 'Enrollments / bookings', v: '+46%' },
        { k: 'Admin hours', v: '-30h/week' },
        { k: 'On-time invoice collection', v: '+33%' },
      ],
      quote: '“Parents get clear info right away and tours fill up. Billing is finally smooth.”',
      note: 'First term after launch.',
    },
    tech: [
      { name: 'GoHighLevel', desc: 'CRM + calendars + automation.' },
      { name: 'Make.com', desc: 'Cross-tool automation.' },
      { name: 'Zapier', desc: 'Quick app connectors.' },
      { name: 'Twilio', desc: 'Calls/SMS for reminders + alerts.' },
      { name: 'Google Business', desc: 'Reviews + local pack visibility.' },
      // plus the ones you requested to add
      { name: 'HiMama', desc: 'Childcare management: attendance, parent comms, billing.' },
      { name: 'n8n', desc: 'Self-host workflow engine.' },
      { name: 'Calendly', desc: 'Tour scheduling with buffers.' },
      { name: 'Figma', desc: 'Design assets and pages.' },
      { name: 'OpenAI', desc: 'Assistants for Parent FAQs/comms.' },
      { name: 'ElevenLabs', desc: 'Voice reminders/IVR as needed.' },
      { name: 'QuickBooks', desc: 'Billing/accounting sync.' },
    ],
    faq: [
      { q: 'How long to launch?', a: '2–4 weeks for core flows; complex sites can add time.' },
      { q: 'Do you replace our tools?', a: 'No—we can integrate with your stack or use GHL.' },
      { q: 'Privacy & data ownership?', a: 'You own the data; we work under your accounts and document everything.' },
      { q: 'Will staff adopt this?', a: 'We include training + SOPs; we adjust with you for 30 days.' },
      { q: 'IDX equivalent?', a: 'Not relevant—focus is tours/waitlists, not listings.' },
      { q: 'Budget flexibility?', a: 'Tiers scale from Starter to Scale based on needs.' },
    ],
    consoleSeed: {
      id: 'cc',
      title: 'Tour Booking Flow',
      sub: 'Tour Form → GHL → Webhook → Normalize → Route → CRM → QuickBooks/Reviews',
      est: '~3.2s execution',
      lines: [
        'Tour Request Submitted — Program page form',
        'GoHighLevel:',
        '  • Contact created/updated',
        '  • Opportunity created/updated (stage: Tour Requested)',
        '  • Location/program owner assigned & alerted',
        '  • Info SMS + Email sent to parent',
        'Webhook received — validating payload… ok',
        'Normalize: child age, program, preferred time, contact details… ok',
        'Route: by program/site capacity… assigned to Program Lead',
        'Write to CRM timeline… ok',
        'QuickBooks sync: queued invoice batch (if applicable)… ok',
        'Review engine: schedule post-tour prompts… ok',
        'Execution finished — success',
      ],
    },
  },
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function IndustriesDetail() {
  const { slug } = useParams();
  const meta = industries.find((i) => i.slug === slug);

  if (!meta) {
    return (
      <NotFound
        title="Industry not found"
        message="That industry doesn’t exist. Choose another vertical or request a proposal."
        backHref="/industries"
        backText="Browse Industries"
        actions={[{ href: '/get-started', label: 'Get Started', primary: true }]}
      />
    );
  }

  const content = CONTENT[slug];

  if (!content) {
    return (
      <article className="container mx-auto px-4 py-10 space-y-8">
        <nav className="text-base" style={{ color: 'var(--darkest-brown)' }}>
          <Link to="/industries" className="hover:underline" style={{ color: 'var(--darkest-brown)' }}>
            Industries
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span>{meta.title}</span>
        </nav>
        <header className="space-y-2">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--darkest-brown)' }}>
            {meta.title}
          </h1>
          {meta.subtitle && <p className="text-gray-600 max-w-2xl">{meta.subtitle}</p>}
        </header>
        <p style={{ color: 'var(--text-secondary)' }}>
          We’re preparing a tailored package for this industry. In the meantime, explore our{' '}
          <Link to="/solutions" className="underline">solutions</Link> or{' '}
          <Link to="/get-started" className="underline">get started</Link>.
        </p>
      </article>
    );
  }

  const tierHref = (tierKey) => `/industries/${slug}/package/${tierKey}`;

  return (
    <section id={`industry-${slug}`} className="section" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="container page-pad space-y-10">
        {/* Breadcrumbs (raised & dark brown @16px) */}
        <nav className="pt-2 -mb-4">
          <div className="inline-flex items-center gap-2 text-base" style={{ color: 'var(--darkest-brown)' }}>
            <Link to="/industries" className="hover:underline" style={{ color: 'var(--darkest-brown)' }}>
              Industries
            </Link>
            <span className="text-gray-400">/</span>
            <span>{meta.title}</span>
          </div>
        </nav>

        {/* Header */}
        <header className="text-center mb-4">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4 section-header-underline animate-in"
            style={{ color: 'var(--darkest-brown)' }}
          >
            {content.heroTitle}
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {content.heroSub}
          </p>
        </header>

        {/* Outcomes */}
        <section className="grid sm:grid-cols-3 gap-4">
          {content.outcomes.map((o, i) => (
            <div key={i} className="p-4 rounded-xl border-2 text-center"
                 style={{ borderColor: 'var(--light-brown)', background: 'var(--white)' }}>
              <div className="font-semibold" style={{ color: 'var(--darkest-brown)' }}>{o}</div>
            </div>
          ))}
        </section>

        {/* Packages — iOS-y hover (push/zoom + glow), entire card clickable */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--darkest-brown)' }}>Packages</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {content.packages.map((p) => (
              <Link
                key={p.key}
                to={tierHref(p.key)}
                className="group block rounded-2xl border-2 p-6 transition-all will-change-transform"
                style={{
                  borderColor: 'var(--light-brown)',
                  background: 'var(--white)',
                  boxShadow: '0 0 0 rgba(0,0,0,0)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(150,114,89,0.18)';
                  e.currentTarget.style.borderColor = 'var(--medium-brown)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
                  e.currentTarget.style.borderColor = 'var(--light-brown)';
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xl font-semibold" style={{ color: 'var(--darkest-brown)' }}>{p.name}</div>
                  <div className="text-xs px-2 py-0.5 rounded-full border"
                       style={{ borderColor: 'var(--light-brown)', color: 'var(--text-light)' }}>
                    {p.who}
                  </div>
                </div>
                <ul className="text-sm mb-3 space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  {p.outcomes.map((x, i) => <li key={i}>• {x}</li>)}
                </ul>
                <div className="text-sm mb-3" style={{ color: 'var(--text-light)' }}>What’s included:</div>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  {p.includes.slice(0, 5).map((x, i) => <li key={i}>• {x}</li>)}
                </ul>
                <div className="mt-4 text-sm flex items-center justify-between">
                  <span style={{ color: 'var(--text-light)' }}>Timeline: ~{p.weeks} weeks</span>
                  <span style={{ color: 'var(--darkest-brown)' }}>Setup {p.setup} · {p.monthly}/mo</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Impact Snapshot + Automation Console */}
        <section className="grid lg:grid-cols-3 gap-6 items-stretch">
          {/* Impact card (more balanced) */}
          <div className="lg:col-span-1 rounded-2xl border-2 p-6"
               style={{ borderColor: 'var(--light-brown)', background: 'var(--white)' }}>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--darkest-brown)' }}>Impact Snapshot</h3>
            <div className="text-sm mb-2" style={{ color: 'var(--text-light)' }}>{content.impact.client}</div>
            <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p><strong>Problem:</strong> {content.impact.problem}</p>
              <p><strong>Solution:</strong> {content.impact.solution}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 my-4">
              {content.impact.metrics.map((m, i) => (
                <div key={i} className="rounded-xl border p-3 text-center"
                     style={{ borderColor: 'var(--light-brown)', background: 'var(--cream)' }}>
                  <div className="text-lg font-bold" style={{ color: 'var(--darkest-brown)' }}>{m.v}</div>
                  <div className="text-xs" style={{ color: 'var(--text-light)' }}>{m.k}</div>
                </div>
              ))}
            </div>
            <blockquote className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
              “{content.impact.quote}”
            </blockquote>
            <div className="mt-3 text-xs" style={{ color: 'var(--text-light)' }}>{content.impact.note}</div>
          </div>

          {/* Automation Console */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--darkest-brown)' }}>
              Live Run — see how the flow behaves
            </h3>
            <AutomationConsole seed={content.consoleSeed} />
          </div>
        </section>

        {/* Timeline (new) */}
        <section>
          <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--darkest-brown)' }}>
            From audit to outcomes — what changes week by week
          </h3>
          <DotRevealTimeline items={content.timeline} />
        </section>

        {/* Tech stack */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold" style={{ color: 'var(--darkest-brown)' }}>Tech Stack</h3>
          <TechStack items={content.tech} />
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold" style={{ color: 'var(--darkest-brown)' }}>FAQs</h3>
          <FAQ items={content.faq} />
        </section>

        {/* Bottom CTAs */}
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <CTAButton label="Get Started" to="/get-started" variant="dark" size="md" useNavLink />
          <Link to="/solutions" className="px-5 py-3 rounded-xl border"
                style={{ borderColor: 'var(--light-brown)', color: 'var(--darkest-brown)', background: 'var(--white)' }}>
            View All Solutions
          </Link>
        </div>
      </div>
    </section>
  );
}
