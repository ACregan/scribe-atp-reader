import { listSites, listArticles, NotFoundError } from "@scribe-atp/core";
import { fetchWithFastPath } from "./pdsRetry.server";

// Shared by tree.tsx and tree-alt.tsx, which render the same full hierarchy
// at two different URLs (/:author and /:author/site.standard.publication).
export async function loadAuthorTree(author: string, signal: AbortSignal) {
  try {
    return await fetchWithFastPath(
      async () => {
        const [sites, articles] = await Promise.all([
          listSites(author, signal),
          listArticles(author, signal),
        ]);
        return { author, sites, articles };
      },
      signal,
    );
  } catch (error) {
    if (error instanceof NotFoundError) throw new Response("Not Found", { status: 404 });
    throw error;
  }
}
