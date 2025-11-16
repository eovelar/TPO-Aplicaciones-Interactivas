import { useState } from "react";
import { api } from "../api/http";
import { useNavigate } from "react-router-dom";
import BlackLogo from "../assets/logo-black.png"; // ⬅️ logo negro

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return alert("Completá todos los campos");
    }

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role: "miembro",
      });

      alert("Usuario registrado correctamente");
      navigate("/"); 

    } catch (err: any) {
      console.error("Error al registrar:", err);
      alert(err.response?.data?.message || "No se pudo registrar");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 via-white to-gray-50 px-4">
      
      <div className="bg-white p-8 rounded-2xl shadow-xl w-[90%] sm:w-80 border border-gray-200">

        {/* LOGO NEGRO */}
        <img
          src={BlackLogo}
          alt="Focusin Black Logo"
          className="mx-auto mb-6"
          style={{
            height: "80px",
            width: "auto",
            objectFit: "contain",
          }}
        />

        <h2 className="text-xl font-semibold text-center mb-6">
          Crear cuenta
        </h2>

        {/* INPUTS */}
        <input
          className="w-full border border-gray-300 px-3 py-2 mb-3 rounded focus:ring-2 focus:ring-[#7600ff] focus:border-[#7600ff]"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full border border-gray-300 px-3 py-2 mb-3 rounded focus:ring-2 focus:ring-[#7600ff] focus:border-[#7600ff]"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border border-gray-300 px-3 py-2 mb-4 rounded focus:ring-2 focus:ring-[#7600ff] focus:border-[#7600ff]"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* BOTÓN */}
        <button
          onClick={handleRegister}
          className="w-full text-white font-semibold py-2 rounded transition"
          style={{
            backgroundColor: "#7600ff",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#5b00c7")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#7600ff")
          }
        >
          Registrarse
        </button>

        {/* VOLVER AL LOGIN */}
        <p
          className="text-center mt-4 text-sm text-[#7600ff] cursor-pointer hover:underline"
          onClick={() => navigate("/")}
        >
          ¿Ya tenés cuenta? Iniciar sesión
        </p>
      </div>
    </div>
  );
}
