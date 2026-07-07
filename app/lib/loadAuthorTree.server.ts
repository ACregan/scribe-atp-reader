import { listSites, listArticles } from "@scribe-atp/core";
import { withNotFound } from "./withNotFound";

// Shared by tree.tsx and tree-alt.tsx, which render the same full hierarchy
// at two different URLs (/:author and /:author/site.standard.publication).
export function loadAuthorTree(author: string, signal: AbortSignal) {
  return withNotFound(async () => {
    const [sites, articles] = await Promise.all([
      listSites(author, signal),
      listArticles(author, signal),
    ]);
    return { author, sites, articles };
  });
}
