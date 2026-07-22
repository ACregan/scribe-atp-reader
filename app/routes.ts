import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/Home/Home.tsx"),
  route(":author", "routes/AuthorLayout/AuthorLayout.tsx", [
    index("routes/Tree/Tree.tsx"),
    route("site.standard.publication", "routes/Tree/Tree.tsx", { id: "tree-alt" }),
    route("site.standard.publication/:siteDomain", "routes/Site/Site.tsx"),
    route("site.standard.publication/:siteDomain/:groupSlug", "routes/Group/Group.tsx"),
    route("site.standard.publication/:siteDomain/:groupSlug/:articleRkey", "routes/ArticleSite/ArticleSite.tsx"),
    route("site.standard.document", "routes/Articles/Articles.tsx"),
    route("site.standard.document/:articleRkey", "routes/Article/Article.tsx"),
    route("site.standard.document/:articleRkey/:slug", "routes/Article/Article.tsx", { id: "article-alt" }),
  ]),
] satisfies RouteConfig;
