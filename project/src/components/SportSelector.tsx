import React from 'react';
import { Sport } from '../types';
import { Trophy } from 'lucide-react';

interface SportSelectorProps {
  sports: Sport[];
  selectedSportId: number | null;
  onSelectSport: (id: number) => void;
}

const SportSelector: React.FC<SportSelectorProps> = ({
  sports,
  selectedSportId,
  onSelectSport
}) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Trophy size={20} className="text-indigo-600 mr-2" />
        Qual esporte você quer jogar?
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {sports.map((sport) => (
          <button
            key={sport.id}
            onClick={() => onSelectSport(sport.id)}
            className={`
              py-3 px-4 rounded-lg text-center transition-all font-medium
              ${selectedSportId === sport.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
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