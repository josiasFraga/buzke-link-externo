'use client';

import React, { useEffect, useState } from 'react';
import { AppointmentSlots, Company, Service, TimeSlot } from '../types';
import CompanyProfile from './CompanyProfile';
import ServicesList from './Services/ServicesList';
import BookingModal from './BookingModal';
import LoadingScreen from './LoadingScreen';
import { useCompanyStore } from '../store/companyStore';
import { buildPublicApiUrl } from '../lib/public-api';

interface CompanyBookingPageClientProps {
  company: Company;
  initialServices: Service[];
  initialSelectedDate: string;
}

function CompanyBookingPageClient({ company, initialServices, initialSelectedDate }: CompanyBookingPageClientProps) {
  const { setCompany, clearCompany } = useCompanyStore();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedTimeSlotData, setSelectedTimeSlotData] = useState<TimeSlot | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentSlots | null>(null);

  useEffect(() => {
    setCompany(company);

    return () => {
      clearCompany();
    };
  }, [clearCompany, company, setCompany]);

  useEffect(() => {
    if (!selectedDate || !selectedService) {
      return;
    }

    const [year, month, day] = selectedDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    fetch(buildPublicApiUrl(`/services/data-to-appointment?servico_id=${selectedService.id}&data=${formattedDate}`))
      .then((response) => response.json())
      .then((data: AppointmentSlots) => {
        setTimeSlots(data.horarios || []);
        setAppointmentData(data);
      })
      .catch((error) => {
        console.error('Error fetching time slots:', error);
        setTimeSlots([]);
        setAppointmentData(null);
      });
  }, [selectedDate, selectedService]);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
    setTimeSlots([]);
    setSelectedTimeSlot(null);
    setSelectedTimeSlotData(null);
    setAppointmentData(null);
    setSelectedDate(initialSelectedDate);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setTimeSlots([]);
    setSelectedTimeSlot(null);
    setSelectedTimeSlotData(null);
    setAppointmentData(null);
  };

  const handleSelectTimeSlot = (timeSlotId: string) => {
    setSelectedTimeSlot(timeSlotId);
    const timeSlotData = timeSlots.find((slot) => slot.time === timeSlotId);
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

  if (!company) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyProfile company={company}>
        <ServicesList
          companyId={company.id}
          onSelectService={handleSelectService}
          initialServices={initialServices}
          initialSelectedDate={initialSelectedDate}
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

export default CompanyBookingPageClient;
