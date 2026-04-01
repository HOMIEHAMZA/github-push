'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore, type ToastType } from '@/store/useToastStore';

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="text-cyan-400" size={18} />,
  error: <AlertCircle className="text-red-400" size={18} />,
  info: <Info className="text-blue-400" size={18} />,
};

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="group relative flex items-center gap-3 px-5 py-4 min-w-[300px] bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Success/Error/Info Icon */}
            <div className="shrink-0">{TOAST_ICONS[toast.type]}</div>

            {/* Message */}
            <p className="flex-1 text-sm font-medium text-white/90">{toast.message}</p>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md text-white/20 hover:text-white hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
            >
              <X size={14} />
            </button>

            {/* Subtle Progress Bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 3, ease: 'linear' }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500/30 origin-left"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
