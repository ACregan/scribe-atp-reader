import { NotFoundError, PdsFetchError, PdsUnreachableError, withRetry } from "@scribe-atp/core";

export type PdsResult<T> =
  | { status: "ok"; data: T }
  | { status: "retrying"; data: Promise<T> };

// Duck-typed rather than `instanceof Error` — jsdom's DOMException (thrown
// by AbortController in tests) doesn't share Node's Error prototype chain
// across realms, so instanceof can't be relied on here.
function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

// resolveIdentifier failures always surface as PdsFetchError with a stable
// "Failed to resolve handle: <statusText>" message (see @scribe-atp/core's
// resolve.ts) — never NotFoundError, since "this handle doesn't exist"
// isn't a missing *record* the SDK can detect the way a site/article
// lookup can. Unlike the fixed-author consumer sites (where SITE_AUTHOR is
// always valid, so a resolution failure is always transient), Reader
// visitors can type any handle — a genuinely nonexistent one is common
// enough to be worth classifying as "doesn't exist" immediately, rather
// than burning ~4.5s of retries before showing "couldn't load". Bsky's
// resolveHandle responds "Bad Request" specifically for an unresolvable
// handle; any other status (5xx, rate limiting) keeps the normal
// transient/retryable classification.
function isUnresolvableAuthor(error: unknown): boolean {
  return (
    error instanceof PdsFetchError &&
    !(error instanceof PdsUnreachableError) &&
    error.message.startsWith("Failed to resolve handle") &&
    error.message.includes("Bad Request")
  );
}

// Attempt `fn` once, synchronously — the fast path, so meta() stays
// available on every normal request. Only on failure does this switch to
// streaming: the remaining retries run un-awaited, so the route can return
// a promise and let <Suspense>/<Await> show a spinner instead of blocking
// the whole response.
//
// NotFoundError and an aborted signal are rethrown immediately, uncaught —
// callers handle those the same way they always have (throw a 404 Response,
// or let the abort propagate).
export async function fetchWithFastPath<T>(
  fn: () => Promise<T>,
  signal?: AbortSignal,
): Promise<PdsResult<T>> {
  try {
    const data = await fn();
    return { status: "ok", data };
  } catch (error) {
    if (isAbortError(error)) throw error;
    // NotFoundError also rethrows here — withRetry would refuse to retry it
    // anyway, but throwing immediately skips the pointless promise wrapper
    // and lets the caller's existing 404 handling run without a spinner.
    if (error instanceof NotFoundError) throw error;
    // Reclassify so callers only need one instanceof check for "this
    // author doesn't exist" regardless of which layer determined it.
    if (isUnresolvableAuthor(error)) throw new NotFoundError((error as Error).message);
    return {
      status: "retrying",
      data: withRetry(fn, { attempts: 4, signal }),
    };
  }
}
