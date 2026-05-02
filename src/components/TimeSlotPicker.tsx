import React, { useRef, useEffect } from 'react';
import { TimeSlot } from '../types';
import { AlertCircle, Bell, CheckCircle2, Clock } from 'lucide-react';

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedTimeSlot: string | null;
  onSelectTimeSlot: (timeSlotId: string) => void;
  onExpressInterest?: (slot: TimeSlot) => void;
  isLoading?: boolean;
  stickyTitle?: boolean;
  stickyTopClassName?: string;
  autoScrollOnSelect?: boolean;
  interestLoadingAppointmentId?: number | null;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ 
  timeSlots, 
  selectedTimeSlot, 
  onSelectTimeSlot,
  onExpressInterest,
  isLoading = false,
  stickyTitle = false,
  stickyTopClassName = '',
  autoScrollOnSelect = true,
  interestLoadingAppointmentId = null,
}) => {
  const timeSlotRef = useRef<HTMLDivElement>(null);

  const canExpressInterest = (slot: TimeSlot) => Boolean(
    !slot.active &&
    slot.can_express_interest &&
    (slot.interest_options?.occasional || slot.interest_options?.fixed_series)
  );

  const isInterestSubmitted = (slot: TimeSlot) => Boolean(
    slot.registered_interest_options?.occasional ||
    slot.registered_interest_options?.fixed_series
  );

  const getInterestActionLabel = (slot: TimeSlot) => {
    if (isInterestSubmitted(slot)) {
      return 'Interesse registrado';
    }

    if (slot.occupied_appointment_id && interestLoadingAppointmentId === slot.occupied_appointment_id) {
      return 'Enviando...';
    }

    return slot.occupied_by_fixed && slot.interest_options?.fixed_series ? 'Avise-me se liberar' : 'Receber aviso';
  };

  const getInterestContextLabel = (slot: TimeSlot) => {
    if (slot.occupied_by_fixed && slot.occupied_fixed_type) {
      return `Ocupado em série ${slot.occupied_fixed_type.toLowerCase()}`;
    }

    return 'Horário ocupado';
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.active) {
      onSelectTimeSlot(slot.time);
      return;
    }

    if (canExpressInterest(slot) && !isInterestSubmitted(slot)) {
      onExpressInterest?.(slot);
    }
  };
  
  // Scroll to professional selector when time slot is selected
  useEffect(() => {
    if (selectedTimeSlot && autoScrollOnSelect) {
      setTimeout(() => {
        const modalElement = timeSlotRef.current?.closest('.overflow-y-auto');
        if (modalElement) {
          const scrollHeight = modalElement.scrollHeight;
          modalElement.scrollTo({
            top: scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100); // Small delay to ensure content is rendered
    }
  }, [autoScrollOnSelect, selectedTimeSlot]);
  
  if (isLoading) {
    return (
      <div className="mt-6" id="time-slot-section" ref={timeSlotRef}>
        <div className={`${stickyTitle ? `sticky z-20 bg-[var(--color-background)] py-2 ${stickyTopClassName}` : 'mb-4'} flex items-center`}>
          <Clock size={20} className="theme-text-accent mr-2" />
          <h3 className="theme-text-primary text-lg font-semibold">Selecione o Horário</h3>
        </div>
        <div className="animate-pulse">
          {/* Morning slots */}
          <div className="mb-4">
            <div className="mb-2 h-4 w-16 rounded bg-[var(--color-surface-secondary)]"></div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-[var(--color-surface-secondary)]"></div>
              ))}
            </div>
          </div>
          
          {/* Afternoon slots */}
          <div className="mb-4">
            <div className="mb-2 h-4 w-16 rounded bg-[var(--color-surface-secondary)]"></div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-[var(--color-surface-secondary)]"></div>
              ))}
            </div>
          </div>
          
          {/* Evening slots */}
          <div className="mb-4">
            <div className="mb-2 h-4 w-16 rounded bg-[var(--color-surface-secondary)]"></div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-[var(--color-surface-secondary)]"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Group time slots by morning, afternoon, evening
  const morningSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 7 && hour < 12;
  });
  
  const afternoonSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 12 && hour < 17;
  });
  
  const eveningSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 17;
  });
  
  const renderTimeSlotGroup = (slots: TimeSlot[], title: string) => {
    if (slots.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h4 className="theme-text-secondary mb-2 text-sm font-medium">{title}</h4>
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot, index) => (
            (() => {
              const isExpressInterestAvailable = canExpressInterest(slot);
              const isSubmitted = isInterestSubmitted(slot);
              const isLoadingInterest = Boolean(
                slot.occupied_appointment_id && interestLoadingAppointmentId === slot.occupied_appointment_id
              );
              const isCommonUnavailable = !slot.active && !isExpressInterestAvailable;

              return (
                <button
                  key={`${title}-${slot.time}-${slot.endTime}-${slot.duration}-${index}`}
                  type="button"
                  onClick={() => handleSlotClick(slot)}
                  disabled={isCommonUnavailable || isSubmitted || isLoadingInterest}
                  className={`
                    group relative rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors
                    ${isCommonUnavailable
                      ? 'bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)] cursor-not-allowed'
                      : isSubmitted
                        ? 'theme-panel-success border border-[color:color-mix(in_srgb,var(--color-success-text)_22%,transparent)] text-[var(--color-success-text)] cursor-not-allowed'
                        : isExpressInterestAvailable
                          ? 'min-h-[4.5rem] border border-[color:color-mix(in_srgb,var(--color-primary)_42%,var(--color-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary)_13%,var(--color-surface))_0%,color-mix(in_srgb,var(--color-primary)_6%,var(--color-surface))_100%)] text-[var(--color-text-primary)] shadow-[var(--shadow-soft)] hover:border-[var(--color-primary)] hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary)_18%,var(--color-surface))_0%,color-mix(in_srgb,var(--color-primary)_10%,var(--color-surface))_100%)]'
                          : selectedTimeSlot === slot.time
                            ? 'min-h-[4.25rem] bg-[var(--color-primary)] text-white'
                            : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)] text-[var(--color-text-primary)]'
                    }
                  `}
                >
                  <div className="flex h-full flex-col justify-between gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-base leading-none">{slot.label}</span>
                      {isExpressInterestAvailable ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[color:color-mix(in_srgb,var(--color-primary)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
                          <AlertCircle size={12} />
                          Ocupado
                        </span>
                      ) : null}
                    </div>
                    {isExpressInterestAvailable || isSubmitted ? (
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
                          {getInterestContextLabel(slot)}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {isSubmitted ? <CheckCircle2 size={13} className="theme-text-success" /> : <Bell size={13} className="theme-text-accent" />}
                          <p className={`text-xs ${isSubmitted ? 'theme-text-success' : 'theme-text-accent'}`}>
                            {getInterestActionLabel(slot)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1 text-xs text-transparent">.</div>
                    )}
                    {!isExpressInterestAvailable && !isSubmitted ? (
                      <div className="pt-0.5">
                        <p className={`text-xs ${selectedTimeSlot === slot.time ? 'text-white/80' : 'theme-text-secondary'}`}>
                          {slot.active ? 'Disponível agora' : 'Indisponível'}
                        </p>
                      </div>
                    ) : null}
                  </div>
                  {isCommonUnavailable && slot.motivo ? (
                    <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text-primary)] opacity-0 shadow-[var(--shadow-soft)] transition-opacity group-hover:opacity-100">
                      {slot.motivo}
                    </div>
                  ) : null}
                </button>
              );
            })()
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="mt-6" id="time-slot-section" ref={timeSlotRef}>
      <div className={`${stickyTitle ? `sticky z-20 bg-[var(--color-background)] py-2 ${stickyTopClassName}` : 'mb-4'} flex items-center`}>
        <Clock size={20} className="theme-text-accent mr-2" />
        <h3 className="theme-text-primary text-lg font-semibold">Selecione o Horário</h3>
      </div>
      
      {timeSlots.length === 0 ? (
        <div className="theme-panel-warning p-4">
          <p className="text-center">Não há horários disponíveis para a data selecionada.</p>
          <p className="mt-1 text-center text-sm">Por favor, selecione outra data.</p>
        </div>
      ) : (
        <div>
          {renderTimeSlotGroup(morningSlots, 'Manhã')}
          {renderTimeSlotGroup(afternoonSlots, 'Tarde')}
          {renderTimeSlotGroup(eveningSlots, 'Noite')}
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;