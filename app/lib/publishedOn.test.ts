import { describe, it, expect } from "vitest";
import { findPublishedOn, findPublishedOnInGroup } from "./publishedOn";
import type { Site } from "@scribe-atp/core";

function makeSite(overrides: Partial<Site> = {}): Site {
  return {
    uri: "at://did:plc:author/site.standard.publication/site1",
    title: "Alice's Blog",
    url: "alice.example.com",
    urlPrefix: "",
    groups: [],
    ungroupedArticles: [],
    ...overrides,
  };
}

const articleRkey = "3mp4hfovqib2h";
const articleUri = `at://did:plc:author/site.standard.document/${articleRkey}`;

describe("findPublishedOn", () => {
  it("returns null when no site references the article", () => {
    const sites = [makeSite()];
    expect(findPublishedOn(sites, articleRkey)).toBeNull();
  });

  it("finds the article nested in a group and builds its canonical URL", () => {
    const site = makeSite({
      groups: [{ slug: "writing", title: "Writing", articles: [{ uri: articleUri, title: "My Post", createdAt: "2026-01-01", splashImageUrl: null }] }],
    });
    expect(findPublishedOn([site], articleRkey)).toEqual({
      title: "Alice's Blog",
      canonicalUrl: `https://alice.example.com/writing/${articleRkey}`,
    });
  });

  it("prefers the article's own slug over its rkey when present", () => {
    const site = makeSite({
      groups: [{ slug: "writing", title: "Writing", articles: [{ uri: articleUri, slug: "my-post", title: "My Post", createdAt: "2026-01-01", splashImageUrl: null }] }],
    });
    expect(findPublishedOn([site], articleRkey)?.canonicalUrl).toBe(
      "https://alice.example.com/writing/my-post",
    );
  });

  it("applies the site's urlPrefix when set", () => {
    const site = makeSite({
      urlPrefix: "blog",
      groups: [{ slug: "writing", title: "Writing", articles: [{ uri: articleUri, title: "My Post", createdAt: "2026-01-01", splashImageUrl: null }] }],
    });
    expect(findPublishedOn([site], articleRkey)?.canonicalUrl).toBe(
      `https://alice.example.com/blog/writing/${articleRkey}`,
    );
  });

  it("searches across multiple sites and stops at the first match", () => {
    const emptySite = makeSite({ title: "Empty", url: "empty.example.com" });
    const matchingSite = makeSite({
      groups: [{ slug: "writing", title: "Writing", articles: [{ uri: articleUri, title: "My Post", createdAt: "2026-01-01", splashImageUrl: null }] }],
    });
    expect(findPublishedOn([emptySite, matchingSite], articleRkey)?.title).toBe("Alice's Blog");
  });
});

describe("findPublishedOnInGroup", () => {
  it("returns null when the groupSlug doesn't exist on the site", () => {
    const site = makeSite();
    expect(findPublishedOnInGroup(site, "missing-group", articleRkey)).toBeNull();
  });

  it("returns null when the group exists but doesn't contain the article", () => {
    const site = makeSite({ groups: [{ slug: "writing", title: "Writing", articles: [] }] });
    expect(findPublishedOnInGroup(site, "writing", articleRkey)).toBeNull();
  });

  it("finds the article within the named group and builds its canonical URL", () => {
    const site = makeSite({
      groups: [{ slug: "writing", title: "Writing", articles: [{ uri: articleUri, title: "My Post", createdAt: "2026-01-01", splashImageUrl: null }] }],
    });
    expect(findPublishedOnInGroup(site, "writing", articleRkey)).toEqual({
      title: "Alice's Blog",
      canonicalUrl: `https://alice.example.com/writing/${articleRkey}`,
    });
  });

  it("does not match the article if it's in a different group on the same site", () => {
    const site = makeSite({
      groups: [
        { slug: "writing", title: "Writing", articles: [] },
        { slug: "projects", title: "Projects", articles: [{ uri: articleUri, title: "My Post", createdAt: "2026-01-01", splashImageUrl: null }] },
      ],
    });
    expect(findPublishedOnInGroup(site, "writing", articleRkey)).toBeNull();
  });
});
