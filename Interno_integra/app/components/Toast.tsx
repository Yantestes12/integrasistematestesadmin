import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastMessage = {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  description?: string;
};

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === "success";
        const isWarning = toast.type === "warning";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-start gap-3 backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 duration-200 ${
              isSuccess
                ? "bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/20"
                : isWarning
                ? "bg-amber-950/95 text-amber-100 border-amber-500/50 shadow-amber-950/20"
                : isError
                ? "bg-red-950/95 text-red-100 border-red-500/50 shadow-red-950/20"
                : "bg-slate-900/95 text-slate-100 border-slate-700/50"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {isError && <AlertCircle className="w-5 h-5 text-red-400" />}
              {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-blue-400" />}
            </div>

            <div className="flex-1">
              <h4 className="text-xs font-black tracking-wide uppercase">{toast.title}</h4>
              {toast.description && (
                <p className="text-xs text-slate-300 font-medium mt-0.5">{toast.description}</p>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded-lg transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
