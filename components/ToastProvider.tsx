import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

type ToastType = 'info' | 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return ctx;
};

const toastStyles: Record<
  ToastType,
  { border: string; text: string; icon: string; Icon: typeof Info }
> = {
  success: {
    border: 'border-emerald-200/80',
    text: 'text-emerald-900',
    icon: 'text-emerald-600',
    Icon: CheckCircle2,
  },
  error: {
    border: 'border-red-200/80',
    text: 'text-red-900',
    icon: 'text-red-600',
    Icon: AlertCircle,
  },
  info: {
    border: 'border-sky-200/80',
    text: 'text-sky-950',
    icon: 'text-sky-600',
    Icon: Info,
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed inset-x-0 bottom-4 z-[100] flex justify-center pointer-events-none px-4"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div className="flex w-full max-w-sm flex-col gap-2">
          {toasts.map((toast) => {
            const s = toastStyles[toast.type];
            const Icon = s.Icon;
            return (
              <div
                key={toast.id}
                className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-xl backdrop-blur-md animate-tm-toast-in bg-white/95 ${s.border} ${s.text}`}
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${s.icon}`} strokeWidth={2.2} aria-hidden />
                <p className="leading-snug font-medium">{toast.message}</p>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
};
