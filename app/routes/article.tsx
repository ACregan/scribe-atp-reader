import { useLoaderData } from "react-router";
import { fetchArticle, listSites } from "@scribe-atp/core";
import { ArticleView } from "~/components/ArticleView";
import { findPublishedOn } from "~/lib/publishedOn";
import { withNotFound } from "~/lib/withNotFound";
import type { Route } from "./+types/article";

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: `${loaderData?.article.title ?? "Article"} | Scribe Reader` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { author, articleRkey } = params;
  const [article, sites] = await withNotFound(() =>
    Promise.all([
      fetchArticle(author, articleRkey, request.signal),
      listSites(author, request.signal),
    ]),
  );

  return { article, publishedOn: findPublishedOn(sites, articleRkey) };
}

export default function ArticleRoute({ params }: Route.ComponentProps) {
  const { article, publishedOn } = useLoaderData<typeof loader>();
  return <ArticleView article={article} publishedOn={publishedOn} author={params.author} />;
}
