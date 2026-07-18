import { describe, it, expect } from "vitest";
import { bskyPostUrl, readingTimeMinutes } from "./articleMeta";

describe("bskyPostUrl", () => {
  it("builds a bsky.app profile/post link from an at:// URI", () => {
    const uri = "at://did:plc:author123/app.bsky.feed.post/3mp4hfovqib2h";
    expect(bskyPostUrl(uri)).toBe(
      "https://bsky.app/profile/did:plc:author123/post/3mp4hfovqib2h",
    );
  });
});

describe("readingTimeMinutes", () => {
  it("returns a minimum of 1 minute for empty content", () => {
    expect(readingTimeMinutes("")).toBe(1);
  });

  it("returns a minimum of 1 minute for null or undefined content", () => {
    expect(readingTimeMinutes(null)).toBe(1);
    expect(readingTimeMinutes(undefined)).toBe(1);
  });

  it("returns a minimum of 1 minute for whitespace-only content", () => {
    expect(readingTimeMinutes("   \n\t  ")).toBe(1);
  });

  it("rounds word count to the nearest minute at 225 words per minute", () => {
    const text = Array(450).fill("word").join(" ");
    expect(readingTimeMinutes(text)).toBe(2);
  });

  it("rounds down when under the halfway point of a minute", () => {
    const text = Array(300).fill("word").join(" ");
    expect(readingTimeMinutes(text)).toBe(1);
  });
});
