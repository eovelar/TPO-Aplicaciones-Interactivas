import { useEffect, useState } from "react";
import { api } from "../api/http";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

interface Team {
  id: number;
  name: string;
  description?: string;
  members?: any[];
  tasks?: any[];
  owner?: any;
}

const Avatar = ({ name }: { name: string }) => {
  const letter = name ? name[0].toUpperCase() : "?";
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold">
      {letter}
    </div>
  );
};

export default function Teams() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [loading, setLoading] = useState(true);

  // ============================================================
  // CARGAR EQUIPOS
  // ============================================================
  const fetchTeams = async () => {
    try {
      const res = await api.get("/teams");

      let raw = res.data;

      // Compatibilidad con distintos formatos del backend
      if (Array.isArray(raw)) {
        setTeams(raw);
      } else if (raw.items) {
        setTeams(raw.items);
      } else if (raw.data) {
        setTeams(raw.data);
      } else {
        console.error("Formato desconocido en /teams:", raw);
        setTeams([]);
      }

    } catch (err) {
      console.error("Error al cargar equipos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // ============================================================
  // CREAR EQUIPO
  // ============================================================
  const createTeam = async () => {
    if (!newTeamName.trim()) return alert("El nombre es obligatorio");

    try {
      await api.post("/teams", {
        name: newTeamName,
        description: newTeamDescription,
      });

      setNewTeamName("");
      setNewTeamDescription("");
      fetchTeams();

    } catch (err) {
      console.error("Error al crear equipo:", err);
      alert("No se pudo crear el equipo");
    }
  };

  // ============================================================
  // ELIMINAR EQUIPO
  // ============================================================
  const deleteTeam = async (id: number) => {
    if (!confirm("¿Seguro que deseas eliminar este equipo?")) return;

    try {
      await api.delete(`/teams/${id}`);
      fetchTeams();
    } catch (err) {
      console.error("Error al eliminar equipo:", err);
      alert("Error al eliminar equipo");
    }
  };

  // ============================================================
  // UI
  // ============================================================
  if (loading) {
    return (
      <p className="text-center text-gray-600 mt-10">
        Cargando equipos...
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-semibold text-gray-800">Equipos</h2>

          <button
            onClick={createTeam}
            className="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition"
          >
            + Crear equipo
          </button>
        </div>

        {/* FORM CREACIÓN */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow mb-10">
          <input
            type="text"
            placeholder="Nombre del equipo..."
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-gray-300"
          />

          <textarea
            placeholder="Descripción (opcional)..."
            value={newTeamDescription}
            onChange={(e) => setNewTeamDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm min-h-[70px] mb-3 focus:ring-2 focus:ring-gray-300"
          />

          <button
            onClick={createTeam}
            className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-md text-sm font-medium transition"
          >
            Crear equipo
          </button>
        </div>

        {/* LISTA DE EQUIPOS */}
        {teams.length === 0 ? (
          <p className="text-center text-gray-600">
            No hay equipos creados todavía.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
              >

                {/* HEADER CARD */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {team.name}
                  </h3>

                  <p className="text-gray-600 text-sm mt-1">
                    {team.description || "Sin descripción"}
                  </p>

                  {/* STATS */}
                  <div className="flex items-center gap-3 mt-4 text-sm text-gray-700">
                    <span>👥 {team.members?.length ?? 0} miembros</span>
                    <span>•</span>
                    <span>📝 {team.tasks?.length ?? 0} tareas</span>
                  </div>

                  {/* AVATARES */}
                  <div className="flex items-center gap-2 mt-3">
                    {team.members && team.members.length > 0 ? (
                      <>
                        {team.members.slice(0, 3).map((m) => (
                          <Avatar key={m.id} name={m.name} />
                        ))}
                        {team.members.length > 3 && (
                          <div className="text-xs text-gray-600 ml-1">
                            +{team.members.length - 3}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 text-sm">Sin miembros</p>
                    )}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    className="text-gray-900 hover:underline text-sm font-medium"
                    onClick={() => navigate(`/teams/${team.id}`)}
                  >
                    Ver detalles
                  </button>

                  {/* Solo el propietario puede eliminar */}
                  {user?.id === team.owner?.id && (
                    <button
                      onClick={() => deleteTeam(team.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
