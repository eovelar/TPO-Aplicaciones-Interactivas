import type { ReactNode } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/logo.png";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-white underline font-semibold"
      : "text-purple-200 hover:text-white";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-inter">

      {/* NAV SUPERIOR */}
      <header
        className="text-white py-4 shadow-md"
        style={{ backgroundColor: "#7600ff" }}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">

          {/* LOGO SOLO – proporción original */}
          <img
            src={Logo}
            alt="Focusin Logo"
            onClick={() => navigate("/tasks")}
            className="cursor-pointer hover:opacity-90 transition"
            style={{
              height: "40px",   // tamaño visible ideal
              width: "auto",    // mantiene proporción original
              objectFit: "contain"
            }}
          />

          {/* NAV */}
          {user && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/tasks")}
                className={`text-sm font-medium hover:underline ${isActive("/tasks")}`}
              >
                Tareas
              </button>

              <button
                onClick={() => navigate("/teams")}
                className={`text-sm font-medium hover:underline ${isActive("/teams")}`}
              >
                Equipos
              </button>

              <button
                onClick={() => navigate("/activity")}
                className={`text-sm font-medium hover:underline ${isActive("/activity")}`}
              >
                Actividad
              </button>

              <span className="text-sm sm:text-base font-light text-purple-200 hidden sm:block">
                {user.email}
              </span>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition"
                style={{ backgroundColor: "#5b00c7" }}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* CONTENIDO */}
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
