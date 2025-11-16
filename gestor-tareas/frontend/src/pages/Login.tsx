import { useState } from "react";
import { api } from "../api/http";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import BlackLogo from "../assets/logo-black.png"; // ⬅️ logo versión negra

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      setUser(res.data.user);
      alert("Inicio de sesión exitoso ✅");
      navigate("/tasks");
    } catch {
      alert("Credenciales inválidas ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-white to-gray-50 flex items-center justify-center px-4">

      {/* CARD */}
      <div className="bg-white shadow-xl rounded-2xl p-10 w-[90%] sm:w-[400px] border border-gray-200">

        {/* LOGO NEGRO */}
        <img
          src={BlackLogo}
          alt="Focusin Logo Black"
          className="mx-auto mb-6"
          style={{
            height: "80px",     // tamaño elegante
            width: "auto",
            objectFit: "contain"
          }}
        />

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#7600ff] focus:border-[#7600ff]"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#7600ff] focus:border-[#7600ff]"
            required
          />

          <button
            type="submit"
            className="w-full text-white font-semibold py-2 rounded-md transition"
            style={{
              backgroundColor: "#7600ff"
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#5b00c7")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#7600ff")
            }
          >
            Ingresar
          </button>
        </form>

        {/* LINK A REGISTRO */}
        <p
          className="mt-5 text-center text-sm text-[#7600ff] cursor-pointer hover:underline"
          onClick={() => navigate("/register")}
        >
          ¿No tenés cuenta? Crear una cuenta
        </p>
      </div>
    </div>
  );
}
