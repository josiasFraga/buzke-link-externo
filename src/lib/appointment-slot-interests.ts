import { AppointmentSlotInterestType } from '../types';
import { buildPublicApiUrl } from './public-api';

interface CreateAppointmentSlotInterestParams {
  token: string;
  appointmentId: number;
  tipoInteresse: AppointmentSlotInterestType;
  dataSlot: string;
  horaInicio: string;
  duracao: string;
}

interface CreateAppointmentSlotInterestPayload {
  tipo_interesse: AppointmentSlotInterestType;
  canal_origem: 'link_externo';
  data_slot: string;
  hora_inicio: string;
  duracao: string;
}

function getApiErrorMessage(data: unknown, fallbackMessage: string) {
  if (!data || typeof data !== 'object') {
    return fallbackMessage;
  }

  const message = Reflect.get(data, 'message');

  if (Array.isArray(message)) {
    return message.filter((item): item is string => typeof item === 'string').join(' ');
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  return fallbackMessage;
}

export function buildAppointmentSlotInterestKey(dataSlot: string, horaInicio: string, duracao: string) {
  return `${dataSlot}__${horaInicio}__${duracao}`;
}

export async function createAppointmentSlotInterest({
  token,
  appointmentId,
  tipoInteresse,
  dataSlot,
  horaInicio,
  duracao,
}: CreateAppointmentSlotInterestParams) {
  const payload: CreateAppointmentSlotInterestPayload = {
    tipo_interesse: tipoInteresse,
    canal_origem: 'link_externo',
    data_slot: dataSlot,
    hora_inicio: horaInicio,
    duracao,
  };

  const response = await fetch(
    buildPublicApiUrl(`/appointment-slot-interests/appointments/${appointmentId}`),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, 'Não foi possível registrar seu interesse nesse horário.'));
  }

  return data;
}
