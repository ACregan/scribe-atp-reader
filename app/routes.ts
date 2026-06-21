import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route(":author", "routes/author.tsx", [
    index("routes/tree.tsx"),
    route("app.scribe.site", "routes/tree-alt.tsx"),
    route("app.scribe.site/:siteRkey", "routes/site.tsx"),
    route("app.scribe.site/:siteRkey/:groupSlug", "routes/group.tsx"),
    route("app.scribe.site/:siteRkey/:groupSlug/:articleRkey", "routes/article-site.tsx"),
    route("app.scribe.article", "routes/articles.tsx"),
    route("app.scribe.article/:articleRkey", "routes/article.tsx"),
  ]),
] satisfies RouteConfig;
