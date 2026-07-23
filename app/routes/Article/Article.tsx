import { useLoaderData } from "react-router";
import { fetchArticle, listSites } from "@scribe-atp/core";
import { ArticleView } from "~/components/ArticleView";
import { findPublishedOn } from "~/lib/publishedOn";
import { withNotFound } from "~/lib/withNotFound";
import type { Route } from "./+types/Article";

export function meta({ loaderData, params }: Route.MetaArgs) {
  return [
    { title: `${loaderData?.article.title ?? "Article"} | Scribe Reader` },
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
    ...(loaderData?.article.canonicalUrl
      ? [{ tagName: "link", rel: "canonical", href: loaderData.article.canonicalUrl }]
      : []),
  ];
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
