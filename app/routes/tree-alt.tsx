import { useLoaderData } from "react-router";
import { listSites, listArticles } from "@scribe-atp/core";
import { AuthorTree } from "~/components/Tree";
import type { Route } from "./+types/tree-alt";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `${params.author} | Scribe Reader` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { author } = params;
  try {
    const [sites, articles] = await Promise.all([
      listSites(author, request.signal),
      listArticles(author, request.signal),
    ]);
    return { author, sites, articles };
  } catch (e) {
    if (e instanceof Error && e.message.includes("Bad Request")) {
      throw new Response("Not Found", { status: 404 });
    }
    throw e;
  }
}

export default function AuthorTreeAltRoute() {
  const { author, sites, articles } = useLoaderData<typeof loader>();
  return (
    <main>
      <AuthorTree author={author} sites={sites} articles={articles} />
    </main>
  );
}
