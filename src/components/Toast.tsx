import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3 bg-slate-900/95 border border-emerald-500/40 text-white rounded-xl shadow-2xl animate-fade-in text-xs font-medium print:hidden pointer-events-none backdrop-blur-xs">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      <span>{message}</span>
    </div>
  );
};
