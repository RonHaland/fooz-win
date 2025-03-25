"use client";

type InfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title: string;
};

export function InfoModal({ isOpen, onClose, message, title }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-slate-300 mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700/70 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
