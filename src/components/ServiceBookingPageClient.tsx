'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { AppointmentSlots, Company, Service, TimeSlot } from '../types';
import { useCompanyStore } from '../store/companyStore';
import { buildPublicApiUrl } from '../lib/public-api';
import BookingFlow from './BookingFlow';
import CompanyProfile from './CompanyProfile';
import PublicBookingHeader from './Header/PublicBookingHeader';
import LoadingScreen from './LoadingScreen';

interface ServiceBookingPageClientProps {
  company: Company;
  service: Service;
  initialSelectedDate?: string | null;
}

function ServiceBookingPageClient({ company, service, initialSelectedDate }: ServiceBookingPageClientProps) {
  const { setCompany, clearCompany } = useCompanyStore();
  const bookingFlowSectionRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(initialSelectedDate ?? null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedTimeSlotData, setSelectedTimeSlotData] = useState<TimeSlot | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentSlots | null>(null);

  const priceFrom = useMemo(() => {
    if (!service.price || service.price <= 0) {
      return null;
    }

    return service.price;
  }, [service.price]);

  const locationLabel = useMemo(() => {
    if (!company.address?.city) {
      return null;
    }

    return company.address.state
      ? `${company.address.city} - ${company.address.state}`
      : company.address.city;
  }, [company.address]);

  useEffect(() => {
    setCompany(company);

    return () => {
      clearCompany();
    };
  }, [clearCompany, company, setCompany]);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const [year, month, day] = selectedDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    const serviceIdentifier = service.slug || service.id;

    fetch(buildPublicApiUrl(`/services/data-to-appointment?servico_id=${encodeURIComponent(serviceIdentifier)}&data=${formattedDate}`))
      .then((response) => response.json())
      .then((data: AppointmentSlots) => {
        setTimeSlots(data.horarios || []);
        setAppointmentData(data);
      })
      .catch((error) => {
        console.error('Error fetching time slots:', error);
        setTimeSlots([]);
        setAppointmentData(null);
      });
  }, [selectedDate, service.id, service.slug]);

  useEffect(() => {
    const target = document.getElementById('booking-steps-scroll-anchor') || bookingFlowSectionRef.current;

    if (!target) {
      return;
    }

    const scrollToBookingFlow = () => {
      const top = target.getBoundingClientRect().top + window.scrollY - 56;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    };

    const timeoutId = window.setTimeout(() => {
      requestAnimationFrame(scrollToBookingFlow);
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [service.id]);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setTimeSlots([]);
    setSelectedTimeSlot(null);
    setSelectedTimeSlotData(null);
    setAppointmentData(null);
  };

  const handleSelectTimeSlot = (timeSlotId: string) => {
    setSelectedTimeSlot(timeSlotId);
    const timeSlotData = timeSlots.find((slot) => slot.time === timeSlotId);
    setSelectedTimeSlotData(timeSlotData || null);
  };

  if (!company) {
    return <LoadingScreen />;
  }

  return (
    <div className="theme-page min-h-screen">
      <CompanyProfile company={company} priceFrom={priceFrom} showHeader={false}>
        <section className="relative overflow-hidden theme-text-primary">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(138deg, var(--color-hero-start) 0%, var(--color-hero-mid) 44%, var(--color-hero-end) 100%)' }} />
          <div className="absolute inset-0 opacity-[0.84]" style={{ background: 'radial-gradient(circle at 12% 14%, var(--color-hero-orb-primary), transparent 27%), radial-gradient(circle at 86% 18%, var(--color-hero-orb-secondary), transparent 24%), radial-gradient(circle at 56% 68%, var(--color-hero-orb-tertiary), transparent 30%), linear-gradient(140deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 24%, rgba(255,255,255,0.012) 48%, rgba(255,255,255,0) 72%)' }} />
          <div className="absolute left-[8%] top-28 h-52 w-52 rounded-full opacity-70 blur-3xl" style={{ background: 'var(--color-hero-orb-primary)' }} />
          <div className="absolute right-[10%] top-24 h-40 w-40 rounded-full opacity-65 blur-3xl" style={{ background: 'var(--color-hero-orb-secondary)' }} />
          <div className="absolute bottom-[18%] left-[36%] h-48 w-48 rounded-full opacity-60 blur-3xl" style={{ background: 'var(--color-hero-orb-tertiary)' }} />
          <div className="absolute inset-0 opacity-[0.22]" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 18%, rgba(255,255,255,0) 42%)' }} />
          <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(to right, transparent 0%, transparent calc(100% - 1px), color-mix(in srgb, var(--color-border) 55%, transparent) 100%), linear-gradient(to bottom, transparent 0%, transparent calc(100% - 1px), color-mix(in srgb, var(--color-border) 40%, transparent) 100%)', backgroundSize: '72px 72px' }} />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent via-[color:color-mix(in_srgb,var(--color-background)_22%,transparent)] to-[var(--color-background)]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />

          <PublicBookingHeader fixed />

          <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-[5.25rem] sm:px-6 sm:pb-10 sm:pt-[6.25rem] lg:px-8 lg:pb-12 lg:pt-[7rem]">
            <div className="max-w-5xl">
              <nav aria-label="Breadcrumb" className="overflow-x-auto">
                <ol className="theme-text-secondary flex min-w-max items-center gap-2 text-sm">
                  <li>
                    <Link
                      href="/"
                      className="rounded-full border border-transparent px-3 py-1.5 transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-surface)_56%,transparent)] hover:text-[var(--color-text-primary)]"
                    >
                      Inicio
                    </Link>
                  </li>
                  <li aria-hidden="true" className="theme-text-muted">
                    <ChevronRight size={14} />
                  </li>
                  <li>
                    <Link
                      href={`/${company.slug || company.id}`}
                      className="rounded-full border border-transparent px-3 py-1.5 transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-surface)_56%,transparent)] hover:text-[var(--color-text-primary)]"
                    >
                      {company.name}
                    </Link>
                  </li>
                  <li aria-hidden="true" className="theme-text-muted">
                    <ChevronRight size={14} />
                  </li>
                  <li
                    className="rounded-full bg-[color:color-mix(in_srgb,var(--color-surface)_62%,transparent)] px-3 py-1.5 font-medium text-[var(--color-text-primary)]"
                    aria-current="page"
                  >
                    {service.name}
                  </li>
                </ol>
              </nav>

              <div className="mt-6 flex flex-col gap-4 sm:mt-7 sm:flex-row sm:items-start sm:gap-5">
                {service.images?.[0] ? (
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-[color:color-mix(in_srgb,var(--color-border)_70%,transparent)] bg-[color:color-mix(in_srgb,var(--color-surface)_40%,transparent)] shadow-[0_10px_24px_rgba(15,23,42,0.12)] sm:h-32 sm:w-32">
                    <Image
                      src={service.images[0]}
                      alt={service.name}
                      fill
                      sizes="(max-width: 640px) 112px, 128px"
                      className="object-cover"
                    />
                  </div>
                ) : null}

                <div className="min-w-0 flex-1">
                  <h1 className="theme-text-primary max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
                    {service.name}
                  </h1>
                  {service.description ? (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:color-mix(in_srgb,var(--color-text-primary)_88%,transparent)] sm:text-base">
                      {service.description}
                    </p>
                  ) : null}
                  <p className="theme-text-secondary mt-3 max-w-2xl text-sm leading-6 sm:text-base">
                    Escolha a data, horario e conclua o agendamento na propria pagina do servico.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={bookingFlowSectionRef} className="theme-page relative z-10 -mt-6 px-4 pb-10 sm:-mt-8 sm:px-6 sm:pb-12 lg:px-8 lg:pb-14">
          <div className="mx-auto w-full max-w-7xl">
            <BookingFlow
              key={service.id}
              selectedService={service}
              selectedDate={selectedDate}
              selectedTimeSlot={selectedTimeSlot}
              selectedTimeSlotData={selectedTimeSlotData}
              timeSlots={timeSlots}
              onSelectDate={handleSelectDate}
              onSelectTimeSlot={handleSelectTimeSlot}
              appointmentData={appointmentData}
              showServiceSummary={false}
              stickySteps
              showSelectionSidebar
            />

            <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.9fr)]">
              <article className="theme-card p-6 sm:p-7">
                <h2 className="theme-text-primary text-2xl font-bold">Sobre {service.name}</h2>
                <p className="theme-text-secondary mt-3 leading-7">
                  {service.description || `${service.name} esta disponivel para agendamento online em ${company.name}. Escolha a data, confira os horarios livres e conclua a reserva em poucos passos.`}
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="theme-surface-muted p-4">
                    <h3 className="theme-text-primary text-sm font-semibold uppercase tracking-[0.12em]">Duracao</h3>
                    <p className="theme-text-secondary mt-2 text-base font-medium">{service.duration || 'Consulte a empresa'}</p>
                  </div>
                  <div className="theme-surface-muted p-4">
                    <h3 className="theme-text-primary text-sm font-semibold uppercase tracking-[0.12em]">Valor inicial</h3>
                    <p className="theme-text-secondary mt-2 text-base font-medium">
                      {service.price > 0 ? `R$ ${service.price}` : 'Consulte valores'}
                    </p>
                  </div>
                </div>
              </article>

              <aside className="theme-card p-6 sm:p-7">
                <h2 className="theme-text-primary text-xl font-bold">Informacoes da empresa</h2>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="theme-text-muted text-sm font-semibold uppercase tracking-[0.12em]">Empresa</dt>
                    <dd className="theme-text-secondary mt-1">{company.name}</dd>
                  </div>
                  {company.categories?.length ? (
                    <div>
                      <dt className="theme-text-muted text-sm font-semibold uppercase tracking-[0.12em]">Especialidades</dt>
                      <dd className="theme-text-secondary mt-1">{company.categories.slice(0, 4).join(', ')}</dd>
                    </div>
                  ) : null}
                  {locationLabel ? (
                    <div>
                      <dt className="theme-text-muted text-sm font-semibold uppercase tracking-[0.12em]">Localizacao</dt>
                      <dd className="theme-text-secondary mt-1">{locationLabel}</dd>
                    </div>
                  ) : null}
                  {company.businessHours?.length ? (
                    <div>
                      <dt className="theme-text-muted text-sm font-semibold uppercase tracking-[0.12em]">Horario de atendimento</dt>
                      <dd className="theme-text-secondary mt-1">{company.businessHours[0].day}: {company.businessHours[0].hours}</dd>
                    </div>
                  ) : null}
                </dl>
              </aside>
            </section>
          </div>
        </section>
      </CompanyProfile>
    </div>
  );
}

export default ServiceBookingPageClient;