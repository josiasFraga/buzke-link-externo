import React, { useState, ReactNode } from 'react';
import { Company, Service } from '../types';
import BuzkeAppBanner from './Header/BuzkeAppBanner';
import CompanyHeader from './Header/CompanyHeader';
import BuzkeAppPromotion from './Promotions/BuzkeAppPromotion';
import BusinessHoursModal from './Modals/BusinessHoursModal';
import ReviewsModal from './Modals/ReviewsModal';
import Footer from './Footer/Footer';
import { useNavigate } from 'react-router-dom';

interface CompanyProfileProps {
  company: Company;
  onSelectService: (service: Service) => void;
  children: ReactNode;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({ 
  company, 
  onSelectService,
  children
}) => {
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const navigate = useNavigate();

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Empresa Não Encontrada</h1>
          <p className="text-gray-600 mb-4">A empresa que você está procurando não existe ou foi removida.</p>
          <button 
            onClick={() => navigate('/@mdbeautystudio')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Ir para Página Inicial
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <BuzkeAppBanner />
      <CompanyHeader 
        company={company}
        onOpenHours={() => setIsHoursModalOpen(true)}
        onOpenReviews={() => setIsReviewsModalOpen(true)}
      />
      
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