import { useState } from "react";
import { Link } from "react-router";
import { slugFromUri } from "@scribe-atp/core";
import type { SiteRecord, ArticleRef, SiteGroup } from "@scribe-atp/core";

export function ArticleLink({
  article,
  author,
}: {
  article: ArticleRef;
  author: string;
}) {
  const rkey = slugFromUri(article.uri);
  return (
    <li>
      <Link
        to={`/${author}/app.scribe.article/${rkey}`}
        className="text-sm hover:underline text-gray-800"
      >
        {article.title}
      </Link>
    </li>
  );
}

export function GroupNode({
  group,
  author,
}: {
  group: SiteGroup;
  author: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <li>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-xs text-gray-400 w-3 shrink-0"
          aria-label={open ? "Collapse group" : "Expand group"}
        >
          {open ? "▼" : "▶"}
        </button>
        <span className="text-sm font-medium text-gray-700">
          {group.title}
          <span className="text-xs text-gray-400 font-normal ml-1">
            ({group.articles.length})
          </span>
        </span>
      </div>
      {open && group.articles.length > 0 && (
        <ul className="pl-6 mt-0.5 space-y-0.5">
          {group.articles.map((a) => (
            <ArticleLink key={a.uri} article={a} author={author} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function SiteNode({
  site,
  author,
}: {
  site: SiteRecord;
  author: string;
}) {
  const [open, setOpen] = useState(true);
  const siteRkey = slugFromUri(site.uri);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-xs text-gray-400 w-3 shrink-0"
          aria-label={open ? "Collapse site" : "Expand site"}
        >
          {open ? "▼" : "▶"}
        </button>
        <Link
          to={`/${author}/app.scribe.site/${siteRkey}`}
          className="font-semibold text-gray-900 hover:underline"
        >
          {site.title}
        </Link>
        <span className="text-xs text-gray-400">{site.url}</span>
      </div>

      {open && (
        <ul className="pl-6 mt-1 space-y-1">
          {site.groups.map((group) => (
            <GroupNode key={group.slug} group={group} author={author} />
          ))}
          {site.ungroupedArticles.length > 0 && (
            <li>
              <span className="text-sm text-gray-500 italic">
                Unpublished Articles
              </span>
              <ul className="pl-6 mt-0.5 space-y-0.5">
                {site.ungroupedArticles.map((a) => (
                  <ArticleLink key={a.uri} article={a} author={author} />
                ))}
              </ul>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

interface AuthorTreeProps {
  author: string;
  sites: SiteRecord[];
  articles: ArticleRef[];
}

export function AuthorTree({ author, sites, articles }: AuthorTreeProps) {
  const referencedUris = new Set(
    sites
      .flatMap((s) => [
        ...s.groups.flatMap((g) => g.articles),
        ...s.ungroupedArticles,
      ])
      .map((a) => a.uri)
  );
  const drafts = articles.filter((a) => !referencedUris.has(a.uri));

  if (sites.length === 0 && articles.length === 0) {
    return (
      <p className="text-gray-500 mt-8 text-center">
        No Scribe content found for{" "}
        <span className="font-mono">{author}</span>.
      </p>
    );
  }

  return (
    <div>
      {sites.map((site) => (
        <SiteNode key={site.uri} site={site} author={author} />
      ))}
      {drafts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 italic mb-2">
            Draft Articles by <span className="font-mono">{author}</span>
          </p>
          <ul className="pl-6 space-y-0.5">
            {drafts.map((a) => (
              <ArticleLink key={a.uri} article={a} author={author} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
