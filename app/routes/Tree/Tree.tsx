import { useLoaderData } from "react-router";
import { AuthorTree } from "~/components/Tree";
import { loadAuthorTree } from "~/lib/loadAuthorTree.server";
import type { Route } from "./+types/Tree";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `${params.author} | Scribe Reader` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  return loadAuthorTree(params.author, request.signal);
}

export default function AuthorTreeRoute() {
  const { author, sites, articles } = useLoaderData<typeof loader>();
  return (
    <main>
      <AuthorTree author={author} sites={sites} articles={articles} />
    </main>
  );
}
