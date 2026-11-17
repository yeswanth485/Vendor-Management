import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ShieldAlert, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { notificationService, AppNotification } from '../../services/notificationService';

export function ToastContainer() {
  const [toasts, setToasts] = useState<AppNotification[]>([]);

  useEffect(() => {
    let prevList: AppNotification[] = [];
    return notificationService.subscribe((list) => {
      // Find new incoming items that weren't in prevList
      if (prevList.length > 0 && list.length > prevList.length) {
        const newest = list[0];
        if (newest && !newest.read) {
          setToasts((current) => [newest, ...current.slice(0, 2)]);
        }
      }
      prevList = list;
    });
  }, []);

  const removeToast = (id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isCritical = toast.priority === 'CRITICAL';
          const isHigh = toast.priority === 'HIGH';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto p-3.5 rounded-lg border shadow-xl bg-white flex items-start gap-3 relative overflow-hidden ${
                isCritical 
                  ? 'border-rose-300 ring-1 ring-rose-200' 
                  : isHigh 
                  ? 'border-amber-300 ring-1 ring-amber-200' 
                  : 'border-indigo-200'
              }`}
            >
              <div className={`p-1.5 rounded-md shrink-0 ${
                isCritical 
                  ? 'bg-rose-100 text-rose-700' 
                  : isHigh 
                  ? 'bg-amber-100 text-amber-700' 
                  : 'bg-indigo-100 text-indigo-700'
              }`}>
                {isCritical ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : isHigh ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">
                    {toast.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">just now</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
