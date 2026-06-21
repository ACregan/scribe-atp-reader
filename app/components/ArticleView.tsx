import type { Article } from "@scribe-atp/core";
import styles from "./ArticleView.module.css";

interface PublishedOn {
  title: string;
  canonicalUrl: string;
}

interface ArticleViewProps {
  article: Article;
  publishedOn: PublishedOn | null;
}

export function ArticleView({ article, publishedOn }: ArticleViewProps) {
  return (
    <article className={styles.article}>
      {publishedOn && (
        <div className={styles.publishedBanner}>
          Published on{" "}
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
      {article.synopsis && (
        <p className={styles.synopsis}>{article.synopsis}</p>
      )}
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}
