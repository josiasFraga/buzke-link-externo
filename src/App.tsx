import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Company, Service, TimeSlot, AppointmentSlots } from './types';
import CompanyProfile from './components/CompanyProfile';
import NotFound from './pages/NotFound';
import LoadingScreen from './components/LoadingScreen';
import ServicesList from './components/Services/ServicesList';
import BookingModal from './components/BookingModal';
import { useCompanyStore } from './store/companyStore';

function App() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { company, setCompany } = useCompanyStore();
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedTimeSlotData, setSelectedTimeSlotData] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentSlots | null>(null);
  
  useEffect(() => {
    if (!username) {
      navigate('/mdbeautystudio');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    fetch(`${import.meta.env.VITE_API_URL}/business/${username}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Empresa não encontrada');
        }
        return response.json();
      })
      .then(data => {
        const transformedCompany: Company = {
          id: data.id.toString(),
          name: data.nome,
          logo: data.logo,
          coverPhoto: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=400&q=80',
          description: data.empresaSubcategorias.map(cat => cat.subcategoria.nome).join(', '),
          phone: data.telefone,
          whatsapp: data.wp,
          address: {
            pais: data.pais,
            street: data.endereco,
            number: data.endereco_n,
            neighborhood: data.bairro,
            city: data.cidadeBr?.loc_no || data.cidadeUi.nome,
            state: data.cidadeBr?.ufe_sg || data.estadoUi.nome
          },
          businessHours: data.horarios_atendimento.map(horario => ({
            day: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][horario.horario_dia_semana],
            hours: `${horario.abertura.substring(0, 5)} - ${horario.fechamento.substring(0, 5)}`
          })),
          categories: data.empresaSubcategorias.map(cat => cat.subcategoria.nome),
          media_avaliacoes: data.media_avaliacoes,
          total_avaliacoes: data.total_avaliacoes
        };
        
        setCompany(transformedCompany);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching company:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, [username, navigate, setCompany]);
  
  useEffect(() => {
    if (selectedDate && selectedService) {
      // Format date as DD/MM/YYYY without timezone adjustments
      const [year, month, day] = selectedDate.split('-');
      const formattedDate = `${day}/${month}/${year}`;
      
      const url = `${import.meta.env.VITE_API_URL}/services/data-to-appointment?servico_id=${selectedService.id}&data=${formattedDate}`;
      
      fetch(url)
        .then(response => response.json())
        .then((data: AppointmentSlots) => {
          setTimeSlots(data.horarios);
          setAppointmentData(data);
        })
        .catch(error => {
          console.error('Error fetching time slots:', error);
          setTimeSlots([]);
          setAppointmentData(null);
        });
    }
  }, [selectedDate, selectedService]);
  
  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
    setSelectedTimeSlot(null);
    setSelectedTimeSlotData(null);
  };
  
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    setSelectedTimeSlotData(null);
  };
  
  const handleSelectTimeSlot = (timeSlotId: string) => {
    setSelectedTimeSlot(timeSlotId);
    const timeSlotData = timeSlots.find(slot => slot.time === timeSlotId);
    setSelectedTimeSlotData(timeSlotData || null);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setSelectedTimeSlotData(null);
    setAppointmentData(null);
  };
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !company) {
    return <NotFound />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyProfile 
        company={company}
        onSelectService={handleSelectService}
      >
        <ServicesList
          companyId={company.id}
          onSelectService={handleSelectService}
        />
      </CompanyProfile>
      
      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedService={selectedService}
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlot}
        selectedTimeSlotData={selectedTimeSlotData}
        timeSlots={timeSlots}
        onSelectDate={handleSelectDate}
        onSelectTimeSlot={handleSelectTimeSlot}
        appointmentData={appointmentData}
      />
    </div>
  );
}

export default App;