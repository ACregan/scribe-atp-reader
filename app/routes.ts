import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route(":author", "routes/author.tsx", [
    index("routes/tree.tsx"),
    route("site.standard.publication", "routes/tree-alt.tsx"),
    route("site.standard.publication/:siteDomain", "routes/site.tsx"),
    route("site.standard.publication/:siteDomain/:groupSlug", "routes/group.tsx"),
    route("site.standard.publication/:siteDomain/:groupSlug/:articleRkey", "routes/article-site.tsx"),
    route("site.standard.document", "routes/articles.tsx"),
    route("site.standard.document/:articleRkey", "routes/article.tsx"),
  ]),
] satisfies RouteConfig;
