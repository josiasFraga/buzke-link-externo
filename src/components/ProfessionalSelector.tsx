import React from 'react';
import { Professional } from '../types';

interface ProfessionalSelectorProps {
  professionals: Professional[];
  selectedProfessionalId: number | null;
  onSelectProfessional: (id: number) => void;
  availableProfessionals?: number[];
  stickyTitle?: boolean;
  stickyTopClassName?: string;
}

const ProfessionalSelector: React.FC<ProfessionalSelectorProps> = ({
  professionals,
  selectedProfessionalId,
  onSelectProfessional,
  availableProfessionals = [],
  stickyTitle = false,
  stickyTopClassName = ''
}) => {
  return (
    <div className="mt-6" id="professional-selector-section">
      <div className={stickyTitle ? `sticky z-20 bg-[var(--color-background)] py-2 ${stickyTopClassName}` : 'mb-4'}>
        <h3 className="theme-text-primary text-lg font-semibold">Selecione o Profissional</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {professionals.map((professional) => {
          const isAvailable = availableProfessionals.includes(professional.usuario.id);
          
          return (
            <button
              key={professional.id}
              onClick={() => isAvailable && onSelectProfessional(professional.id)}
              disabled={!isAvailable}
              className={`
                relative p-4 rounded-lg border transition-all
                ${selectedProfessionalId === professional.id
                  ? 'border-[var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)]'
                  : isAvailable
                    ? 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-secondary)] opacity-50 cursor-not-allowed'
                }
              `}
            >
              <div className="aspect-square rounded-full overflow-hidden mb-3">
                <img
                  src={professional.usuario.img || 'https://via.placeholder.com/200'}
                  alt={professional.usuario.nome}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-medium text-center text-gray-800 truncate">
                {professional.usuario.nome}
              </p>
              {!isAvailable && (
                <span className="theme-panel-error theme-text-danger absolute right-2 top-2 px-2 py-1 text-xs">
                  Indisponível
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfessionalSelector;