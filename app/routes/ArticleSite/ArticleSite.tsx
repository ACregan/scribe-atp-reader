import { Suspense } from "react";
import { Await, useLoaderData, useParams } from "react-router";
import { fetchArticle, fetchSite, NotFoundError } from "@scribe-atp/core";
import type { Article } from "@scribe-atp/core";
import { ArticleView } from "~/components/ArticleView";
import { Spinner } from "~/components/Spinner/Spinner";
import { AwaitErrorBoundary } from "~/components/AwaitErrorBoundary/AwaitErrorBoundary";
import { findPublishedOnInGroup } from "~/lib/publishedOn";
import { fetchWithFastPath } from "~/lib/pdsRetry.server";
import type { Route } from "./+types/ArticleSite";

export function meta({ loaderData }: Route.MetaArgs) {
  const article = loaderData?.status === "ok" ? loaderData.data.article : undefined;
  return [
    { title: `${article?.title ?? "Article"} | Scribe Reader` },
    // Articles reachable via this route are always published (it's the
    // site.standard.publication-scoped view), so canonicalUrl should always
    // be set — point crawlers at the author's own site rather than letting
    // Reader's copy compete with it as duplicate content.
    ...(article?.canonicalUrl
      ? [{ tagName: "link", rel: "canonical", href: article.canonicalUrl }]
      : []),
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { author, siteDomain, groupSlug, articleRkey } = params;
  try {
    const result = await fetchWithFastPath(
      () =>
        Promise.all([
          fetchArticle(author, articleRkey, request.signal),
          fetchSite(author, `https://${siteDomain}`, request.signal),
        ]),
      request.signal,
    );
    if (result.status === "ok") {
      const [article, site] = result.data;
      return {
        status: "ok" as const,
        data: { article, publishedOn: findPublishedOnInGroup(site, groupSlug, articleRkey) },
      };
    }
    return {
      status: "retrying" as const,
      data: result.data.then(([article, site]) => ({
        article,
        publishedOn: findPublishedOnInGroup(site, groupSlug, articleRkey),
      })),
    };
  } catch (error) {
    if (error instanceof NotFoundError) throw new Response("Not Found", { status: 404 });
    throw error;
  }
}

function ArticleContent({
  author,
  article,
  publishedOn,
}: {
  author: string;
  article: Article;
  publishedOn: ReturnType<typeof findPublishedOnInGroup>;
}) {
  return <ArticleView article={article} publishedOn={publishedOn} author={author} />;
}

export default function ArticleSiteRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const { author } = useParams();

  if (loaderData.status === "retrying") {
    return (
      <Suspense fallback={<Spinner />}>
        <Await resolve={loaderData.data} errorElement={<AwaitErrorBoundary />}>
          {({ article, publishedOn }) => (
            <ArticleContent author={author!} article={article} publishedOn={publishedOn} />
          )}
        </Await>
      </Suspense>
    );
  }
  const { article, publishedOn } = loaderData.data;
  return <ArticleContent author={author!} article={article} publishedOn={publishedOn} />;
}
