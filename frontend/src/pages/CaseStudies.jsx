import { Link } from 'react-router-dom';

export default function CaseStudies() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-3">
      <h1 className="text-3xl font-bold">Case Studies</h1>
      <p className="text-gray-600">Real results and snapshots coming soon.</p>
      <Link to="/get-proposal" className="inline-block px-4 py-2 rounded-xl text-white" style={{ background: 'var(--medium-brown)' }}>
        Request a case snapshot
      </Link>
    </div>
  );
}