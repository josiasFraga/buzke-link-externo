import React, { useState, useEffect } from 'react';
import { Service, TimeSlot, AppointmentSlots, Appointment, Voucher } from '../types';
import useAuthStore from '../store/authStore';
import moment from '../utils/moment-pt-br';
import RecurringOptions from './Forms/RecurringOptions';
import HomeServiceOptions from './Forms/HomeServiceOptions';
import VoucherInput from './Forms/VoucherInput';
import { Calendar } from 'lucide-react';

interface ConfirmationStepProps {
  selectedService: Service;
  selectedDate: string;
  selectedTimeSlotData: TimeSlot;
  selectedProfessionalId: number | null;
  selectedSportId: number | null;
  selectedPetId: number | null;
  appointmentData: AppointmentSlots | null;
  onBookingComplete: (appointment: Appointment, voucher: Voucher | null) => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  selectedService,
  selectedDate,
  selectedTimeSlotData,
  selectedProfessionalId,
  selectedSportId,
  selectedPetId,
  appointmentData,
  onBookingComplete,
}) => {
  const { user, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voucher State
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccessMessage, setVoucherSuccessMessage] = useState<string | null>(null);
  
  // Recurring State
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDuration, setRecurringDuration] = useState('3M');

  // At Home State
  const [isAtHome, setIsAtHome] = useState(selectedTimeSlotData?.only_at_home || false);
  const [address, setAddress] = useState('');

  const [totalPrice, setTotalPrice] = useState(selectedTimeSlotData.default_value);

  useEffect(() => {
    let currentPrice = selectedTimeSlotData.default_value;
    if (appliedVoucher) {
      if (appliedVoucher.tipo_desconto === 'P' && appliedVoucher.porcentagem_desconto) {
        currentPrice -= currentPrice * (parseFloat(appliedVoucher.porcentagem_desconto) / 100);
      } else if (appliedVoucher.tipo_desconto === 'V' && appliedVoucher.valor_desconto) {
        currentPrice -= parseFloat(appliedVoucher.valor_desconto);
      }
    }
    setTotalPrice(Math.max(0, currentPrice));
  }, [selectedTimeSlotData, appliedVoucher]);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setIsApplyingVoucher(true);
    setVoucherError(null);
    setVoucherSuccessMessage(null);
    if (!token) {
      setVoucherError("Você precisa estar logado para aplicar um cupom.");
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/vouchers/validate?code=${voucherCode}&business_id=${selectedService.companyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Cupom inválido');
      setAppliedVoucher(data);
      setVoucherSuccessMessage(data.descricao || 'Cupom aplicado!');
    } catch (err) {
      setVoucherError(err instanceof Error ? err.message : 'Erro ao aplicar cupom.');
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!user || !token) {
      setError("Você precisa estar logado para agendar.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const [hours, minutes] = selectedTimeSlotData.time.split(':');
      const appointmentDate = moment(selectedDate).hours(parseInt(hours)).minutes(parseInt(minutes)).format();

      const selectedProfessional = appointmentData?.profissionais?.find(
        prof => prof.id === selectedProfessionalId
      );

      const payload: any = {
        cliente_id: parseInt(selectedService.companyId),
        servico_id: parseInt(selectedService.id),
        horario: appointmentDate,
        domicilio: isAtHome ? 'Y' : 'N',
        endereco: isAtHome ? address : undefined,
        ...(isRecurring && {
          ilimitado: recurringDuration === '12M' ? 'Y' : 'N',
          limite: recurringDuration !== '12M' ? recurringDuration : undefined,
        }),
        ...(selectedProfessional && { profissional_id: selectedProfessional.usuario.id }),
        ...(selectedSportId && { subcategoria_id: selectedSportId }),
        ...(selectedPetId && { pet_id: selectedPetId }),
        ...(appliedVoucher && { vouchersIds: [appliedVoucher.id] }),
        valor_final: totalPrice,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/appointments/create-from-external-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao criar agendamento');

      const newAppointment: Appointment = {
        id: data.id.toString(),
        serviceId: selectedService.id,
        date: selectedDate,
        timeSlot: selectedTimeSlotData.time,
        customerName: user.nome,
        customerEmail: user.email,
        isRecurring,
        isAtHome,
        address: isAtHome ? address : undefined,
        professionalId: selectedProfessional?.usuario.id,
        sportId: selectedSportId || undefined,
        pet_id: selectedPetId || undefined,
        vouchersIds: appliedVoucher ? [appliedVoucher.id] : undefined,
      };
      onBookingComplete(newAppointment, appliedVoucher);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {selectedTimeSlotData?.enable_fixed_scheduling && (
        <RecurringOptions isRecurring={isRecurring} recurringDuration={recurringDuration} onRecurringChange={setIsRecurring} onDurationChange={setRecurringDuration} fixedType={selectedTimeSlotData?.fixed_type} />
      )}
      {selectedTimeSlotData?.at_home && (
        <HomeServiceOptions isAtHome={isAtHome} address={address} onAtHomeChange={setIsAtHome} onAddressChange={setAddress} isRequired={selectedTimeSlotData?.only_at_home} error={!isAtHome && selectedTimeSlotData.only_at_home ? 'Endereço é obrigatório' : ''} />
      )}
      <VoucherInput voucherCode={voucherCode} onVoucherCodeChange={setVoucherCode} onApplyVoucher={handleApplyVoucher} isLoading={isApplyingVoucher} error={voucherError} successMessage={voucherSuccessMessage} />
      
      <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
        <div className="flex items-start">
          <Calendar size={20} className="text-indigo-600 mr-3 mt-0.5" />
          <div>
            <h4 className="font-bold text-gray-800">{selectedService.name}</h4>
            <p className="text-sm text-gray-600 mt-1">
              {moment(selectedDate).format('dddd, DD [de] MMMM [de] YYYY')} às {selectedTimeSlotData.time}
            </p>
            <div className="mt-2">
              {appliedVoucher ? (
                <div className="flex items-center gap-2">
                  <span className="line-through text-gray-500">R$ {selectedTimeSlotData.default_value.toFixed(2)}</span>
                  <span className="text-lg font-medium text-green-600">R$ {totalPrice.toFixed(2)}</span>
                </div>
              ) : (
                <p className="text-lg font-medium text-indigo-600">R$ {totalPrice.toFixed(2)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      <button onClick={handleConfirmBooking} disabled={isLoading} className="w-full py-3 px-4 rounded-lg text-white font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors">
        {isLoading ? 'Confirmando...' : 'Concluir Agendamento'}
      </button>
    </div>
  );
};

export default ConfirmationStep;