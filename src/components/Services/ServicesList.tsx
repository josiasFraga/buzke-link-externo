import React, { useState, useEffect } from 'react';
import { Service } from '../../types';
import ServicesSection from './ServicesSection';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

interface ServicesListProps {
  companyId: string;
  onSelectService: (service: Service) => void;
}

const ServicesList: React.FC<ServicesListProps> = ({ companyId, onSelectService }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return moment().format('YYYY-MM-DD');
  });
  const [realCompanyId, setRealCompanyId] = useState<string | null>(null);

  const formatDuration = (duration: string): string => {
    const [hours, minutes] = duration.split(':').map(Number);
    
    if (hours === 0) {
      return `${minutes}min`;
    }
    
    if (minutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${minutes}min`;
  };

  const fetchServices = async (date: string, id: string) => {
    setIsLoading(true);
    const formattedDate = moment(date).format('DD/MM/YYYY');
    
    const url = `${import.meta.env.VITE_API_URL}/services/index?data=${formattedDate}&limit=50&offset=0&cliente_id=${id}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const transformedServices: Service[] = data.map(service => ({
        id: service.id.toString(),
        companyId: id,
        name: service.nome,
        description: service.descricao,
        duration: formatDuration(service.horarios_atendimento[0].duracao),
        price: service.horarios_atendimento[0].valor_padrao,
        images: service.fotos.map(foto => foto.imagem),
        rating: service.media_avaliacoes,
        reviewCount: 0,
        tipo: service.tipo
      }));
      
      setServices(transformedServices);
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        setIsLoading(true);
        // Check if companyId is a number
        if (isNaN(Number(companyId))) {
          // If it's not a number, assume it's a username and fetch by username
          const response = await fetch(`${import.meta.env.VITE_API_URL}/business/${companyId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch company details');
          }
          const data = await response.json();
          const id = data.id.toString();
          setRealCompanyId(id);
          // Fetch services after getting the real company ID
          await fetchServices(selectedDate, id);
        } else {
          // If it's already a number, use it directly
          setRealCompanyId(companyId);
          await fetchServices(selectedDate, companyId);
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
        setIsLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [companyId, selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <ServicesSection
      services={services}
      onSelectService={onSelectService}
      isLoading={isLoading}
      selectedDate={selectedDate}
      onDateChange={handleDateChange}
    />
  );
};

export default ServicesList;