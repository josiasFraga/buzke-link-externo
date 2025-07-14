import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Service, TimeSlot, AppointmentSlots, Appointment, Pet, Voucher } from '../types';
import Modal from './Modal';
import DatePicker from './DatePicker';
import TimeSlotPicker from './TimeSlotPicker';
import BookingSteps from './BookingSteps';
import ProfessionalSelector from './ProfessionalSelector';
import SportSelector from './SportSelector';
import AuthStep from './AuthStep';
import PetStep from './PetStep';
import ConfirmationStep from './ConfirmationStep';
import BookingConfirmation from './BookingConfirmation';
import { Calendar, ArrowLeft } from 'lucide-react';
import { getBookingSteps } from '../data/mockData';
import useAuthStore from '../store/authStore';

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
  const { isAuthenticated, user } = useAuthStore();

  const [bookingStep, setBookingStep] = useState(1);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);
  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  const [showProfessionalSelector, setShowProfessionalSelector] = useState(false);
  const [showSportSelector, setShowSportSelector] = useState(false);
  const [timeSlotsLoaded, setTimeSlotsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

  const requiresPetInfo = appointmentData?.selecao_pet || false;
  const bookingSteps = getBookingSteps(requiresPetInfo, isAuthenticated);
  const finalStep = bookingSteps.length + 1;

  const scrollToTop = () => {
    if (modalRef.current) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }, 100);
    }
  };

  useEffect(() => {
    setBookingStep(1);
    setAppointment(null);
    setSelectedProfessionalId(null);
    setSelectedSportId(null);
    setShowProfessionalSelector(false);
    setShowSportSelector(false);
    setTimeSlotsLoaded(false);
    setError(null);
    setSelectedPetId(null);
  }, [selectedService, isOpen]);

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

  const handleNextStep = () => {
    setError(null);
    if (bookingStep === 1) {
      if (appointmentData?.tipo === 'Serviço' && !selectedProfessionalId) {
        setError('Por favor, selecione um profissional');
        return;
      }
      if (appointmentData?.tipo === 'Quadra' && !selectedSportId) {
        setError('Por favor, selecione um esporte');
        return;
      }
    }
    setBookingStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setBookingStep(prev => prev - 1);
  };

  const handleAuthSuccess = () => {
    handleNextStep();
  };

  const handlePetSelected = (petId: number) => {
    setSelectedPetId(petId);
    handleNextStep();
  };

  const handleBookingComplete = (newAppointment: Appointment, voucher: Voucher | null) => {
    setAppointment(newAppointment);
    setAppliedVoucher(voucher);
    setBookingStep(finalStep);
  };
  
  const handleCloseAndReset = () => {
    onClose();
  };

  if (!selectedService) return null;

  const renderStepContent = () => {
    let currentStepIndex = 1;
    
    // Passo 1: Data e Hora
    if (bookingStep === currentStepIndex) {
      return (
        <div>
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {selectedService.images && selectedService.images.length > 0 && (
              <div className="w-full md:w-1/3 h-40 rounded-lg overflow-hidden">
                <img src={selectedService.images[0]} alt={selectedService.name} className="w-full h-full object-cover" />
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
          <DatePicker onSelectDate={handleDateSelect} selectedDate={selectedDate} onDateSelected={onDateSelected} timeSlotsLoaded={timeSlotsLoaded} />
          {selectedDate && <TimeSlotPicker timeSlots={timeSlots} selectedTimeSlot={selectedTimeSlot} onSelectTimeSlot={onSelectTimeSlot} isLoading={isLoadingTimeSlots} />}
          {showProfessionalSelector && appointmentData?.profissionais && selectedTimeSlotData && <ProfessionalSelector professionals={appointmentData.profissionais} selectedProfessionalId={selectedProfessionalId} onSelectProfessional={setSelectedProfessionalId} availableProfessionals={selectedTimeSlotData.availableProfessionals} />}
          {showSportSelector && appointmentData?.subcategorias && <SportSelector sports={appointmentData.subcategorias} selectedSportId={selectedSportId} onSelectSport={setSelectedSportId} />}
          {selectedDate && selectedTimeSlot && (
            <div className="mt-8">
              <button onClick={handleNextStep} disabled={!selectedTimeSlot || (showProfessionalSelector && !selectedProfessionalId) || (showSportSelector && !selectedSportId)} className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${!selectedTimeSlot || (showProfessionalSelector && !selectedProfessionalId) || (showSportSelector && !selectedSportId) ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'}`}>
                Continuar
              </button>
            </div>
          )}
        </div>
      );
    }
    currentStepIndex++;

    // Passo 2: Autenticação
    if (bookingStep === currentStepIndex) {
      return <AuthStep onAuthSuccess={handleNextStep} />;
    }
    currentStepIndex++;

    // Passo 3: Pet (condicional)
    if (requiresPetInfo && bookingStep === currentStepIndex) {
      return <PetStep onPetSelected={handlePetSelected} />;
    }
    if (requiresPetInfo) currentStepIndex++;

    // Passo 4: Confirmação
    if (bookingStep === currentStepIndex) {
      return (
        <ConfirmationStep
          selectedService={selectedService!}
          selectedDate={selectedDate!}
          selectedTimeSlotData={selectedTimeSlotData!}
          selectedProfessionalId={selectedProfessionalId}
          selectedSportId={selectedSportId}
          selectedPetId={selectedPetId}
          appointmentData={appointmentData}
          onBookingComplete={handleBookingComplete}
        />
      );
    }

    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseAndReset} title={bookingStep === finalStep ? "Agendamento Confirmado" : "Agendar Compromisso"} modalRef={modalRef}>
      {bookingStep < finalStep && (
        <>
          {bookingStep > 1 && (
            <button onClick={handleBack} className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition-colors">
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
      {bookingStep === finalStep && appointment && selectedService ? (
        <BookingConfirmation appointment={appointment} service={selectedService} appliedVoucher={appliedVoucher} onClose={handleCloseAndReset} />
      ) : (
        renderStepContent()
      )}
    </Modal>
  );
};

export default BookingModal;