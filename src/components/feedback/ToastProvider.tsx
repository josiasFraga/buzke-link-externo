'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type ToastVariant = 'error' | 'success' | 'info';

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ShowToastOptions {
  message: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  showToast: (options: ShowToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function getToastClasses(variant: ToastVariant) {
  if (variant === 'success') {
    return {
      container: 'theme-panel-success',
      text: 'theme-text-success',
      Icon: CheckCircle2,
    };
  }

  if (variant === 'info') {
    return {
      container: 'border border-[color:color-mix(in_srgb,var(--color-info-text)_28%,var(--color-border))] bg-[var(--color-info-bg)]',
      text: 'text-[var(--color-info-text)]',
      Icon: Info,
    };
  }

  return {
    container: 'theme-panel-error',
    text: 'theme-text-danger',
    Icon: AlertCircle,
  };
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(({ message, variant = 'info' }: ShowToastOptions) => {
    const nextToast: ToastItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      message,
      variant,
    };

    setToasts((currentItems) => [...currentItems, nextToast]);

    window.setTimeout(() => {
      removeToast(nextToast.id);
    }, 4500);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex flex-col items-center gap-3 px-4 sm:items-end">
        {toasts.map((toast) => {
          const { container, text, Icon } = getToastClasses(toast.variant);

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-[1.1rem] px-4 py-3 shadow-[var(--shadow-card)] ${container}`}
            >
              <Icon size={18} className={`${text} mt-0.5 shrink-0`} />
              <p className={`flex-1 text-sm font-medium ${text}`}>{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className={`rounded-full p-1 transition-colors hover:bg-black/5 ${text}`}
                aria-label="Fechar aviso"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider.');
  }

  return context;
}