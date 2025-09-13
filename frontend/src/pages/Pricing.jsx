import { Link } from 'react-router-dom';

export default function Pricing() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-3">
      <h1 className="text-3xl font-bold">Pricing</h1>
      <p className="text-gray-600">
        We’re finalizing packages and usage tiers. Get an exact quote via the proposal form.
      </p>
      <ul className="list-disc pl-5">
        <li><strong>Setup + Monthly</strong> pricing with pass-through usage.</li>
        <li>Starter, Pro, and Office/Brokerage tiers per industry.</li>
      </ul>
      <Link to="/get-proposal" className="inline-block px-4 py-2 rounded-xl text-white" style={{ background: 'var(--medium-brown)' }}>
        Get a Proposal
      </Link>
    </div>
  );
}