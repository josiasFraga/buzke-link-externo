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
  getServiceHref?: (service: Service) => string;
  isLoading: boolean;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

const ServicesSection = ({ 
  services, 
  onSelectService, 
  getServiceHref,
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
      <div className="theme-page container mx-auto px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="mb-4 h-8 w-1/4 rounded bg-[var(--color-surface-secondary)]"></div>
            <div className="mb-8 h-4 w-2/4 rounded bg-[var(--color-surface-secondary)]"></div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="theme-card p-4">
                  <div className="mb-4 h-48 rounded-lg bg-[var(--color-surface-secondary)]"></div>
                  <div className="mb-2 h-6 w-3/4 rounded bg-[var(--color-surface-secondary)]"></div>
                  <div className="mb-4 h-4 w-1/2 rounded bg-[var(--color-surface-secondary)]"></div>
                  <div className="h-10 rounded bg-[var(--color-surface-secondary)]"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page container mx-auto px-4 py-12" id="section-services">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="theme-text-primary mb-2 text-3xl font-bold">Nossos Serviços</h2>
            <p className="theme-text-secondary text-lg">Selecione um serviço para agendar um horário</p>
          </div>
          <div className="relative mt-4 md:mt-0">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="theme-secondary-btn rounded-full px-4 py-2"
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
              <div className="theme-card absolute right-0 z-10 mt-2 w-72 p-4">
                <h3 className="theme-text-primary mb-3 text-lg font-semibold">Selecione a Data</h3>
                <div className="grid grid-cols-2 gap-2">
                  {dates.map((date) => (
                    <button
                      key={date.format('YYYY-MM-DD')}
                      onClick={() => handleDateSelect(date)}
                      className={`
                        rounded-lg px-3 py-2 text-center transition-colors
                        ${isToday(date) ? 'theme-panel-accent theme-text-accent font-medium' : 'theme-surface-muted theme-text-secondary'}
                        ${selectedDate === formatDateYYYYMMDD(date) ? 'border-[var(--color-primary)]' : ''}
                      `}
                    >
                      <div className="text-sm font-medium">
                        {isToday(date) ? 'Hoje' : formatDate(date, 'short')}
                      </div>
                      <div className="theme-text-muted text-xs">
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
          <div className="theme-panel-warning p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--color-warning-text)_20%,transparent)]">
              <Calendar size={24} className="theme-text-warning" />
            </div>
            <h3 className="theme-text-primary mb-2 text-xl font-bold">Nenhum Serviço Disponível</h3>
            <p className="theme-text-secondary mb-4">Não há serviços disponíveis na data selecionada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map(service => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                href={getServiceHref?.(service)}
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