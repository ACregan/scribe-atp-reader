import { fetchSite, NotFoundError } from "@scribe-atp/core";
import { fetchWithFastPath } from "./pdsRetry.server";

// Shared by site.tsx, group.tsx, and article-site.tsx, which all need the
// same site record and 404 semantics for a bare domain from the URL.
export async function loadSite(author: string, siteDomain: string, signal: AbortSignal) {
  try {
    return await fetchWithFastPath(
      () => fetchSite(author, `https://${siteDomain}`, signal),
      signal,
    );
  } catch (error) {
    if (error instanceof NotFoundError) throw new Response("Not Found", { status: 404 });
    throw error;
  }
}
