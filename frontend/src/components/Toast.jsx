import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl border border-white/10 backdrop-blur-xl bg-black/60 shadow-2xl pointer-events-auto select-none max-w-sm"
      >
        <div className="shrink-0">
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-500" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white leading-snug">
            {toast.message}
          </p>
        </div>

        <button 
          onClick={onClose}
          className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-wider pl-2"
        >
          Dismiss
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;
