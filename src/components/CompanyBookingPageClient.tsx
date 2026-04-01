'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Company, Service } from '../types';
import CompanyProfile from './CompanyProfile';
import ServicesList from './Services/ServicesList';
import LoadingScreen from './LoadingScreen';
import { useCompanyStore } from '../store/companyStore';

interface CompanyBookingPageClientProps {
  company: Company;
  initialServices: Service[];
  initialSelectedDate: string;
}

function CompanyBookingPageClient({ company, initialServices, initialSelectedDate }: CompanyBookingPageClientProps) {
  const router = useRouter();
  const { setCompany, clearCompany } = useCompanyStore();
  const priceFrom = initialServices.reduce<number | null>((lowestPrice, service) => {
    if (!service.price || service.price <= 0) {
      return lowestPrice;
    }

    if (lowestPrice === null) {
      return service.price;
    }

    return Math.min(lowestPrice, service.price);
  }, null);

  useEffect(() => {
    setCompany(company);

    return () => {
      clearCompany();
    };
  }, [clearCompany, company, setCompany]);

  const handleSelectService = (service: Service) => {
    router.push(`/${company.slug || company.id}/${service.slug || service.id}`);
  };

  const getServiceHref = (service: Service) => `/${company.slug || company.id}/${service.slug || service.id}`;

  if (!company) {
    return <LoadingScreen />;
  }

  return (
    <div className="theme-page min-h-screen">
      <CompanyProfile company={company} priceFrom={priceFrom}>
        <ServicesList
          companyId={company.id}
          onSelectService={handleSelectService}
          getServiceHref={getServiceHref}
          initialServices={initialServices}
          initialSelectedDate={initialSelectedDate}
        />
      </CompanyProfile>
    </div>
  );
}

export default CompanyBookingPageClient;
