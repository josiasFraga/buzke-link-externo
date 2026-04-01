import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Appointment, AppointmentSlots, Service, TimeSlot, Voucher } from '../types';
import { getBookingSteps } from '../data/mockData';
import AuthStep from './AuthStep';
import BookingConfirmation from './BookingConfirmation';
import BookingSteps from './BookingSteps';
import ConfirmationStep from './ConfirmationStep';
import DatePicker from './DatePicker';
import PetStep from './PetStep';
import ProfessionalSelector from './ProfessionalSelector';
import SportSelector from './SportSelector';
import TimeSlotPicker from './TimeSlotPicker';

interface BookingFlowProps {
  selectedService: Service;
  selectedDate: string | null;
  selectedTimeSlot: string | null;
  selectedTimeSlotData: TimeSlot | null;
  timeSlots: TimeSlot[];
  onSelectDate: (date: string) => void;
  onSelectTimeSlot: (timeSlotId: string) => void;
  onDateSelected?: () => void;
  appointmentData: AppointmentSlots | null;
  containerRef?: React.RefObject<HTMLDivElement>;
  showServiceSummary?: boolean;
  stickySteps?: boolean;
}

const BookingFlow: React.FC<BookingFlowProps> = ({
  selectedService,
  selectedDate,
  selectedTimeSlot,
  selectedTimeSlotData,
  timeSlots,
  onSelectDate,
  onSelectTimeSlot,
  onDateSelected,
  appointmentData,
  containerRef,
  showServiceSummary = true,
  stickySteps = false,
}) => {
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const activeContainerRef = containerRef || internalContainerRef;

  const [bookingStep, setBookingStep] = useState(1);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);
  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

  const requiresPetInfo = appointmentData?.selecao_pet || false;
  const bookingSteps = useMemo(() => getBookingSteps(requiresPetInfo), [requiresPetInfo]);
  const finalStep = bookingSteps.length + 1;
  const timeSlotsLoaded = timeSlots.length > 0;
  const isLoadingTimeSlots = Boolean(selectedDate && !appointmentData);
  const showProfessionalSelector = Boolean(selectedTimeSlot && appointmentData?.tipo === 'Serviço');
  const showSportSelector = Boolean(selectedTimeSlot && appointmentData?.tipo === 'Quadra');
  const stickySectionTopClassName = stickySteps ? 'top-[8.75rem] sm:top-[10.25rem] lg:top-[10.75rem]' : '';

  const scrollToFlowSection = (sectionId: string, pageOffset = 172) => {
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    const modalElement = section.closest('.overflow-y-auto');

    if (modalElement) {
      const modalRect = modalElement.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const top = sectionRect.top - modalRect.top + modalElement.scrollTop - 16;

      modalElement.scrollTo({
        top: Math.max(top, 0),
        behavior: 'smooth',
      });

      return;
    }

    const top = section.getBoundingClientRect().top + window.scrollY - pageOffset;
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (!activeContainerRef.current) {
      return;
    }

    setTimeout(() => {
      requestAnimationFrame(() => {
        activeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }, 100);
  }, [activeContainerRef, appointment, bookingStep]);

  useEffect(() => {
    if (bookingStep <= 1) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      scrollToFlowSection('booking-steps-scroll-anchor', 56);
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [bookingStep]);

  useEffect(() => {
    if (!selectedTimeSlot) {
      return;
    }

    const targetSectionId = showProfessionalSelector
      ? 'professional-selector-section'
      : showSportSelector
        ? 'sport-selector-section'
        : 'booking-continue-section';

    const timeoutId = window.setTimeout(() => {
      scrollToFlowSection(targetSectionId);
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [selectedTimeSlot, showProfessionalSelector, showSportSelector]);

  useEffect(() => {
    if (!selectedProfessionalId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      scrollToFlowSection('booking-continue-section');
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [selectedProfessionalId]);

  useEffect(() => {
    if (!selectedSportId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      scrollToFlowSection('booking-continue-section');
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [selectedSportId]);

  const handleDateSelect = (date: string) => {
    setError(null);
    setSelectedProfessionalId(null);
    setSelectedSportId(null);
    onSelectDate(date);
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    setError(null);
    setSelectedProfessionalId(null);
    setSelectedSportId(null);
    onSelectTimeSlot(timeSlotId);
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

    setBookingStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setBookingStep((prev) => prev - 1);
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

  const renderStepContent = () => {
    let currentStepIndex = 1;

    if (bookingStep === currentStepIndex) {
      return (
        <div>
          {showServiceSummary ? (
            <div className="mb-6 flex flex-col gap-6 md:flex-row">
              {selectedService.images && selectedService.images.length > 0 ? (
                <div className="h-40 w-full overflow-hidden rounded-lg md:w-1/3">
                  <img src={selectedService.images[0]} alt={selectedService.name} className="h-full w-full object-cover" />
                </div>
              ) : null}
              <div className="w-full md:w-2/3">
                <h3 className="theme-text-primary mb-2 text-xl font-bold">{selectedService.name}</h3>
                <p className="theme-text-secondary mb-4">{selectedService.description}</p>
                <div className="theme-panel-accent flex items-center p-3">
                  <div className="mr-3 rounded-full bg-[color:color-mix(in_srgb,var(--color-primary)_18%,transparent)] p-2">
                    <Calendar size={18} className="theme-text-accent" />
                  </div>
                  <div>
                    <p className="theme-text-primary text-sm font-medium">Duração: {selectedService.duration}</p>
                    <p className="theme-text-accent text-xs">Preço: R$ {selectedService.price}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <DatePicker onSelectDate={handleDateSelect} selectedDate={selectedDate} onDateSelected={onDateSelected} timeSlotsLoaded={timeSlotsLoaded} stickyTitle={stickySteps} stickyTopClassName={stickySectionTopClassName} />
          {selectedDate ? (
            <TimeSlotPicker timeSlots={timeSlots} selectedTimeSlot={selectedTimeSlot} onSelectTimeSlot={handleTimeSlotSelect} isLoading={isLoadingTimeSlots} stickyTitle={stickySteps} stickyTopClassName={stickySectionTopClassName} autoScrollOnSelect={false} />
          ) : null}
          {showProfessionalSelector && appointmentData?.profissionais && selectedTimeSlotData ? (
            <ProfessionalSelector
              professionals={appointmentData.profissionais}
              selectedProfessionalId={selectedProfessionalId}
              onSelectProfessional={setSelectedProfessionalId}
              availableProfessionals={selectedTimeSlotData.availableProfessionals}
              stickyTitle={stickySteps}
              stickyTopClassName={stickySectionTopClassName}
            />
          ) : null}
          {showSportSelector && appointmentData?.subcategorias ? (
            <SportSelector sports={appointmentData.subcategorias} selectedSportId={selectedSportId} onSelectSport={setSelectedSportId} stickyTitle={stickySteps} stickyTopClassName={stickySectionTopClassName} />
          ) : null}
          {selectedDate && selectedTimeSlot ? (
            <div className="mt-8" id="booking-continue-section">
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!selectedTimeSlot || (showProfessionalSelector && !selectedProfessionalId) || (showSportSelector && !selectedSportId)}
                className="theme-primary-btn w-full px-4 py-3 font-medium"
              >
                Continuar
              </button>
            </div>
          ) : null}
        </div>
      );
    }
    currentStepIndex++;

    if (bookingStep === currentStepIndex) {
      return <AuthStep onAuthSuccess={handleNextStep} />;
    }
    currentStepIndex++;

    if (requiresPetInfo && bookingStep === currentStepIndex) {
      return <PetStep onPetSelected={handlePetSelected} />;
    }
    if (requiresPetInfo) currentStepIndex++;

    if (bookingStep === currentStepIndex) {
      return (
        <ConfirmationStep
          selectedService={selectedService}
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
    <div ref={activeContainerRef} className="min-h-[24rem]">
      {bookingStep < finalStep ? (
        <>
          {bookingStep > 1 ? (
            <button type="button" onClick={handleBack} className="theme-text-secondary mb-4 flex items-center transition-colors hover:text-[var(--color-text-primary)]">
              <ArrowLeft size={20} className="mr-1" />
              Voltar
            </button>
          ) : null}
          <div id="booking-steps-scroll-anchor" />
          <div id="booking-steps-anchor" className={stickySteps ? 'sticky top-[3.25rem] z-30 mb-6 bg-[var(--color-background)] sm:top-[3.25rem] lg:top-[3.75rem]' : ''}>
            <BookingSteps steps={bookingSteps} currentStep={bookingStep} />
          </div>
        </>
      ) : null}

      {error ? (
        <div className="theme-panel-error mb-4 p-4">
          <p className="theme-text-danger">{error}</p>
        </div>
      ) : null}

      {bookingStep === finalStep && appointment ? (
        <BookingConfirmation appointment={appointment} service={selectedService} appliedVoucher={appliedVoucher} />
      ) : (
        renderStepContent()
      )}
    </div>
  );
};

export default BookingFlow;