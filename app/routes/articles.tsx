import { useLoaderData } from "react-router";
import { listSites, listArticles } from "@scribe-atp/core";
import { ArticleItem } from "~/components/ArticleItem/ArticleItem";
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
      <div className={styles.pageContainer}>
        <h1 className={styles.title}>
          All articles by <span className={styles.handle}>{author}</span>
        </h1>
        <ul className={styles.list}>
          {articles.map((article) => (
            <li key={article.uri} className={styles.item}>
              <div className={styles.itemBody}>
                <ArticleItem
                  article={article}
                  author={author}
                  showDescription
                  state={article.state}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
