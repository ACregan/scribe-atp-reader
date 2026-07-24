import { Suspense } from "react";
import { Await, useLoaderData, useParams } from "react-router";
import type { Site } from "@scribe-atp/core";
import { GroupItem } from "~/components/GroupItem/GroupItem";
import { Spinner } from "~/components/Spinner/Spinner";
import { AwaitErrorBoundary } from "~/components/AwaitErrorBoundary/AwaitErrorBoundary";
import { loadSite } from "~/lib/loadSite.server";
import type { Route } from "./+types/Site";
import styles from "./Site.module.css";

export function meta({ loaderData }: Route.MetaArgs) {
  const site = loaderData?.status === "ok" ? loaderData.data : undefined;
  return [{ title: `${site?.title ?? "Site"} | Scribe Reader` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { author, siteDomain } = params;
  return loadSite(author, siteDomain, request.signal);
}

function SiteContent({ author, site }: { author: string; site: Site }) {
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

export default function SiteRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const { author } = useParams();

  if (loaderData.status === "retrying") {
    return (
      <Suspense fallback={<Spinner />}>
        <Await resolve={loaderData.data} errorElement={<AwaitErrorBoundary />}>
          {(site) => <SiteContent author={author!} site={site} />}
        </Await>
      </Suspense>
    );
  }
  return <SiteContent author={author!} site={loaderData.data} />;
}
