# scribe-atp-reader

Scribe Reader — a publicly accessible browser for any Scribe author's content. React Router v8 (framework mode), served at `reader.scribe-atp.app`.

## What it does

A user enters an AT Protocol handle or DID. The Reader resolves it, fetches all the author's Sites and Articles, and renders a collapsible navigation tree. Clicking an article shows the full content inline.

No auth. No login. AT Protocol repos are publicly readable; the Reader reflects that.

## Article states

**Revised by the Scribe CMS's ADR 0013 (2026-07-08).** Every article is in one of two states:

| State | Definition | Where it appears in the tree | Banner? |
|-------|------------|------------------------------|---------|
| **Draft** | On PDS, not referenced in any Site record | "Draft Articles by @handle" section at the bottom of the tree | No |
| **Published** | In a Group on a Site | Under its Group, under its Site | Yes — "This article is published on [Site Title]" with link to canonical URL |

The old middle state ("Unpublished" — assigned to a Site's `ungroupedArticles` but not yet placed in a Group) and the UI that rendered it (a per-site "Unpublished Articles" section in `site.tsx`/`SiteItem.tsx`, and the `"unpublished"` value of `ArticleState` in `tagArticles.ts`) were **removed outright** (2026-07-08) — no current Scribe CMS write path can produce that state anymore, since assigning to a Site and placing in a Group now happen together in one Publish step. `Site.ungroupedArticles` still exists on the SDK type for backwards compatibility, but `tagArticles` no longer reads it at all; anything left in it is treated the same as a plain draft.

## Navigation tree structure

```
SITE: alice.example.com
  ├── Group: Writing
  │   ├── Article: My first post        ← Published
  │   └── Article: Six months in        ← Published
  └── Group: Projects
      └── Article: Building a thing     ← Published

Draft Articles by @alice.bsky.social
  └── Article: Notes to self            ← Draft (no site)
```

Sites and Groups are collapsible. The tree is the primary navigation — there is no separate article index page.

## No-site edge case

When an author has no Site records, skip the Site level entirely and show "Draft Articles by @handle" at the root.

## SDK dependency

The Reader uses `@scribe-atp/core`:

- `listSites(author, signal?)` — lists `site.standard.publication` records
- `listArticles(author, signal?)` — lists `site.standard.document` records
- `fetchSite(author, publicationUrl, signal?)` — fetches a single publication by its full HTTPS URL (e.g. `"https://norobots.blog"`)
- `fetchArticle(author, rkey, signal?)` — fetches a single `site.standard.document` record by TID rkey

Draft articles = all articles from `listArticles` not referenced in any site's `groups` (see `tagArticles.ts`).

## URL structure

URLs use the current collection names. The input accepts handles, DIDs, and full `at://` URIs — `at://` is stripped and the remainder becomes the path.

```
/
  Landing page — large input, accepts handle / DID / at:// URI

/:author
/:author/site.standard.publication
  Full hierarchy — all Sites → Groups → Articles (both routes render identically)

/:author/site.standard.publication/:siteDomain
  Single site — that site's Groups and Articles only
  :siteDomain is the domain from site.url e.g. "norobots.blog"

/:author/site.standard.publication/:siteDomain/:groupSlug
  Single group — articles in that group only
  e.g. /anthonycregan.dev/site.standard.publication/norobots.blog/technology

/:author/site.standard.publication/:siteDomain/:groupSlug/:articleRkey
  Single article reading view (reached via site → group path)
  :articleRkey is the TID rkey e.g. 3mp4hfovqib2h

/:author/site.standard.document
  Flat list of all the author's articles across all states

/:author/site.standard.document/:articleRkey
/:author/site.standard.document/:articleRkey/:slug
  Single article reading view (reached directly)
  :articleRkey is the TID rkey. The trailing :slug is accepted but
  ignored — some third-party aggregators treat the document's `site`
  field as a URL prefix and append the article slug themselves.
```

`:author` is always a handle or DID — whichever the user entered. No normalisation applied.

## AT URI discoverability

Single-article pages (`Article.tsx`) emit `<link rel="site.standard.document" href="at://...">` in the page head, matching the convention already used by hand in every consumer site's `meta()` function (e.g. `norobots/app/routes/post/post.tsx`). This lets third-party validators/aggregators (e.g. site-validator.fly.dev) discover the article's AT URI from the page itself instead of reconstructing it from the URL — which is what caused the trailing-`:slug` bug above in the first place. The tag is only emitted when `params.author` is DID-shaped (`fetchArticle` doesn't return the resolved DID the way `fetchArticleBySlug` does, so it's built from the URL param directly — safe because every Reader-generated loose article URL is already DID-keyed per ADR 0013).

## Design decisions

**No social buttons.** The Reader is a navigator and preview tool — it browses any author's content by handle or DID. `@scribe-atp/social` is intentionally absent. Social engagement belongs on the author's own consumer sites, not on a neutral third-party browser. Do not add LikeButton, SubscribeButton, or ShareButton.

## Stack

- React Router v8 (framework / server mode) — same pattern as norobots.blog, anthonycregan.co.uk
- `@scribe-atp/core` — all data fetching; no other adapter needed (server loaders)
- TypeScript strict mode

## Deployment

GitLab CI → SSH pull-deploy → VPS. Same pattern as all other consumer sites.

- App name in `deploy.config.sh`: `scribe-atp-reader`
- PM2 job name: `scribe-atp-reader`
- Port: 3010
- Domain: `reader.scribe-atp.app`
- nginx: proxy_pass to PM2 port, standard security headers
