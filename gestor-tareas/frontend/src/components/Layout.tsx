import type { ReactNode } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-inter">
      {/* NAV SUPERIOR */}
      <header className="bg-blue-600 text-white py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          {/* Título principal */}
          <div
            onClick={() => navigate("/tasks")}
            className="text-xl sm:text-2xl font-semibold cursor-pointer hover:opacity-90 transition"
          >
            Focusin
          </div>

          {/* Menú de navegación */}
          {user && (
            <div className="flex items-center gap-4">
              {/* Botón de navegación */}
              <button
                onClick={() => navigate("/tasks")}
                className={`text-sm font-medium hover:underline ${
                  location.pathname === "/tasks" ? "text-white" : "text-blue-100"
                }`}
              >
                Tareas
              </button>
              <button
                onClick={() => navigate("/teams")}
                className={`text-sm font-medium hover:underline ${
                  location.pathname === "/teams" ? "text-white" : "text-blue-100"
                }`}
              >
                Equipos
              </button>

              {/* Info del usuario */}
              <span className="text-sm sm:text-base font-light text-blue-100 hidden sm:block">
                {user.email}
              </span>

              {/* Botón de cierre de sesión */}
              <button
                onClick={handleLogout}
                className="bg-blue-500 hover:bg-blue-700 px-3 py-1.5 rounded-md text-sm font-medium transition"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-100 border-t mt-10">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} UADE • Aplicaciones Interactivas
        </div>
      </footer>
    </div>
  );
}
