import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-emerald-500/40 text-white rounded-lg shadow-2xl animate-fade-in text-xs font-medium print:hidden pointer-events-none">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};
