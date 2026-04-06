import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import CompanyBookingPageClient from '../../src/components/CompanyBookingPageClient';
import StructuredDataScript from '../../src/components/StructuredDataScript';
import type { Company, Service } from '../../src/types';
import {
  buildCompanyLandingDescription,
  buildCompanySeoDescription,
  getCompanyBySlug,
  getCompanyByUsername,
  getEligibleBusinessSlugs,
  getEligibleBusinessUsernames,
  getServicesByCompanyId,
  getTodayDateInSaoPaulo,
} from '../../src/lib/buzke-api';

export const revalidate = 300;
export const dynamicParams = true;

interface CompanyPageProps {
  params: {
    username: string;
  };
}

const SCHEMA_DAY_MAP: Record<string, string> = {
  'Domingo': 'Sunday',
  'Segunda-feira': 'Monday',
  'Terça-feira': 'Tuesday',
  'Quarta-feira': 'Wednesday',
  'Quinta-feira': 'Thursday',
  'Sexta-feira': 'Friday',
  'Sábado': 'Saturday',
};

function getLocationLabel(company: Company) {
  if (!company.address?.city) {
    return null;
  }

  return company.address.state
    ? `${company.address.city} - ${company.address.state}`
    : company.address.city;
}

function buildCompanyTitle(company: Company) {
  const location = getLocationLabel(company);

  return location
    ? `${company.name} | Agendamento online em ${location}`
    : `${company.name} | Agendamento online`;
}

function buildPriceRange(services: Service[]) {
  const prices = services
    .map((service) => service.price)
    .filter((price) => typeof price === 'number' && price > 0);

  if (!prices.length) {
    return undefined;
  }

  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);

  return minimum === maximum ? `R$ ${minimum}` : `R$ ${minimum} - R$ ${maximum}`;
}

function normalizeText(value?: string | null) {
  const normalizedValue = value?.replace(/\s+/g, ' ').trim();

  return normalizedValue || undefined;
}

function buildAggregateRating(rating: number | null, reviewCount: number) {
  if (rating === null || !Number.isFinite(rating) || reviewCount <= 0) {
    return undefined;
  }

  return {
    '@type': 'AggregateRating',
    ratingValue: Number(rating.toFixed(1)),
    reviewCount,
    bestRating: 5,
    worstRating: 1,
  };
}

function buildOpeningHoursSpecification(company: Company) {
  return (company.businessHours || [])
    .map((entry) => {
      const dayOfWeek = SCHEMA_DAY_MAP[entry.day];
      const [opens, closes] = entry.hours.split(' - ').map((value) => value.trim());

      if (!dayOfWeek || !opens || !closes) {
        return null;
      }

      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${dayOfWeek}`,
        opens,
        closes,
      };
    })
    .filter(Boolean);
}

function buildSameAs(company: Company) {
  const sameAs = new Set<string>();
  const whatsappDigits = company.whatsapp?.replace(/\D/g, '');

  if (whatsappDigits) {
    sameAs.add(`https://wa.me/${whatsappDigits}`);
  }

  return sameAs.size ? Array.from(sameAs) : undefined;
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

export async function generateStaticParams() {
  const [usernames, slugs] = await Promise.all([
    getEligibleBusinessUsernames(),
    getEligibleBusinessSlugs(),
  ]);

  const params = new Set<string>();

  usernames.forEach((username) => {
    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      return;
    }

    params.add(normalizedUsername.startsWith('@') ? normalizedUsername : `@${normalizedUsername}`);
  });

  slugs.forEach((slug) => {
    const normalizedSlug = slug.trim();

    if (normalizedSlug) {
      params.add(normalizedSlug);
    }
  });

  return Array.from(params).map((username) => ({
    username,
  }));
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agendar.buzke.com.br';
  const usernameLanding = isUsernameLanding(params.username);
  const company = usernameLanding
    ? await getCompanyByUsername(params.username)
    : await getCompanyBySlug(params.username);

  if (!company) {
    return {
      title: 'Empresa não encontrada',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalSlugPath = company.slug ? `/${company.slug}` : undefined;

  if (usernameLanding) {
    const description = buildCompanyLandingDescription(company);
    const title = `${company.name} | Conheça a empresa`;
    const canonicalPath = canonicalSlugPath || `/${params.username}`;
    const canonicalUrl = buildAbsoluteUrl(canonicalPath, siteUrl);
    const ogImageUrl = buildAbsoluteUrl(company.logo || `${canonicalPath}/opengraph-image`, siteUrl);

    return {
      title,
      description,
      alternates: canonicalSlugPath
        ? {
            canonical: canonicalUrl,
          }
        : undefined,
      robots: {
        index: false,
        follow: true,
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

  const selectedDate = getTodayDateInSaoPaulo();
  const services = await getServicesByCompanyId(company.id, selectedDate);
  const description = buildCompanySeoDescription(company, services);
  const title = buildCompanyTitle(company);
  const location = getLocationLabel(company);
  const canonicalPath = canonicalSlugPath || `/${params.username}`;
  const canonicalUrl = buildAbsoluteUrl(canonicalPath, siteUrl);
  const ogImageUrl = buildAbsoluteUrl(company.logo || `${canonicalPath}/opengraph-image`, siteUrl);
  const keywords = [
    company.name,
    ...(company.categories || []),
    ...services.slice(0, 5).map((service) => service.name),
    location,
  ].filter((value): value is string => Boolean(value));

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

export default async function CompanyPage({ params }: CompanyPageProps) {
  const usernameLanding = isUsernameLanding(params.username);
  const company = usernameLanding
    ? await getCompanyByUsername(params.username)
    : await getCompanyBySlug(params.username);

  if (!company) {
    notFound();
  }

  if (usernameLanding) {
    if (!company.slug) {
      notFound();
    }

    redirect(`/${company.slug}`);
  }

  const initialSelectedDate = getTodayDateInSaoPaulo();
  const initialServices = await getServicesByCompanyId(company.id, initialSelectedDate);
  const description = buildCompanySeoDescription(company, initialServices);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://agendar.buzke.com.br'}/${company.slug || params.username}`;
  const image = company.logo || company.coverPhoto;
  const location = getLocationLabel(company);
  const openingHoursSpecification = buildOpeningHoursSpecification(company);
  const sameAs = buildSameAs(company);
  const priceRange = buildPriceRange(initialServices);
  const aggregateRating = buildAggregateRating(
    company.media_avaliacoes,
    Number(company.total_avaliacoes || 0)
  );

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `${url}#business`,
        name: normalizeText(company.name),
        description,
        url,
        image,
        telephone: company.phone || company.whatsapp || undefined,
        sameAs,
        priceRange,
        address: company.address
          ? {
              '@type': 'PostalAddress',
              streetAddress: `${company.address.street}, ${company.address.number}`,
              addressLocality: company.address.city,
              addressRegion: company.address.state,
              addressCountry: company.address.pais,
            }
          : undefined,
        areaServed: location
          ? {
              '@type': 'City',
              name: location,
            }
          : undefined,
        openingHoursSpecification: openingHoursSpecification.length ? openingHoursSpecification : undefined,
        aggregateRating,
        makesOffer: initialServices.slice(0, 10).map((service) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: normalizeText(service.name),
            description: normalizeText(service.description),
          },
          price: service.price,
          priceCurrency: 'BRL',
          url: `${url}/${service.slug || service.id}`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: process.env.NEXT_PUBLIC_SITE_URL || 'https://agendar.buzke.com.br',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: company.name,
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <>
      <StructuredDataScript id={`company-structured-data-${company.id}`} data={structuredData} />
      <CompanyBookingPageClient
        company={company}
        initialServices={initialServices}
        initialSelectedDate={initialSelectedDate}
      />
    </>
  );
}
