import React, { useRef } from 'react';
import { Service, TimeSlot, AppointmentSlots } from '../types';
import Modal from './Modal';
import BookingFlow from './BookingFlow';

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
  const modalRef = useRef<HTMLDivElement>(null);
  
  const handleCloseAndReset = () => {
    onClose();
  };

  if (!selectedService) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleCloseAndReset} title="Agendar Compromisso" modalRef={modalRef}>
      <BookingFlow
        key={selectedService.id}
        selectedService={selectedService}
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlot}
        selectedTimeSlotData={selectedTimeSlotData}
        timeSlots={timeSlots}
        onSelectDate={onSelectDate}
        onSelectTimeSlot={onSelectTimeSlot}
        onDateSelected={onDateSelected}
        appointmentData={appointmentData}
        containerRef={modalRef}
      />
    </Modal>
  );
};

export default BookingModal;