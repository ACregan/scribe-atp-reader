import { describe, it, expect } from "vitest";
import { parseAuthorInput } from "./parseAuthorInput";

describe("parseAuthorInput", () => {
  it("returns a plain handle unchanged", () => {
    expect(parseAuthorInput("alice.bsky.social")).toBe("alice.bsky.social");
  });

  it("trims surrounding whitespace", () => {
    expect(parseAuthorInput("  alice.bsky.social  ")).toBe("alice.bsky.social");
  });

  it("strips at:// prefix from a handle", () => {
    expect(parseAuthorInput("at://alice.bsky.social")).toBe("alice.bsky.social");
  });

  it("strips at:// prefix from a DID", () => {
    expect(parseAuthorInput("at://did:plc:abc123")).toBe("did:plc:abc123");
  });

  it("strips at:// and preserves the collection path", () => {
    expect(
      parseAuthorInput("at://did:plc:abc123/app.scribe.article/rkey1")
    ).toBe("did:plc:abc123/app.scribe.article/rkey1");
  });

  it("returns empty string for empty input", () => {
    expect(parseAuthorInput("")).toBe("");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(parseAuthorInput("   ")).toBe("");
  });
});
