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
    <div className="theme-panel-accent p-4">
      <div className="flex items-start mb-3">
        <Home size={20} className="theme-text-accent mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="theme-text-primary font-medium">Atendimento a Domicílio</h4>
          <p className="theme-text-accent mt-1 text-sm">
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
          className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] disabled:opacity-50"
        />
        <label htmlFor="atHome" className="theme-text-secondary ml-2 text-sm font-medium">
          {isRequired
            ? 'Este serviço é exclusivamente a domicílio'
            : 'Sim, quero atendimento a domicílio'
          }
        </label>
      </div>

      {isAtHome && (
        <div className="mt-3">
          <label htmlFor="address" className="theme-text-secondary mb-1 block text-sm font-medium">
            Endereço Completo
          </label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Digite seu endereço completo, incluindo número, complemento, bairro e CEP"
            rows={3}
            className={`theme-input px-4 py-3 ${error ? 'border-red-500' : ''}`}
          />
          {error && <p className="theme-text-danger mt-1 text-sm">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default HomeServiceOptions;