import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import ServiceBookingPageClient from '../../../src/components/ServiceBookingPageClient';
import StructuredDataScript from '../../../src/components/StructuredDataScript';
import type { Company, Service } from '../../../src/types';
import {
  buildServiceSeoDescription,
  getCompanyBySlug,
  getCompanyByUsername,
  getEligibleBusinessSlugs,
  getServiceByIdOrSlug,
  getServiceSlugsByCompanyId,
} from '../../../src/lib/buzke-api';

export const revalidate = 300;
export const dynamicParams = true;

interface ServicePageProps {
  params: {
    username: string;
    serviceSlug: string;
  };
}

function getLocationLabel(company: Company) {
  if (!company.address?.city) {
    return null;
  }

  return company.address.state
    ? `${company.address.city} - ${company.address.state}`
    : company.address.city;
}

function buildServiceTitle(company: Company, service: Service) {
  const location = getLocationLabel(company);

  return location
    ? `${service.name} em ${company.name} | ${location}`
    : `${service.name} | ${company.name}`;
}

function buildServiceKeywords(company: Company, service: Service) {
  return [
    service.name,
    company.name,
    service.tipo,
    ...(company.categories || []),
    getLocationLabel(company),
  ].filter((value): value is string => Boolean(value));
}

function buildDurationIso(duration: string) {
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)min/);
  const hours = Number(hoursMatch?.[1] || 0);
  const minutes = Number(minutesMatch?.[1] || 0);

  if (!hours && !minutes) {
    return undefined;
  }

  return `PT${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}`;
}

function normalizeText(value?: string | null) {
  const normalizedValue = value?.replace(/\s+/g, ' ').trim();

  return normalizedValue || undefined;
}

function buildAggregateRating(rating: number | undefined, reviewCount: number | undefined) {
  if (!Number.isFinite(rating) || !reviewCount || reviewCount <= 0) {
    return undefined;
  }

  return {
    '@type': 'AggregateRating',
    ratingValue: Number(rating!.toFixed(1)),
    reviewCount,
    bestRating: 5,
    worstRating: 1,
  };
}

function buildSameAs(company: Company) {
  const sameAs = new Set<string>();
  const whatsappDigits = company.whatsapp?.replace(/\D/g, '');

  if (whatsappDigits) {
    sameAs.add(`https://wa.me/${whatsappDigits}`);
  }

  return sameAs.size ? Array.from(sameAs) : undefined;
}

export async function generateStaticParams() {
  const companySlugs = await getEligibleBusinessSlugs();
  const paramsNested = await Promise.all(
    companySlugs.map(async (username) => {
      const company = await getCompanyBySlug(username);

      if (!company) {
        return [];
      }

      const services = await getServiceSlugsByCompanyId(company.id);

      return services
        .filter((service) => service.slug)
        .map((service) => ({
          username,
          serviceSlug: service.slug!,
        }));
    })
  );

  return paramsNested.flat();
}

function isUsernameLanding(identifier: string) {
  try {
    return decodeURIComponent(identifier).trim().startsWith('@');
  } catch {
    return identifier.trim().startsWith('@');
  }
}

function buildAbsoluteUrl(pathOrUrl: string, siteUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`, siteUrl).toString();
}

async function getPageData(params: ServicePageProps['params']) {
  const usernameLanding = isUsernameLanding(params.username);
  const company = usernameLanding
    ? await getCompanyByUsername(params.username)
    : await getCompanyBySlug(params.username);

  if (!company) {
    return null;
  }

  const service = await getServiceByIdOrSlug(params.serviceSlug, company.id);

  if (!service) {
    return { company, service: null, usernameLanding };
  }

  return { company, service, usernameLanding };
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agendar.buzke.com.br';
  const data = await getPageData(params);

  if (!data?.company || !data.service) {
    return {
      title: 'Serviço não encontrado',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUsername = data.company.slug || params.username;
  const canonicalServiceSlug = data.service.slug || params.serviceSlug;
  const description = buildServiceSeoDescription(data.company, data.service);
  const title = buildServiceTitle(data.company, data.service);
  const canonicalPath = `/${canonicalUsername}/${canonicalServiceSlug}`;
  const canonicalUrl = buildAbsoluteUrl(canonicalPath, siteUrl);
  const ogImageUrl = buildAbsoluteUrl(
    data.service.images?.[0] || `${canonicalPath}/opengraph-image`,
    siteUrl
  );
  const keywords = buildServiceKeywords(data.company, data.service);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
      images: [{ url: ogImageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const data = await getPageData(params);

  if (!data?.company || !data.service) {
    notFound();
  }

  if (data.usernameLanding) {
    if (!data.company.slug) {
      notFound();
    }

    redirect(`/${data.company.slug}/${data.service.slug || params.serviceSlug}`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agendar.buzke.com.br';
  const serviceSlug = data.service.slug || params.serviceSlug;
  const serviceUrl = `${siteUrl}/${data.company.slug || params.username}/${serviceSlug}`;
  const description = buildServiceSeoDescription(data.company, data.service);
  const location = getLocationLabel(data.company);
  const sameAs = buildSameAs(data.company);
  const durationIso = buildDurationIso(data.service.duration);
  const aggregateRating = buildAggregateRating(data.service.rating, data.service.reviewCount);

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${serviceUrl}#service`,
        name: normalizeText(data.service.name),
        description,
        image: data.service.images?.[0] || data.company.logo || data.company.coverPhoto,
        serviceType: data.service.tipo || data.company.categories?.[0] || undefined,
        category: data.company.categories?.join(', ') || undefined,
        areaServed: location
          ? {
              '@type': 'City',
              name: location,
            }
          : undefined,
        providerMobility: 'dynamic',
        duration: durationIso,
        provider: {
          '@type': 'LocalBusiness',
          '@id': `${siteUrl}/${data.company.slug || params.username}#business`,
          name: normalizeText(data.company.name),
          url: `${siteUrl}/${data.company.slug || params.username}`,
          image: data.company.logo || data.company.coverPhoto,
          telephone: data.company.phone || data.company.whatsapp || undefined,
          sameAs,
          address: data.company.address
            ? {
                '@type': 'PostalAddress',
                streetAddress: `${data.company.address.street}, ${data.company.address.number}`,
                addressLocality: data.company.address.city,
                addressRegion: data.company.address.state,
                addressCountry: data.company.address.pais,
              }
            : undefined,
        },
        offers: data.service.price > 0
          ? {
              '@type': 'Offer',
              price: data.service.price,
              priceCurrency: 'BRL',
              url: serviceUrl,
              availability: 'https://schema.org/InStock',
            }
          : undefined,
        aggregateRating,
        url: serviceUrl,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${serviceUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: normalizeText(data.company.name),
            item: `${siteUrl}/${data.company.slug || params.username}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: normalizeText(data.service.name),
            item: serviceUrl,
          },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': `${serviceUrl}#webpage`,
        url: serviceUrl,
        name: buildServiceTitle(data.company, data.service),
        description,
        isPartOf: {
          '@id': `${siteUrl}/${data.company.slug || params.username}#business`,
        },
      },
    ],
  };

  return (
    <>
      <StructuredDataScript
        id={`service-structured-data-${data.company.id}-${data.service.id}`}
        data={structuredData}
      />
      <ServiceBookingPageClient
        key={data.service.id}
        company={data.company}
        service={data.service}
      />
    </>
  );
}