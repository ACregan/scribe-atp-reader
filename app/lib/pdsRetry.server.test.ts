import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchWithFastPath } from "./pdsRetry.server";
import { NotFoundError, PdsFetchError, PdsUnreachableError } from "@scribe-atp/core";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("fetchWithFastPath", () => {
  it("returns status ok on first success — no retry involved", async () => {
    const fn = vi.fn().mockResolvedValue("site-data");

    const result = await fetchWithFastPath(fn);

    expect(result).toEqual({ status: "ok", data: "site-data" });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("rethrows NotFoundError immediately without entering the retrying state", async () => {
    const fn = vi.fn().mockRejectedValue(new NotFoundError("Article not found: x"));

    await expect(fetchWithFastPath(fn)).rejects.toBeInstanceOf(NotFoundError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("rethrows an aborted request immediately without entering the retrying state", async () => {
    const abortError = new DOMException("Aborted", "AbortError");
    const fn = vi.fn().mockRejectedValue(abortError);

    await expect(fetchWithFastPath(fn)).rejects.toBe(abortError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("switches to status retrying on a transient failure, and resolves once a retry succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new PdsFetchError("network blip"))
      .mockResolvedValueOnce("site-data");

    const result = await fetchWithFastPath(fn);
    expect(result.status).toBe("retrying");

    const assertion =
      result.status === "retrying" ? expect(result.data).resolves.toBe("site-data") : undefined;
    await vi.runAllTimersAsync();
    await assertion;
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("rejects with the last PdsFetchError once all retries are exhausted", async () => {
    const fn = vi.fn().mockRejectedValue(new PdsFetchError("PDS is down"));

    const result = await fetchWithFastPath(fn);
    expect(result.status).toBe("retrying");

    const assertion =
      result.status === "retrying" ? expect(result.data).rejects.toThrow("PDS is down") : undefined;
    await vi.runAllTimersAsync();
    await assertion;
    // 1 fast-path attempt + 4 retries
    expect(fn).toHaveBeenCalledTimes(5);
  });

  it("does not retry past a NotFoundError thrown by fn on a retry attempt", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new PdsFetchError("network blip"))
      .mockImplementationOnce(async () => {
        throw new NotFoundError("Group not found: gone");
      });

    const result = await fetchWithFastPath(fn);
    expect(result.status).toBe("retrying");

    const assertion =
      result.status === "retrying" ? expect(result.data).rejects.toBeInstanceOf(NotFoundError) : undefined;
    await vi.runAllTimersAsync();
    await assertion;
  });

  it("rethrows an unresolvable-handle PdsFetchError as NotFoundError immediately, without retrying", async () => {
    const fn = vi
      .fn()
      .mockRejectedValue(new PdsFetchError("Failed to resolve handle: Bad Request"));

    await expect(fetchWithFastPath(fn)).rejects.toBeInstanceOf(NotFoundError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("still retries a resolve-handle PdsFetchError that isn't the unresolvable-handle case", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new PdsFetchError("Failed to resolve handle: Service Unavailable"))
      .mockResolvedValueOnce("did:plc:test");

    const result = await fetchWithFastPath(fn);
    expect(result.status).toBe("retrying");

    const assertion =
      result.status === "retrying" ? expect(result.data).resolves.toBe("did:plc:test") : undefined;
    await vi.runAllTimersAsync();
    await assertion;
  });

  it("still retries a PdsUnreachableError even if its message happens to mention resolving a handle", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(
        new PdsUnreachableError("Could not reach PDS: https://public.api.bsky.app/..."),
      )
      .mockResolvedValueOnce("did:plc:test");

    const result = await fetchWithFastPath(fn);
    expect(result.status).toBe("retrying");

    const assertion =
      result.status === "retrying" ? expect(result.data).resolves.toBe("did:plc:test") : undefined;
    await vi.runAllTimersAsync();
    await assertion;
  });
});
