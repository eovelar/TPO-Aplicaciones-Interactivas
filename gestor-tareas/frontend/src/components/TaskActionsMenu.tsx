import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TaskActionsMenuProps {
  onEdit: () => void;
  onComplete: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export default function TaskActionsMenu({
  onEdit,
  onComplete,
  onDelete,
  disabled = false,
}: TaskActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calcula posición exacta del menú
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 150, // ajusta ancho del menú
      });
    }
  }, [open]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar al hacer scroll (para evitar flotantes mal ubicados)
  useEffect(() => {
    const handleScroll = () => setOpen(false);
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        className={`border border-gray-300 bg-white text-gray-700 text-sm px-3 py-1 rounded-md hover:bg-gray-100 flex items-center justify-center gap-1 transition ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Acciones
        <span className="text-xs">▾</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="absolute w-36 bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-[9999]"
            style={{
              top: menuPos.top,
              left: menuPos.left,
            }}
          >
            <div className="py-1 text-sm text-gray-700">
              <button
                onClick={() => {
                  onEdit();
                  setOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Editar
              </button>

              {!disabled && (
                <button
                  onClick={() => {
                    onComplete();
                    setOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Completar
                </button>
              )}

              <button
                onClick={() => {
                  onDelete();
                  setOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                Eliminar
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
