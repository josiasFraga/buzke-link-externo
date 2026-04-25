import React, { useEffect, useRef } from 'react';
import { MessageCircle, ShieldCheck, Smartphone } from 'lucide-react';
import DdiPicker from './DdiPicker';

interface PhoneValidationFormProps {
  ddi: string;
  phone: string;
  code: string;
  isCodeSent: boolean;
  isSendingCode: boolean;
  isValidatingCode: boolean;
  resendCooldownSeconds: number;
  error: string | null;
  successMessage: string | null;
  onDdiChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onSendCode: () => void;
  onValidateCode: () => void;
}

function formatPhoneNumber(value: string, ddi: string) {
  const numbers = value.replace(/\D/g, '');

  if (ddi === '+55') {
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;

    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }

  if (ddi === '+598') {
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 8) return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;

    return `${numbers.slice(0, 4)} ${numbers.slice(4, 8)}`;
  }

  return numbers.slice(0, 15);
}

const PhoneValidationForm: React.FC<PhoneValidationFormProps> = ({
  ddi,
  phone,
  code,
  isCodeSent,
  isSendingCode,
  isValidatingCode,
  resendCooldownSeconds,
  error,
  successMessage,
  onDdiChange,
  onPhoneChange,
  onCodeChange,
  onSendCode,
  onValidateCode,
}) => {
  const codeInputRef = useRef<HTMLInputElement>(null);
  const lastSubmittedCodeRef = useRef('');

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPhoneChange(formatPhoneNumber(event.target.value, ddi));
  };

  useEffect(() => {
    if (isCodeSent) {
      codeInputRef.current?.focus();
    }
  }, [isCodeSent]);

  useEffect(() => {
    if (!isCodeSent || isSendingCode || isValidatingCode) {
      return;
    }

    if (code.length < 6) {
      lastSubmittedCodeRef.current = '';
      return;
    }

    if (code.length === 6 && lastSubmittedCodeRef.current !== code) {
      lastSubmittedCodeRef.current = code;
      onValidateCode();
    }
  }, [code, isCodeSent, isSendingCode, isValidatingCode, onValidateCode]);

  const isResendLocked = resendCooldownSeconds > 0;
  const resendLabel = isCodeSent
    ? isResendLocked
      ? `Reenviar código em ${resendCooldownSeconds}s`
      : 'Reenviar código'
    : 'Enviar código por WhatsApp';

  return (
    <div className="space-y-5">
      <div className="theme-panel-accent p-4">
        <div className="flex items-start gap-3">
          <div className="theme-panel-accent flex h-11 w-11 items-center justify-center rounded-full">
            <MessageCircle size={18} className="theme-text-accent" />
          </div>
          <div>
            <h3 className="theme-text-primary text-base font-bold">Valide seu telefone pelo WhatsApp</h3>
            <p className="theme-text-secondary mt-1 text-sm leading-6">
              Para concluir seu acesso, envie um código para o número abaixo e confirme os 6 dígitos recebidos.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="phone-validation-phone" className="theme-text-secondary mb-1 flex items-center text-sm font-medium">
          <Smartphone size={16} className="mr-2" />
          Telefone com WhatsApp
        </label>
        <div className="flex gap-2">
          <DdiPicker id="phone-validation-ddi" value={ddi} onChange={onDdiChange} />
          <input
            type="tel"
            id="phone-validation-phone"
            value={phone}
            onChange={handlePhoneChange}
            className="theme-input min-w-0 flex-1 px-4 py-3"
            placeholder={ddi === '+55' ? '(XX) XXXXX-XXXX' : 'XXXX XXXX'}
            inputMode="tel"
          />
        </div>
      </div>

      <button type="button" onClick={onSendCode} disabled={isSendingCode || isValidatingCode || isResendLocked} className="theme-secondary-btn w-full px-4 py-3 font-medium">
        {isSendingCode ? 'Enviando código...' : resendLabel}
      </button>

      {isCodeSent && isResendLocked ? (
        <p className="theme-text-secondary text-sm">
          Você poderá solicitar um novo código em {resendCooldownSeconds} segundo{resendCooldownSeconds === 1 ? '' : 's'}.
        </p>
      ) : null}

      {isCodeSent ? (
        <>
          <div>
            <label htmlFor="phone-validation-code" className="theme-text-secondary mb-1 flex items-center text-sm font-medium">
              <ShieldCheck size={16} className="mr-2" />
              Código de validação
            </label>
            <input
              ref={codeInputRef}
              type="text"
              id="phone-validation-code"
              value={code}
              onChange={(event) => onCodeChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
              className="theme-input px-4 py-3 tracking-[0.35em]"
              placeholder="123456"
              inputMode="numeric"
            />
          </div>

          <button type="button" onClick={onValidateCode} disabled={isSendingCode || isValidatingCode} className="theme-primary-btn w-full px-4 py-3 font-medium">
            {isValidatingCode ? 'Validando código...' : 'Confirmar código'}
          </button>
        </>
      ) : null}

      {error ? <p className="theme-text-danger text-sm">{error}</p> : null}
      {successMessage ? <p className="theme-text-success text-sm">{successMessage}</p> : null}
    </div>
  );
};

export default PhoneValidationForm;
