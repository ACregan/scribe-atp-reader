import type { SiteRecord, ArticleRef } from "@scribe-atp/core";

// Two states, not three: Scribe CMS's ADR 0013 merged what used to be a
// separate "unpublished" state (assigned to a site but not yet grouped)
// into "draft" — assignment and grouping now happen together, so an
// article is either in a group (published) or it isn't (draft). See
// scribe-atp.app's ADR 0013 and this repo's own CLAUDE.md for the history.
export type ArticleState = "published" | "draft";

export interface TaggedArticle extends ArticleRef {
  state: ArticleState;
}

export function tagArticles(
  sites: SiteRecord[],
  articles: ArticleRef[]
): TaggedArticle[] {
  const publishedUris = new Set(
    sites.flatMap((s) => s.groups.flatMap((g) => g.articles.map((a) => a.uri)))
  );
  return articles.map((a) => ({
    ...a,
    state: publishedUris.has(a.uri) ? "published" : "draft",
  }));
}
