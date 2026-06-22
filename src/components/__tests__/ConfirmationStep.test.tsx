import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import ConfirmationStep from '../ConfirmationStep';
import useAuthStore from '../../store/authStore';
import { AppointmentSlots, Service, TimeSlot } from '../../types';

const baseService: Service = {
  id: '10',
  companyId: '20',
  name: 'Quadra de teste',
  description: 'Servico para teste',
  duration: '01:00:00',
  price: 100,
};

const baseTimeSlot: TimeSlot = {
  time: '10:00',
  duration: '01:00:00',
  endTime: '11:00',
  label: '10:00 - 11:00',
  default_value: 100,
  fixed_value: 90,
  default_value_old: 0,
  fixed_value_old: null,
  at_home: false,
  only_at_home: false,
  enable_fixed_scheduling: true,
  fixed_type: 'weekly',
  have_promotion: false,
  availableProfessionals: [],
  active: true,
};

const baseAppointmentData: AppointmentSlots = {
  origem: 'external-link',
  tipo: 'Quadra',
  is_court: true,
  selecao_pet: false,
  localidade: 'empresa',
  prazo_cancelamento: '24h',
  profissionais: [],
  subcategorias: [],
  horarios: [baseTimeSlot],
};

describe('ConfirmationStep', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: 'test-token',
      isAuthenticated: true,
      user: {
        id: 1,
        nome: 'Cliente Teste',
        email: 'cliente@teste.com',
        usuario: 'cliente',
        img: null,
        telefone: '11999999999',
        telefone_validado: 1,
        telefone_ddi: '55',
        pais: 'Brasil',
        cliente_id: 1,
      },
    });
  });

  it('exibe as opções de agendamento fixo quando o slot permite recorrência', () => {
    render(
      <ConfirmationStep
        selectedService={baseService}
        selectedDate="2026-06-22"
        selectedTimeSlotData={baseTimeSlot}
        selectedProfessionalId={null}
        selectedProfessionalUserId={null}
        selectedSportId={null}
        selectedSubcategoryId={null}
        selectedPetId={null}
        appointmentData={baseAppointmentData}
        onBookingComplete={() => undefined}
      />
    );

    expect(screen.getByRole('heading', { name: /agendamento fixo/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/sim, tornar este agendamento fixo/i)).toBeInTheDocument();
  });

  it('não exibe as opções de agendamento fixo quando o slot não permite recorrência', () => {
    render(
      <ConfirmationStep
        selectedService={baseService}
        selectedDate="2026-06-22"
        selectedTimeSlotData={{ ...baseTimeSlot, enable_fixed_scheduling: false }}
        selectedProfessionalId={null}
        selectedProfessionalUserId={null}
        selectedSportId={null}
        selectedSubcategoryId={null}
        selectedPetId={null}
        appointmentData={baseAppointmentData}
        onBookingComplete={() => undefined}
      />
    );

    expect(screen.queryByRole('heading', { name: /agendamento fixo/i })).not.toBeInTheDocument();
  });
});
