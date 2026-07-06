import { Link } from "react-router";
import { slugFromUri } from "@scribe-atp/core";
import type { ArticleRef } from "@scribe-atp/core";
import styles from "./ArticleItem.module.css";
import type { ArticleState } from "~/lib/tagArticles";

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
  unpublished: "Unpublished",
  draft: "Draft",
};

const stateBadgeClass: Record<ArticleState, string> = {
  published: styles.badgePublished,
  unpublished: styles.badgeUnpublished,
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
  const rkey = slugFromUri(article.uri);

  const to =
    siteDomain && groupSlug
      ? `/${author}/site.standard.publication/${siteDomain}/${groupSlug}/${rkey}`
      : `/${author}/site.standard.document/${rkey}`;

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
