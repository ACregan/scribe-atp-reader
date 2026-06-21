# scribe-atp-reader

**Scribe Reader** — browse any Scribe author's content by handle.

A publicly accessible reading interface at `reader.scribe-atp.app`. Enter an AT Protocol handle or DID and browse that author's Sites, Groups, and Articles in a collapsible tree. Full article content is shown inline; published articles display a banner linking to their canonical URL on the author's own site.

## Stack

- React Router v7 (framework / server mode)
- `@scribe-atp/core` for all AT Protocol data fetching
- TypeScript

## Domain

`reader.scribe-atp.app`

## Related repos

| Repo | Purpose |
|------|---------|
| `scribe-atp-sdk` | `@scribe-atp/core` and framework adapters |
| `scribe-atp-docs` | Documentation site and project landing page |
| `scribe-atp.app` | Scribe CMS |

## Commands

```bash
npm install       # install dependencies
npm run dev       # dev server
npm run build     # production build
npm run typecheck # type checking
npm start         # production server (after build)
```

## CI / Deployment

GitLab CI → SSH pull-deploy → VPS. Manual deploy step on merge to main.
