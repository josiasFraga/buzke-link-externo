import React, { useRef, useEffect } from 'react';
import { TimeSlot } from '../types';
import { Clock } from 'lucide-react';

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedTimeSlot: string | null;
  onSelectTimeSlot: (timeSlotId: string) => void;
  isLoading?: boolean;
  stickyTitle?: boolean;
  stickyTopClassName?: string;
  autoScrollOnSelect?: boolean;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ 
  timeSlots, 
  selectedTimeSlot, 
  onSelectTimeSlot,
  isLoading = false,
  stickyTitle = false,
  stickyTopClassName = '',
  autoScrollOnSelect = true
}) => {
  const timeSlotRef = useRef<HTMLDivElement>(null);
  
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
            <button
              key={`${title}-${slot.time}-${slot.endTime}-${slot.duration}-${index}`}
              onClick={() => slot.active && onSelectTimeSlot(slot.time)}
              disabled={!slot.active}
              className={`
                py-2 px-3 rounded-lg text-center text-sm font-medium
                ${!slot.active 
                  ? 'bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)] cursor-not-allowed' 
                  : selectedTimeSlot === slot.time
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[color:color-mix(in_srgb,var(--color-primary)_14%,transparent)] text-[var(--color-text-primary)]'
                }
                transition-colors group relative
              `}
            >
              {slot.label}
              {!slot.active && slot.motivo && (
                <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text-primary)] opacity-0 shadow-[var(--shadow-soft)] transition-opacity group-hover:opacity-100">
                  {slot.motivo}
                </div>
              )}
            </button>
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