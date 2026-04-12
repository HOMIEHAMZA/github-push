import { MetadataRoute } from 'next'
import { productsApi } from '@/lib/api-client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://accessomart.com';

  try {
    const res = await productsApi.list({ limit: 100 });
    const productEntries: MetadataRoute.Sitemap = res.products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt || p.createdAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      ...productEntries,
      {
        url: `${baseUrl}/pc-builder`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
    ];
  } catch (error) {
    console.error('[Sitemap] Failed to fetch products:', error);
    // Fallback to static routes
    return [
      { url: baseUrl, lastModified: new Date() },
      { url: `${baseUrl}/products`, lastModified: new Date() },
    ];
  }
}
