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
}: Props) {
  const rkey = slugFromUri(article.uri);

  return (
    <>
      <Link
        to={`/${author}/site.standard.document/${rkey}`}
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
