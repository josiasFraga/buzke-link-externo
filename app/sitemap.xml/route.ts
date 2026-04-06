import {
  getCompanyBySlug,
  getEligibleBusinessSlugs,
  getServiceSlugsByCompanyId,
} from '../../src/lib/buzke-api';

export const revalidate = 300;

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildUrlEntry(url: string, priority: number, lastModified: string) {
  return [
    '<url>',
    `<loc>${escapeXml(url)}</loc>`,
    `<lastmod>${lastModified}</lastmod>`,
    '<changefreq>daily</changefreq>',
    `<priority>${priority.toFixed(1)}</priority>`,
    '</url>',
  ].join('');
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agendar.buzke.com.br';
  const slugs = await getEligibleBusinessSlugs();
  const lastModified = new Date().toISOString();

  const companyPages = slugs.map((slug) =>
    buildUrlEntry(`${siteUrl}/${encodeURIComponent(slug)}`, 0.9, lastModified)
  );

  const servicePagesNested = await Promise.all(
    slugs.map(async (slug) => {
      const company = await getCompanyBySlug(slug);

      if (!company) {
        return [];
      }

      const services = await getServiceSlugsByCompanyId(company.id);

      return services
        .filter((service) => service.slug)
        .map((service) =>
          buildUrlEntry(
            `${siteUrl}/${encodeURIComponent(slug)}/${encodeURIComponent(service.slug!)}`,
            0.8,
            lastModified
          )
        );
    })
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    buildUrlEntry(siteUrl, 0.7, lastModified),
    ...companyPages,
    ...servicePagesNested.flat(),
    '</urlset>',
  ].join('');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
    },
  });
}