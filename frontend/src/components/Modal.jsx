import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ isOpen, onClose, children ,noX = false}) {
  // Fermer avec la touche ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 relative max-h-[90vh] overflow-y-auto w-fit max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton fermer */}
        {!noX && <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
        >
          ✕
        </button>}

        {/* Contenu du modal */}
        <div className="pr-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}