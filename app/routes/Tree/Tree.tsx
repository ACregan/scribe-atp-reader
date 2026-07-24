import { Suspense } from "react";
import { Await, useLoaderData } from "react-router";
import type { SiteRecord, ArticleRef } from "@scribe-atp/core";
import { AuthorTree } from "~/components/Tree";
import { Spinner } from "~/components/Spinner/Spinner";
import { AwaitErrorBoundary } from "~/components/AwaitErrorBoundary/AwaitErrorBoundary";
import { loadAuthorTree } from "~/lib/loadAuthorTree.server";
import type { Route } from "./+types/Tree";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `${params.author} | Scribe Reader` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  return loadAuthorTree(params.author, request.signal);
}

function TreeContent({
  author,
  sites,
  articles,
}: {
  author: string;
  sites: SiteRecord[];
  articles: ArticleRef[];
}) {
  return <AuthorTree author={author} sites={sites} articles={articles} />;
}

export default function AuthorTreeRoute() {
  const loaderData = useLoaderData<typeof loader>();

  if (loaderData.status === "retrying") {
    return (
      <main>
        <Suspense fallback={<Spinner />}>
          <Await resolve={loaderData.data} errorElement={<AwaitErrorBoundary />}>
            {({ author, sites, articles }) => (
              <TreeContent author={author} sites={sites} articles={articles} />
            )}
          </Await>
        </Suspense>
      </main>
    );
  }
  const { author, sites, articles } = loaderData.data;
  return (
    <main>
      <TreeContent author={author} sites={sites} articles={articles} />
    </main>
  );
}
