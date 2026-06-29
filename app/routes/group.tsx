import { data, useLoaderData, Link } from "react-router";
import { fetchSite, slugFromUri } from "@scribe-atp/core";
import type { Route } from "./+types/group";
import styles from "./group.module.css";

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
  const { author, siteDomain, groupSlug } = params;
  const site = await fetchSite(author, `https://${siteDomain}`, request.signal);
  const group = site.groups.find((g) => g.slug === groupSlug);
  if (!group) throw data("Group not found", { status: 404 });
  return { author, site, group };
}

export default function GroupRoute() {
  const { author, site, group } = useLoaderData<typeof loader>();
  return (
    <main className={styles.page}>
      <p className={styles.siteName}>{site.title}</p>
      <h1 className={styles.title}>{group.title}</h1>
      <ul className={styles.list}>
        {group.articles.map((article) => (
          <li key={article.uri} className={styles.item}>
            <Link
              to={`/${author}/app.scribe.article/${slugFromUri(article.uri)}`}
              className={styles.link}
            >
              {article.title}
            </Link>
            {article.description && (
              <p className={styles.synopsis}>{article.description}</p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
