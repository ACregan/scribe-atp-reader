import { useLoaderData } from "react-router";
import { fetchSite } from "@scribe-atp/core";
import { GroupNode, ArticleLink } from "~/components/Tree";
import type { Route } from "./+types/site";

export function meta({ data }: Route.MetaArgs) {
  return [{ title: `${data?.site.title ?? "Site"} | Scribe Reader` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { author, siteRkey } = params;
  const site = await fetchSite(author, siteRkey, request.signal);
  return { author, site };
}

export default function SiteRoute() {
  const { author, site } = useLoaderData<typeof loader>();
  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="font-semibold text-xl mb-0.5">{site.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{site.url}</p>
      <ul className="space-y-1">
        {site.groups.map((group) => (
          <GroupNode key={group.slug} group={group} author={author} />
        ))}
        {site.ungroupedArticles.length > 0 && (
          <li className="pt-2">
            <span className="text-sm text-gray-500 italic">
              Unpublished Articles
            </span>
            <ul className="pl-6 mt-0.5 space-y-0.5">
              {site.ungroupedArticles.map((a) => (
                <ArticleLink key={a.uri} article={a} author={author} />
              ))}
            </ul>
          </li>
        )}
      </ul>
    </main>
  );
}
