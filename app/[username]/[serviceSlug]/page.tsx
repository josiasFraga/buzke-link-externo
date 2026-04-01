import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import ServiceBookingPageClient from '../../../src/components/ServiceBookingPageClient';
import {
  buildServiceSeoDescription,
  getCompanyBySlug,
  getCompanyByUsername,
  getServiceByIdOrSlug,
} from '../../../src/lib/buzke-api';

export const revalidate = 300;
export const dynamicParams = true;

interface ServicePageProps {
  params: {
    username: string;
    serviceSlug: string;
  };
}

function isUsernameLanding(identifier: string) {
  try {
    return decodeURIComponent(identifier).trim().startsWith('@');
  } catch {
    return identifier.trim().startsWith('@');
  }
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
  const title = `${data.service.name} | ${data.company.name}`;
  const image = data.service.images?.[0] || data.company.logo || data.company.coverPhoto;
  const canonicalPath = `/${canonicalUsername}/${canonicalServiceSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalPath,
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

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: data.service.name,
        description,
        image: data.service.images?.[0] || data.company.logo || data.company.coverPhoto,
        provider: {
          '@type': 'LocalBusiness',
          name: data.company.name,
          url: `${siteUrl}/${data.company.slug || params.username}`,
        },
        offers: data.service.price > 0
          ? {
              '@type': 'Offer',
              price: data.service.price,
              priceCurrency: 'BRL',
              url: serviceUrl,
            }
          : undefined,
        url: serviceUrl,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: data.company.name,
            item: `${siteUrl}/${data.company.slug || params.username}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: data.service.name,
            item: serviceUrl,
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
      <ServiceBookingPageClient
        key={data.service.id}
        company={data.company}
        service={data.service}
      />
    </>
  );
}