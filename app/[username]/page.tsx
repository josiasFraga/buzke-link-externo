import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import buzkeLogo from '../../src/assets/logo.png';
import CompanyBookingPageClient from '../../src/components/CompanyBookingPageClient';
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
  const usernameLanding = isUsernameLanding(params.username);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agendar.buzke.com.br';
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
    const image = company.logo || company.coverPhoto;

    return {
      title,
      description,
      alternates: canonicalSlugPath
        ? {
            canonical: canonicalSlugPath,
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
        images: image ? [{ url: image }] : undefined,
      },
      twitter: {
        card: image ? 'summary_large_image' : 'summary',
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  }

  const selectedDate = getTodayDateInSaoPaulo();
  const services = await getServicesByCompanyId(company.id, selectedDate);
  const description = buildCompanySeoDescription(company, services);
  const title = buildCompanyTitle(company);
  const image = company.logo || company.coverPhoto;
  const fallbackImage = new URL(buzkeLogo.src, siteUrl).toString();
  const location = getLocationLabel(company);
  const canonicalPath = canonicalSlugPath || `/${params.username}`;
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
      canonical: canonicalSlugPath || `/${params.username}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalPath,
      images: [{ url: image || fallbackImage }],
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: [image || fallbackImage],
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

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `${url}#business`,
        name: company.name,
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
        aggregateRating:
          company.media_avaliacoes !== null
            ? {
                '@type': 'AggregateRating',
                ratingValue: company.media_avaliacoes,
                reviewCount: Number(company.total_avaliacoes || 0),
              }
            : undefined,
        makesOffer: initialServices.slice(0, 10).map((service) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: service.name,
            description: service.description,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <CompanyBookingPageClient
        company={company}
        initialServices={initialServices}
        initialSelectedDate={initialSelectedDate}
      />
    </>
  );
}
