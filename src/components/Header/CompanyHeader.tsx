import React from 'react';
import { Company } from '../../types';
import PublicBookingHeader from './PublicBookingHeader';
import PublicBookingHero from './PublicBookingHero';

interface CompanyHeaderProps {
  company: Company;
  priceFrom?: number | null;
  isVerified?: boolean;
  onOpenHours: () => void;
  onOpenReviews: () => void;
}

const CompanyHeader = ({ company, priceFrom = null, isVerified = false, onOpenHours, onOpenReviews }: CompanyHeaderProps) => {
  return (
    <section className="theme-hero-shell relative isolate overflow-hidden">
      <PublicBookingHeader />
      <PublicBookingHero
        company={company}
        priceFrom={priceFrom}
        isVerified={isVerified}
        onOpenHours={onOpenHours}
        onOpenReviews={onOpenReviews}
      />
    </section>
  );
};

export default CompanyHeader;