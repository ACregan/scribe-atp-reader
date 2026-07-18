import { slugFromUri } from "@scribe-atp/core";

// siteDomain and groupSlug are only meaningful together — an article's
// canonical in-tree location. Missing either falls back to the
// site-agnostic site.standard.document view.
export function buildArticleHref(
  author: string,
  articleUri: string,
  siteDomain?: string,
  groupSlug?: string,
): string {
  const rkey = slugFromUri(articleUri);
  return siteDomain && groupSlug
    ? `/${author}/site.standard.publication/${siteDomain}/${groupSlug}/${rkey}`
    : `/${author}/site.standard.document/${rkey}`;
}
