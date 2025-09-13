import { useLocation } from 'react-router-dom';

export default function ResourcesCatchAll() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean).slice(1); // after /resources
  const title = parts.length ? parts.join(" / ").replace(/\b\w/g, (m) => m.toUpperCase()) : "Overview";
  return (
    <div className="container mx-auto px-4 py-8 space-y-2">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-gray-600">Content coming soon.</p>
    </div>
  );
}