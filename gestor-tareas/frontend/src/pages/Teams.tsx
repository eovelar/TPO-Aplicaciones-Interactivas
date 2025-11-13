import { useEffect, useState } from "react";
import { api } from "../api/http";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom"; // 🔹 IMPORTACIÓN NUEVA

interface Team {
  id: number;
  name: string;
  description?: string;
  members?: any[];
  owner?: any;
}

export default function Teams() {
  const { user } = useUser();
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const navigate = useNavigate(); // 🔹 INICIALIZACIÓN

  // =====================
  // 🔹 Cargar equipos
  // =====================
  const fetchTeams = async () => {
    try {
      const res = await api.get("/teams", {
        headers: {
          "x-user-id": user?.id,
          "x-user-role": user?.role,
        },
      });
      setTeams(res.data);
    } catch (err) {
      console.error("Error al cargar equipos:", err);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // =====================
  // 🔹 Crear equipo
  // =====================
  const createTeam = async () => {
    if (!newTeamName.trim()) return alert("El nombre es obligatorio");

    try {
      await api.post(
        "/teams",
        { name: newTeamName, description: "" },
        {
          headers: {
            "x-user-id": user?.id,
            "x-user-role": user?.role,
          },
        }
      );

      setNewTeamName("");
      fetchTeams();
    } catch (err) {
      alert("No se pudo crear el equipo");
    }
  };

  // =====================
  // 🔹 Eliminar equipo
  // =====================
  const deleteTeam = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este equipo?")) return;

    try {
      await api.delete(`/teams/${id}`, {
        headers: {
          "x-user-id": user?.id,
          "x-user-role": user?.role,
        },
      });

      fetchTeams();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error al eliminar el equipo");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* TÍTULO */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>👥</span> Gestión de Equipos
        </h2>

        {/* FORMULARIO DE CREACIÓN */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow mb-8 flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Nombre del nuevo equipo..."
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-300"
          />
          <button
            onClick={createTeam}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Crear
          </button>
        </div>

        {/* LISTA EN TARJETAS */}
        {teams.length === 0 ? (
          <p className="text-center text-gray-600">No hay equipos creados.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-white p-5 rounded-xl shadow border border-gray-200 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {team.name}
                  </h3>

                  <p className="text-gray-500 text-sm mb-2">ID: {team.id}</p>

                  <p className="text-gray-700 text-sm">
                    👥 Miembros: <strong>{team.members?.length ?? 0}</strong>
                  </p>
                </div>

                <div className="flex justify-between items-center mt-5">

                  {/* 🔹 VER DETALLES → redirige a /teams/:id */}
                  <button
                    onClick={() => navigate(`/teams/${team.id}`)}
                    className="text-purple-600 hover:underline text-sm"
                  >
                    Ver detalles
                  </button>

                  {/* 🔹 BOTÓN ELIMINAR */}
                  <button
                    onClick={() => deleteTeam(team.id)}
                    className="text-red-500 hover:text-red-700 font-medium text-sm"
                  >
                    Eliminar
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
