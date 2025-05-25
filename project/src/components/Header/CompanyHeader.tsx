import React from 'react';
import { MapPin, Clock, Star, Phone } from 'lucide-react';
import { Company } from '../../types';

interface CompanyHeaderProps {
  company: Company;
  onOpenHours: () => void;
  onOpenReviews: () => void;
}

const CompanyHeader = ({ company, onOpenHours, onOpenReviews }: CompanyHeaderProps) => {
  const openGoogleMaps = () => {
    const address = `${company.address?.street}, ${company.address?.number} - ${company.address?.neighborhood}, ${company.address?.city} - ${company.address?.state}`;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const callCompany = () => {
    window.open(`tel:+${company.phone}`, '_blank');
  };

  const getCurrentBusinessHours = () => {
    const today = new Date().getDay();
    const currentHours = company.businessHours?.[today];
    return currentHours ? currentHours.hours : 'Fechado';
  };

  const renderRatingButton = () => {
    if (company.media_avaliacoes === null) {
      return (
        <button 
          onClick={onOpenReviews}
          className="flex items-center bg-white/10 backdrop-blur-sm hover:bg-white/20 px-4 py-2 rounded-full transition-colors text-white"
        >
          <Star size={18} className="mr-2" />
          <span>Sem avaliações</span>
        </button>
      );
    }

    return (
      <button 
        onClick={onOpenReviews}
        className="flex items-center bg-white/10 backdrop-blur-sm hover:bg-white/20 px-4 py-2 rounded-full transition-colors text-white"
      >
        <Star size={18} className="mr-2" />
        <span>{company.media_avaliacoes} ({company.total_avaliacoes} avaliações)</span>
      </button>
    );
  };

  return (
    <div className="w-full h-96 relative overflow-hidden">
      <img 
        src={company.coverPhoto} 
        alt={`${company.name} cover`} 
        className="w-full h-full object-cover transform scale-105 hover:scale-100 transition-transform duration-10000"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 5}s`
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <div className="flex flex-col md:flex-row md:items-end gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 p-1">
                <img 
                  src={company.logo} 
                  alt={company.name} 
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 rounded-xl border-4 border-white opacity-0 hover:opacity-20 bg-white transition-opacity duration-300"></div>
              </div>
              <div className="absolute -top-3 -right-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                Destaque da Semana
              </div>
            </div>
            
            <div className="text-white flex-1">
              <div className="flex flex-col mb-4">
                <h1 className="text-5xl font-bold text-shadow-lg mb-2 flex items-center gap-3">
                  {company.name}
                  <div className="bg-indigo-600 text-white text-sm font-bold px-2 py-1 rounded-full shadow-md flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verificado
                  </div>
                </h1>
                <p className="text-white/90 text-lg font-medium">
                  {company.categories?.join(', ')}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <button 
                  onClick={openGoogleMaps}
                  className="flex items-center bg-white/10 backdrop-blur-sm hover:bg-white/20 px-4 py-2 rounded-full transition-colors text-white"
                >
                  <MapPin size={18} className="mr-2" />
                  <span>{company.address?.city}, {company.address?.state}</span>
                </button>
                
                <button 
                  onClick={onOpenHours}
                  className="flex items-center bg-white/10 backdrop-blur-sm hover:bg-white/20 px-4 py-2 rounded-full transition-colors text-white"
                >
                  <Clock size={18} className="mr-2" />
                  <span>Aberto {getCurrentBusinessHours()}</span>
                </button>
                
                {renderRatingButton()}
                
                <button 
                  onClick={callCompany}
                  className="flex items-center bg-white/10 backdrop-blur-sm hover:bg-white/20 px-4 py-2 rounded-full transition-colors text-white"
                >
                  <Phone size={18} className="mr-2" />
                  <span>{company.phone}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyHeader;