import { Suspense } from "react";
import { Await, useLoaderData, useParams } from "react-router";
import { fetchArticle, listSites, NotFoundError } from "@scribe-atp/core";
import type { Article } from "@scribe-atp/core";
import { ArticleView } from "~/components/ArticleView";
import { Spinner } from "~/components/Spinner/Spinner";
import { AwaitErrorBoundary } from "~/components/AwaitErrorBoundary/AwaitErrorBoundary";
import { findPublishedOn } from "~/lib/publishedOn";
import { fetchWithFastPath } from "~/lib/pdsRetry.server";
import type { Route } from "./+types/Article";

export function meta({ loaderData, params }: Route.MetaArgs) {
  const article = loaderData?.status === "ok" ? loaderData.data.article : undefined;
  return [
    { title: `${article?.title ?? "Article"} | Scribe Reader` },
    // Only DIDs make a well-formed at:// authority — params.author may be a
    // handle when a reader typed one into the search bar (no normalisation
    // applied, see CLAUDE.md). Every reader-generated loose article URL is
    // already DID-keyed (ADR 0013), so this covers the cases that matter.
    ...(params.author.startsWith("did:")
      ? [
          {
            tagName: "link",
            rel: "site.standard.document",
            href: `at://${params.author}/site.standard.document/${params.articleRkey}`,
          },
        ]
      : []),
    // Published articles have a real home on the author's own site — point
    // crawlers there so Reader's copy (a navigator, not a publishing
    // surface) doesn't compete with it as duplicate content. Loose/draft
    // articles have no canonicalUrl (ADR 0013) — Reader's own URL is their
    // only home, so no tag is added and it stays the de facto canonical.
    ...(article?.canonicalUrl
      ? [{ tagName: "link", rel: "canonical", href: article.canonicalUrl }]
      : []),
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { author, articleRkey } = params;
  try {
    const result = await fetchWithFastPath(
      () =>
        Promise.all([
          fetchArticle(author, articleRkey, request.signal),
          listSites(author, request.signal),
        ]),
      request.signal,
    );
    if (result.status === "ok") {
      const [article, sites] = result.data;
      return {
        status: "ok" as const,
        data: { article, publishedOn: findPublishedOn(sites, articleRkey) },
      };
    }
    return {
      status: "retrying" as const,
      data: result.data.then(([article, sites]) => ({
        article,
        publishedOn: findPublishedOn(sites, articleRkey),
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
  publishedOn: ReturnType<typeof findPublishedOn>;
}) {
  return <ArticleView article={article} publishedOn={publishedOn} author={author} />;
}

export default function ArticleRoute() {
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
