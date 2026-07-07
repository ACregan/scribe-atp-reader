import { data, useLoaderData } from "react-router";
import { fetchSite } from "@scribe-atp/core";
import { ArticleItem } from "~/components/ArticleItem/ArticleItem";
import { withNotFound } from "~/lib/withNotFound";
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
  const site = await withNotFound(() => fetchSite(author, `https://${siteDomain}`, request.signal));
  const group = site.groups.find((g) => g.slug === groupSlug);
  if (!group) throw data("Group not found", { status: 404 });
  return { author, site, group, siteDomain, groupSlug };
}

export default function GroupRoute() {
  const { author, site, group, siteDomain, groupSlug } = useLoaderData<typeof loader>();
  return (
    <main className={styles.page}>
      <div className={styles.pageContainer}>
        <p className={styles.siteName}>{site.title}</p>
        <h1 className={styles.title}>{group.title}</h1>
        <ul className={styles.list}>
          {group.articles.map((article) => (
            <li key={article.uri} className={styles.item}>
              <ArticleItem
                article={article}
                author={author}
                showDescription
                siteDomain={siteDomain}
                groupSlug={groupSlug}
              />
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
