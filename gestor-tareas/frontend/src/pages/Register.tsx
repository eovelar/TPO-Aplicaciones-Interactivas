import { useState } from "react";
import { api } from "../api/http";
import { useNavigate } from "react-router-dom";

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
        role: "miembro", // 🔥 tu backend lo espera
      });

      alert("Usuario registrado correctamente");
      navigate("/"); // volver al login

    } catch (err: any) {
      console.error("Error al registrar:", err);
      alert(err.response?.data?.message || "No se pudo registrar");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h2 className="text-xl font-semibold text-center mb-4">
          Crear cuenta
        </h2>

        <input
          className="w-full border px-3 py-2 mb-3 rounded"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full border px-3 py-2 mb-3 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border px-3 py-2 mb-4 rounded"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Registrarse
        </button>

        <p
          className="text-center mt-4 text-sm text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate("/")}
        >
          ¿Ya tenés cuenta? Iniciar sesión
        </p>
      </div>
    </div>
  );
}
