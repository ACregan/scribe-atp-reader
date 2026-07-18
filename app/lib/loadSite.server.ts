import { fetchSite } from "@scribe-atp/core";
import { withNotFound } from "./withNotFound";

// Shared by site.tsx, group.tsx, and article-site.tsx, which all need the
// same site record and 404 semantics for a bare domain from the URL.
export function loadSite(author: string, siteDomain: string, signal: AbortSignal) {
  return withNotFound(() => fetchSite(author, `https://${siteDomain}`, signal));
}
