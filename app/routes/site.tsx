import { useLoaderData } from "react-router";
import { fetchSite } from "@scribe-atp/core";
import { GroupNode, ArticleLink } from "~/components/Tree";
import type { Route } from "./+types/site";
import styles from "./site.module.css";

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
    <main className={styles.page}>
      <h1 className={styles.title}>{site.title}</h1>
      <p className={styles.url}>{site.url}</p>
      <ul className={styles.list}>
        {site.groups.map((group) => (
          <GroupNode key={group.slug} group={group} author={author} />
        ))}
        {site.ungroupedArticles.length > 0 && (
          <li className={styles.unpublishedSection}>
            <span className={styles.unpublishedLabel}>Unpublished Articles</span>
            <ul className={styles.unpublishedList}>
              {site.ungroupedArticles.map((a) => (
                <li key={a.uri} className={styles.unpublishedItem}>
                  <ArticleLink article={a} author={author} />
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>
    </main>
  );
}
