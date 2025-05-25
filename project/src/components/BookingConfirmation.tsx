import React from 'react';
import { Service, Appointment } from '../types';
import { Calendar, Clock, User, Mail, CheckCircle, Download, Smartphone } from 'lucide-react';

interface BookingConfirmationProps {
  appointment: Appointment;
  service: Service;
  onClose: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ 
  appointment, 
  service,
  onClose
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  const handleAddToCalendar = () => {
    const startDate = new Date(appointment.date);
    const [hours, minutes] = appointment.timeSlot.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes));

    // Calculate end time based on service duration
    const endDate = new Date(startDate);
    const durationMatch = service.duration.match(/(\d+)h\s*(\d+)?min|(\d+)min/);
    if (durationMatch) {
      const hours = parseInt(durationMatch[1] || '0');
      const minutes = parseInt(durationMatch[2] || durationMatch[3] || '0');
      endDate.setHours(endDate.getHours() + hours);
      endDate.setMinutes(endDate.getMinutes() + minutes);
    }

    // Create calendar event details
    const eventDetails = {
      title: service.name,
      description: `Agendamento com ${appointment.customerName}\n${service.description}`,
      location: appointment.isAtHome ? appointment.address : '',
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString()
    };

    // Generate calendar URLs
    const googleUrl = new URL('https://calendar.google.com/calendar/render');
    googleUrl.searchParams.append('action', 'TEMPLATE');
    googleUrl.searchParams.append('text', eventDetails.title);
    googleUrl.searchParams.append('details', eventDetails.description);
    googleUrl.searchParams.append('location', eventDetails.location);
    googleUrl.searchParams.append('dates', `${eventDetails.startTime.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${eventDetails.endTime.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`);

    // Open calendar in new tab
    window.open(googleUrl.toString(), '_blank');
  };

  return (
    <div className="text-center">
      <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Agendamento Confirmado!</h2>
      <p className="text-gray-600 mb-8">Seu compromisso foi agendado com sucesso.</p>
      
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6 shadow-sm">
        <h3 className="font-bold text-xl mb-4 text-indigo-800">{service.name}</h3>
        
        <div className="space-y-3 text-left">
          <div className="flex items-center">
            <Calendar size={18} className="text-indigo-600 mr-3 flex-shrink-0" />
            <span className="text-gray-700">{formatDate(appointment.date)}</span>
          </div>
          
          <div className="flex items-center">
            <Clock size={18} className="text-indigo-600 mr-3 flex-shrink-0" />
            <span className="text-gray-700">{appointment.timeSlot} ({service.duration})</span>
          </div>
          
          {appointment.isRecurring && appointment.recurringType && (
            <div className="flex items-center">
              <Calendar size={18} className="text-indigo-600 mr-3 flex-shrink-0" />
              <span className="text-gray-700">
                Agendamento recorrente: {appointment.recurringType === 'weekly' ? 'Semanal' : 'Mensal'}
              </span>
            </div>
          )}

          {appointment.isAtHome && (
            <div className="flex items-center">
              <Home size={18} className="text-indigo-600 mr-3 flex-shrink-0" />
              <div className="text-gray-700">
                <div className="font-medium">Atendimento a Domicílio</div>
                <div className="text-sm mt-1">{appointment.address}</div>
              </div>
            </div>
          )}
          
          <div className="flex items-center">
            <User size={18} className="text-indigo-600 mr-3 flex-shrink-0" />
            <span className="text-gray-700 font-medium">{appointment.customerName}</span>
          </div>
          
          <div className="flex items-center">
            <Mail size={18} className="text-indigo-600 mr-3 flex-shrink-0" />
            <span className="text-gray-700">{appointment.customerEmail}</span>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-indigo-100">
          <button 
            onClick={handleAddToCalendar}
            className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            <Download size={16} className="mr-1" />
            Adicionar ao Calendário
          </button>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 text-left border border-blue-100">
        <div className="flex">
          <div className="mr-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Smartphone size={24} className="text-blue-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <div className="bg-indigo-600 rounded-full p-1 mr-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="white"/>
                  <path d="M16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="#4F46E5"/>
                </svg>
              </div>
              <h4 className="font-bold text-blue-800 text-lg">Baixe o Aplicativo Buzke</h4>
            </div>
            <p className="text-blue-700 mb-3">
              Faça login com <span className="font-semibold">{appointment.customerEmail}</span> para acompanhar seu agendamento, 
              receber notificações e gerenciar todos os seus compromissos em um só lugar.
            </p>
            <div className="flex flex-wrap gap-3">
              <a 
                href="https://apps.apple.com/ar/app/buzke/id1622471470"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.5,12.5c0-0.9,0.5-1.7,1.3-2.2c-0.5-0.7-1.2-1.3-2.1-1.6c-0.9-0.3-1.7-0.4-2.5-0.4c-1.1,0-2.2,0.3-3.1,0.9
                  c-0.9,0.6-1.6,1.4-2,2.4c-0.4,1-0.5,2.1-0.3,3.1c0.2,1,0.7,2,1.4,2.7c0.7,0.7,1.6,1.2,2.6,1.4c1,0.2,2.1,0.1,3.1-0.3
                  c1-0.4,1.8-1.1,2.4-2C18.7,15.6,19,14.5,19,13.4C19,13.1,18.9,12.8,18.8,12.5C18.2,12.8,17.8,12.8,17.5,12.5z"/>
                </svg>
                App Store
              </a>
              <a 
                href="https://play.google.com/store/apps/details?id=com.buzke"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91,3.34,2.39,3.84,2.15C4.34,1.91,4.91,1.94,5.37,2.25L20.37,12.25C20.8,12.54,21,13.03,21,13.5
                  C21,13.97,20.8,14.46,20.37,14.75L5.37,24.75C4.91,25.06,4.34,25.09,3.84,24.85C3.34,24.61,3,24.09,3,23.5V20.5z"/>
                </svg>
                Google Play
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;