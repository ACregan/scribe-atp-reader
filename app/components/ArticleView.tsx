import { Link } from "react-router";
import type { Article } from "@scribe-atp/core";
import styles from "./ArticleView.module.css";
import SvgIcon, { SvgImageList } from "./SvgIcon/SvgIcon";

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
      {article.splashImageUrl && (
        <img
          src={article.splashImageUrl}
          alt=""
          className={styles.splashImage}
        />
      )}
      <h1 className={styles.title}>{article.title}</h1>
      {article.description && (
        <p className={styles.synopsis}>{article.description}</p>
      )}
      <div
        className={`${styles.articleBody} article-body`}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
      <div className={styles.backBottom}>{backLink}</div>
    </article>
  );
}
