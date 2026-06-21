import { data, useLoaderData, Link } from "react-router";
import { fetchSite, slugFromUri } from "@scribe-atp/core";
import type { Route } from "./+types/group";

export function meta({ data: d }: Route.MetaArgs) {
  const group = d?.group;
  const site = d?.site;
  return [
    {
      title: group
        ? `${group.title} — ${site?.title} | Scribe Reader`
        : "Scribe Reader",
    },
  ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { author, siteRkey, groupSlug } = params;
  const site = await fetchSite(author, siteRkey, request.signal);
  const group = site.groups.find((g) => g.slug === groupSlug);
  if (!group) throw data("Group not found", { status: 404 });
  return { author, site, group };
}

export default function GroupRoute() {
  const { author, site, group } = useLoaderData<typeof loader>();
  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <p className="text-sm text-gray-500 mb-4">{site.title}</p>
      <h1 className="text-2xl font-semibold mb-6">{group.title}</h1>
      <ul className="space-y-2">
        {group.articles.map((article) => (
          <li key={article.uri}>
            <Link
              to={`/${author}/app.scribe.article/${slugFromUri(article.uri)}`}
              className="hover:underline text-gray-900"
            >
              {article.title}
            </Link>
            {article.synopsis && (
              <p className="text-sm text-gray-500 mt-0.5">{article.synopsis}</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
