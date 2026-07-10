import { useLoaderData } from "react-router";
import { fetchSite } from "@scribe-atp/core";
import { GroupItem } from "~/components/GroupItem/GroupItem";
import { withNotFound } from "~/lib/withNotFound";
import type { Route } from "./+types/site";
import styles from "./site.module.css";

export function meta({ loaderData }: Route.MetaArgs) {
  return [{ title: `${loaderData?.site.title ?? "Site"} | Scribe Reader` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { author, siteDomain } = params;
  const site = await withNotFound(() => fetchSite(author, `https://${siteDomain}`, request.signal));
  return { author, site };
}

export default function SiteRoute() {
  const { author, site } = useLoaderData<typeof loader>();
  return (
    <main className={styles.page}>
      <div className={styles.pageContainer}>
        <div className={styles.siteNameContainer}>
          <h1 className={styles.title}>{site.title}</h1>
          <p className={styles.url}>{site.url}</p>
        </div>
        <ul className={styles.list}>
          {site.groups.map((group) => (
            <GroupItem key={group.slug} group={group} author={author} />
          ))}
        </ul>
      </div>
    </main>
  );
}
