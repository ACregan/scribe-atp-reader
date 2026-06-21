import { useLoaderData } from "react-router";
import { fetchArticle, fetchSite, slugFromUri } from "@scribe-atp/core";
import { ArticleView } from "~/components/ArticleView";
import type { Route } from "./+types/article-site";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: `${data?.article.title ?? "Article"} | Scribe Reader` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { author, siteRkey, groupSlug, articleRkey } = params;
  const [article, site] = await Promise.all([
    fetchArticle(author, articleRkey, request.signal),
    fetchSite(author, siteRkey, request.signal),
  ]);

  const group = site.groups.find((g) => g.slug === groupSlug);
  const ref = group?.articles.find((a) => slugFromUri(a.uri) === articleRkey);
  const prefix = site.urlPrefix ? `/${site.urlPrefix}` : "";
  const publishedOn = ref
    ? {
        title: site.title,
        canonicalUrl: `https://${site.url}${prefix}/${groupSlug}/${ref.url ?? articleRkey}`,
      }
    : null;

  return { article, publishedOn };
}

export default function ArticleSiteRoute() {
  const { article, publishedOn } = useLoaderData<typeof loader>();
  return <ArticleView article={article} publishedOn={publishedOn} />;
}
