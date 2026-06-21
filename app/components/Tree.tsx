import { useState } from "react";
import { Link } from "react-router";
import { slugFromUri } from "@scribe-atp/core";
import type { SiteRecord, ArticleRef, SiteGroup } from "@scribe-atp/core";
import styles from "./Tree.module.css";

export function ArticleLink({
  article,
  author,
}: {
  article: ArticleRef;
  author: string;
}) {
  const rkey = slugFromUri(article.uri);
  return (
    <li className={styles.groupItem}>
      <Link
        to={`/${author}/app.scribe.article/${rkey}`}
        className={styles.articleLink}
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
    <li className={styles.siteItem}>
      <div className={styles.groupHeader}>
        <button
          onClick={() => setOpen((o) => !o)}
          className={styles.toggle}
          aria-label={open ? "Collapse group" : "Expand group"}
        >
          {open ? "▼" : "▶"}
        </button>
        <span className={styles.groupTitle}>
          {group.title}
          <span className={styles.groupCount}>({group.articles.length})</span>
        </span>
      </div>
      {open && group.articles.length > 0 && (
        <ul className={styles.groupList}>
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
    <div className={styles.site}>
      <div className={styles.siteHeader}>
        <button
          onClick={() => setOpen((o) => !o)}
          className={styles.toggle}
          aria-label={open ? "Collapse site" : "Expand site"}
        >
          {open ? "▼" : "▶"}
        </button>
        <Link
          to={`/${author}/app.scribe.site/${siteRkey}`}
          className={styles.siteLink}
        >
          {site.title}
        </Link>
        <span className={styles.siteUrl}>{site.url}</span>
      </div>

      {open && (
        <ul className={styles.siteList}>
          {site.groups.map((group) => (
            <GroupNode key={group.slug} group={group} author={author} />
          ))}
          {site.ungroupedArticles.length > 0 && (
            <li className={styles.siteItem}>
              <span className={styles.unpublishedLabel}>Unpublished Articles</span>
              <ul className={styles.unpublishedList}>
                {site.ungroupedArticles.map((a) => (
                  <li key={a.uri} className={styles.unpublishedItem}>
                    <ArticleLink article={a} author={author} />
                  </li>
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
      <p className={styles.empty}>
        No Scribe content found for{" "}
        <span className={styles.emptyHandle}>{author}</span>.
      </p>
    );
  }

  return (
    <div>
      {sites.map((site) => (
        <SiteNode key={site.uri} site={site} author={author} />
      ))}
      {drafts.length > 0 && (
        <div className={styles.draftSection}>
          <p className={styles.draftLabel}>
            Draft Articles by <span className={styles.draftHandle}>{author}</span>
          </p>
          <ul className={styles.draftList}>
            {drafts.map((a) => (
              <li key={a.uri} className={styles.draftItem}>
                <ArticleLink article={a} author={author} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
