import { useLoaderData, Link } from "react-router";
import { listSites, listArticles, slugFromUri } from "@scribe-atp/core";
import { tagArticles } from "~/lib/tagArticles";
import type { ArticleState } from "~/lib/tagArticles";
import type { Route } from "./+types/articles";
import styles from "./articles.module.css";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `All articles by ${params.author} | Scribe Reader` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { author } = params;
  const [sites, articles] = await Promise.all([
    listSites(author, request.signal),
    listArticles(author, request.signal),
  ]);

  return { author, articles: tagArticles(sites, articles) };
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

export default function ArticlesRoute() {
  const { author, articles } = useLoaderData<typeof loader>();

  if (articles.length === 0) {
    return (
      <main className={styles.page}>
        <p className={styles.empty}>
          No articles found for <span className={styles.handle}>{author}</span>.
        </p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>
        All articles by <span className={styles.handle}>{author}</span>
      </h1>
      <ul className={styles.list}>
        {articles.map((article) => (
          <li key={article.uri} className={styles.item}>
            <span className={`${styles.badge} ${stateBadgeClass[article.state]}`}>
              {stateLabel[article.state]}
            </span>
            <div className={styles.itemBody}>
              <Link
                to={`/${author}/app.scribe.article/${slugFromUri(article.uri)}`}
                className={styles.link}
              >
                {article.title}
              </Link>
              {article.description && (
                <p className={styles.synopsis}>{article.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
