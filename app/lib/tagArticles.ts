import type { SiteRecord, ArticleRef } from "@scribe-atp/core";

export type ArticleState = "published" | "unpublished" | "draft";

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
  const unpublishedUris = new Set(
    sites.flatMap((s) => s.ungroupedArticles.map((a) => a.uri))
  );
  return articles.map((a) => ({
    ...a,
    state: publishedUris.has(a.uri)
      ? "published"
      : unpublishedUris.has(a.uri)
        ? "unpublished"
        : "draft",
  }));
}
