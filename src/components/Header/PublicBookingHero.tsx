'use client';

import React from 'react';
import Image from 'next/image';
import {
  CalendarCheck2,
  Clock3,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
} from 'lucide-react';
import { Company } from '../../types';
import EstablishmentMetaChips, { MetaChipItem } from './EstablishmentMetaChips';
import HeroActions from './HeroActions';
import {
  formatPriceLabel,
  formatRating,
  getInitials,
  getLocationSummary,
  getMapsHref,
  getPhoneHref,
  getPrimaryCategory,
  getTodayBusinessHours,
  getWhatsappHref,
} from './publicBookingUtils';

interface PublicBookingHeroProps {
  company: Company;
  priceFrom?: number | null;
  isVerified?: boolean;
  onOpenHours: () => void;
  onOpenReviews: () => void;
}

const PublicBookingHero = ({
  company,
  priceFrom = null,
  isVerified = false,
  onOpenHours,
  onOpenReviews,
}: PublicBookingHeroProps) => {
  const primaryCategory = getPrimaryCategory(company);
  const categoryItems = company.categories?.filter(Boolean) || [];
  const location = getLocationSummary(company);
  const ratingLabel = formatRating(company);
  const todayHours = getTodayBusinessHours(company);
  const priceLabel = formatPriceLabel(priceFrom);
  const mapsHref = getMapsHref(company);
  const whatsappHref = getWhatsappHref(company.whatsapp, company);
  const phoneHref = getPhoneHref(company.phone);
  const bookingHref = company.slug ? `/${company.slug}#section-services` : '#section-services';
  const hasLogo = Boolean(company.logo?.trim());

  const metaItems: MetaChipItem[] = [];

  if (location) {
    metaItems.push({
      id: 'location',
      icon: MapPin,
      label: location,
      href: mapsHref || undefined,
      tone: 'default',
    });
  }

  if (todayHours) {
    metaItems.push({
      id: 'hours',
      icon: Clock3,
      label: `Hoje: ${todayHours}`,
      onClick: onOpenHours,
      tone: 'accent',
    });
  }

  if (ratingLabel) {
    metaItems.push({
      id: 'rating',
      icon: Star,
      label: ratingLabel,
      onClick: onOpenReviews,
      tone: 'default',
    });
  }

  if (priceLabel) {
    metaItems.push({
      id: 'price',
      icon: Wallet,
      label: priceLabel,
      tone: 'muted',
    });
  }

  return (
    <div className="relative overflow-hidden theme-text-primary">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(138deg, var(--color-hero-start) 0%, var(--color-hero-mid) 44%, var(--color-hero-end) 100%)' }} />
      <div className="absolute inset-0 opacity-[0.84]" style={{ background: 'radial-gradient(circle at 12% 14%, var(--color-hero-orb-primary), transparent 27%), radial-gradient(circle at 86% 18%, var(--color-hero-orb-secondary), transparent 24%), radial-gradient(circle at 56% 68%, var(--color-hero-orb-tertiary), transparent 30%), linear-gradient(140deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 24%, rgba(255,255,255,0.012) 48%, rgba(255,255,255,0) 72%)' }} />
      <div className="absolute left-[8%] top-28 h-52 w-52 rounded-full opacity-70 blur-3xl" style={{ background: 'var(--color-hero-orb-primary)' }} />
      <div className="absolute right-[10%] top-24 h-40 w-40 rounded-full opacity-65 blur-3xl" style={{ background: 'var(--color-hero-orb-secondary)' }} />
      <div className="absolute bottom-[18%] left-[36%] h-48 w-48 rounded-full opacity-60 blur-3xl" style={{ background: 'var(--color-hero-orb-tertiary)' }} />
      <div className="absolute inset-0 opacity-[0.22]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 18%, rgba(255,255,255,0) 42%)' }} />
      <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(to right, transparent 0%, transparent calc(100% - 1px), color-mix(in srgb, var(--color-border) 55%, transparent) 100%), linear-gradient(to bottom, transparent 0%, transparent calc(100% - 1px), color-mix(in srgb, var(--color-border) 40%, transparent) 100%)', backgroundSize: '72px 72px' }} />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent via-[color:color-mix(in_srgb,var(--color-background)_22%,transparent)] to-[var(--color-background)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 pb-5 pt-24 sm:px-6 sm:pb-7 sm:pt-28 lg:px-8 lg:pb-9 lg:pt-32">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.28fr)_268px] lg:items-center lg:gap-5">
          <div className="px-1 py-2 sm:px-2 lg:pr-8 lg:pt-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative flex h-[3.9rem] w-[3.9rem] shrink-0 items-center justify-center overflow-hidden rounded-[1rem] border border-[color:color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[color:color-mix(in_srgb,var(--color-surface-elevated)_94%,transparent)] text-base font-semibold shadow-[0_4px_14px_rgba(15,23,42,0.05)] sm:h-[4.4rem] sm:w-[4.4rem] sm:rounded-[1.1rem] dark:shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
                {hasLogo ? (
                  <Image
                    src={company.logo}
                    alt={`Logo de ${company.name}`}
                    fill
                    sizes="70px"
                    className="object-cover"
                  />
                ) : (
                  <span className="theme-text-secondary text-sm font-semibold tracking-[0.08em] sm:text-base">
                    {getInitials(company.name) || 'BZ'}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="theme-text-primary min-w-0 text-[2rem] font-semibold tracking-[-0.045em] sm:text-[2.55rem] lg:text-[3.45rem] lg:leading-[0.98]">
                    {company.name}
                  </h1>
                  {isVerified ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--color-primary)] px-3 py-1 text-[11px] font-semibold text-white">
                      <ShieldCheck size={14} />
                      Verificado
                    </span>
                  ) : null}
                </div>

                <div className="theme-text-muted mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.92rem] sm:mt-2 sm:gap-x-2.5 sm:text-[0.94rem]">
                  {categoryItems.length ? (
                    categoryItems.slice(0, 3).map((category, index) => (
                      <React.Fragment key={category}>
                        {index > 0 ? <span className="theme-text-muted">•</span> : null}
                        <span className="theme-text-secondary font-medium">{category}</span>
                      </React.Fragment>
                    ))
                  ) : (
                    <span className="theme-text-secondary font-medium">{primaryCategory}</span>
                  )}
                </div>
              </div>
            </div>

            <p className="theme-text-primary mt-6 max-w-2xl text-lg font-medium leading-7 sm:mt-7 sm:text-[1.38rem] sm:leading-8">
              Agende seu horario online com praticidade e confirmacao em poucos passos.
            </p>

            <p className="theme-text-secondary mt-2.5 max-w-md text-sm leading-6 sm:mt-3 sm:max-w-lg sm:text-base sm:leading-7">
              Escolha o servico, veja os horarios e finalize com facilidade.
            </p>

              <div className="mt-8 sm:mt-9">
              <EstablishmentMetaChips items={metaItems} />
            </div>

            <div className="mt-7 sm:mt-8">
              <HeroActions bookingHref={bookingHref} whatsappHref={whatsappHref} mapsHref={mapsHref} />
            </div>

            <div className="theme-text-secondary mt-7 grid gap-2.5 text-sm sm:grid-cols-3 sm:gap-x-5 sm:gap-y-2.5">
              <div className="inline-flex items-center gap-2.5 leading-5">
                <CalendarCheck2 size={15} className="theme-text-accent" />
                Confirmacao rapida
              </div>
              <div className="inline-flex items-center gap-2.5 leading-5">
                <Sparkles size={15} className="theme-text-accent" />
                Sem baixar app
              </div>
              <div className="inline-flex items-center gap-2.5 leading-5">
                <ShieldCheck size={15} className="theme-text-accent" />
                Reserva simples
              </div>
            </div>
          </div>

          <aside className="rounded-[1.15rem] border border-[color:color-mix(in_srgb,var(--color-border)_90%,transparent)] bg-[color:color-mix(in_srgb,var(--color-surface-elevated)_96%,transparent)] p-3.5 shadow-[0_8px_20px_rgba(15,23,42,0.045)] sm:p-4 dark:shadow-[0_10px_22px_rgba(0,0,0,0.11)]">
            <p className="theme-text-secondary text-[11px] font-semibold uppercase tracking-[0.22em]">
              Reserva online
            </p>

            <div className="mt-2.5 grid gap-1.5">
              {todayHours ? (
                <button
                  type="button"
                  onClick={onOpenHours}
                  className="theme-surface-muted flex items-center justify-between rounded-[0.9rem] px-3.5 py-2.5 text-left transition hover:border-[var(--color-primary)]"
                >
                  <div>
                    <p className="theme-text-muted text-[11px] uppercase tracking-[0.18em]">Funcionamento hoje</p>
                    <p className="theme-text-primary mt-1 text-sm font-medium">{todayHours}</p>
                  </div>
                  <Clock3 size={17} className="theme-text-accent" />
                </button>
              ) : null}

              {location ? (
                <a
                  href={mapsHref || undefined}
                  target={mapsHref ? '_blank' : undefined}
                  rel={mapsHref ? 'noopener noreferrer' : undefined}
                  className="theme-surface-muted flex items-center justify-between rounded-[0.9rem] px-3.5 py-2.5 transition hover:border-[var(--color-primary)]"
                >
                  <div>
                    <p className="theme-text-muted text-[11px] uppercase tracking-[0.18em]">Localizacao</p>
                    <p className="theme-text-primary mt-1 text-sm font-medium">{location}</p>
                  </div>
                  <MapPin size={17} className="theme-text-accent" />
                </a>
              ) : null}

              {priceLabel ? (
                <div className="theme-surface-muted flex items-center justify-between rounded-[0.9rem] px-3.5 py-2.5">
                  <div>
                    <p className="theme-text-muted text-[11px] uppercase tracking-[0.18em]">Faixa inicial</p>
                    <p className="theme-text-primary mt-1 text-sm font-medium">{priceLabel}</p>
                  </div>
                  <Wallet size={17} className="theme-text-accent" />
                </div>
              ) : null}

              {phoneHref ? (
                <a
                  href={phoneHref}
                  className="theme-surface-muted flex items-center justify-between rounded-[0.9rem] px-3.5 py-2.5 transition hover:border-[var(--color-primary)]"
                >
                  <div>
                    <p className="theme-text-muted text-[11px] uppercase tracking-[0.18em]">Contato</p>
                    <p className="theme-text-primary mt-1 text-sm font-medium">{company.phone}</p>
                  </div>
                  <Phone size={17} className="theme-text-accent" />
                </a>
              ) : null}
            </div>

            <p className="theme-text-secondary mt-2.5 text-xs leading-5">
              Veja os servicos e escolha o melhor horario logo abaixo.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PublicBookingHero;