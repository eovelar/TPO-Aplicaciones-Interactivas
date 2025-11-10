import { useState } from "react";
import { api } from "../api/http";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

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
    } catch (err) {
      alert("Error al iniciar sesión ❌");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ textAlign: "center", marginTop: "4rem" }}>
      <h2>Iniciar sesión</h2>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button type="submit">Entrar</button>
    </form>
  );
}
