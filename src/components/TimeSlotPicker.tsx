import React, { useRef, useEffect } from 'react';
import { TimeSlot } from '../types';
import { Clock } from 'lucide-react';

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedTimeSlot: string | null;
  onSelectTimeSlot: (timeSlotId: string) => void;
  isLoading?: boolean;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ 
  timeSlots, 
  selectedTimeSlot, 
  onSelectTimeSlot,
  isLoading = false
}) => {
  const timeSlotRef = useRef<HTMLDivElement>(null);
  
  // Scroll to professional selector when time slot is selected
  useEffect(() => {
    if (selectedTimeSlot) {
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
  }, [selectedTimeSlot]);
  
  if (isLoading) {
    return (
      <div className="mt-6" id="time-slot-section" ref={timeSlotRef}>
        <div className="flex items-center mb-4">
          <Clock size={20} className="text-indigo-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Selecione o Horário</h3>
        </div>
        <div className="animate-pulse">
          {/* Morning slots */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 w-16 rounded mb-2"></div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
          
          {/* Afternoon slots */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 w-16 rounded mb-2"></div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
          
          {/* Evening slots */}
          <div className="mb-4">
            <div className="h-4 bg-gray-200 w-16 rounded mb-2"></div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
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
        <h4 className="text-sm font-medium text-gray-500 mb-2">{title}</h4>
        <div className="grid grid-cols-3 gap-2">
          {slots.map(slot => (
            <button
              key={slot.time}
              onClick={() => slot.active && onSelectTimeSlot(slot.time)}
              disabled={!slot.active}
              className={`
                py-2 px-3 rounded-lg text-center text-sm font-medium
                ${!slot.active 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : selectedTimeSlot === slot.time
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700'
                }
                transition-colors group relative
              `}
            >
              {slot.label}
              {!slot.active && slot.motivo && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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
      <div className="flex items-center mb-4">
        <Clock size={20} className="text-indigo-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">Selecione o Horário</h3>
      </div>
      
      {timeSlots.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
          <p className="text-center">Não há horários disponíveis para a data selecionada.</p>
          <p className="text-center text-sm mt-1">Por favor, selecione outra data.</p>
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