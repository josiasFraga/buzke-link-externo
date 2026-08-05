import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import BookingConfirmation from '../BookingConfirmation';
import { useCompanyStore } from '../../store/companyStore';
import { Appointment, Service, Voucher } from '../../types';

const baseService: Service = {
  id: '10',
  companyId: '20',
  name: 'Quadra de teste',
  description: 'Servico para teste',
  duration: '01:00:00',
  price: 100,
};

const appointmentWithMultipleSlots: Appointment = {
  id: '123',
  serviceId: '10',
  date: '2026-06-22',
  timeSlot: '10:00, 11:00',
  subtotalPrice: 200,
  totalPrice: 200,
  customerName: 'Cliente Teste',
  customerEmail: 'cliente@teste.com',
};

const appliedVoucher: Voucher = {
  id: 1,
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
  deleted_at: null,
  validade_inicio: '2026-01-01',
  validade_fim: '2026-12-31',
  codigo: 'DESC10',
  limite_uso: 100,
  ativo: true,
  tipo_desconto: 'P',
  valor_desconto: null,
  porcentagem_desconto: '10',
  apenas_agendamentos_novos: false,
  descricao: '10% de desconto',
};

describe('BookingConfirmation', () => {
  beforeEach(() => {
    useCompanyStore.setState({
      company: {
        id: '20',
        name: 'Empresa Teste',
        logo: '',
        coverPhoto: '',
        description: 'Descricao da empresa',
        media_avaliacoes: null,
        total_avaliacoes: '0',
      },
    });
  });

  it('exibe o total consolidado quando o agendamento possui multiplos horarios', () => {
    render(
      <BookingConfirmation
        appointment={appointmentWithMultipleSlots}
        service={baseService}
        appliedVoucher={null}
      />
    );

    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getByText('R$ 200.00')).toBeInTheDocument();
    expect(screen.getByText('10:00, 11:00 (01:00:00)')).toBeInTheDocument();
  });

  it('exibe subtotal riscado e total com desconto quando houver cupom aplicado', () => {
    render(
      <BookingConfirmation
        appointment={{
          ...appointmentWithMultipleSlots,
          subtotalPrice: 200,
          totalPrice: 180,
        }}
        service={baseService}
        appliedVoucher={appliedVoucher}
      />
    );

    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getByText('R$ 200.00')).toBeInTheDocument();
    expect(screen.getByText('R$ 180.00')).toBeInTheDocument();
    expect(screen.getByText('Cupom Aplicado: DESC10')).toBeInTheDocument();
  });
});
