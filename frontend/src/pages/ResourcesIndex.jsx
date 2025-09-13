import { Link } from 'react-router-dom';

export default function ResourcesIndex() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-3">
      <h1 className="text-3xl font-bold">Resources</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { href: "/resources/blog", title: "Blog" },
          { href: "/resources/playbooks", title: "Playbooks" },
          { href: "/resources/templates", title: "Templates" },
          { href: "/resources/roi-calculator", title: "ROI Calculator" },
          { href: "/resources/webinars", title: "Webinars" },
          { href: "/resources/help-center", title: "Help Center" },
        ].map((i) => (
          <Link key={i.href} to={i.href} className="border rounded-xl p-4 hover:shadow">
            {i.title}
          </Link>
        ))}
      </div>
    </div>
  );
}