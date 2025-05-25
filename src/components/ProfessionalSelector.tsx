import React from 'react';
import { Professional } from '../types';

interface ProfessionalSelectorProps {
  professionals: Professional[];
  selectedProfessionalId: number | null;
  onSelectProfessional: (id: number) => void;
  availableProfessionals?: number[];
}

const ProfessionalSelector: React.FC<ProfessionalSelectorProps> = ({
  professionals,
  selectedProfessionalId,
  onSelectProfessional,
  availableProfessionals = []
}) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecione o Profissional</h3>
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
                  ? 'border-indigo-600 bg-indigo-50'
                  : isAvailable
                    ? 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    : 'border-gray-200 opacity-50 cursor-not-allowed bg-gray-50'
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
                <span className="absolute top-2 right-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
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