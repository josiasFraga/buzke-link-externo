import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ArrowLeft, CheckCircle2, Clock3, Sparkles, Trophy, UserRound } from 'lucide-react';
import { Appointment, AppointmentSlotInterestType, AppointmentSlots, Service, TimeSlot, Voucher } from '../types';
import { getBookingSteps } from '../data/mockData';
import AuthStep from './AuthStep';
import BookingConfirmation from './BookingConfirmation';
import BookingSteps from './BookingSteps';
import ConfirmationStep from './ConfirmationStep';
import DatePicker from './DatePicker';
import { createAppointmentSlotInterest } from '../lib/appointment-slot-interests';
import { useToast } from './feedback/ToastProvider';
import useAuthStore from '../store/authStore';
import Modal from './Modal';
import PetStep from './PetStep';
import ProfessionalSelector from './ProfessionalSelector';
import SportSelector from './SportSelector';
import TimeSlotPicker from './TimeSlotPicker';
import { useTheme } from './theme/ThemeProvider';
import { getServiceImageSources } from '../lib/service-images';

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
  onRefreshTimeSlots?: () => Promise<void> | void;
  containerRef?: React.RefObject<HTMLDivElement>;
  showServiceSummary?: boolean;
  stickySteps?: boolean;
  showSelectionSidebar?: boolean;
}

interface PendingInterestRequest {
  slot: TimeSlot;
  type: AppointmentSlotInterestType;
}

function getInterestTypesForSlot(slot: TimeSlot): AppointmentSlotInterestType[] {
  const interestTypes: AppointmentSlotInterestType[] = [];

  if (slot.interest_options?.occasional) {
    interestTypes.push('occasional');
  }

  if (slot.occupied_by_fixed && slot.interest_options?.fixed_series) {
    interestTypes.push('fixed_series');
  }

  return interestTypes;
}

function getInterestTypeLabel(type: AppointmentSlotInterestType) {
  return type === 'fixed_series' ? 'Interesse fixo' : 'Interesse avulso';
}

function getInterestTypeDescription(type: AppointmentSlotInterestType) {
  return type === 'fixed_series'
    ? 'Você só recebe aviso se o titular atual desistir desse horário fixo. Se isso acontecer, você decide depois se quer ficar com ele.'
    : 'Você recebe aviso se esse horário for cancelado nesta data. Se a vaga abrir, você decide depois se quer ficar com ela.';
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
  onRefreshTimeSlots,
  containerRef,
  showServiceSummary = true,
  stickySteps = false,
  showSelectionSidebar = false,
}) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { isAuthenticated, token } = useAuthStore();
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const activeContainerRef = containerRef || internalContainerRef;
  const lastErrorToastRef = useRef<string | null>(null);
  const lastInterestErrorToastRef = useRef<string | null>(null);

  const [bookingStep, setBookingStep] = useState(1);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);
  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [interestSelectionSlot, setInterestSelectionSlot] = useState<TimeSlot | null>(null);
  const [interestSelectionType, setInterestSelectionType] = useState<AppointmentSlotInterestType | null>(null);
  const [pendingInterestRequest, setPendingInterestRequest] = useState<PendingInterestRequest | null>(null);
  const [interestLoadingAppointmentId, setInterestLoadingAppointmentId] = useState<number | null>(null);
  const [interestError, setInterestError] = useState<string | null>(null);
  const [interestSuccess, setInterestSuccess] = useState<string | null>(null);

  const requiresPetInfo = appointmentData?.selecao_pet || false;
  const bookingSteps = useMemo(() => getBookingSteps(requiresPetInfo), [requiresPetInfo]);
  const finalStep = bookingSteps.length + 1;
  const timeSlotsLoaded = timeSlots.length > 0;
  const isLoadingTimeSlots = Boolean(selectedDate && !appointmentData);
  const showProfessionalSelector = Boolean(selectedTimeSlot && appointmentData?.tipo === 'Serviço');
  const showSportSelector = Boolean(selectedTimeSlot && appointmentData?.tipo === 'Quadra');
  const stickySectionTopClassName = stickySteps ? 'top-[8.75rem] sm:top-[10.25rem] lg:top-[10.75rem]' : '';
  const sidebarStickyTopClassName = bookingStep === 1 ? 'lg:top-[11.5rem]' : 'lg:top-[8.75rem]';
  const selectedProfessional = useMemo(
    () => appointmentData?.profissionais?.find((professional) => professional.id === selectedProfessionalId) || null,
    [appointmentData?.profissionais, selectedProfessionalId]
  );
  const selectedSport = useMemo(
    () => appointmentData?.subcategorias?.find((sport) => sport.id === selectedSportId) || null,
    [appointmentData?.subcategorias, selectedSportId]
  );
  const showDesktopSidebar = showSelectionSidebar && bookingStep < finalStep;
  const selectedServiceImages = useMemo(
    () => getServiceImageSources(selectedService.images, theme),
    [selectedService.images, theme]
  );

  const formatSelectedDate = (date: string | null) => {
    if (!date) {
      return 'Escolha no calendario';
    }

    const [year, month, day] = date.split('-').map(Number);
    const formattedDate = new Date(year, (month || 1) - 1, day || 1);

    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(formattedDate);
  };

  const summaryItems = [
    {
      id: 'date',
      label: 'Data',
      value: formatSelectedDate(selectedDate),
      icon: Calendar,
      ready: Boolean(selectedDate),
    },
    {
      id: 'time',
      label: 'Horario',
      value: selectedTimeSlot ? `${selectedTimeSlot}${selectedService.duration ? ` • ${selectedService.duration}` : ''}` : 'Selecione um horario',
      icon: Clock3,
      ready: Boolean(selectedTimeSlot),
    },
    {
      id: 'professional',
      label: appointmentData?.tipo === 'Quadra' ? 'Esporte' : 'Profissional',
      value: appointmentData?.tipo === 'Quadra'
        ? selectedSport?.subcategoria.esporte_nome || 'Selecione um esporte'
        : selectedProfessional?.usuario.nome || (appointmentData?.tipo === 'Serviço' ? 'Selecione um profissional' : 'Nao se aplica'),
      icon: appointmentData?.tipo === 'Quadra' ? Trophy : UserRound,
      ready: appointmentData?.tipo === 'Quadra' ? Boolean(selectedSport) : appointmentData?.tipo === 'Serviço' ? Boolean(selectedProfessional) : true,
    },
  ];

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
    if (bookingStep !== finalStep || !appointment) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 80);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [appointment, bookingStep, finalStep]);

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
    if (!error) {
      lastErrorToastRef.current = null;
      return;
    }

    if (lastErrorToastRef.current === error) {
      return;
    }

    lastErrorToastRef.current = error;
    showToast({ message: error, variant: 'error' });
  }, [error, showToast]);

  useEffect(() => {
    if (!interestError) {
      lastInterestErrorToastRef.current = null;
      return;
    }

    if (lastInterestErrorToastRef.current === interestError) {
      return;
    }

    lastInterestErrorToastRef.current = interestError;
    showToast({ message: interestError, variant: 'error' });
  }, [interestError, showToast]);

  useEffect(() => {
    if (!selectedTimeSlot) {
      return;
    }

    const targetSectionId = showProfessionalSelector
      ? 'professional-selector-section'
      : showSportSelector
        ? 'sport-selector-section'
        : null;

    if (!targetSectionId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      scrollToFlowSection(targetSectionId);
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [selectedTimeSlot, showProfessionalSelector, showSportSelector]);

  const handleDateSelect = (date: string) => {
    setError(null);
    setInterestError(null);
    setInterestSuccess(null);
    setPendingInterestRequest(null);
    setInterestSelectionSlot(null);
    setInterestSelectionType(null);
    setSelectedProfessionalId(null);
    setSelectedSportId(null);
    onSelectDate(date);
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    setError(null);
    setInterestError(null);
    setInterestSuccess(null);
    setSelectedProfessionalId(null);
    setSelectedSportId(null);
    onSelectTimeSlot(timeSlotId);
  };

  const submitSlotInterest = async (slot: TimeSlot, type: AppointmentSlotInterestType) => {
    if (!token) {
      setInterestError('Faça login para registrar interesse nesse horário.');
      return;
    }

    if (!selectedDate) {
      setInterestError('Selecione a data do horário para registrar esse aviso.');
      return;
    }

    if (!slot.occupied_appointment_id) {
      setInterestError('Esse horário permite interesse, mas o backend não retornou occupied_appointment_id. Sem esse identificador não é possível concluir o envio.');
      return;
    }

    setError(null);
    setInterestError(null);
    setInterestSuccess(null);
    setInterestSelectionSlot(null);
    setInterestLoadingAppointmentId(slot.occupied_appointment_id);

    try {
      await createAppointmentSlotInterest({
        token,
        appointmentId: slot.occupied_appointment_id,
        tipoInteresse: type,
        dataSlot: selectedDate,
        horaInicio: slot.time,
        duracao: slot.duration,
      });
      await onRefreshTimeSlots?.();
      setPendingInterestRequest(null);
      setBookingStep(1);
      setInterestSuccess(
        type === 'fixed_series'
          ? 'Seu interesse na série fixa foi registrado. A continuidade acontecerá pelo atendimento da empresa.'
          : 'Seu interesse nesse horário foi registrado. A continuidade acontecerá pelo atendimento da empresa.'
      );
    } catch (err) {
      setInterestError(err instanceof Error ? err.message : 'Não foi possível registrar seu interesse agora.');
    } finally {
      setInterestLoadingAppointmentId(null);
    }
  };

  const handleInterestTypeSelect = (slot: TimeSlot, type: AppointmentSlotInterestType) => {
    setInterestSelectionSlot(null);
    setInterestSelectionType(null);

    if (!isAuthenticated || !token) {
      setPendingInterestRequest({ slot, type });
      setBookingStep(2);
      return;
    }

    void submitSlotInterest(slot, type);
  };

  const handleExpressInterest = (slot: TimeSlot) => {
    const interestTypes = getInterestTypesForSlot(slot);

    setError(null);
    setInterestError(null);
    setInterestSuccess(null);

    if (interestTypes.length === 0) {
      setInterestError('Esse horário não possui opção de interesse disponível.');
      return;
    }

    setInterestSelectionSlot(slot);
    setInterestSelectionType(interestTypes[0]);
  };

  const handleCloseInterestModal = () => {
    setInterestSelectionSlot(null);
    setInterestSelectionType(null);
  };

  const handleConfirmInterestSelection = () => {
    if (!interestSelectionSlot || !interestSelectionType) {
      return;
    }

    handleInterestTypeSelect(interestSelectionSlot, interestSelectionType);
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
    if (pendingInterestRequest && bookingStep === 2) {
      setInterestError(null);
      setPendingInterestRequest(null);
      setBookingStep(1);
      return;
    }

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

  const handleAuthStepSuccess = () => {
    if (!pendingInterestRequest) {
      handleNextStep();
      return;
    }

    const request = pendingInterestRequest;

    setPendingInterestRequest(null);
    setBookingStep(1);
    void submitSlotInterest(request.slot, request.type);
  };

  const renderStepContent = () => {
    let currentStepIndex = 1;

    if (bookingStep === currentStepIndex) {
      return (
        <div>
          {showServiceSummary ? (
            <div className="mb-6 flex flex-col gap-6 md:flex-row">
              {selectedServiceImages[0] ? (
                <div className="h-40 w-full overflow-hidden rounded-lg md:w-1/3">
                  <img src={selectedServiceImages[0]} alt={selectedService.name} className="h-full w-full object-cover" />
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
            <TimeSlotPicker
              timeSlots={timeSlots}
              selectedTimeSlot={selectedTimeSlot}
              onSelectTimeSlot={handleTimeSlotSelect}
              onExpressInterest={handleExpressInterest}
              isLoading={isLoadingTimeSlots}
              stickyTitle={stickySteps}
              stickyTopClassName={stickySectionTopClassName}
              autoScrollOnSelect={false}
              interestLoadingAppointmentId={interestLoadingAppointmentId}
            />
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
      return (
        <div className="space-y-4">
          {pendingInterestRequest ? (
            <div className="theme-panel-warning p-4">
              <p className="theme-text-primary font-medium">Entre para receber aviso desse horário.</p>
              <p className="theme-text-secondary mt-1 text-sm">
                {pendingInterestRequest.slot.time} • {getInterestTypeLabel(pendingInterestRequest.type)}
              </p>
            </div>
          ) : null}
          <AuthStep onAuthSuccess={handleAuthStepSuccess} />
        </div>
      );
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

      {interestError ? (
        <div className="theme-panel-error mb-4 p-4">
          <p className="theme-text-danger">{interestError}</p>
        </div>
      ) : null}

      {interestSuccess ? (
        <div className="theme-panel-success mb-4 p-4">
          <p className="theme-text-success font-medium">{interestSuccess}</p>
        </div>
      ) : null}

      {bookingStep === finalStep && appointment ? (
        <BookingConfirmation appointment={appointment} service={selectedService} appliedVoucher={appliedVoucher} />
      ) : (
        <div className={showDesktopSidebar ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6 lg:items-start' : ''}>
          <div className="min-w-0">
            {renderStepContent()}
          </div>

          {showDesktopSidebar ? (
            <aside className={`hidden lg:block lg:sticky ${sidebarStickyTopClassName}`}>
              <div className="theme-card overflow-hidden p-5">
                {selectedServiceImages[0] ? (
                  <div className="mb-5 h-40 overflow-hidden rounded-[1.25rem] border border-[var(--color-border)]">
                    <img src={selectedServiceImages[0]} alt={selectedService.name} className="h-full w-full object-cover" />
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="theme-text-muted text-xs font-semibold uppercase tracking-[0.18em]">Resumo do agendamento</p>
                    <h3 className="theme-text-primary mt-2 text-xl font-bold">{selectedService.name}</h3>
                  </div>
                  <div className="theme-panel-accent flex h-11 w-11 items-center justify-center rounded-full">
                    <Sparkles size={18} className="theme-text-accent" />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-[1rem] border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface-secondary)_72%,transparent)] px-4 py-3">
                  <div>
                    <p className="theme-text-muted text-xs font-semibold uppercase tracking-[0.14em]">Valor inicial</p>
                    <p className="theme-text-primary mt-1 text-sm">{selectedService.duration}</p>
                  </div>
                  <p className="theme-text-accent text-xl font-bold">
                    {selectedService.price > 0 ? `R$ ${selectedService.price}` : 'Consulte'}
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  {summaryItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.id} className="theme-surface-muted flex items-start gap-3 p-4">
                        <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-full ${item.ready ? 'theme-panel-accent' : 'bg-[color:color-mix(in_srgb,var(--color-border)_32%,transparent)]'}`}>
                          <Icon size={17} className={item.ready ? 'theme-text-accent' : 'theme-text-secondary'} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="theme-text-muted text-xs font-semibold uppercase tracking-[0.14em]">{item.label}</p>
                          <p className={`mt-1 text-sm leading-6 ${item.ready ? 'theme-text-primary font-medium' : 'theme-text-secondary'}`}>{item.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="theme-panel-success mt-5 flex items-start gap-3 p-4">
                  <CheckCircle2 size={18} className="theme-text-success mt-0.5" />
                  <div>
                    <p className="theme-text-primary text-sm font-semibold">Passo {bookingStep} de {bookingSteps.length}</p>
                    <p className="theme-text-secondary mt-1 text-sm">Seu resumo acompanha as selecoes em tempo real para facilitar a revisao antes da confirmacao.</p>
                  </div>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      )}

      <Modal
        isOpen={Boolean(interestSelectionSlot)}
        onClose={handleCloseInterestModal}
        title="Interesse no horário ocupado"
      >
        {interestSelectionSlot ? (
          <div className="space-y-5">
            <div className="theme-panel-warning p-4">
              <p className="theme-text-primary font-medium">{interestSelectionSlot.time} está ocupado.</p>
              <p className="theme-text-secondary mt-1 text-sm">
                Vamos avisar você pelo app e pelo WhatsApp se esse horário ficar disponível. O horário não fica reservado e a decisão final continua sendo sua quando o aviso chegar.
              </p>
            </div>

            <div className="space-y-3">
              <p className="theme-text-primary text-sm font-medium">Como você quer receber esse aviso?</p>

              <div className="grid gap-3">
                {getInterestTypesForSlot(interestSelectionSlot).map((type) => {
                  const isSelected = interestSelectionType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInterestSelectionType(type)}
                      className={`w-full rounded-xl border px-4 py-4 text-left transition-colors ${
                        isSelected
                          ? 'border-[var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_10%,var(--color-surface))]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'
                      }`}
                    >
                      <span className="theme-text-primary block font-medium">{getInterestTypeLabel(type)}</span>
                      <span className="theme-text-secondary mt-1 block text-sm">{getInterestTypeDescription(type)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!interestSelectionSlot.occupied_appointment_id ? (
              <div className="theme-panel-warning p-4">
                <p className="theme-text-primary text-sm font-medium">Este horário ainda não pode concluir o alerta.</p>
                <p className="theme-text-secondary mt-1 text-sm">
                  O sistema ainda não recebeu todos os dados necessários para registrar esse interesse. Assim que essa referência vier da API, o envio poderá ser concluído normalmente.
                </p>
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseInterestModal}
                className="theme-secondary-btn px-4 py-3"
              >
                Agora não
              </button>
              <button
                type="button"
                onClick={handleConfirmInterestSelection}
                disabled={!interestSelectionType || !interestSelectionSlot.occupied_appointment_id}
                className="theme-primary-btn px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Confirmar aviso
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

    </div>
  );
};

export default BookingFlow;