import {
  useState,
  useCallback,
  createContext,
  useContext,
  useEffect,
} from "react";

// ─────────────────────────────────────────────
// 1. CONTEXT + HOOK MODAL
// ─────────────────────────────────────────────
const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);

  const openModal = useCallback(({ title, content }) => {
    setModal({ title, content });
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  // ESC key
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeModal]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {/* ───────── MODAL UI ───────── */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000]"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {modal.title}
              </h2>

              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:text-black hover:bg-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">{modal.content}</div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used inside ModalProvider");
  return ctx;
}