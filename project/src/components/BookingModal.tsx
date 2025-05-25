import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Service, TimeSlot, AppointmentSlots, Appointment, Pet } from '../types';
import Modal from './Modal';
import DatePicker from './DatePicker';
import TimeSlotPicker from './TimeSlotPicker';
import CustomerForm from './CustomerForm';
import BookingConfirmation from './BookingConfirmation';
import BookingSteps from './BookingSteps';
import ProfessionalSelector from './ProfessionalSelector';
import SportSelector from './SportSelector';
import PetForm from './Forms/PetForm';
import { Calendar, ArrowLeft } from 'lucide-react';
import { getBookingSteps } from '../data/mockData';
import moment from 'moment';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: Service | null;
  selectedDate: string | null;
  selectedTimeSlot: string | null;
  selectedTimeSlotData: TimeSlot | null;
  timeSlots: TimeSlot[];
  onSelectDate: (date: string) => void;
  onSelectTimeSlot: (timeSlotId: string) => void;
  onDateSelected?: () => void;
  appointmentData: AppointmentSlots | null;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedService,
  selectedDate,
  selectedTimeSlot,
  selectedTimeSlotData,
  timeSlots,
  onSelectDate,
  onSelectTimeSlot,
  onDateSelected,
  appointmentData
}) => {
  const { username } = useParams<{ username: string }>();
  const modalRef = useRef<HTMLDivElement>(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);
  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  const [showProfessionalSelector, setShowProfessionalSelector] = useState(false);
  const [showSportSelector, setShowSportSelector] = useState(false);
  const [timeSlotsLoaded, setTimeSlotsLoaded] = useState(false);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [petInfo, setPetInfo] = useState<Pet | null>(null);

  const requiresPetInfo = appointmentData?.selecao_pet || false;
  const bookingSteps = getBookingSteps(requiresPetInfo);
  const finalStep = requiresPetInfo ? 4 : 3;

  const scrollToTop = () => {
    if (modalRef.current) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          modalRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        });
      }, 100);
    }
  };

  useEffect(() => {
    setBookingStep(1);
    setAppointment(null);
    setIsRecurring(false);
    setSelectedProfessionalId(null);
    setSelectedSportId(null);
    setShowProfessionalSelector(false);
    setShowSportSelector(false);
    setTimeSlotsLoaded(false);
    setError(null);
    setPetInfo(null);
  }, [selectedService]);

  useEffect(() => {
    setSelectedProfessionalId(null);
    setSelectedSportId(null);
  }, [selectedDate, selectedTimeSlot]);

  useEffect(() => {
    setTimeSlotsLoaded(timeSlots.length > 0);
    setIsLoadingTimeSlots(false);
  }, [timeSlots]);

  useEffect(() => {
    if (selectedTimeSlot) {
      if (appointmentData?.tipo === 'Serviço') {
        setShowProfessionalSelector(true);
        setShowSportSelector(false);
      } else if (appointmentData?.tipo === 'Quadra') {
        setShowSportSelector(true);
        setShowProfessionalSelector(false);
      } else {
        setShowProfessionalSelector(false);
        setShowSportSelector(false);
      }
    }
  }, [selectedTimeSlot, appointmentData?.tipo]);

  useEffect(() => {
    scrollToTop();
  }, [bookingStep, appointment]);

  const handleDateSelect = (date: string) => {
    setIsLoadingTimeSlots(true);
    onSelectDate(date);
  };

  const handleContinueToNextStep = () => {
    if (selectedDate && selectedTimeSlot) {
      if (appointmentData?.tipo === 'Serviço' && !selectedProfessionalId) {
        setError('Por favor, selecione um profissional');
        return;
      }
      if (appointmentData?.tipo === 'Quadra' && !selectedSportId) {
        setError('Por favor, selecione um esporte');
        return;
      }
      setBookingStep(bookingStep + 1);
      setError(null);
    }
  };

  const handlePetSubmit = (pet: Pet) => {
    setPetInfo(pet);
    setBookingStep(3);
    setError(null);
  };

  const handleCustomerSubmit = async (
    name: string,
    email: string,
    isRecurring: boolean,
    recurringType: 'weekly' | 'monthly' | null,
    isAtHome: boolean,
    address: string,
    hasAccount: boolean,
    password: string,
    country: string,
    phonePrefix: string,
    phone: string,
    recurringDuration: string
  ) => {
    if (!selectedService || !selectedDate || !selectedTimeSlot || !username) return;

    if (requiresPetInfo && !petInfo) {
      setError('Informações do pet são obrigatórias');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [hours, minutes] = selectedTimeSlot.split(':');
      const appointmentDate = moment(selectedDate).hours(parseInt(hours)).minutes(parseInt(minutes)).format();

      const selectedProfessional = appointmentData?.profissionais?.find(
        prof => prof.id === selectedProfessionalId
      );

      const selectedSport = appointmentData?.subcategorias?.find(
        sport => sport.id === selectedSportId
      );

      const payload = {
        cliente_id: parseInt(selectedService.companyId),
        servico_id: parseInt(selectedService.id),
        horario: appointmentDate,
        domicilio: isAtHome ? 'Y' : 'N',
        endereco: isAtHome ? address : undefined,
        ...(isRecurring ? {
          ilimitado: recurringDuration === '12M' ? 'Y' : 'N',
          limite: recurringDuration !== '12M' ? recurringDuration : undefined,
        } : {}),
        profissional_id: selectedProfessional?.usuario.id,
        selectedSport: selectedSport?.subcategoria.id,
        ...(petInfo && { pet: petInfo })
      };

      if (hasAccount) {
        Object.assign(payload, {
          login: {
            email,
            senha: password
          }
        });
      } else {
        Object.assign(payload, {
          cadastro: {
            pais: country,
            nome: name,
            ddi: phonePrefix.replace('+', ''),
            telefone: phone,
            email,
            senha: password
          }
        });
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/appointments/create-from-external-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Email ou senha incorretos');
        }
        throw new Error(data.message || 'Erro ao criar agendamento');
      }

      const newAppointment: Appointment = {
        id: data.id.toString(),
        serviceId: selectedService.id,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        customerName: name,
        customerEmail: email,
        isRecurring,
        recurringType: recurringType || undefined,
        isAtHome,
        address,
        professionalId: selectedProfessional?.usuario.id,
        sportId: selectedSport?.subcategoria.id,
        pet: petInfo || undefined
      };

      setAppointment(newAppointment);
      setBookingStep(finalStep);
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento');
      if (err instanceof Error && err.message === 'Email ou senha incorretos') {
        setBookingStep(requiresPetInfo ? 3 : 2);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingComplete = () => {
    onClose();
    setBookingStep(1);
    setAppointment(null);
    setIsRecurring(false);
    setSelectedProfessionalId(null);
    setSelectedSportId(null);
    setShowProfessionalSelector(false);
    setShowSportSelector(false);
    setPetInfo(null);
    setError(null);
  };

  const handleBack = () => {
    setBookingStep(bookingStep - 1);
    setError(null);
  };

  if (!selectedService) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bookingStep === finalStep ? "Agendamento Confirmado" : "Agendar Compromisso"}
      modalRef={modalRef}
    >
      {bookingStep < finalStep && (
        <>
          {bookingStep > 1 && (
            <button
              onClick={handleBack}
              className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} className="mr-1" />
              Voltar
            </button>
          )}
          <BookingSteps steps={bookingSteps} currentStep={bookingStep} />
        </>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {bookingStep === 1 && (
        <div>
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {selectedService.images && selectedService.images.length > 0 && (
              <div className="w-full md:w-1/3 h-40 rounded-lg overflow-hidden">
                <img
                  src={selectedService.images[0]}
                  alt={selectedService.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="w-full md:w-2/3">
              <h3 className="text-xl font-bold mb-2 text-gray-800">{selectedService.name}</h3>
              <p className="text-gray-600 mb-4">{selectedService.description}</p>

              <div className="bg-indigo-50 p-3 rounded-lg flex items-center">
                <div className="bg-indigo-100 rounded-full p-2 mr-3">
                  <Calendar size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-800">Duração: {selectedService.duration}</p>
                  <p className="text-xs text-indigo-600">Preço: R$ {selectedService.price}</p>
                </div>
              </div>
            </div>
          </div>

          <DatePicker
            onSelectDate={handleDateSelect}
            selectedDate={selectedDate}
            onDateSelected={onDateSelected}
            timeSlotsLoaded={timeSlotsLoaded}
          />

          {selectedDate && (
            <TimeSlotPicker
              timeSlots={timeSlots}
              selectedTimeSlot={selectedTimeSlot}
              onSelectTimeSlot={onSelectTimeSlot}
              isLoading={isLoadingTimeSlots}
            />
          )}

          {showProfessionalSelector && appointmentData?.profissionais && selectedTimeSlotData && (
            <ProfessionalSelector
              professionals={appointmentData.profissionais}
              selectedProfessionalId={selectedProfessionalId}
              onSelectProfessional={setSelectedProfessionalId}
              availableProfessionals={selectedTimeSlotData.availableProfessionals}
            />
          )}

          {showSportSelector && appointmentData?.subcategorias && (
            <SportSelector
              sports={appointmentData.subcategorias}
              selectedSportId={selectedSportId}
              onSelectSport={setSelectedSportId}
            />
          )}

          {selectedDate && selectedTimeSlot && (
            <div className="mt-8">
              <button
                onClick={handleContinueToNextStep}
                disabled={
                  !selectedTimeSlot || 
                  (showProfessionalSelector && !selectedProfessionalId) ||
                  (showSportSelector && !selectedSportId)
                }
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                  !selectedTimeSlot || 
                  (showProfessionalSelector && !selectedProfessionalId) ||
                  (showSportSelector && !selectedSportId)
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'
                }`}
              >
                Continuar
              </button>
            </div>
          )}
        </div>
      )}

      {bookingStep === 2 && requiresPetInfo && (
        <div>
          <h3 className="text-xl font-bold mb-4 text-gray-800">Informações do Pet</h3>
          <PetForm onSubmit={handlePetSubmit} />
        </div>
      )}

      {((bookingStep === 2 && !requiresPetInfo) || (bookingStep === 3 && requiresPetInfo)) && 
        selectedTimeSlotData && selectedService && selectedDate && (
        <div>
          <h3 className="text-xl font-bold mb-4 text-gray-800">Suas Informações</h3>
          <CustomerForm
            onSubmit={handleCustomerSubmit}
            isLoading={isLoading}
            companyAllowsRecurring={true}
            selectedTimeSlot={selectedTimeSlotData}
            selectedService={selectedService}
            selectedDate={selectedDate}
            onRecurringChange={setIsRecurring}
          />
        </div>
      )}

      {bookingStep === finalStep && appointment && selectedService && (
        <BookingConfirmation
          appointment={appointment}
          service={selectedService}
          onClose={handleBookingComplete}
        />
      )}
    </Modal>
  );
};

export default BookingModal;