import type { MetadataRoute } from 'next';
import { getEligibleBusinessSlugs } from '../src/lib/buzke-api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agendar.buzke.com.br';
  const slugs = await getEligibleBusinessSlugs();

  const companyPages = slugs.map((slug) => ({
    url: `${siteUrl}/${encodeURIComponent(slug)}`,
    changeFrequency: 'daily' as const,
    priority: 0.9,
    lastModified: new Date(),
  }));

  return [
    {
      url: siteUrl,
      changeFrequency: 'daily',
      priority: 0.7,
      lastModified: new Date(),
    },
    ...companyPages,
  ];
}
