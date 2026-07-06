# scribe-atp-reader

Scribe Reader — a publicly accessible browser for any Scribe author's content. React Router v7 (framework mode), served at `reader.scribe-atp.app`.

## What it does

A user enters an AT Protocol handle or DID. The Reader resolves it, fetches all the author's Sites and Articles, and renders a collapsible navigation tree. Clicking an article shows the full content inline.

No auth. No login. AT Protocol repos are publicly readable; the Reader reflects that.

## Three article states

Every article is in one of three states. The Reader must handle all three:

| State | Definition | Where it appears in the tree | Banner? |
|-------|------------|------------------------------|---------|
| **Draft** | On PDS, not referenced in any Site record | "Draft Articles by @handle" section at the bottom of the tree | No |
| **Unpublished** | In a Site's `ungroupedArticles` | "Unpublished Articles" section under its Site | No |
| **Published** | In a Group on a Site | Under its Group, under its Site | Yes — "This article is published on [Site Title]" with link to canonical URL |

## Navigation tree structure

```
SITE: alice.example.com
  ├── Group: Writing
  │   ├── Article: My first post        ← Published
  │   └── Article: Six months in        ← Published
  ├── Group: Projects
  │   └── Article: Building a thing     ← Published
  └── Unpublished Articles
      └── Article: Work in progress     ← Unpublished

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

Draft articles = all articles from `listArticles` not referenced in any site's `groups` or `ungroupedArticles`.

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
  Single article reading view (reached directly)
  :articleRkey is the TID rkey
```

`:author` is always a handle or DID — whichever the user entered. No normalisation applied.

## Stack

- React Router v7 (framework / server mode) — same pattern as norobots.blog, anthonycregan.co.uk
- `@scribe-atp/core` — all data fetching; no other adapter needed (server loaders)
- TypeScript strict mode

## Deployment

GitLab CI → SSH pull-deploy → VPS. Same pattern as all other consumer sites.

- App name in `deploy.config.sh`: `scribe-atp-reader`
- PM2 job name: `scribe-atp-reader`
- Port: 3010
- Domain: `reader.scribe-atp.app`
- nginx: proxy_pass to PM2 port, standard security headers
