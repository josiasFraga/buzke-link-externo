import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Service } from '../types';
import { Clock, ArrowRight, Star, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onSelect: () => void;
  href?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect, href }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideInterval = useRef<number | null>(null);

  const handleCardClick = () => {
    if (href) {
      return;
    }

    onSelect();
  };
  
  // Start slideshow
  useEffect(() => {
    if (service.images && service.images.length > 1) {
      slideInterval.current = window.setInterval(() => {
        setCurrentImageIndex(prev => 
          prev === service.images!.length - 1 ? 0 : prev + 1
        );
      }, 5000); // Change image every 5 seconds
    }
    
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, [service.images]);
  
  // Handle next image
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (service.images) {
      setCurrentImageIndex(prev => 
        prev === service.images!.length - 1 ? 0 : prev + 1
      );
    }
  };
  
  // Handle previous image
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (service.images) {
      setCurrentImageIndex(prev => 
        prev === 0 ? service.images!.length - 1 : prev - 1
      );
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsFullscreen(!isFullscreen);
  };
  
  // Render star rating
  const renderRating = () => {
    if (!service.rating) return null;
    
    return (
      <div className="flex items-center">
        <div className="flex items-center mr-1">
          {[1, 2, 3, 4, 5].map(star => (
            <Star 
              key={star} 
              size={14} 
              className={`${star <= Math.round(service.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--color-border-strong)]'}`} 
            />
          ))}
        </div>
        <span className="theme-text-secondary text-sm">
          ({service.reviewCount})
        </span>
      </div>
    );
  };

  const imageContent = (
    <div className="relative h-48 overflow-hidden">
      <img 
        src={service.images?.[currentImageIndex]} 
        alt={service.name} 
        className="w-full h-full object-cover transition-transform duration-500"
      />
      
      {service.images && service.images.length > 1 && (
        <>
          <button 
            type="button"
            onClick={handlePrevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1 text-white transition-colors hover:bg-black/75"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            type="button"
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1 text-white transition-colors hover:bg-black/75"
          >
            <ChevronRight size={20} />
          </button>
          <button 
            type="button"
            onClick={toggleFullscreen}
            className="absolute right-2 top-2 rounded-full bg-black/55 p-1 text-white transition-colors hover:bg-black/75"
          >
            <Maximize2 size={16} />
          </button>

          <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
            {service.images.map((_, index) => (
              <div 
                key={index} 
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
  
  return (
    <>
      <div 
        className="theme-card cursor-pointer overflow-hidden rounded-[var(--radius-button)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        onClick={handleCardClick}
      >
        {/* Image Slideshow */}
        {service.images && (href ? (
          <Link href={href} onClick={(event) => event.stopPropagation()} className="block">
            {imageContent}
          </Link>
        ) : imageContent)}
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="theme-text-primary text-xl font-bold">
              {href ? (
                <Link href={href} onClick={(event) => event.stopPropagation()} className="hover:underline">
                  {service.name}
                </Link>
              ) : (
                service.name
              )}
            </h3>
            {renderRating()}
          </div>
          
          <p className="theme-text-secondary mb-6 min-h-[60px]">{service.description}</p>
          
          <div className="flex items-center justify-between text-sm mb-4">
            <div className="theme-panel-accent flex items-center rounded-full px-3 py-1">
              <Clock size={16} className="mr-1" />
              <span className="font-medium">{service.duration}</span>
            </div>
            <div className="theme-text-primary text-lg font-bold">
              R$ {service.price}
            </div>
          </div>
        </div>
        <div className="theme-gradient-accent flex items-center justify-between px-4 py-3 text-white">
          {href ? (
            <Link href={href} onClick={(event) => event.stopPropagation()} className="flex flex-1 items-center justify-between gap-3 font-medium">
              <span>Agendar Agora</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <span className="font-medium">Agendar Agora</span>
              <ArrowRight size={18} />
            </>
          )}
        </div>
      </div>
      
      {/* Fullscreen Image Modal */}
      {isFullscreen && service.images && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={toggleFullscreen}
        >
          <div className="relative w-full max-w-5xl">
            <img 
              src={service.images[currentImageIndex]} 
              alt={service.name} 
              className="w-full h-auto max-h-[90vh] object-contain"
            />
            
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen(e);
              }}
              className="absolute right-4 top-4 rounded-full bg-white/25 p-2 text-white transition-colors hover:bg-white/50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage(e);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/25 p-3 text-white transition-colors hover:bg-white/50"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage(e);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/25 p-3 text-white transition-colors hover:bg-white/50"
            >
              <ChevronRight size={24} />
            </button>
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {service.images.map((_, index) => (
                <div 
                  key={index} 
                  className={`w-3 h-3 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceCard;