import { slugFromUri, type Site } from "@scribe-atp/core";

export interface PublishedOn {
  title: string;
  canonicalUrl: string;
}

function buildCanonicalUrl(site: Site, groupSlug: string, ref: { uri: string; slug?: string }, articleRkey: string) {
  const prefix = site.urlPrefix ? `/${site.urlPrefix}` : "";
  return `https://${site.url}${prefix}/${groupSlug}/${ref.slug ?? articleRkey}`;
}

// Searches every site's groups for a reference to this article. Used by the
// site-agnostic /:author/site.standard.document/:articleRkey route, which
// doesn't know in advance which site (if any) published the article.
export function findPublishedOn(sites: Site[], articleRkey: string): PublishedOn | null {
  for (const site of sites) {
    for (const group of site.groups) {
      const ref = group.articles.find((a) => slugFromUri(a.uri) === articleRkey);
      if (ref) {
        return { title: site.title, canonicalUrl: buildCanonicalUrl(site, group.slug, ref, articleRkey) };
      }
    }
  }
  return null;
}

// Scoped variant for the site+group-aware route, which already knows the
// site and expected group and only needs to confirm the article is really
// filed there.
export function findPublishedOnInGroup(site: Site, groupSlug: string, articleRkey: string): PublishedOn | null {
  const group = site.groups.find((g) => g.slug === groupSlug);
  const ref = group?.articles.find((a) => slugFromUri(a.uri) === articleRkey);
  if (!ref) return null;
  return { title: site.title, canonicalUrl: buildCanonicalUrl(site, groupSlug, ref, articleRkey) };
}
