import { Link } from 'react-router-dom';

export default function NotFound({
  title = 'Page not found',
  message = "We couldn't find what you were looking for.",
  backHref = '/',
  backText = 'Go Home',
  actions = [],
}) {
  return (
    <div className="container mx-auto px-4 py-14 max-w-2xl">
      <div className="text-6xl font-bold">404</div>
      <h1 className="text-2xl font-semibold mt-2">{title}</h1>
      <p className="text-gray-600 mt-2">{message}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={backHref} className="px-4 py-2 rounded-xl border">{backText}</Link>
        {actions.map((a) => (
          <Link
            key={a.href}
            to={a.href}
            className={`px-4 py-2 rounded-xl ${a.primary ? 'text-white' : 'border'}`}
            style={a.primary ? { background: 'var(--medium-brown)' } : {}}
          >
            {a.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 text-sm text-gray-500">
        Or jump to:{" "}
        <Link to="/solutions" className="text-blue-600">Solutions</Link>{" · "}
        <Link to="/industries" className="text-blue-600">Industries</Link>{" · "}
        <Link to="/get-proposal" className="text-blue-600">Get a Proposal</Link>
      </div>
    </div>
  );
}
