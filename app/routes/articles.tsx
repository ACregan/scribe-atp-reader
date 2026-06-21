import { useLoaderData, Link } from "react-router";
import { listSites, listArticles, slugFromUri } from "@scribe-atp/core";
import { tagArticles } from "~/lib/tagArticles";
import type { ArticleState } from "~/lib/tagArticles";
import type { Route } from "./+types/articles";

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `All articles by ${params.author} | Scribe Reader` }];
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const { author } = params;
  const [sites, articles] = await Promise.all([
    listSites(author, request.signal),
    listArticles(author, request.signal),
  ]);

  return { author, articles: tagArticles(sites, articles) };
}

const stateLabel: Record<ArticleState, string> = {
  published: "Published",
  unpublished: "Unpublished",
  draft: "Draft",
};

const stateBadge: Record<ArticleState, string> = {
  published: "bg-green-50 text-green-700",
  unpublished: "bg-yellow-50 text-yellow-700",
  draft: "bg-gray-100 text-gray-500",
};

export default function ArticlesRoute() {
  const { author, articles } = useLoaderData<typeof loader>();

  if (articles.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-8">
        <p className="text-gray-500">
          No articles found for <span className="font-mono">{author}</span>.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold mb-6">
        All articles by <span className="font-mono">{author}</span>
      </h1>
      <ul className="space-y-4">
        {articles.map((article) => (
          <li key={article.uri} className="flex items-start gap-3">
            <span
              className={`mt-0.5 shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${stateBadge[article.state]}`}
            >
              {stateLabel[article.state]}
            </span>
            <div>
              <Link
                to={`/${author}/app.scribe.article/${slugFromUri(article.uri)}`}
                className="hover:underline text-gray-900 font-medium"
              >
                {article.title}
              </Link>
              {article.synopsis && (
                <p className="text-sm text-gray-500 mt-0.5">{article.synopsis}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
