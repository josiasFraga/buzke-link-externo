import React from 'react';
import { Repeat } from 'lucide-react';

interface RecurringOptionsProps {
  isRecurring: boolean;
  recurringDuration: string;
  onRecurringChange: (value: boolean) => void;
  onDurationChange: (value: string) => void;
  fixedType?: string;
}

const RECURRING_DURATION_OPTIONS = [
  { label: "3 Meses", value: "3M" },
  { label: "6 Meses", value: "6M" },
  { label: "9 Meses", value: "9M" },
  { label: "Ilimitado", value: "12M" },
];

const RecurringOptions: React.FC<RecurringOptionsProps> = ({
  isRecurring,
  recurringDuration,
  onRecurringChange,
  onDurationChange,
  fixedType
}) => {
  return (
    <div className="theme-panel-accent p-4">
      <div className="flex items-start mb-3">
        <Repeat size={20} className="theme-text-accent mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="theme-text-primary font-medium">Agendamento Fixo</h4>
          <p className="theme-text-accent mt-1 text-sm">
            Deseja que este agendamento se repita automaticamente?
          </p>
        </div>
      </div>

      <div className="flex items-center mb-3">
        <input
          type="checkbox"
          id="recurring"
          checked={isRecurring}
          onChange={(e) => onRecurringChange(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
        />
        <label htmlFor="recurring" className="theme-text-secondary ml-2 text-sm font-medium">
          Sim, tornar este agendamento fixo
        </label>
      </div>

      {isRecurring && (
        <div className="ml-6 space-y-3">
          {fixedType && (
            <div className="flex items-center">
              <input
                type="radio"
                id={fixedType.toLowerCase()}
                name="recurringType"
                value={fixedType.toLowerCase()}
                checked={true}
                readOnly
                className="h-4 w-4 border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <label htmlFor={fixedType.toLowerCase()} className="theme-text-secondary ml-2 text-sm font-medium">
                {fixedType === 'weekly'
                  ? 'Semanalmente (mesmo dia da semana)'
                  : 'Mensalmente (mesmo dia do mês)'
                }
              </label>
            </div>
          )}
          
          <div>
            <label className="theme-text-secondary mb-2 block text-sm font-medium">
              Por quanto tempo deseja manter o agendamento fixo?
            </label>
            <select
              value={recurringDuration}
              onChange={(e) => onDurationChange(e.target.value)}
              className="theme-input px-3 py-2"
            >
              {RECURRING_DURATION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringOptions;