import { ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = "max-w-md" }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-brand-dark-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl border border-brand-dark-100 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-900 p-6 shadow-2xl animate-scale-in`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand-dark-900 dark:text-brand-lime-50">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-brand-dark-400 transition-colors hover:bg-brand-dark-50 dark:hover:bg-brand-dark-800"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
