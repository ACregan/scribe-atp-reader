import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@scribe-atp/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@scribe-atp/core")>();
  return { ...actual, listSites: vi.fn(), listArticles: vi.fn() };
});

import { loadAuthorTree } from "./loadAuthorTree.server";
import { listSites, listArticles, PdsFetchError } from "@scribe-atp/core";
import type { SiteRecord, ArticleRef } from "@scribe-atp/core";

const mockSites: SiteRecord[] = [];
const mockArticles: ArticleRef[] = [];

const signal = new AbortController().signal;

beforeEach(() => {
  vi.mocked(listSites).mockReset();
  vi.mocked(listArticles).mockReset();
});

describe("loadAuthorTree", () => {
  it("returns status ok with author/sites/articles on the fast path", async () => {
    vi.mocked(listSites).mockResolvedValue(mockSites);
    vi.mocked(listArticles).mockResolvedValue(mockArticles);

    const result = await loadAuthorTree("did:plc:test", signal);

    expect(result).toEqual({
      status: "ok",
      data: { author: "did:plc:test", sites: mockSites, articles: mockArticles },
    });
  });

  it("throws a 404 Response immediately for an unresolvable handle, without retrying", async () => {
    vi.mocked(listSites).mockRejectedValue(
      new PdsFetchError("Failed to resolve handle: Bad Request"),
    );
    vi.mocked(listArticles).mockResolvedValue(mockArticles);

    let thrown: unknown;
    try {
      await loadAuthorTree("this-handle-does-not-exist.invalid", signal);
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(404);
    expect(listSites).toHaveBeenCalledTimes(1);
  });

  it("returns status retrying when the fetch fails transiently, resolving once a retry succeeds", async () => {
    vi.mocked(listSites)
      .mockRejectedValueOnce(new PdsFetchError("network blip"))
      .mockResolvedValueOnce(mockSites);
    vi.mocked(listArticles).mockResolvedValue(mockArticles);

    vi.useFakeTimers();
    try {
      const result = await loadAuthorTree("did:plc:test", signal);
      expect(result.status).toBe("retrying");

      const assertion =
        result.status === "retrying"
          ? expect(result.data).resolves.toEqual({
              author: "did:plc:test",
              sites: mockSites,
              articles: mockArticles,
            })
          : undefined;
      await vi.runAllTimersAsync();
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });
});
