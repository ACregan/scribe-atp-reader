import { describe, it, expect } from "vitest";
import { tagArticles } from "./tagArticles";
import type { SiteRecord, ArticleRef } from "@scribe-atp/core";

const makeArticle = (rkey: string): ArticleRef => ({
  uri: `at://did:plc:author/site.standard.document/${rkey}`,
  title: `Article ${rkey}`,
  splashImageUrl: null,
  createdAt: "2024-01-01T00:00:00Z",
});

const makeSite = (published: string[], unpublished: string[]): SiteRecord => ({
  uri: "at://did:plc:author/site.standard.publication/site1",
  title: "My Site",
  url: "mysite.com",
  urlPrefix: "",
  groups: [
    {
      title: "Group",
      slug: "group",
      articles: published.map(makeArticle),
    },
  ],
  ungroupedArticles: unpublished.map(makeArticle),
});

describe("tagArticles", () => {
  it("tags a published article", () => {
    const result = tagArticles([makeSite(["pub1"], [])], [makeArticle("pub1")]);
    expect(result[0].state).toBe("published");
  });

  it("tags an unpublished article", () => {
    const result = tagArticles([makeSite([], ["unpub1"])], [makeArticle("unpub1")]);
    expect(result[0].state).toBe("unpublished");
  });

  it("tags a draft article", () => {
    const result = tagArticles([], [makeArticle("draft1")]);
    expect(result[0].state).toBe("draft");
  });

  it("handles a mix of all three states", () => {
    const site = makeSite(["pub1"], ["unpub1"]);
    const result = tagArticles([site], [
      makeArticle("pub1"),
      makeArticle("unpub1"),
      makeArticle("draft1"),
    ]);
    expect(result.find((a) => a.uri.endsWith("pub1"))?.state).toBe("published");
    expect(result.find((a) => a.uri.endsWith("unpub1"))?.state).toBe("unpublished");
    expect(result.find((a) => a.uri.endsWith("draft1"))?.state).toBe("draft");
  });

  it("handles articles spread across multiple sites", () => {
    const result = tagArticles(
      [makeSite(["pub1"], []), makeSite(["pub2"], ["unpub1"])],
      [makeArticle("pub1"), makeArticle("pub2"), makeArticle("unpub1")]
    );
    expect(result[0].state).toBe("published");
    expect(result[1].state).toBe("published");
    expect(result[2].state).toBe("unpublished");
  });

  it("preserves all article fields", () => {
    const article: ArticleRef = {
      uri: "at://did:plc:author/site.standard.document/rkey1",
      title: "My Article",
      description: "A description",
      splashImageUrl: null,
      createdAt: "2024-01-01T00:00:00Z",
    };
    expect(tagArticles([], [article])[0]).toMatchObject({
      uri: article.uri,
      title: article.title,
      description: article.description,
      state: "draft",
    });
  });

  it("returns an empty array when there are no articles", () => {
    expect(tagArticles([], [])).toEqual([]);
  });
});
