import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route(":author", "routes/author.tsx", [
    index("routes/tree.tsx"),
    route("app.scribe.site", "routes/tree-alt.tsx"),
    route("app.scribe.site/:siteDomain", "routes/site.tsx"),
    route("app.scribe.site/:siteDomain/:groupSlug", "routes/group.tsx"),
    route("app.scribe.site/:siteDomain/:groupSlug/:articleRkey", "routes/article-site.tsx"),
    route("app.scribe.article", "routes/articles.tsx"),
    route("app.scribe.article/:articleRkey", "routes/article.tsx"),
  ]),
] satisfies RouteConfig;
