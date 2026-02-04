"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

interface Toast {
  id: number;
  message: string;
  type: "info" | "success" | "error";
}

interface ToastContextType {
  info: (msg: string) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  info: () => {},
  success: () => {},
  error: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const addToast = useCallback((message: string, type: Toast["type"]) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const info = useCallback((msg: string) => addToast(msg, "info"), [addToast]);
  const success = useCallback((msg: string) => addToast(msg, "success"), [addToast]);
  const error = useCallback((msg: string) => addToast(msg, "error"), [addToast]);

  return (
    <ToastContext.Provider value={{ info, success, error }}>
      {children}
      <div className="fixed bottom-24 left-0 right-0 flex flex-col items-center z-50 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="mb-2 px-6 py-3 rounded-xl text-sm font-semibold text-white text-center max-w-[calc(100vw-40px)] animate-fade-up"
            style={{
              backgroundColor:
                toast.type === "error"
                  ? "var(--danger)"
                  : toast.type === "success"
                    ? "var(--accent-dark)"
                    : "var(--gray-800)",
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
