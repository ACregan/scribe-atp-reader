import { useLoaderData } from "react-router";
import { fetchArticle } from "@scribe-atp/core";
import { ArticleView } from "~/components/ArticleView";
import { findPublishedOnInGroup } from "~/lib/publishedOn";
import { loadSite } from "~/lib/loadSite.server";
import { withNotFound } from "~/lib/withNotFound";
import type { Route } from "./+types/article-site";

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: `${loaderData?.article.title ?? "Article"} | Scribe Reader` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { author, siteDomain, groupSlug, articleRkey } = params;
  const [article, site] = await Promise.all([
    withNotFound(() => fetchArticle(author, articleRkey, request.signal)),
    loadSite(author, siteDomain, request.signal),
  ]);

  return { article, publishedOn: findPublishedOnInGroup(site, groupSlug, articleRkey) };
}

export default function ArticleSiteRoute({ params }: Route.ComponentProps) {
  const { article, publishedOn } = useLoaderData<typeof loader>();
  return <ArticleView article={article} publishedOn={publishedOn} author={params.author} />;
}
