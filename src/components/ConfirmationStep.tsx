import React, { useEffect, useMemo, useState } from 'react';
import { Appointment, AppointmentPaymentMethod, LessonType, Service, TeacherLessonTypePrice, TimeSlot, Voucher } from '../types';
import useAuthStore from '../store/authStore';
import moment from '../utils/moment-pt-br';
import RecurringOptions from './Forms/RecurringOptions';
import HomeServiceOptions from './Forms/HomeServiceOptions';
import VoucherInput from './Forms/VoucherInput';
import { Calendar } from 'lucide-react';
import { buildPublicApiUrl } from '../lib/public-api';

interface ConfirmationStepProps {
  selectedService: Service;
  selectedDate: string;
  selectedTimeSlots: TimeSlot[];
  selectedProfessionalUserId: number | null;
  selectedSportId: number | null;
  selectedSubcategoryId: number | null;
  selectedPetId: number | null;
  selectedLessonType: LessonType | null;
  selectedLessonTypePrice: TeacherLessonTypePrice | null;
  isLessonBooking?: boolean;
  onBookingComplete: (appointment: Appointment, voucher: Voucher | null) => void;
}

interface AppointmentCreatePayload {
  cliente_id: number;
  servico_id: number;
  horario?: string;
  horarios?: string[];
  duracao: string;
  domicilio: 'Y' | 'N';
  endereco?: string;
  ilimitado?: 'Y' | 'N';
  limite?: string;
  profissional_id?: number;
  subcategoria_id?: number;
  pet_id?: number;
  vouchersIds?: number[];
  agendamento_aula?: boolean;
  cliente_aula_tipo_id?: number;
  selectedSport?: number;
  valor_final: number;
}

interface AppointmentCreateResponse {
  id: number;
  message?: string;
  ids?: number[];
  payment_id?: number | null;
  appointment_status?: string;
  payment_required?: boolean;
  payment_percentage?: number | null;
  required_payment_amount?: number | string | null;
  payment_gateway?: string | null;
  accepted_payment_methods?: Array<'pix' | 'cartao' | string>;
  reserva_expira_em?: string | null;
  reservation_expires_at?: string | null;
}

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizePaymentMethods(methods: AppointmentCreateResponse['accepted_payment_methods']): AppointmentPaymentMethod[] {
  const normalizedMethods = (methods || [])
    .map((method) => String(method).trim().toLowerCase())
    .map((method): AppointmentPaymentMethod | null => {
      if (method === 'pix') {
        return 'pix';
      }

      if (method === 'cartao' || method === 'cartão' || method === 'card' || method === 'credit_card') {
        return 'cartao';
      }

      return null;
    })
    .filter((method): method is AppointmentPaymentMethod => Boolean(method));

  return normalizedMethods.length ? normalizedMethods : ['pix'];
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  selectedService,
  selectedDate,
  selectedTimeSlots,
  selectedProfessionalUserId,
  selectedSportId,
  selectedSubcategoryId,
  selectedPetId,
  selectedLessonType,
  selectedLessonTypePrice,
  isLessonBooking = false,
  onBookingComplete,
}) => {
  const { user, token } = useAuthStore();
  const referenceTimeSlot = selectedTimeSlots[0] ?? null;
  const allSelectedSlotsAllowFixed = selectedTimeSlots.length > 0 && selectedTimeSlots.every((slot) => Boolean(slot.enable_fixed_scheduling));
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
  const [recurringDuration, setRecurringDuration] = useState('1M');

  // At Home State
  const [isAtHome, setIsAtHome] = useState(referenceTimeSlot?.only_at_home || false);
  const [address, setAddress] = useState('');

  const basePrice = useMemo(() => {
    if (selectedTimeSlots.length === 0) {
      return 0;
    }

    if (isLessonBooking && selectedLessonType && selectedLessonTypePrice) {
      const lessonSlotPrice = isRecurring
        ? (selectedLessonTypePrice.valor_fixo || selectedLessonTypePrice.valor)
        : selectedLessonTypePrice.valor;

      return selectedTimeSlots.reduce((total) => total + lessonSlotPrice, 0);
    }

    return selectedTimeSlots.reduce((total, slot) => {
      const slotPrice = isRecurring ? (slot.fixed_value ?? slot.default_value) : slot.default_value;
      return total + slotPrice;
    }, 0);
  }, [isLessonBooking, isRecurring, selectedLessonType, selectedLessonTypePrice, selectedTimeSlots]);

  const [totalPrice, setTotalPrice] = useState(basePrice);

  useEffect(() => {
    let currentPrice = basePrice;
    if (appliedVoucher) {
      if (appliedVoucher.tipo_desconto === 'P' && appliedVoucher.porcentagem_desconto) {
        currentPrice -= currentPrice * (parseFloat(appliedVoucher.porcentagem_desconto) / 100);
      } else if (appliedVoucher.tipo_desconto === 'V' && appliedVoucher.valor_desconto) {
        currentPrice -= parseFloat(appliedVoucher.valor_desconto);
      }
    }
    setTotalPrice(Math.max(0, currentPrice));
  }, [appliedVoucher, basePrice]);

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
      const response = await fetch(buildPublicApiUrl(`/vouchers/validate?code=${voucherCode}&business_id=${selectedService.companyId}`), {
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

    if (isLessonBooking && !selectedLessonType) {
      setError('Selecione o tipo de aula para continuar.');
      return;
    }

    if (isLessonBooking && !selectedLessonTypePrice) {
      setError('Não encontramos preço para este tipo de aula com o professor selecionado.');
      return;
    }

    if (!referenceTimeSlot || selectedTimeSlots.length === 0) {
      setError('Selecione pelo menos um horário para continuar.');
      return;
    }

    if (isRecurring && !allSelectedSlotsAllowFixed) {
      setError('Todos os horários selecionados precisam permitir agendamento fixo.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const appointmentDates = selectedTimeSlots.map((slot) => {
        const [hours, minutes] = slot.time.split(':');
        return moment(selectedDate).hours(parseInt(hours)).minutes(parseInt(minutes)).format();
      });
      const appointmentDate = appointmentDates[0];

      const professionalUserId = selectedProfessionalUserId ?? null;

      const payload: AppointmentCreatePayload = {
        cliente_id: parseInt(selectedService.companyId),
        servico_id: parseInt(selectedService.id),
        horario: appointmentDate,
        horarios: appointmentDates,
        duracao: referenceTimeSlot.duration,
        domicilio: isAtHome ? 'Y' : 'N',
        endereco: isAtHome ? address : undefined,
        ...(isRecurring && {
          ilimitado: recurringDuration === '12M' ? 'Y' : 'N',
          limite: recurringDuration !== '12M' ? recurringDuration : undefined,
        }),
        ...(professionalUserId && { profissional_id: professionalUserId }),
        agendamento_aula: isLessonBooking,
        ...(isLessonBooking && selectedLessonType ? { cliente_aula_tipo_id: selectedLessonType.id } : {}),
        ...(selectedSubcategoryId && { selectedSport: selectedSubcategoryId, subcategoria_id: selectedSubcategoryId }),
        ...(selectedPetId && { pet_id: selectedPetId }),
        ...(appliedVoucher && { vouchersIds: [appliedVoucher.id] }),
        valor_final: totalPrice,
      };

      const response = await fetch(buildPublicApiUrl('/appointments/create-from-external-link'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data: AppointmentCreateResponse = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao criar agendamento');

      const paymentRequired = Boolean(data.payment_required && data.payment_id);

      const newAppointment: Appointment = {
        id: data.id.toString(),
        ids: data.ids,
        serviceId: selectedService.id,
        date: selectedDate,
        timeSlot: selectedTimeSlots.map((slot) => slot.time).join(', '),
        subtotalPrice: basePrice,
        totalPrice,
        customerName: user.nome,
        customerEmail: user.email,
        isRecurring,
        isLessonBooking,
        isAtHome,
        address: isAtHome ? address : undefined,
        professionalId: selectedProfessionalUserId ?? undefined,
        sportId: selectedSportId ?? undefined,
        pet_id: selectedPetId ?? undefined,
        vouchersIds: appliedVoucher ? [appliedVoucher.id] : undefined,
        payment: paymentRequired
          ? {
              paymentId: Number(data.payment_id),
              required: true,
              amount: toNumber(data.required_payment_amount),
              percentage: data.payment_percentage ?? null,
              gateway: data.payment_gateway ?? null,
              acceptedMethods: normalizePaymentMethods(data.accepted_payment_methods),
              appointmentStatus: data.appointment_status,
              reservationExpiresAt: data.reservation_expires_at ?? data.reserva_expira_em ?? null,
            }
          : null,
      };
      onBookingComplete(newAppointment, appliedVoucher);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="confirmation-step-section" className="space-y-6">
      {allSelectedSlotsAllowFixed && referenceTimeSlot && (
        <RecurringOptions isRecurring={isRecurring} recurringDuration={recurringDuration} onRecurringChange={setIsRecurring} onDurationChange={setRecurringDuration} fixedType={referenceTimeSlot.fixed_type} />
      )}
      {referenceTimeSlot?.at_home && (
        <HomeServiceOptions isAtHome={isAtHome} address={address} onAtHomeChange={setIsAtHome} onAddressChange={setAddress} isRequired={referenceTimeSlot.only_at_home} error={!isAtHome && referenceTimeSlot.only_at_home ? 'Endereço é obrigatório' : ''} />
      )}
      <VoucherInput voucherCode={voucherCode} onVoucherCodeChange={setVoucherCode} onApplyVoucher={handleApplyVoucher} isLoading={isApplyingVoucher} error={voucherError} successMessage={voucherSuccessMessage} />
      
      <div className="theme-panel-accent mt-6 p-4">
        <div className="flex items-start">
          <Calendar size={20} className="theme-text-accent mr-3 mt-0.5" />
          <div>
            <h4 className="theme-text-primary font-bold">{selectedService.name}</h4>
            <p className="theme-text-secondary mt-1 text-sm">
              {moment(selectedDate).format('dddd, DD [de] MMMM [de] YYYY')} às {selectedTimeSlots.map((slot) => slot.time).join(', ')}
            </p>
            {isLessonBooking && selectedLessonType ? (
              <p className="theme-text-secondary mt-1 text-sm">{selectedLessonType.nome}</p>
            ) : null}
            <div className="mt-2">
              {appliedVoucher ? (
                <div className="flex items-center gap-2">
                  <span className="theme-text-muted line-through">R$ {basePrice.toFixed(2)}</span>
                  <span className="theme-text-success text-lg font-medium">R$ {totalPrice.toFixed(2)}</span>
                </div>
              ) : (
                <p className="theme-text-accent text-lg font-medium">R$ {totalPrice.toFixed(2)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && <p className="theme-text-danger mt-2 text-sm">{error}</p>}

      <button onClick={handleConfirmBooking} disabled={isLoading} className="theme-primary-btn w-full px-4 py-3 font-medium">
        {isLoading ? 'Confirmando...' : 'Concluir Agendamento'}
      </button>
    </div>
  );
};

export default ConfirmationStep;