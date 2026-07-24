import { Suspense } from "react";
import { Await, useLoaderData, useParams } from "react-router";
import { listSites, listArticles, NotFoundError } from "@scribe-atp/core";
import { ArticleItem } from "~/components/ArticleItem/ArticleItem";
import { Spinner } from "~/components/Spinner/Spinner";
import { AwaitErrorBoundary } from "~/components/AwaitErrorBoundary/AwaitErrorBoundary";
import { tagArticles } from "~/lib/tagArticles";
import { fetchWithFastPath } from "~/lib/pdsRetry.server";
import type { Route } from "./+types/Articles";
import styles from "./Articles.module.css";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `All articles by ${params.author} | Scribe Reader` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { author } = params;
  try {
    const result = await fetchWithFastPath(
      async () => {
        const [sites, articles] = await Promise.all([
          listSites(author, request.signal),
          listArticles(author, request.signal),
        ]);
        return tagArticles(sites, articles);
      },
      request.signal,
    );
    if (result.status === "ok") {
      return { status: "ok" as const, data: { author, articles: result.data } };
    }
    return {
      status: "retrying" as const,
      data: result.data.then((articles) => ({ author, articles })),
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw new Response("Not Found", { status: 404 });
    throw error;
  }
}

function ArticlesContent({
  author,
  articles,
}: {
  author: string;
  articles: ReturnType<typeof tagArticles>;
}) {
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

export default function ArticlesRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const { author } = useParams();

  if (loaderData.status === "retrying") {
    return (
      <Suspense fallback={<Spinner />}>
        <Await resolve={loaderData.data} errorElement={<AwaitErrorBoundary />}>
          {({ articles }) => <ArticlesContent author={author!} articles={articles} />}
        </Await>
      </Suspense>
    );
  }
  return <ArticlesContent author={author!} articles={loaderData.data.articles} />;
}
