import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@scribe-atp/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@scribe-atp/core")>();
  return { ...actual, fetchSite: vi.fn() };
});

import { loadSite } from "./loadSite.server";
import { fetchSite, NotFoundError, PdsFetchError } from "@scribe-atp/core";
import type { Site } from "@scribe-atp/core";

const mockSite: Site = {
  uri: "at://did:plc:test/site.standard.publication/test",
  title: "Test Site",
  url: "example.com",
  urlPrefix: "",
  groups: [],
  ungroupedArticles: [],
};

const signal = new AbortController().signal;

beforeEach(() => {
  vi.mocked(fetchSite).mockReset();
});

describe("loadSite", () => {
  it("returns status ok with the site on the fast path", async () => {
    vi.mocked(fetchSite).mockResolvedValue(mockSite);

    const result = await loadSite("did:plc:test", "example.com", signal);

    expect(result).toEqual({ status: "ok", data: mockSite });
  });

  it("throws a 404 Response when the site doesn't exist", async () => {
    vi.mocked(fetchSite).mockRejectedValue(new NotFoundError("Site not found: https://example.com"));

    let thrown: unknown;
    try {
      await loadSite("did:plc:test", "example.com", signal);
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(404);
  });

  it("returns status retrying when the fetch fails transiently, resolving once a retry succeeds", async () => {
    vi.mocked(fetchSite)
      .mockRejectedValueOnce(new PdsFetchError("network blip"))
      .mockResolvedValueOnce(mockSite);

    vi.useFakeTimers();
    try {
      const result = await loadSite("did:plc:test", "example.com", signal);
      expect(result.status).toBe("retrying");

      const assertion =
        result.status === "retrying" ? expect(result.data).resolves.toEqual(mockSite) : undefined;
      await vi.runAllTimersAsync();
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });
});
