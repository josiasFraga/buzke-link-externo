import React, { useState, useEffect, useCallback } from 'react';
import { Service } from '../../types';
import ServicesSection from './ServicesSection';
import moment from 'moment';
import 'moment/locale/pt-br';
import { buildPublicApiUrl } from '../../lib/public-api';
import {
  mergeServicesWithSlugEntries,
  parseServiceSlugEntries,
  slugifyServiceName,
} from '../../lib/service-slugs';

moment.locale('pt-br');

interface ServicesListProps {
  companyId: string;
  onSelectService: (service: Service) => void;
  getServiceHref?: (service: Service) => string;
  initialServices?: Service[];
  initialSelectedDate?: string | null;
}

interface RawServicePhoto {
  imagem: string;
}

interface RawServiceSchedule {
  duracao: string;
  valor_padrao: number;
}

interface RawService {
  id: number;
  slug?: string;
  nome: string;
  descricao: string;
  horarios_atendimento: RawServiceSchedule[];
  fotos: RawServicePhoto[];
  media_avaliacoes?: number;
  tipo?: string;
}

const ServicesList: React.FC<ServicesListProps> = ({
  companyId,
  onSelectService,
  getServiceHref,
  initialServices = [],
  initialSelectedDate,
}) => {
  const [services, setServices] = useState<Service[]>(() => (initialSelectedDate ? initialServices : []));
  const [isLoading, setIsLoading] = useState(Boolean(initialSelectedDate && initialServices.length === 0));
  const [selectedDate, setSelectedDate] = useState<string | null>(initialSelectedDate || null);
  const [hasConsumedInitialData, setHasConsumedInitialData] = useState(Boolean(initialSelectedDate && initialServices.length > 0));

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

  const fetchServices = useCallback(async (date: string, id: string) => {
    setIsLoading(true);
    const formattedDate = moment(date).format('DD/MM/YYYY');

    const servicesUrl = buildPublicApiUrl(`/services/index?data=${formattedDate}&limit=50&offset=0&cliente_id=${id}`);
    const slugsUrl = buildPublicApiUrl(`/services/slugs?cliente_id=${id}`);

    try {
      const [servicesResponse, slugsResponse] = await Promise.all([
        fetch(servicesUrl),
        fetch(slugsUrl).catch(() => null),
      ]);

      const data: RawService[] = await servicesResponse.json();
      const slugPayload = slugsResponse?.ok ? await slugsResponse.json() : [];
      const slugEntries = parseServiceSlugEntries(slugPayload);

      const transformedServices: Service[] = data.map((service) => ({
        id: service.id.toString(),
        slug: service.slug?.trim() || undefined,
        companyId: id,
        name: service.nome,
        description: service.descricao,
        duration: formatDuration(service.horarios_atendimento[0].duracao),
        price: service.horarios_atendimento[0].valor_padrao,
        images: service.fotos.map((foto) => foto.imagem),
        rating: service.media_avaliacoes,
        reviewCount: 0,
        tipo: service.tipo
      }));

      setServices(
        mergeServicesWithSlugEntries(transformedServices, slugEntries).map((service) => ({
          ...service,
          slug: service.slug || slugifyServiceName(service.name) || undefined,
        }))
      );
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setServices([]);
      setIsLoading(false);
      return;
    }

    if (hasConsumedInitialData && selectedDate === initialSelectedDate) {
      setHasConsumedInitialData(false);
      setIsLoading(false);
      return;
    }

    fetchServices(selectedDate, companyId);
  }, [companyId, fetchServices, hasConsumedInitialData, initialSelectedDate, selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <ServicesSection
      services={services}
      onSelectService={onSelectService}
      getServiceHref={getServiceHref}
      isLoading={isLoading}
      selectedDate={selectedDate}
      onDateChange={handleDateChange}
    />
  );
};

export default ServicesList;