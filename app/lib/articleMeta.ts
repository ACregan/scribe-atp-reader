const WORDS_PER_MINUTE = 225;

// An at:// URI's rkey-bearing form is at://<did>/<collection>/<rkey>; the
// post's author DID and rkey sit at fixed positions once split on "/".
export function bskyPostUrl(atUri: string): string {
  const parts = atUri.split("/");
  return `https://bsky.app/profile/${parts[2]}/post/${parts[4]}`;
}

export function readingTimeMinutes(textContent: string | null | undefined): number {
  const wordCount = textContent?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}
