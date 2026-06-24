import { useLoaderData } from "react-router";
import { fetchArticle, listSites, slugFromUri } from "@scribe-atp/core";
import { ArticleView } from "~/components/ArticleView";
import type { Route } from "./+types/article";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: `${data?.article.title ?? "Article"} | Scribe Reader` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { author, articleRkey } = params;
  const [article, sites] = await Promise.all([
    fetchArticle(author, articleRkey, request.signal),
    listSites(author, request.signal),
  ]);

  let publishedOn: { title: string; canonicalUrl: string } | null = null;
  outer: for (const site of sites) {
    for (const group of site.groups) {
      const ref = group.articles.find(
        (a) => slugFromUri(a.uri) === articleRkey
      );
      if (ref) {
        const prefix = site.urlPrefix ? `/${site.urlPrefix}` : "";
        publishedOn = {
          title: site.title,
          canonicalUrl: `https://${site.url}${prefix}/${group.slug}/${ref.slug ?? articleRkey}`,
        };
        break outer;
      }
    }
  }

  return { article, publishedOn };
}

export default function ArticleRoute({ params }: Route.ComponentProps) {
  const { article, publishedOn } = useLoaderData<typeof loader>();
  return <ArticleView article={article} publishedOn={publishedOn} author={params.author} />;
}
