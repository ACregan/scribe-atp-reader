import { Link, Outlet } from "react-router";
import type { Route } from "./+types/author";

export default function AuthorLayout({ params }: Route.ComponentProps) {
  return (
    <>
      <header className="border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
          ← Scribe Reader
        </Link>
        <span className="text-sm font-mono text-gray-600">{params.author}</span>
      </header>
      <Outlet />
    </>
  );
}
