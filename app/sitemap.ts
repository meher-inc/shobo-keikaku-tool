import type { MetadataRoute } from "next";

const BASE = "https://plan.todokede.jp";

// 公開している主要ページのサイトマップ。検索エンジンのクロールを助ける。
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "/", priority: 1.0 },
    { path: "/shobo-keikaku-no-kakikata", priority: 0.8 },
    { path: "/pricing", priority: 0.7 },
    { path: "/contact", priority: 0.5 },
  ];
  return routes.map((r) => ({
    url: `${BASE}${r.path}`,
    changeFrequency: "monthly",
    priority: r.priority,
  }));
}
