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
          className="flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-white/20 px-3 py-2 rounded-full transition-colors text-white text-sm"
        >
          <Star size={16} className="mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Sem avaliações</span>
          <span className="sm:hidden">0</span>
        </button>
      );
    }

    return (
      <button 
        onClick={onOpenReviews}
        className="flex items-center justify-center bg-white/10 backdrop-blur-sm hover:bg-white/20 px-3 py-2 rounded-full transition-colors text-white text-sm"
      >
        <Star size={16} className="mr-1 sm:mr-2" />
        <span className="hidden sm:inline">{company.media_avaliacoes} ({company.total_avaliacoes} avaliações)</span>
        <span className="sm:hidden">{company.media_avaliacoes}</span>
      </button>
    );
  };

  return (
    <div className="w-full min-h-[100vh] sm:min-h-0 sm:h-96 relative overflow-hidden">
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${company.coverPhoto})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80">
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
        
        <div className="container mx-auto px-4 h-full flex flex-col justify-center sm:justify-end pb-8 sm:pb-12 relative z-10">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-6 sm:gap-8">
            <div className="relative">
              <div className="w-36 h-36 sm:w-32 sm:h-32 md:w-26 md:h-26 lg:w-26 lg:h-26 rounded-xl border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 p-1">
                <img 
                  src={company.logo} 
                  alt={company.name} 
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 rounded-xl border-4 border-white opacity-0 hover:opacity-20 bg-white transition-opacity duration-300"></div>
              </div>
              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                <span className="hidden sm:inline">Destaque da Semana</span>
                <span className="sm:hidden">★</span>
              </div>
            </div>
            
            <div className="text-white flex-1 max-w-full">
              <div className="flex flex-col mb-4 sm:mb-6">
                <h1 className="text-3xl sm:text-5xl font-bold text-shadow-lg mb-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <span>{company.name}</span>
                  <div className="bg-indigo-600 text-white text-xs sm:text-sm font-bold px-2 py-1 rounded-full shadow-md flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verificado
                  </div>
                </h1>
                <p className="text-white/90 text-base sm:text-lg font-medium px-4 sm:px-0">
                  {company.categories?.join(', ')}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mt-4 px-2 sm:px-0">
                <button 
                  onClick={openGoogleMaps}
                  className="flex items-center justify-center sm:justify-start bg-white/10 backdrop-blur-sm hover:bg-white/20 px-3 py-2 rounded-full transition-colors text-white text-sm"
                >
                  <MapPin size={16} className="mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="truncate">{company.address?.city}, {company.address?.state}</span>
                </button>
                
                <button 
                  onClick={onOpenHours}
                  className="flex items-center justify-center sm:justify-start bg-white/10 backdrop-blur-sm hover:bg-white/20 px-3 py-2 rounded-full transition-colors text-white text-sm"
                >
                  <Clock size={16} className="mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Aberto {getCurrentBusinessHours()}</span>
                  <span className="sm:hidden">Horários</span>
                </button>
                
                {renderRatingButton()}
                
                <button 
                  onClick={callCompany}
                  className="flex items-center justify-center sm:justify-start bg-white/10 backdrop-blur-sm hover:bg-white/20 px-3 py-2 rounded-full transition-colors text-white text-sm"
                >
                  <Phone size={16} className="mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">{company.phone}</span>
                  <span className="sm:hidden">Ligar</span>
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