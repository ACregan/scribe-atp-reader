import { Link } from "react-router";
import type { ArticleRef } from "@scribe-atp/core";
import styles from "./ArticleItem.module.css";
import type { ArticleState } from "~/lib/tagArticles";
import { buildArticleHref } from "~/lib/buildArticleHref";

interface Props {
  article: ArticleRef;
  author: string;
  showDescription?: boolean;
  state?: ArticleState;
  siteDomain?: string;
  groupSlug?: string;
}

const stateLabel: Record<ArticleState, string> = {
  published: "Published",
  draft: "Draft",
};

const stateBadgeClass: Record<ArticleState, string> = {
  published: styles.badgePublished,
  draft: styles.badgeDraft,
};

export function ArticleItem({
  article,
  author,
  showDescription = false,
  state,
  siteDomain,
  groupSlug,
}: Props) {
  const to = buildArticleHref(author, article.uri, siteDomain, groupSlug);

  return (
    <>
      <Link
        to={to}
        className={styles.link}
      >
        {article.title}
        {state && (
          <span className={`${styles.badge} ${stateBadgeClass[state]}`}>
            {stateLabel[state]}
          </span>
        )}
        {showDescription && article.description && (
          <p className={styles.description}>{article.description}</p>
        )}
      </Link>
    </>
  );
}
