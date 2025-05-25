import React from 'react';
import { Home } from 'lucide-react';

interface HomeServiceOptionsProps {
  isAtHome: boolean;
  address: string;
  onAtHomeChange: (value: boolean) => void;
  onAddressChange: (value: string) => void;
  isRequired?: boolean;
  error?: string;
}

const HomeServiceOptions: React.FC<HomeServiceOptionsProps> = ({
  isAtHome,
  address,
  onAtHomeChange,
  onAddressChange,
  isRequired,
  error
}) => {
  return (
    <div className="bg-indigo-50 p-4 rounded-lg">
      <div className="flex items-start mb-3">
        <Home size={20} className="text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-indigo-800">Atendimento a Domicílio</h4>
          <p className="text-sm text-indigo-600 mt-1">
            Este serviço pode ser realizado na sua residência
          </p>
        </div>
      </div>

      <div className="flex items-center mb-3">
        <input
          type="checkbox"
          id="atHome"
          checked={isAtHome}
          onChange={(e) => onAtHomeChange(e.target.checked)}
          disabled={isRequired}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 disabled:opacity-50"
        />
        <label htmlFor="atHome" className="ml-2 text-sm font-medium text-gray-700">
          {isRequired
            ? 'Este serviço é exclusivamente a domicílio'
            : 'Sim, quero atendimento a domicílio'
          }
        </label>
      </div>

      {isAtHome && (
        <div className="mt-3">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Endereço Completo
          </label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Digite seu endereço completo, incluindo número, complemento, bairro e CEP"
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg ${
              error ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default HomeServiceOptions;