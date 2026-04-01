'use client';

import React, { useState, ReactNode } from 'react';
import { Company } from '../types';
import CompanyHeader from './Header/CompanyHeader';
import BuzkeAppPromotion from './Promotions/BuzkeAppPromotion';
import BusinessHoursModal from './Modals/BusinessHoursModal';
import ReviewsModal from './Modals/ReviewsModal';
import Footer from './Footer/Footer';

interface CompanyProfileProps {
  company: Company;
  children: ReactNode;
  priceFrom?: number | null;
  showHeader?: boolean;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({ 
  company, 
  children,
  priceFrom = null,
  showHeader = true,
}) => {
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

  if (!company) {
    return (
      <div className="theme-page flex min-h-screen items-center justify-center">
        <div className="theme-card max-w-md p-8 text-center">
          <div className="theme-panel-error mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <svg className="theme-text-danger h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="theme-text-primary mb-2 text-2xl font-bold">Empresa Não Encontrada</h1>
          <p className="theme-text-secondary mb-4">A empresa que você está procurando não existe ou foi removida.</p>
          <a
            href="/"
            className="theme-primary-btn px-4 py-2"
          >
            Ir para Página Inicial
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="theme-page min-h-screen">
      {showHeader ? (
        <CompanyHeader 
          company={company}
          priceFrom={priceFrom}
          onOpenHours={() => setIsHoursModalOpen(true)}
          onOpenReviews={() => setIsReviewsModalOpen(true)}
        />
      ) : null}
      
      {children}
      
      <BuzkeAppPromotion />
      <Footer />

      <BusinessHoursModal 
        isOpen={isHoursModalOpen}
        onClose={() => setIsHoursModalOpen(false)}
        businessHours={company.businessHours || []}
      />

      <ReviewsModal 
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        company={company}
      />
    </div>
  );
};

export default CompanyProfile;