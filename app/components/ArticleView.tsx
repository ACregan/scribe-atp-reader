import { Link } from "react-router";
import type { Article } from "@scribe-atp/core";
import { ScribeContent } from "@scribe-atp/react";
import styles from "./ArticleView.module.css";
import SvgIcon, { SvgImageList } from "./SvgIcon/SvgIcon";
import { bskyPostUrl, readingTimeMinutes } from "~/lib/articleMeta";
import "@scribe-atp/styles";

interface PublishedOn {
  title: string;
  canonicalUrl: string;
}

interface ArticleViewProps {
  article: Article;
  publishedOn: PublishedOn | null;
  author: string;
}

export function ArticleView({
  article,
  publishedOn,
  author,
}: ArticleViewProps) {
  const backLink = (
    <Link to={`/${author}`} className={styles.backLink}>
      <SvgIcon className={styles.backIcon} name={SvgImageList.ArrowLeft} />
      BACK
    </Link>
  );

  return (
    <article className={styles.article}>
      <div className={styles.articleWrapper}>
        <div className={styles.backTop}>{backLink}</div>
        {publishedOn && (
          <div className={styles.publishedBanner}>
            This Article is published on{" "}
            <a
              href={publishedOn.canonicalUrl}
              className={styles.publishedBannerLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {publishedOn.title}
            </a>
          </div>
        )}
        {article.coverImageUrl && (
          <img
            src={article.coverImageUrl}
            alt=""
            className={styles.splashImage}
          />
        )}
        <h1 className={styles.title}>{article.title}</h1>
        {article.description && (
          <p className={styles.synopsis}>{article.description}</p>
        )}
        <p className={styles.meta}>{readingTimeMinutes(article.textContent)} min read</p>
        {article.bskyPostRef && (
          <a
            href={bskyPostUrl(article.bskyPostRef.uri)}
            className={styles.bskyLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            View discussion on Bluesky ↗
          </a>
        )}
        <ScribeContent html={article.content} className={styles.articleBody} />
        <div className={styles.backBottom}>{backLink}</div>
      </div>
    </article>
  );
}
