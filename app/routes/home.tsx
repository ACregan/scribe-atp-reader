import { useState } from "react";
import { useNavigate } from "react-router";

export function meta() {
  return [{ title: "Scribe Reader" }];
}

export default function Home() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim().replace(/^at:\/\//, "");
    if (trimmed) navigate(`/${trimmed}`);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <h1 className="text-4xl font-semibold tracking-tight mb-2 text-center">
          Scribe Reader
        </h1>
        <p className="text-center text-gray-500 mb-10 text-sm">
          Browse any Scribe author's content
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="alice.bsky.social"
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 font-mono"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </form>
        <p className="text-xs text-gray-400 text-center mt-3">
          Paste a handle, DID, or <code>at://</code> URI — press Enter to browse
        </p>
      </div>
    </main>
  );
}
