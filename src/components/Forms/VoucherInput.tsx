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
    <div className="bg-white rounded-lg border border-dashed border-gray-300 p-4 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`mr-3 ${isApplied ? 'text-green-500' : 'text-indigo-500'}`}>
            <Ticket size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">Cupom de Desconto</h4>
            <p className="text-sm text-gray-500">Tem um cupom? Aplique aqui!</p>
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
            className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 uppercase disabled:bg-gray-100"
            disabled={isLoading || isApplied}
          />
          <button
            type="button"
            onClick={onApplyVoucher}
            disabled={isLoading || !voucherCode || isApplied}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center justify-center w-28
              ${isApplied
                ? 'bg-green-500 cursor-not-allowed'
                : isLoading || !voucherCode
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
          >
            {isLoading ? '...' : isApplied ? 'Aplicado!' : 'Aplicar'}
          </button>
        </div>
        {error && (
          <div className="text-red-600 text-sm mt-2 flex items-center">
            <XCircle size={16} className="mr-1" /> {error}
          </div>
        )}
        {successMessage && (
          <div className="text-green-600 text-sm mt-2 flex items-center">
            <CheckCircle size={16} className="mr-1" /> {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherInput;