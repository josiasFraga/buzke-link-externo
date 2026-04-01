import type { MetadataRoute } from 'next';
import {
  getCompanyBySlug,
  getEligibleBusinessSlugs,
  getServiceSlugsByCompanyId,
} from '../src/lib/buzke-api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agendar.buzke.com.br';
  const slugs = await getEligibleBusinessSlugs();

  const companyPages = slugs.map((slug) => ({
    url: `${siteUrl}/${encodeURIComponent(slug)}`,
    changeFrequency: 'daily' as const,
    priority: 0.9,
    lastModified: new Date(),
  }));

  const servicePagesNested = await Promise.all(
    slugs.map(async (slug) => {
      const company = await getCompanyBySlug(slug);

      if (!company) {
        return [];
      }

      const services = await getServiceSlugsByCompanyId(company.id);

      return services
        .filter((service) => service.slug)
        .map((service) => ({
          url: `${siteUrl}/${encodeURIComponent(slug)}/${encodeURIComponent(service.slug!)}`,
          changeFrequency: 'daily' as const,
          priority: 0.8,
          lastModified: new Date(),
        }));
    })
  );

  const servicePages = servicePagesNested.flat();

  return [
    {
      url: siteUrl,
      changeFrequency: 'daily',
      priority: 0.7,
      lastModified: new Date(),
    },
    ...companyPages,
    ...servicePages,
  ];
}
