import type { Article } from "@scribe-atp/core";

interface PublishedOn {
  title: string;
  canonicalUrl: string;
}

interface ArticleViewProps {
  article: Article;
  publishedOn: PublishedOn | null;
}

export function ArticleView({ article, publishedOn }: ArticleViewProps) {
  return (
    <article className="max-w-2xl mx-auto px-6 py-8">
      {publishedOn && (
        <div className="mb-6 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
          Published on{" "}
          <a
            href={publishedOn.canonicalUrl}
            className="underline hover:text-gray-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            {publishedOn.title}
          </a>
        </div>
      )}
      {article.splashImageUrl && (
        <img
          src={article.splashImageUrl}
          alt=""
          className="w-full h-56 object-cover rounded-lg mb-6"
        />
      )}
      <h1 className="text-3xl font-bold mb-3 leading-tight">{article.title}</h1>
      {article.synopsis && (
        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
          {article.synopsis}
        </p>
      )}
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}
