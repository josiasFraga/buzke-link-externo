import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import CompanyBookingPageClient from '../../src/components/CompanyBookingPageClient';
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
  const title = `${company.name} | Agendamento online`;
  const image = company.logo || company.coverPhoto;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalSlugPath || `/${params.username}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalSlugPath || `/${params.username}`,
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

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.name,
    description,
    url,
    image,
    telephone: company.phone || company.whatsapp || undefined,
    address: company.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: `${company.address.street}, ${company.address.number}`,
          addressLocality: company.address.city,
          addressRegion: company.address.state,
          addressCountry: company.address.pais,
        }
      : undefined,
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
    })),
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
