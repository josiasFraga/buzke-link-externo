import React from 'react';
import { Ticket, CheckCircle, XCircle } from 'lucide-react';

interface VoucherInputProps {
  voucherCode: string;
  onVoucherCodeChange: (code: string) => void;
  onApplyVoucher: () => void;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const VoucherInput: React.FC<VoucherInputProps> = ({
  voucherCode,
  onVoucherCodeChange,
  onApplyVoucher,
  isLoading,
  error,
  successMessage,
}) => {
  const isApplied = !!successMessage;

  return (
    <div className="theme-card border-dashed p-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`mr-3 ${isApplied ? 'theme-text-success' : 'theme-text-accent'}`}>
            <Ticket size={24} />
          </div>
          <div>
            <h4 className="theme-text-primary font-bold">Cupom de Desconto</h4>
            <p className="theme-text-muted text-sm">Tem um cupom? Aplique aqui!</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex gap-2">
          <input
            type="text"
            id="voucher"
            value={voucherCode}
            onChange={(e) => onVoucherCodeChange(e.target.value.toUpperCase())}
            placeholder="SEUCUPOM"
            className="theme-input flex-grow p-2 uppercase disabled:bg-[var(--color-surface-secondary)]"
            disabled={isLoading || isApplied}
          />
          <button
            type="button"
            onClick={onApplyVoucher}
            disabled={isLoading || !voucherCode || isApplied}
            className={`flex w-28 items-center justify-center rounded-lg px-4 py-2 font-medium transition-colors ${
              isApplied ? 'theme-panel-success theme-text-success cursor-not-allowed' : 'theme-primary-btn'
            }`}
          >
            {isLoading ? '...' : isApplied ? 'Aplicado!' : 'Aplicar'}
          </button>
        </div>
        {error && (
          <div className="theme-text-danger mt-2 flex items-center text-sm">
            <XCircle size={16} className="mr-1" /> {error}
          </div>
        )}
        {successMessage && (
          <div className="theme-text-success mt-2 flex items-center text-sm">
            <CheckCircle size={16} className="mr-1" /> {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherInput;