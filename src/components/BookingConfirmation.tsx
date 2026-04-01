import React from 'react';
import { Service, Appointment, Voucher } from '../types';
import { Calendar, Clock, User, Mail, CheckCircle, Download, Smartphone, Home, Tag } from 'lucide-react';
import moment from '../utils/moment-pt-br';
import { useCompanyStore } from '../store/companyStore';
import { AppleLogo, GooglePlayLogo } from './Icons/StoreIcons';


interface BookingConfirmationProps {
  appointment: Appointment;
  service: Service;
  appliedVoucher: Voucher | null;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  appointment,
  service,
  appliedVoucher
}) => {

  const { company } = useCompanyStore();

  // Format date for display
  const formatDate = (dateString: string) => {
    return moment(dateString).format('dddd, DD [de] MMMM [de] YYYY');
  };

  const handleAddToCalendar = () => {
    // Crie a data no formato ISO local (sem fuso UTC)
    const dateTimeString = `${appointment.date}T${appointment.timeSlot}`;
    const startDate = new Date(dateTimeString);

    // Calcular o horário final baseado na duração do serviço
    const endDate = new Date(startDate);
    const durationMatch = service.duration.match(/(\d+)h|(\d+)h\s*(\d+)?min|(\d+)min/);
    if (durationMatch) {
      const hours = parseInt(durationMatch[1] || '0');
      const minutes = parseInt(durationMatch[2] || durationMatch[3] || '0');
      endDate.setHours(endDate.getHours() + hours);
      endDate.setMinutes(endDate.getMinutes() + minutes);
    }

    const businessLocation = company && company.address
      ? `${company.address.street}, ${company.address.number}, ${company.address.neighborhood}, ${company.address.city} - ${company.address.state}`
      : '';

    const eventDetails = {
      title: `${company?.name} ${service.name}`,
      description: `Agendamento com ${appointment.customerName}\n${service.description}`,
      location: appointment.isAtHome ? appointment.address : businessLocation,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString()
    };

    const googleUrl = new URL('https://calendar.google.com/calendar/render');
    googleUrl.searchParams.append('action', 'TEMPLATE');
    googleUrl.searchParams.append('text', eventDetails.title);
    googleUrl.searchParams.append('details', eventDetails.description);
    googleUrl.searchParams.append('location', eventDetails.location || '');
    googleUrl.searchParams.append(
      'dates',
      `${eventDetails.startTime.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${eventDetails.endTime.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`
    );

    window.open(googleUrl.toString(), '_blank');
  };

  const calculateDiscountedPrice = (price: number, voucher: Voucher | null) => {
    if (!voucher) return price;
    if (voucher.tipo_desconto === 'P' && voucher.porcentagem_desconto) {
      return price - price * (parseFloat(voucher.porcentagem_desconto) / 100);
    }
    if (voucher.tipo_desconto === 'V' && voucher.valor_desconto) {
      return price - parseFloat(voucher.valor_desconto);
    }
    return price;
  };

  const finalPrice = calculateDiscountedPrice(service.price, appliedVoucher);

  return (
    <div className="text-center">
      <div className="theme-panel-success mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <CheckCircle className="theme-text-success h-10 w-10" />
      </div>
      
      <h2 className="theme-text-primary mb-2 text-2xl font-bold">Agendamento Confirmado!</h2>
      <p className="theme-text-secondary mb-8">Seu compromisso foi agendado com sucesso.</p>
      
      <div className="theme-panel-accent mb-6 p-6 text-left shadow-sm">
        <h3 className="theme-text-primary mb-4 text-xl font-bold">{service.name}</h3>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <Calendar size={18} className="theme-text-accent mr-3 flex-shrink-0" />
            <span className="theme-text-secondary">{formatDate(appointment.date)}</span>
          </div>
          
          <div className="flex items-center">
            <Clock size={18} className="theme-text-accent mr-3 flex-shrink-0" />
            <span className="theme-text-secondary">{appointment.timeSlot} ({service.duration})</span>
          </div>
          
          {appointment.isRecurring && appointment.recurringType && (
            <div className="flex items-center">
              <Calendar size={18} className="theme-text-accent mr-3 flex-shrink-0" />
              <span className="theme-text-secondary">
                Agendamento recorrente: {appointment.recurringType === 'weekly' ? 'Semanal' : 'Mensal'}
              </span>
            </div>
          )}

          {appointment.isAtHome && (
            <div className="flex items-center">
              <Home size={18} className="theme-text-accent mr-3 flex-shrink-0" />
              <div className="theme-text-secondary">
                <div className="theme-text-primary font-medium">Atendimento a Domicílio</div>
                <div className="mt-1 text-sm">{appointment.address}</div>
              </div>
            </div>
          )}
          
          {appointment.customerName && <div className="flex items-center">
            <User size={18} className="theme-text-accent mr-3 flex-shrink-0" />
            <span className="theme-text-primary font-medium">{appointment.customerName}</span>
          </div>}
          
          <div className="flex items-center">
            <Mail size={18} className="theme-text-accent mr-3 flex-shrink-0" />
            <span className="theme-text-secondary">{appointment.customerEmail}</span>
          </div>

          {appliedVoucher && (
            <div className="mt-3 flex items-center border-t border-[var(--color-border)] pt-3">
              <Tag size={18} className="theme-text-success mr-3 flex-shrink-0" />
              <div>
                <p className="theme-text-success font-medium">Cupom Aplicado: {appliedVoucher.codigo}</p>
                <p className="theme-text-secondary text-sm">{appliedVoucher.descricao}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 border-t border-[var(--color-border)] pt-4">
            <div className="flex justify-between items-center">
              <span className="theme-text-secondary text-lg font-medium">Total:</span>
              {appliedVoucher ? (
                <div className="text-right">
                  <p className="theme-text-muted line-through">R$ {service.price.toFixed(2)}</p>
                  <p className="theme-text-success text-2xl font-bold">R$ {finalPrice.toFixed(2)}</p>
                </div>
              ) : (
                <p className="theme-text-accent text-2xl font-bold">R$ {service.price.toFixed(2)}</p>
              )}
            </div>
          </div>

        <div className="mt-6 border-t border-[var(--color-border)] pt-6">
          <button
            onClick={handleAddToCalendar}
            className="theme-text-accent flex items-center text-sm font-medium transition-opacity hover:opacity-80"
          >
            <Download size={16} className="mr-1" />
            Adicionar ao Calendário
          </button>
        </div>
      </div>
      
      <div className="theme-card mb-6 border-[var(--color-border)] p-6 text-left">
        <div className="flex">
          <div className="mr-4">
            <div className="theme-panel-accent flex h-12 w-12 items-center justify-center rounded-full">
              <Smartphone size={24} className="theme-text-accent" />
            </div>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <div className="theme-gradient-accent mr-2 rounded-full p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="white"/>
                  <path d="M16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="#4F46E5"/>
                </svg>
              </div>
              <h4 className="theme-text-primary text-lg font-bold">Baixe o Aplicativo Buzke</h4>
            </div>
            <p className="theme-text-secondary mb-3">
              Faça login com <span className="font-semibold">{appointment.customerEmail}</span> para acompanhar seu agendamento, 
              receber notificações e gerenciar todos os seus compromissos em um só lugar.
            </p>
            <div className="flex flex-wrap gap-3">
              <a 
                href="https://apps.apple.com/ar/app/buzke/id1622471470"
                target="_blank"
                rel="noopener noreferrer"
                className="theme-secondary-btn px-4 py-2"
              >
                <AppleLogo size={20} className="mr-2" />
                App Store
              </a>
              <a 
                href="https://play.google.com/store/apps/details?id=com.buzke"
                target="_blank"
                rel="noopener noreferrer"
                className="theme-secondary-btn px-4 py-2"
              >
                <GooglePlayLogo size={20} className="mr-2" />
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