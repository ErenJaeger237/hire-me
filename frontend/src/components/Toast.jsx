import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export function Toast({ message, type = 'success', onDismiss }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // wait for animation
    }, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  if (!isVisible && !message) return null;

  return (
    <div 
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${
        type === 'success' 
          ? 'bg-emerald-600 text-white border-emerald-500' 
          : 'bg-rose-600 text-white border-rose-500'
      }`}
    >
      {type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
      <span className="font-medium text-sm">{message}</span>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(onDismiss, 300);
        }}
        className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Hook to manage toast state
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  return { toast, showToast, hideToast };
}
