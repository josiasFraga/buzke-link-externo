import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CompanyBookingPageClient from '../../src/components/CompanyBookingPageClient';
import CompanyProfile from '../../src/components/CompanyProfile';
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

    return (
      <CompanyProfile company={company}>
        <section id="section-services" className="theme-page px-4 py-12 sm:px-6 lg:px-8">
          <div className="theme-card mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-background-secondary)] to-[var(--color-surface-secondary)] p-8 sm:p-10">
            <div className="max-w-2xl">
              <span className="theme-panel-success inline-flex rounded-full px-3 py-1 text-sm font-medium theme-text-success">
                Perfil da empresa
              </span>
              <h2 className="theme-text-primary mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Conheça a empresa e siga para o agendamento
              </h2>
              <p className="theme-text-secondary mt-4 text-base leading-7 sm:text-lg">
                Esta página apresenta os dados públicos da empresa. Para ver os serviços disponíveis e concluir o agendamento, continue para a página oficial de reservas.
              </p>
              <div className="theme-text-secondary mt-6 flex flex-wrap gap-3 text-sm">
                {company.categories?.slice(0, 4).map((category) => (
                  <span key={category} className="theme-chip rounded-full px-3 py-1.5">
                    {category}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href={`/${company.slug}`}
                  className="theme-primary-btn inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold"
                >
                  Agendar
                </Link>
                <p className="theme-text-muted text-sm">O agendamento será aberto em /{company.slug}</p>
              </div>
            </div>
          </div>
        </section>
      </CompanyProfile>
    );
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
