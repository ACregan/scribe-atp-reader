import { useLoaderData } from "react-router";
import { listSites, listArticles } from "@scribe-atp/core";
import { AuthorTree } from "~/components/Tree";
import type { Route } from "./+types/tree";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `${params.author} | Scribe Reader` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { author } = params;
  const [sites, articles] = await Promise.all([
    listSites(author, request.signal),
    listArticles(author, request.signal),
  ]);
  return { author, sites, articles };
}

export default function AuthorTreeRoute() {
  const { author, sites, articles } = useLoaderData<typeof loader>();
  return (
    <main>
      <AuthorTree author={author} sites={sites} articles={articles} />
    </main>
  );
}
