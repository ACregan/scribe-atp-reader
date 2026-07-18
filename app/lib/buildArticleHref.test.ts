import { describe, it, expect } from "vitest";
import { buildArticleHref } from "./buildArticleHref";

const articleUri = "at://did:plc:author/site.standard.document/3mp4hfovqib2h";

describe("buildArticleHref", () => {
  it("builds a site+group path when both siteDomain and groupSlug are given", () => {
    expect(buildArticleHref("alice.bsky.social", articleUri, "alice.example.com", "writing")).toBe(
      "/alice.bsky.social/site.standard.publication/alice.example.com/writing/3mp4hfovqib2h",
    );
  });

  it("falls back to the flat document path when siteDomain is missing", () => {
    expect(buildArticleHref("alice.bsky.social", articleUri, undefined, "writing")).toBe(
      "/alice.bsky.social/site.standard.document/3mp4hfovqib2h",
    );
  });

  it("falls back to the flat document path when groupSlug is missing", () => {
    expect(buildArticleHref("alice.bsky.social", articleUri, "alice.example.com", undefined)).toBe(
      "/alice.bsky.social/site.standard.document/3mp4hfovqib2h",
    );
  });

  it("falls back to the flat document path when neither is given", () => {
    expect(buildArticleHref("alice.bsky.social", articleUri)).toBe(
      "/alice.bsky.social/site.standard.document/3mp4hfovqib2h",
    );
  });
});
