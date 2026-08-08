import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TimeSlotPicker from '../TimeSlotPicker';
import { TimeSlot } from '../../types';

const makeSlot = (time: string, endTime: string): TimeSlot => ({
  time,
  duration: '01:00:00',
  endTime,
  label: `${time} - ${endTime}`,
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
});

describe('TimeSlotPicker', () => {
  it('desabilita horários que sobrepõem um horário selecionado', () => {
    const selectedSlot = makeSlot('10:00', '11:00');
    const conflictingSlot = makeSlot('10:15', '11:15');
    const availableSlot = makeSlot('11:00', '12:00');
    const onToggleTimeSlot = vi.fn();

    render(
      <TimeSlotPicker
        timeSlots={[selectedSlot, conflictingSlot, availableSlot]}
        selectedTimeSlots={[selectedSlot]}
        onToggleTimeSlot={onToggleTimeSlot}
        autoScrollOnSelect={false}
      />
    );

    const selectedButton = screen.getByRole('button', { name: /10:00 - 11:00/i });
    const conflictingButton = screen.getByRole('button', { name: /10:15 - 11:15/i });
    const availableButton = screen.getByRole('button', { name: /11:00 - 12:00/i });

    expect(selectedButton).not.toBeDisabled();
    expect(conflictingButton).toBeDisabled();
    expect(availableButton).not.toBeDisabled();
    expect(screen.getByText(/conflita com horário selecionado/i)).toBeInTheDocument();

    fireEvent.click(conflictingButton);
    fireEvent.click(availableButton);

    expect(onToggleTimeSlot).toHaveBeenCalledTimes(1);
    expect(onToggleTimeSlot).toHaveBeenCalledWith('11:00');
  });
});
