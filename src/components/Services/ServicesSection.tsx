import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Service } from '../../types';
import ServiceCard from '../ServiceCard';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

interface ServicesSectionProps {
  services: Service[];
  onSelectService: (service: Service) => void;
  isLoading: boolean;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const ServicesSection = ({ 
  services, 
  onSelectService, 
  isLoading,
  selectedDate,
  onDateChange
}: ServicesSectionProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const generateDates = () => {
    const dates = [];
    const today = moment().startOf('day');
    
    for (let i = 0; i < 14; i++) {
      dates.push(moment(today).add(i, 'days'));
    }
    
    return dates;
  };

  const dates = generateDates();

  const formatDate = (date: moment.Moment, format: 'short' | 'long' = 'short') => {
    if (format === 'short') {
      return date.format('D [de] MMM').toLowerCase();
    }
    return date.format('dddd, D [de] MMMM').toLowerCase();
  };

  const isToday = (date: moment.Moment) => {
    return date.isSame(moment().startOf('day'), 'day');
  };

  const formatDateYYYYMMDD = (date: moment.Moment) => {
    return date.format('YYYY-MM-DD');
  };

  const handleDateSelect = (date: moment.Moment) => {
    const formattedDate = formatDateYYYYMMDD(date);
    onDateChange(formattedDate);
    setIsDatePickerOpen(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/4 mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Nossos Serviços</h2>
            <p className="text-gray-600 text-lg">Selecione um serviço para agendar um horário</p>
          </div>
          <div className="mt-4 md:mt-0 relative">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors"
            >
              <Calendar size={16} className="mr-2" />
              <span className="font-medium">
                {selectedDate 
                  ? `Disponível em ${formatDate(moment(selectedDate), 'short')}` 
                  : 'Disponível Hoje'}
              </span>
              <ChevronDown size={16} className="ml-2" />
            </button>
            
            {isDatePickerOpen && (
              <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl z-10 w-72 p-4 border border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Selecione a Data</h3>
                <div className="grid grid-cols-2 gap-2">
                  {dates.map((date) => (
                    <button
                      key={date.format('YYYY-MM-DD')}
                      onClick={() => handleDateSelect(date)}
                      className={`
                        py-2 px-3 rounded-lg text-center transition-colors
                        ${isToday(date) ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-gray-50 hover:bg-gray-100'}
                        ${selectedDate === formatDateYYYYMMDD(date) ? 'ring-2 ring-indigo-500' : ''}
                      `}
                    >
                      <div className="text-sm font-medium">
                        {isToday(date) ? 'Hoje' : formatDate(date, 'short')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {date.format('ddd').toLowerCase()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {services.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Calendar size={24} className="text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhum Serviço Disponível</h3>
            <p className="text-gray-600 mb-4">Não há serviços disponíveis na data selecionada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                onSelect={() => onSelectService(service)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesSection;