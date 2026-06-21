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

The Reader requires two functions not yet in `@scribe-atp/core`:

- `listSites(author, signal?)` — calls `com.atproto.repo.listRecords` for `app.scribe.site`
- `listArticles(author, signal?)` — calls `com.atproto.repo.listRecords` for `app.scribe.article`

Draft articles = all articles from `listArticles` minus those referenced in any site record.

**These must be released in a new `@scribe-atp/core` minor version before the Reader can be built.**

## URL structure

```
/                          ← Landing / search input
/:handle                   ← Author tree view (e.g. /alice.bsky.social)
/:handle/:articleSlug      ← Article reading view
```

## Stack

- React Router v7 (framework / server mode) — same pattern as norobots.blog, anthonycregan.co.uk
- `@scribe-atp/core` — all data fetching; no other adapter needed (server loaders)
- TypeScript strict mode

## Deployment

GitLab CI → SSH pull-deploy → VPS. Same pattern as all other consumer sites.

- App name in `deploy.config.sh`: `scribe-atp-reader`
- PM2 job name: `scribe-atp-reader`
- Port: TBD (next available after 3009)
- Domain: `reader.scribe-atp.app`
- nginx: proxy_pass to PM2 port, standard security headers
