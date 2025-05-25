import React, { useState, useEffect, useRef } from 'react';
import { Service } from '../types';
import { Clock, DollarSign, ArrowRight, Star, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onSelect: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideInterval = useRef<number | null>(null);
  
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
    if (service.images) {
      setCurrentImageIndex(prev => 
        prev === service.images!.length - 1 ? 0 : prev + 1
      );
    }
  };
  
  // Handle previous image
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (service.images) {
      setCurrentImageIndex(prev => 
        prev === 0 ? service.images!.length - 1 : prev - 1
      );
    }
  };
  
  // Toggle fullscreen
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
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
              className={`${star <= Math.round(service.rating!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          ({service.reviewCount})
        </span>
      </div>
    );
  };
  
  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100"
        onClick={onSelect}
      >
        {/* Image Slideshow */}
        {service.images && (
          <div className="relative h-48 overflow-hidden">
            <img 
              src={service.images[currentImageIndex]} 
              alt={service.name} 
              className="w-full h-full object-cover transition-transform duration-500"
            />
            
            {/* Image Navigation */}
            {service.images.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
                <button 
                  onClick={toggleFullscreen}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-colors"
                >
                  <Maximize2 size={16} />
                </button>
                
                {/* Image Indicators */}
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
        )}
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-800">{service.name}</h3>
            {renderRating()}
          </div>
          
          <p className="text-gray-600 mb-6 min-h-[60px]">{service.description}</p>
          
          <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
              <Clock size={16} className="mr-1" />
              <span className="font-medium">{service.duration}</span>
            </div>
            <div className="font-bold text-lg text-gray-800">
              R$ {service.price}
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-4 flex justify-between items-center">
          <span className="font-medium">Agendar Agora</span>
          <ArrowRight size={18} />
        </div>
      </div>
      
      {/* Fullscreen Image Modal */}
      {isFullscreen && service.images && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={toggleFullscreen}
        >
          <div className="relative w-full max-w-5xl">
            <img 
              src={service.images[currentImageIndex]} 
              alt={service.name} 
              className="w-full h-auto max-h-[90vh] object-contain"
            />
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen(e);
              }}
              className="absolute top-4 right-4 bg-white bg-opacity-25 text-white p-2 rounded-full hover:bg-opacity-50 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage(e);
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-25 text-white p-3 rounded-full hover:bg-opacity-50 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage(e);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-25 text-white p-3 rounded-full hover:bg-opacity-50 transition-colors"
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