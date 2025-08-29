import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { Status } from '../types';
import { STATUS_COLORS } from '../consts';

interface ToastContextType {
  showToast: (message: string, type: Status['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [toast, setToast] = useState<Status | null>(null);

  const showToast = (message: string, type: Status['type']) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const value = useMemo(
    () => ({
      showToast,
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '10px',
            color: '#fff',
            backgroundColor: `${STATUS_COLORS[toast.type] ?? STATUS_COLORS.info}`,
            opacity: '80%',
            border: `1px solid ${STATUS_COLORS[toast.type] ?? STATUS_COLORS.info}`,
            borderRadius: '4px',
            zIndex: 1000,
          }}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
