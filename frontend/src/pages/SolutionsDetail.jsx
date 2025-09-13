import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { solutions } from '@/data/solutions';
import NotFound from '@/pages/NotFound';

export default function SolutionsDetail() {
  const { slug } = useParams();
  const s = solutions.find((x) => x.slug === slug);

  if (!s) {
    return (
      <NotFound
        title="Solution not found"
        message="That solution doesn’t exist. Browse solutions or request a proposal and we’ll guide you."
        backHref="/solutions"
        backText="Browse Solutions"
        actions={[{ href: '/get-started', label: 'Get Started', primary: true }]}
      />
    );
  }

  const subtitle = s.outcomes || s.summary || '';
  const deliverables = s.deliverables || [];
  const integrations = s.integrations || [];
  const kpis = s.kpis || [];
  const ctas = s.cta || [];

  const related = solutions
    .filter((x) => x.group === s.group && x.slug !== s.slug)
    .slice(0, 3);

  return (
    <section
      id="solutions-detail"
      className="section"
      style={{ backgroundColor: 'var(--cream)' }}
    >
      <article className="container page-pad space-y-8">
        {/* Breadcrumb */}
        <nav className="text-sm">
          <Link to="/solutions" className="text-blue-600">Solutions</Link>{' '}
          <span className="text-gray-400">/</span>{' '}
          <span className="text-gray-700">{s.title}</span>
        </nav>

        {/* Header */}
        <header className="space-y-2">
          <div className="text-xs inline-flex px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--light-brown)', color: 'var(--darkest-brown)' }}>
            Solution
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-2 section-header-underline"
            style={{ color: 'var(--darkest-brown)' }}
          >
            {s.title}
          </h1>
          {subtitle && (
            <p className="text-lg max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
              {subtitle}
            </p>
          )}
        </header>

        {/* Who it’s for */}
        {s.who && (
          <section
            className="rounded-2xl border-2 p-5"
            style={{ backgroundColor: 'var(--white)', borderColor: 'var(--light-brown)' }}
          >
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--darkest-brown)' }}>Who it’s for</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{s.who}</p>
          </section>
        )}

        {/* Deliverables */}
        {deliverables.length > 0 && (
          <section
            className="rounded-2xl border-2 p-5"
            style={{ backgroundColor: 'var(--white)', borderColor: 'var(--light-brown)' }}
          >
            <h2 className="text-lg font-semibold" style={{ color: 'var(--darkest-brown)' }}>Deliverables</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2" style={{ color: 'var(--text-secondary)' }}>
              {deliverables.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </section>
        )}

        {/* Integrations + KPIs */}
        {(integrations.length > 0 || kpis.length > 0) && (
          <aside className="grid md:grid-cols-2 gap-4">
            {integrations.length > 0 && (
              <div
                className="rounded-2xl border-2 p-5"
                style={{ backgroundColor: 'var(--white)', borderColor: 'var(--light-brown)' }}
              >
                <h3 className="font-semibold" style={{ color: 'var(--darkest-brown)' }}>Integrations</h3>
                <ul className="mt-2 space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  {integrations.map((d, i) => <li key={i}>• {d}</li>)}
                </ul>
              </div>
            )}
            {kpis.length > 0 && (
              <div
                className="rounded-2xl border-2 p-5"
                style={{ backgroundColor: 'var(--white)', borderColor: 'var(--light-brown)' }}
              >
                <h3 className="font-semibold" style={{ color: 'var(--darkest-brown)' }}>KPIs</h3>
                <ul className="mt-2 space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  {kpis.map((d, i) => <li key={i}>• {d}</li>)}
                </ul>
              </div>
            )}
          </aside>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          {ctas.map((label, i) => (
            <span
              key={i}
              className="px-4 py-2 rounded-xl border"
              style={{ borderColor: 'var(--light-brown)', color: 'var(--darkest-brown)' }}
              title={label}
            >
              {label}
            </span>
          ))}
          <Link
            to="/get-started"
            className="px-5 py-3 rounded-xl text-white"
            style={{ background: 'var(--medium-brown)' }}
          >
            Get Started
          </Link>
          <Link
            to="/pricing"
            className="px-5 py-3 rounded-xl border"
          >
            View Pricing
          </Link>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="pt-2">
            <h3 className="font-semibold mb-3" style={{ color: 'var(--darkest-brown)' }}>
              Related {s.group === 'core' ? 'Core' : 'Plug-and-Play'} modules
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/solutions/${r.slug}`}
                  className="rounded-2xl border-2 p-4 hover:shadow transition"
                  style={{ backgroundColor: 'var(--white)', borderColor: 'var(--light-brown)' }}
                >
                  <div className="font-medium" style={{ color: 'var(--darkest-brown)' }}>{r.title}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {r.summary || r.outcomes}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </section>
  );
}