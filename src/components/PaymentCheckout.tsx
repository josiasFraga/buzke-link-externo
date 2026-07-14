import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, CreditCard, Loader2, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { Appointment, AppointmentPaymentMethod, AppointmentPaymentResult, Service } from '../types';
import { buildPublicApiUrl } from '../lib/public-api';
import useAuthStore from '../store/authStore';

interface PaymentCheckoutProps {
  appointment: Appointment;
  service: Service;
  onPaymentComplete: (result: AppointmentPaymentResult) => void;
}

interface PaymentFormState {
  cpf: string;
  telefone: string;
  cc_number: string;
  cc_name: string;
  cc_expiry: string;
  cc_secure_code: string;
  cc_holder_name: string;
  cc_holder_email: string;
  cc_holder_ddi: string;
  cc_holder_phone: string;
  cc_holder_cpf: string;
  cc_holder_cep: string;
  cc_holder_neighborhood: string;
  cc_billing_city: string;
  cc_billing_uf: string;
  cc_address: string;
  cc_address_number: string;
  cc_address_complement: string;
}

interface UserCreditCard {
  id: number;
  bandeira: string;
  ultimos_digitos: string;
  gateway: 'asaas' | 'pagbank' | string;
  created: string;
  updated?: string | null;
}

interface RawPaymentResponse {
  id?: number;
  external_id?: string | null;
  gateway?: string | null;
  payment_status?: string | null;
  amount?: number | string | null;
  valor?: number | string | null;
  appointment_id?: number | null;
  appointment_ids?: number[];
  appointment_status?: string | null;
  payment_required?: boolean;
  required_payment_amount?: number | string | null;
  reservation_expires_at?: string | null;
  reserva_expira_em?: string | null;
  expires_at?: string | null;
  pix_qr_code_id?: string | null;
  pix_copia_cola?: string | null;
  gateway_reference_id?: string | null;
  gateway_order_id?: string | null;
  gateway_charge_id?: string | null;
  pix_data?: Record<string, unknown> | null;
}

interface PostalCodeLookupResponse {
  cep: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade: string;
  uf: string;
  loc_nu_sequencial?: number;
}

interface AddressStateOption {
  nome?: string;
  sigla?: string;
}

interface AddressCityOption {
  id?: number;
  nome?: string;
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatCpf(value: string) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function formatCep(value: string) {
  const digits = onlyDigits(value).slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatCardNumber(value: string) {
  return onlyDigits(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatCardExpiry(value: string) {
  const digits = onlyDigits(value).slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatSecurityCode(value: string) {
  return onlyDigits(value).slice(0, 4);
}

function formatAddressNumber(value: string) {
  return onlyDigits(value).slice(0, 8);
}

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));
}

function normalizePaymentResult(data: RawPaymentResponse): AppointmentPaymentResult {
  const pixData = data.pix_data || {};
  const encodedImage =
    pixData.encodedImage ||
    pixData.encoded_image ||
    pixData.image ||
    pixData.imageBase64 ||
    pixData.image_base64 ||
    pixData.base64Image ||
    pixData.base64_image ||
    pixData.qrCodeBase64 ||
    pixData.qr_code_base64 ||
    pixData.qrCodeImage ||
    pixData.qr_code_image ||
    pixData.imagem_base64 ||
    pixData.imagem ||
    null;
  const copyPasteCode =
    pixData.payload ||
    pixData.copyPaste ||
    pixData.pixCode ||
    pixData.pix_code ||
    pixData.qrCode ||
    pixData.qr_code ||
    pixData.pix_copia_cola ||
    pixData.pixCopiaCola ||
    pixData.copyPasteCode ||
    pixData.copy_paste_code ||
    data.pix_copia_cola ||
    null;

  return {
    id: Number(data.id || 0),
    externalId: data.external_id ?? null,
    gateway: data.gateway ?? null,
    paymentStatus: data.payment_status ?? null,
    amount: toNumber(data.amount ?? data.valor),
    appointmentId: data.appointment_id ?? null,
    appointmentIds: data.appointment_ids || [],
    appointmentStatus: data.appointment_status ?? null,
    paymentRequired: data.payment_required,
    requiredPaymentAmount: toNumber(data.required_payment_amount),
    reservationExpiresAt: data.reservation_expires_at ?? data.reserva_expira_em ?? null,
    expiresAt: data.expires_at ?? null,
    pixPayment: {
      qrCodeId: data.pix_qr_code_id ?? null,
      copyPasteCode: typeof copyPasteCode === 'string' ? copyPasteCode : null,
      encodedImage: typeof encodedImage === 'string' ? encodedImage : null,
      gatewayReferenceId: data.gateway_reference_id ?? null,
      gatewayOrderId: data.gateway_order_id ?? null,
      gatewayChargeId: data.gateway_charge_id ?? null,
      raw: pixData,
    },
  };
}

function buildQrCodeSrc(encodedImage?: string | null) {
  if (!encodedImage) {
    return null;
  }

  if (encodedImage.startsWith('data:image') || encodedImage.startsWith('http')) {
    return encodedImage;
  }

  return `data:image/png;base64,${encodedImage}`;
}

function getPaymentMethodId(method: AppointmentPaymentMethod) {
  return method === 'pix' ? 1 : 2;
}

const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({ appointment, service, onPaymentComplete }) => {
  const { user, token } = useAuthStore();
  const lastPostalCodeLookupRef = useRef<string | null>(null);
  const pixResultRef = useRef<HTMLDivElement | null>(null);
  const acceptedMethods = useMemo(
    () => appointment.payment?.acceptedMethods || [],
    [appointment.payment?.acceptedMethods]
  );
  const initialMethod = acceptedMethods.includes('pix') ? 'pix' : acceptedMethods[0] || 'pix';
  const [selectedMethod, setSelectedMethod] = useState<AppointmentPaymentMethod>(initialMethod);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [form, setForm] = useState<PaymentFormState>({
    cpf: '',
    telefone: formatPhone(user?.telefone || ''),
    cc_number: '',
    cc_name: '',
    cc_expiry: '',
    cc_secure_code: '',
    cc_holder_name: user?.nome || '',
    cc_holder_email: user?.email || '',
    cc_holder_ddi: user?.telefone_ddi || '55',
    cc_holder_phone: formatPhone(user?.telefone || ''),
    cc_holder_cpf: '',
    cc_holder_cep: '',
    cc_holder_neighborhood: '',
    cc_billing_city: '',
    cc_billing_uf: '',
    cc_address: '',
    cc_address_number: '',
    cc_address_complement: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<AppointmentPaymentResult | null>(null);
  const [generatedQrCodeSrc, setGeneratedQrCodeSrc] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [addressStates, setAddressStates] = useState<AddressStateOption[]>([]);
  const [addressCities, setAddressCities] = useState<AddressCityOption[]>([]);
  const [savedCards, setSavedCards] = useState<UserCreditCard[]>([]);
  const [isLoadingSavedCards, setIsLoadingSavedCards] = useState(false);
  const [savedCardsError, setSavedCardsError] = useState<string | null>(null);
  const [isLoadingPostalCode, setIsLoadingPostalCode] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const amount = appointment.payment?.amount ?? service.price;
  const gatewayQrCodeSrc = useMemo(() => buildQrCodeSrc(paymentResult?.pixPayment?.encodedImage), [paymentResult?.pixPayment?.encodedImage]);
  const qrCodeSrc = gatewayQrCodeSrc || generatedQrCodeSrc;
  const pixCopyPasteCode = paymentResult?.pixPayment?.copyPasteCode;
  const isUsingNewCard = selectedMethod === 'cartao' && selectedCardId === 'new';
  const isUsingSavedCard = selectedMethod === 'cartao' && selectedCardId !== '' && selectedCardId !== 'new';

  useEffect(() => {
    if (acceptedMethods.length && !acceptedMethods.includes(selectedMethod)) {
      setSelectedMethod(acceptedMethods[0]);
    }
  }, [acceptedMethods, selectedMethod]);

  useEffect(() => {
    if (!paymentResult || selectedMethod !== 'pix') {
      return;
    }

    pixResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [paymentResult, selectedMethod]);

  useEffect(() => {
    if (!pixCopyPasteCode || gatewayQrCodeSrc) {
      setGeneratedQrCodeSrc(null);
      return;
    }

    let isCurrent = true;

    QRCode.toDataURL(pixCopyPasteCode, {
      errorCorrectionLevel: 'M',
      margin: 1,
      scale: 8,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    })
      .then((dataUrl) => {
        if (isCurrent) {
          setGeneratedQrCodeSrc(dataUrl);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setGeneratedQrCodeSrc(null);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [gatewayQrCodeSrc, pixCopyPasteCode]);

  useEffect(() => {
    if (selectedMethod !== 'cartao') {
      setSelectedCardId('');
      setSavedCards([]);
      setSavedCardsError(null);
      return;
    }

    if (!token) {
      setSavedCards([]);
      setSelectedCardId('new');
      return;
    }

    const abortController = new AbortController();
    const params = new URLSearchParams();

    if (appointment.payment?.gateway) {
      params.set('gateway', appointment.payment.gateway);
    }

    setIsLoadingSavedCards(true);
    setSavedCardsError(null);

    fetch(buildPublicApiUrl(`/user-credit-cards${params.toString() ? `?${params.toString()}` : ''}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: abortController.signal,
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Não foi possível carregar seus cartões salvos.');
        }

        return Array.isArray(data) ? data as UserCreditCard[] : [];
      })
      .then((cards) => {
        setSavedCards(cards);
        setSelectedCardId((currentCardId) => {
          if (currentCardId === 'new') {
            return currentCardId;
          }

          if (currentCardId && cards.some((card) => String(card.id) === currentCardId)) {
            return currentCardId;
          }

          return cards.length ? '' : 'new';
        });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        setSavedCards([]);
        setSelectedCardId('new');
        setSavedCardsError(err instanceof Error ? err.message : 'Não foi possível carregar seus cartões salvos.');
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoadingSavedCards(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [appointment.payment?.gateway, selectedMethod, token]);

  useEffect(() => {
    if (!isUsingNewCard) {
      return;
    }

    const abortController = new AbortController();

    setIsLoadingStates(true);
    fetch(buildPublicApiUrl('/addresses/ufs?country=Brasil'), {
      signal: abortController.signal,
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Não foi possível carregar os estados.');
        }

        setAddressStates(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        setAddressStates([]);
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoadingStates(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [isUsingNewCard]);

  useEffect(() => {
    const uf = form.cc_billing_uf.trim().toUpperCase();

    if (!isUsingNewCard || uf.length !== 2) {
      setAddressCities([]);
      return;
    }

    const abortController = new AbortController();

    setIsLoadingCities(true);
    fetch(buildPublicApiUrl(`/addresses/cities/${encodeURIComponent(uf)}?country=Brasil`), {
      signal: abortController.signal,
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Não foi possível carregar as cidades.');
        }

        setAddressCities(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        setAddressCities([]);
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoadingCities(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [form.cc_billing_uf, isUsingNewCard]);

  useEffect(() => {
    const postalCodeDigits = onlyDigits(form.cc_holder_cep);

    if (!isUsingNewCard || postalCodeDigits.length !== 8 || lastPostalCodeLookupRef.current === postalCodeDigits) {
      return;
    }

    const abortController = new AbortController();

    lastPostalCodeLookupRef.current = postalCodeDigits;
    setIsLoadingPostalCode(true);
    setAddressError(null);

    fetch(buildPublicApiUrl(`/addresses/get-by-postal-code?cep=${postalCodeDigits}`), {
      signal: abortController.signal,
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'CEP não encontrado.');
        }

        return data as PostalCodeLookupResponse;
      })
      .then((address) => {
        setForm((currentForm) => ({
          ...currentForm,
          cc_address: address.logradouro || currentForm.cc_address,
          cc_address_complement: address.complemento || currentForm.cc_address_complement,
          cc_holder_neighborhood: address.bairro || currentForm.cc_holder_neighborhood,
          cc_billing_city: address.localidade || currentForm.cc_billing_city,
          cc_billing_uf: address.uf || currentForm.cc_billing_uf,
        }));
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        setAddressError(err instanceof Error ? err.message : 'Não foi possível buscar o endereço pelo CEP.');
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoadingPostalCode(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [form.cc_holder_cep, isUsingNewCard]);

  const updateField = (name: keyof PaymentFormState, value: string) => {
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const updateCpfField = (name: 'cpf' | 'cc_holder_cpf', value: string) => {
    updateField(name, formatCpf(value));
  };

  const updatePhoneField = (name: 'telefone' | 'cc_holder_phone', value: string) => {
    updateField(name, formatPhone(value));
  };

  const updateCepField = (value: string) => {
    const formattedCep = formatCep(value);

    if (onlyDigits(formattedCep).length < 8) {
      lastPostalCodeLookupRef.current = null;
      setAddressError(null);
    }

    updateField('cc_holder_cep', formattedCep);
  };

  const updateCardNumberField = (value: string) => {
    updateField('cc_number', formatCardNumber(value));
  };

  const updateCardExpiryField = (value: string) => {
    updateField('cc_expiry', formatCardExpiry(value));
  };

  const updateSecurityCodeField = (value: string) => {
    updateField('cc_secure_code', formatSecurityCode(value));
  };

  const updateAddressNumberField = (value: string) => {
    updateField('cc_address_number', formatAddressNumber(value));
  };

  const updateStateField = (value: string) => {
    const nextUf = value.toUpperCase();

    setForm((currentForm) => ({
      ...currentForm,
      cc_billing_uf: nextUf,
      cc_billing_city: nextUf === currentForm.cc_billing_uf ? currentForm.cc_billing_city : '',
    }));
  };

  const validateForm = () => {
    if (!onlyDigits(form.cpf)) {
      return 'Informe o CPF para continuar o pagamento.';
    }

    if (!onlyDigits(form.telefone)) {
      return 'Informe o telefone para continuar o pagamento.';
    }

    if (selectedMethod === 'cartao') {
      if (!selectedCardId) {
        return 'Selecione um cartão salvo ou cadastre um novo.';
      }

      if (isUsingSavedCard && onlyDigits(form.cc_secure_code).length < 3) {
        return 'Informe o CVV do cartão salvo.';
      }

      if (!isUsingNewCard) {
        return null;
      }

      if (onlyDigits(form.cc_number).length < 13) {
        return 'Informe o número do cartão.';
      }

      if (!form.cc_name.trim()) {
        return 'Informe o nome impresso no cartão.';
      }

      if (!form.cc_expiry.trim()) {
        return 'Informe a validade do cartão.';
      }

      if (onlyDigits(form.cc_secure_code).length < 3) {
        return 'Informe o código de segurança.';
      }

      if (!form.cc_holder_name.trim() || !form.cc_holder_email.trim() || !onlyDigits(form.cc_holder_cpf)) {
        return 'Informe os dados do titular do cartão.';
      }

      if (!onlyDigits(form.cc_holder_cep) || !form.cc_billing_uf.trim() || !form.cc_billing_city.trim()) {
        return 'Informe CEP, estado e cidade da cobrança.';
      }

      if (!form.cc_address.trim() || !form.cc_address_number.trim() || !form.cc_holder_neighborhood.trim()) {
        return 'Informe endereço, número e bairro da cobrança.';
      }
    }

    return null;
  };

  const handleSubmitPayment = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!appointment.payment?.paymentId) {
      setError('Pagamento obrigatório não retornou payment_id.');
      return;
    }

    if (!token) {
      setError('Faça login para continuar o pagamento.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setCopySuccess(false);
    setGeneratedQrCodeSrc(null);

    const payload = {
      cpf: onlyDigits(form.cpf),
      telefone: onlyDigits(form.telefone),
      forma_pagamento_id: getPaymentMethodId(selectedMethod),
      payment_id: appointment.payment.paymentId,
      ...(selectedMethod === 'cartao' && selectedCardId && {
        cc_id: selectedCardId,
        cc_secure_code: onlyDigits(form.cc_secure_code),
        ...(isUsingNewCard && {
          cc_number: onlyDigits(form.cc_number),
          cc_name: form.cc_name.trim(),
          cc_expiry: form.cc_expiry.trim(),
          cc_holder_name: form.cc_holder_name.trim(),
          cc_holder_email: form.cc_holder_email.trim(),
          cc_holder_ddi: form.cc_holder_ddi.trim() || '55',
          cc_holder_phone: onlyDigits(form.cc_holder_phone || form.telefone),
          cc_holder_cpf: onlyDigits(form.cc_holder_cpf || form.cpf),
          cc_holder_cep: onlyDigits(form.cc_holder_cep),
          cc_holder_neighborhood: form.cc_holder_neighborhood.trim(),
          cc_billing_city: form.cc_billing_city.trim(),
          cc_billing_uf: form.cc_billing_uf.trim().toUpperCase(),
          cc_address: form.cc_address.trim(),
          cc_address_number: form.cc_address_number.trim(),
          cc_address_complement: form.cc_address_complement.trim() || undefined,
        }),
      }),
    };

    try {
      const response = await fetch(buildPublicApiUrl('/payments/pay-appointments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.message) ? data.message.join(' ') : data.message;
        throw new Error(message || 'Não foi possível iniciar o pagamento.');
      }

      const normalizedResult = normalizePaymentResult(data);
      setPaymentResult(normalizedResult);

      if (selectedMethod === 'cartao') {
        onPaymentComplete(normalizedResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível iniciar o pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPix = async () => {
    const copyPasteCode = paymentResult?.pixPayment?.copyPasteCode;

    if (!copyPasteCode) {
      return;
    }

    await navigator.clipboard.writeText(copyPasteCode);
    setCopySuccess(true);
  };

  return (
    <div className="space-y-6">
      <div className="theme-panel-warning mt-6 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={22} className="theme-text-warning mt-0.5" />
          <div>
            <h2 className="theme-text-primary text-xl font-bold">Pagamento necessário</h2>
            <p className="theme-text-secondary mt-1 text-sm">
              Sua reserva foi criada, mas o agendamento só será confirmado após o pagamento obrigatório.
            </p>
          </div>
        </div>
      </div>

      <div className="theme-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="theme-text-muted text-xs font-semibold uppercase tracking-[0.14em]">Valor a pagar</p>
            <p className="theme-text-primary mt-1 text-3xl font-bold">{formatCurrency(amount)}</p>
          </div>
          {appointment.payment?.reservationExpiresAt ? (
            <p className="theme-text-secondary text-sm">Prazo: {new Date(appointment.payment.reservationExpiresAt).toLocaleString('pt-BR')}</p>
          ) : null}
        </div>
      </div>

      <div className="theme-card p-5">
        <h3 className="theme-text-primary text-lg font-semibold">Forma de pagamento</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {acceptedMethods.includes('pix') ? (
            <button
              type="button"
              onClick={() => setSelectedMethod('pix')}
              className={`rounded-xl border p-4 text-left transition-colors ${selectedMethod === 'pix' ? 'border-[var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-surface))]' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'}`}
            >
              <span className="theme-text-primary flex items-center gap-2 font-semibold"><QrCode size={18} className="theme-text-accent" /> Pix</span>
              <span className="theme-text-secondary mt-1 block text-sm">QR Code ou copia e cola.</span>
            </button>
          ) : null}
          {acceptedMethods.includes('cartao') ? (
            <button
              type="button"
              onClick={() => {
                setSelectedMethod('cartao');
                setForm((currentForm) => ({ ...currentForm, cc_secure_code: '' }));
              }}
              className={`rounded-xl border p-4 text-left transition-colors ${selectedMethod === 'cartao' ? 'border-[var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-surface))]' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'}`}
            >
              <span className="theme-text-primary flex items-center gap-2 font-semibold"><CreditCard size={18} className="theme-text-accent" /> Cartão</span>
              <span className="theme-text-secondary mt-1 block text-sm">Pagamento por cartão de crédito.</span>
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="theme-text-primary text-sm font-medium">CPF</span>
            <input value={form.cpf} onChange={(event) => updateCpfField('cpf', event.target.value)} className="theme-input mt-1 w-full px-4 py-3" placeholder="000.000.000-00" inputMode="numeric" maxLength={14} />
          </label>
          <label className="block">
            <span className="theme-text-primary text-sm font-medium">Telefone</span>
            <input value={form.telefone} onChange={(event) => updatePhoneField('telefone', event.target.value)} className="theme-input mt-1 w-full px-4 py-3" placeholder="(00) 00000-0000" inputMode="tel" maxLength={15} />
          </label>
        </div>

        {selectedMethod === 'cartao' ? (
          <div className="mt-5 space-y-6">
            <div className="space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-secondary)] p-4">
              <div>
                <h4 className="theme-text-primary text-base font-semibold">Cartão de crédito</h4>
                <p className="theme-text-secondary mt-1 text-sm">Escolha um cartão salvo ou cadastre um novo para este pagamento.</p>
              </div>

              {isLoadingSavedCards ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[0, 1].map((item) => <div key={item} className="h-20 animate-pulse rounded-lg bg-[color:color-mix(in_srgb,var(--color-border)_45%,transparent)]" />)}
                </div>
              ) : (
                <>
                {!savedCards.length && !savedCardsError ? (
                  <p className="theme-text-secondary text-sm">Você ainda não tem cartões salvos para este gateway.</p>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  {savedCards.map((card) => {
                    const cardId = String(card.id);
                    const isSelected = selectedCardId === cardId;

                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => {
                          setSelectedCardId(cardId);
                          setForm((currentForm) => ({ ...currentForm, cc_secure_code: '' }));
                        }}
                        className={`rounded-lg border p-4 text-left transition-colors ${isSelected ? 'border-[var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-surface))]' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'}`}
                      >
                        <span className="theme-text-primary flex items-center gap-2 font-semibold"><CreditCard size={18} className="theme-text-accent" /> {card.bandeira || 'Cartão'}</span>
                        <span className="theme-text-secondary mt-1 block text-sm">Final {card.ultimos_digitos} · {card.gateway}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCardId('new');
                      setForm((currentForm) => ({ ...currentForm, cc_secure_code: '' }));
                    }}
                    className={`rounded-lg border p-4 text-left transition-colors ${selectedCardId === 'new' ? 'border-[var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-surface))]' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'}`}
                  >
                    <span className="theme-text-primary flex items-center gap-2 font-semibold"><CreditCard size={18} className="theme-text-accent" /> Cadastrar novo cartão</span>
                    <span className="theme-text-secondary mt-1 block text-sm">Usar os dados de um novo cartão.</span>
                  </button>
                </div>
                </>
              )}

              {savedCardsError ? <p className="theme-text-danger text-sm">{savedCardsError}</p> : null}
            </div>

            {isUsingSavedCard ? (
              <label className="block">
                <span className="theme-text-primary text-sm font-medium">CVV do cartão salvo</span>
                <input value={form.cc_secure_code} onChange={(event) => updateSecurityCodeField(event.target.value)} className="theme-input mt-1 w-full px-4 py-3" inputMode="numeric" maxLength={4} />
              </label>
            ) : null}

            {isUsingNewCard ? (
            <>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="theme-text-primary text-sm font-medium">Número do cartão</span>
                <input value={form.cc_number} onChange={(event) => updateCardNumberField(event.target.value)} className="theme-input mt-1 w-full px-4 py-3" inputMode="numeric" maxLength={23} placeholder="0000 0000 0000 0000" />
              </label>
              <label className="block">
                <span className="theme-text-primary text-sm font-medium">Nome impresso</span>
                <input value={form.cc_name} onChange={(event) => updateField('cc_name', event.target.value.toUpperCase())} className="theme-input mt-1 w-full px-4 py-3" />
              </label>
              <label className="block">
                <span className="theme-text-primary text-sm font-medium">Validade</span>
                <input value={form.cc_expiry} onChange={(event) => updateCardExpiryField(event.target.value)} className="theme-input mt-1 w-full px-4 py-3" placeholder="MM/AA" inputMode="numeric" maxLength={5} />
              </label>
              <label className="block">
                <span className="theme-text-primary text-sm font-medium">CVV</span>
                <input value={form.cc_secure_code} onChange={(event) => updateSecurityCodeField(event.target.value)} className="theme-input mt-1 w-full px-4 py-3" inputMode="numeric" maxLength={4} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="theme-text-primary text-sm font-medium">Nome do titular</span>
                <input value={form.cc_holder_name} onChange={(event) => updateField('cc_holder_name', event.target.value)} className="theme-input mt-1 w-full px-4 py-3" />
              </label>
              <label className="block">
                <span className="theme-text-primary text-sm font-medium">E-mail do titular</span>
                <input value={form.cc_holder_email} onChange={(event) => updateField('cc_holder_email', event.target.value)} className="theme-input mt-1 w-full px-4 py-3" type="email" />
              </label>
              <label className="block">
                <span className="theme-text-primary text-sm font-medium">CPF do titular</span>
                <input value={form.cc_holder_cpf} onChange={(event) => updateCpfField('cc_holder_cpf', event.target.value)} className="theme-input mt-1 w-full px-4 py-3" placeholder="000.000.000-00" inputMode="numeric" maxLength={14} />
              </label>
              <label className="block">
                <span className="theme-text-primary text-sm font-medium">Telefone do titular</span>
                <input value={form.cc_holder_phone} onChange={(event) => updatePhoneField('cc_holder_phone', event.target.value)} className="theme-input mt-1 w-full px-4 py-3" placeholder="(00) 00000-0000" inputMode="tel" maxLength={15} />
              </label>
            </div>

            <div className="space-y-4 rounded-lg border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface-secondary)_38%,transparent)] p-4">
              <div>
                <h4 className="theme-text-primary text-base font-semibold">Endereço de cobrança</h4>
                <p className="theme-text-secondary mt-1 text-sm">Informe o CEP para preencher o endereço automaticamente.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.4fr)]">
                <label className="block">
                  <span className="theme-text-primary text-sm font-medium">CEP</span>
                  <input value={form.cc_holder_cep} onChange={(event) => updateCepField(event.target.value)} className="theme-input mt-1 w-full px-4 py-3" placeholder="00000-000" inputMode="numeric" maxLength={9} disabled={isLoadingPostalCode} />
                </label>
                <label className="block">
                  <span className="theme-text-primary text-sm font-medium">Estado</span>
                  <select value={form.cc_billing_uf} onChange={(event) => updateStateField(event.target.value)} className="theme-input mt-1 w-full px-4 py-3" disabled={isLoadingStates}>
                    <option value="">{isLoadingStates ? 'Carregando...' : 'Selecione'}</option>
                    {form.cc_billing_uf && !addressStates.some((stateOption) => stateOption.sigla === form.cc_billing_uf) ? (
                      <option value={form.cc_billing_uf}>{form.cc_billing_uf}</option>
                    ) : null}
                    {addressStates.map((stateOption) => {
                      const value = stateOption.sigla || '';
                      return value ? <option key={value} value={value}>{stateOption.nome || value}</option> : null;
                    })}
                  </select>
                </label>
                <label className="block">
                  <span className="theme-text-primary text-sm font-medium">Cidade</span>
                  <select value={form.cc_billing_city} onChange={(event) => updateField('cc_billing_city', event.target.value)} className="theme-input mt-1 w-full px-4 py-3" disabled={!form.cc_billing_uf || isLoadingCities}>
                    <option value="">{isLoadingCities ? 'Carregando...' : 'Selecione'}</option>
                    {form.cc_billing_city && !addressCities.some((city) => city.nome === form.cc_billing_city) ? (
                      <option value={form.cc_billing_city}>{form.cc_billing_city}</option>
                    ) : null}
                    {addressCities.map((city) => city.nome ? <option key={city.id || city.nome} value={city.nome}>{city.nome}</option> : null)}
                  </select>
                </label>
              </div>

              {isLoadingPostalCode ? <p className="theme-text-secondary text-sm">Buscando endereço pelo CEP...</p> : null}
              {addressError ? <p className="theme-text-danger text-sm">{addressError}</p> : null}

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
                <label className="block">
                  <span className="theme-text-primary text-sm font-medium">Bairro</span>
                  <input value={form.cc_holder_neighborhood} onChange={(event) => updateField('cc_holder_neighborhood', event.target.value)} className="theme-input mt-1 w-full px-4 py-3" disabled={isLoadingPostalCode} />
                </label>
                <label className="block">
                  <span className="theme-text-primary text-sm font-medium">Endereço</span>
                  <input value={form.cc_address} onChange={(event) => updateField('cc_address', event.target.value)} className="theme-input mt-1 w-full px-4 py-3" disabled={isLoadingPostalCode} />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)]">
                <label className="block">
                  <span className="theme-text-primary text-sm font-medium">Número</span>
                  <input value={form.cc_address_number} onChange={(event) => updateAddressNumberField(event.target.value)} className="theme-input mt-1 w-full px-4 py-3" inputMode="numeric" maxLength={8} />
                </label>
                <label className="block">
                  <span className="theme-text-primary text-sm font-medium">Complemento</span>
                  <input value={form.cc_address_complement} onChange={(event) => updateField('cc_address_complement', event.target.value)} className="theme-input mt-1 w-full px-4 py-3" maxLength={40} />
                </label>
              </div>
            </div>
            </>
            ) : null}
          </div>
        ) : null}

        {error ? <p className="theme-text-danger mt-4 text-sm">{error}</p> : null}

        <button type="button" onClick={handleSubmitPayment} disabled={isSubmitting} className="theme-primary-btn mt-5 w-full px-4 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? <Loader2 size={18} className="mr-2 animate-spin" /> : selectedMethod === 'pix' ? <QrCode size={18} className="mr-2" /> : <CreditCard size={18} className="mr-2" />}
          {selectedMethod === 'pix' ? 'Gerar pagamento Pix' : 'Pagar com cartão'}
        </button>
      </div>

      {paymentResult && selectedMethod === 'pix' ? (
        <div ref={pixResultRef} className="theme-card scroll-mt-6 p-5 text-center">
          <div className="theme-panel-success mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <CheckCircle2 size={28} className="theme-text-success" />
          </div>
          <h3 className="theme-text-primary text-xl font-bold">Pix gerado</h3>
          <p className="theme-text-secondary mt-2 text-sm">Após o pagamento, a confirmação do agendamento acontece automaticamente.</p>

          {qrCodeSrc ? (
            <div className="mx-auto mt-5 w-fit rounded-2xl bg-white p-3 shadow-[var(--shadow-soft)]">
              <img src={qrCodeSrc} alt="QR Code Pix" className="h-56 w-56 object-contain" />
            </div>
          ) : null}

          {pixCopyPasteCode ? (
            <div className="mt-5 text-left">
              <p className="theme-text-primary text-sm font-medium">Pix copia e cola</p>
              <button type="button" onClick={handleCopyPix} className="mt-2 flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 text-left">
                <span className="theme-text-secondary min-w-0 flex-1 truncate font-mono text-xs">{pixCopyPasteCode}</span>
                <Copy size={16} className="theme-text-accent shrink-0" />
              </button>
              {copySuccess ? <p className="theme-text-success mt-2 text-sm">Código copiado.</p> : null}
            </div>
          ) : null}

          {!qrCodeSrc && pixCopyPasteCode ? (
            <p className="theme-text-secondary mt-4 text-sm">Gerando QR Code Pix...</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default PaymentCheckout;