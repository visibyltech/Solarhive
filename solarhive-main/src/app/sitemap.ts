import type { MetadataRoute } from "next";
import { getDb } from "@/lib/db";

const siteUrl = "https://solarhive.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = getDb();
  const [productsSnap, categoriesSnap] = await Promise.all([
    db.collection("products").where("is_active", "==", true).get(),
    db.collection("categories").get(),
  ]);

  const productEntries: MetadataRoute.Sitemap = productsSnap.docs.map((doc) => {
    const p = doc.data();
    return {
      url: `${siteUrl}/product/${p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    };
  });

  const categoryEntries: MetadataRoute.Sitemap = categoriesSnap.docs.map((doc) => {
    const c = doc.data();
    return { url: `${siteUrl}/shop?category=${c.slug}` };
  });

  return [
    { url: siteUrl, priority: 1 },
    { url: `${siteUrl}/shop`, priority: 0.9 },
    { url: `${siteUrl}/contact` },
    { url: `${siteUrl}/login` },
    { url: `${siteUrl}/signup` },
    ...categoryEntries,
    ...productEntries,
  ];
}
