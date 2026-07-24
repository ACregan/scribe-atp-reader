import { Suspense } from "react";
import { Await, data, useLoaderData, useParams } from "react-router";
import { NotFoundError } from "@scribe-atp/core";
import type { Site, SiteGroup } from "@scribe-atp/core";
import { ArticleItem } from "~/components/ArticleItem/ArticleItem";
import { Spinner } from "~/components/Spinner/Spinner";
import { AwaitErrorBoundary } from "~/components/AwaitErrorBoundary/AwaitErrorBoundary";
import { loadSite } from "~/lib/loadSite.server";
import type { Route } from "./+types/Group";
import styles from "./Group.module.css";

export function meta({ loaderData }: Route.MetaArgs) {
  const resolved = loaderData?.status === "ok" ? loaderData.data : undefined;
  return [
    {
      title: resolved
        ? `${resolved.group.title} — ${resolved.site.title} | Scribe Reader`
        : "Scribe Reader",
    },
  ];
}

function findGroup(site: Site, groupSlug: string | undefined): SiteGroup {
  const group = site.groups.find((g) => g.slug === groupSlug);
  if (!group) throw new NotFoundError(`Group not found: ${groupSlug}`);
  return group;
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { author, siteDomain, groupSlug } = params;
  const result = await loadSite(author, siteDomain, request.signal);
  if (result.status === "ok") {
    try {
      return {
        status: "ok" as const,
        data: { site: result.data, group: findGroup(result.data, groupSlug) },
      };
    } catch (error) {
      if (error instanceof NotFoundError) throw data("Group not found", { status: 404 });
      throw error;
    }
  }
  return {
    status: "retrying" as const,
    data: result.data.then((site) => ({ site, group: findGroup(site, groupSlug) })),
  };
}

function GroupContent({
  author,
  siteDomain,
  groupSlug,
  site,
  group,
}: {
  author: string;
  siteDomain: string;
  groupSlug: string;
  site: Site;
  group: SiteGroup;
}) {
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

export default function GroupRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const { author, siteDomain, groupSlug } = useParams();

  if (loaderData.status === "retrying") {
    return (
      <Suspense fallback={<Spinner />}>
        <Await resolve={loaderData.data} errorElement={<AwaitErrorBoundary />}>
          {({ site, group }) => (
            <GroupContent
              author={author!}
              siteDomain={siteDomain!}
              groupSlug={groupSlug!}
              site={site}
              group={group}
            />
          )}
        </Await>
      </Suspense>
    );
  }
  const { site, group } = loaderData.data;
  return (
    <GroupContent
      author={author!}
      siteDomain={siteDomain!}
      groupSlug={groupSlug!}
      site={site}
      group={group}
    />
  );
}
