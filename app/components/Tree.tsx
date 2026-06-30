import type { SiteRecord, ArticleRef } from "@scribe-atp/core";
import { SiteItem } from "./SiteItem/SiteItem";
import { ArticleItem } from "./ArticleItem/ArticleItem";
import styles from "./Tree.module.css";

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
      .map((a) => a.uri),
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
    <div className={styles.pageContainer}>
      <div className={styles.treeContainer}>
        {sites.map((site) => (
          <SiteItem key={site.uri} site={site} author={author} />
        ))}
        {drafts.length > 0 && (
          <div className={styles.draftSection}>
            <p className={styles.draftLabel}>
              Draft Articles by{" "}
              <span className={styles.draftHandle}>{author}</span>
            </p>
            <ul className={styles.draftList}>
              {drafts.map((a) => (
                <li key={a.uri} className={styles.draftItem}>
                  <ArticleItem article={a} author={author} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
