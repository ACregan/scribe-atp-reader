import { parseAuthorInput } from "./parseAuthorInput";

export type ResolveAuthorPathResult =
  | { ok: true; path: string }
  | { ok: false; error: string };

// The core decision logic behind the search input: parse the raw value,
// pass DIDs through untouched (already a resolved identifier), and resolve
// handles against the public AT Protocol API before navigating — so a typo
// surfaces as a message in the input rather than a 404 after navigating.
// Extracted from SearchBar so it's testable without a DOM environment (this
// repo's vitest config runs in "node", not jsdom).
export async function resolveAuthorPath(
  rawValue: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ResolveAuthorPathResult> {
  const trimmed = parseAuthorInput(rawValue);
  if (!trimmed) return { ok: false, error: "" };

  // Extract just the handle/DID — a full at:// URI may include a collection path.
  const authorPart = trimmed.split("/")[0];

  // DIDs are already resolved identifiers — no network round-trip needed.
  if (authorPart.startsWith("did:")) {
    return { ok: true, path: `/${trimmed}` };
  }

  try {
    const res = await fetchImpl(
      `https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(authorPart)}`,
    );
    if (res.status === 400 || res.status === 404) {
      return { ok: false, error: `No AT Protocol account found for "${authorPart}"` };
    }
    if (!res.ok) {
      return { ok: false, error: "AT Protocol returned an unexpected error. Try again." };
    }
    return { ok: true, path: `/${trimmed}` };
  } catch {
    return { ok: false, error: "Unable to reach the AT Protocol network. Check your connection." };
  }
}
