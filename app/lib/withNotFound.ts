// @scribe-atp/core surfaces a missing PDS record as a generic Error whose
// message wraps the underlying HTTP status text — and AT Protocol's
// com.atproto.repo.getRecord returns 400 Bad Request (not 404) for a
// missing record, so "Bad Request" is the actual signal for "not found"
// here. Converts that into a real 404 Response; anything else (network
// failure, a genuine 5xx) is rethrown as-is and left to the root
// ErrorBoundary's generic error path.
//
// Previously this check only existed in tree.tsx/tree-alt.tsx (copy-pasted
// between the two); article.tsx, article-site.tsx, site.tsx, and group.tsx
// had no handling at all, so the exact same missing-record condition
// surfaced as a 404 on some routes and a raw 500 on others.
export async function withNotFound<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof Error && e.message.includes("Bad Request")) {
      throw new Response("Not Found", { status: 404 });
    }
    throw e;
  }
}
