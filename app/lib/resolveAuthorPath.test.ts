import { describe, it, expect, vi } from "vitest";
import { resolveAuthorPath } from "./resolveAuthorPath";

function fetchReturning(status: number): typeof fetch {
  return vi.fn().mockResolvedValue({ status, ok: status >= 200 && status < 300 }) as never;
}

describe("resolveAuthorPath", () => {
  it("returns ok:false with no error for empty input (no-op, matches the form's silent-return)", async () => {
    const result = await resolveAuthorPath("   ", vi.fn());
    expect(result).toEqual({ ok: false, error: "" });
  });

  it("passes a DID straight through without any network call", async () => {
    const fetchImpl = vi.fn();
    const result = await resolveAuthorPath("did:plc:abc123", fetchImpl);
    expect(result).toEqual({ ok: true, path: "/did:plc:abc123" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("strips a leading at:// prefix", async () => {
    const result = await resolveAuthorPath("at://did:plc:abc123/site.standard.document", vi.fn());
    expect(result).toEqual({ ok: true, path: "/did:plc:abc123/site.standard.document" });
  });

  it("resolves a handle successfully and returns the full path", async () => {
    const fetchImpl = fetchReturning(200);
    const result = await resolveAuthorPath("alice.bsky.social", fetchImpl);
    expect(result).toEqual({ ok: true, path: "/alice.bsky.social" });
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining("resolveHandle?handle=alice.bsky.social"),
    );
  });

  it("preserves a path suffix (e.g. site.standard.document) when resolving a handle", async () => {
    const fetchImpl = fetchReturning(200);
    const result = await resolveAuthorPath("alice.bsky.social/site.standard.document", fetchImpl);
    expect(result).toEqual({ ok: true, path: "/alice.bsky.social/site.standard.document" });
    // Only the handle part (before the first slash) is sent to resolveHandle.
    expect(fetchImpl).toHaveBeenCalledWith(expect.stringContaining("handle=alice.bsky.social"));
  });

  it("reports no account found on a 404", async () => {
    const result = await resolveAuthorPath("nonexistent.bsky.social", fetchReturning(404));
    expect(result).toEqual({
      ok: false,
      error: 'No AT Protocol account found for "nonexistent.bsky.social"',
    });
  });

  it("reports no account found on a 400 (malformed handle)", async () => {
    const result = await resolveAuthorPath("not a handle", fetchReturning(400));
    expect(result.ok).toBe(false);
    expect((result as { error: string }).error).toMatch(/No AT Protocol account found/);
  });

  it("reports an unexpected-error message for other non-ok statuses", async () => {
    const result = await resolveAuthorPath("alice.bsky.social", fetchReturning(500));
    expect(result).toEqual({
      ok: false,
      error: "AT Protocol returned an unexpected error. Try again.",
    });
  });

  it("reports a network-unreachable message when fetch itself rejects", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
    const result = await resolveAuthorPath("alice.bsky.social", fetchImpl);
    expect(result).toEqual({
      ok: false,
      error: "Unable to reach the AT Protocol network. Check your connection.",
    });
  });
});
