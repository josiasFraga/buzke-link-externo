import React from 'react';
import { Sport } from '../types';
import { Trophy } from 'lucide-react';

interface SportSelectorProps {
  sports: Sport[];
  selectedSportId: number | null;
  onSelectSport: (id: number) => void;
  stickyTitle?: boolean;
  stickyTopClassName?: string;
}

const SportSelector: React.FC<SportSelectorProps> = ({
  sports,
  selectedSportId,
  onSelectSport,
  stickyTitle = false,
  stickyTopClassName = ''
}) => {
  return (
    <div className="mt-6" id="sport-selector-section">
      <div className={stickyTitle ? `sticky z-20 bg-[var(--color-background)] py-2 ${stickyTopClassName}` : 'mb-4'}>
        <h3 className="theme-text-primary flex items-center text-lg font-semibold">
          <Trophy size={20} className="theme-text-accent mr-2" />
          Qual esporte você quer jogar?
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {sports.map((sport) => (
          <button
            key={sport.id}
            onClick={() => onSelectSport(sport.id)}
            className={`
              py-3 px-4 rounded-lg text-center transition-all font-medium
              ${selectedSportId === sport.id
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)]'
              }
            `}
          >
            {sport.subcategoria.esporte_nome}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SportSelector;