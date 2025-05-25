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
    <div className="bg-indigo-50 p-4 rounded-lg">
      <div className="flex items-start mb-3">
        <Repeat size={20} className="text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-indigo-800">Agendamento Fixo</h4>
          <p className="text-sm text-indigo-600 mt-1">
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
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor="recurring" className="ml-2 text-sm font-medium text-gray-700">
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
                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              />
              <label htmlFor={fixedType.toLowerCase()} className="ml-2 text-sm font-medium text-gray-700">
                {fixedType === 'weekly'
                  ? 'Semanalmente (mesmo dia da semana)'
                  : 'Mensalmente (mesmo dia do mês)'
                }
              </label>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Por quanto tempo deseja manter o agendamento fixo?
            </label>
            <select
              value={recurringDuration}
              onChange={(e) => onDurationChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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