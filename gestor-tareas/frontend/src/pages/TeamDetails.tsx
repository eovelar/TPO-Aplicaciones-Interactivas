import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/http";
import { useUser } from "../context/UserContext";

interface Member {
  id: number;
  name: string;
  email: string;
  role: "propietario" | "miembro";
}

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  fecha_limite: string;
  assignedTo?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface Team {
  id: number;
  name: string;
  description?: string;
  members: Member[];
  owner: Member;
}

const Avatar = ({ name }: { name: string }) => {
  const letter = name ? name[0].toUpperCase() : "?";
  return (
    <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-semibold">
      {letter}
    </div>
  );
};

export default function TeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [team, setTeam] = useState<Team | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  // ============================================================
  // CARGAR EQUIPO
  // ============================================================
  const fetchTeam = async () => {
    try {
      const res = await api.get(`/teams/${id}`);
      const teamData = res.data?.data ?? res.data;
      setTeam(teamData);
    } catch (err) {
      console.error("Error al cargar equipo:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CARGAR TAREAS ASIGNADAS A USUARIOS DEL EQUIPO
  // ============================================================
  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");

      const list =
        Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      // Filtrar tareas asignadas a miembros del equipo
      const filtered = list.filter((t: Task) =>
        team?.members.some((m) => m.id === t.assignedTo?.id)
      );

      setTasks(filtered);
    } catch (err) {
      console.error("Error al cargar tareas:", err);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  useEffect(() => {
    if (team) fetchTasks();
  }, [team]);

  // ============================================================
  // INVITAR MIEMBRO
  // ============================================================
  const handleInvite = async () => {
    if (!inviteEmail.trim()) return alert("Ingresá un email válido");

    try {
      await api.post(`/teams/${id}/invite`, { email: inviteEmail });

      setInviteEmail("");
      fetchTeam();
      alert("Usuario agregado correctamente");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "No se pudo invitar al usuario");
    }
  };

  // ============================================================
  // REMOVER MIEMBRO
  // ============================================================
  const removeMember = async (memberId: number) => {
    if (!confirm("¿Quitar miembro del equipo?")) return;

    try {
      await api.delete(`/teams/${id}/members/${memberId}`);
      fetchTeam();
    } catch (err) {
      console.error("Error al remover miembro:", err);
      alert("No se pudo remover al miembro");
    }
  };

  // ============================================================
  // LOADING
  // ============================================================
  if (loading)
    return <p className="text-center mt-10 text-gray-600">Cargando equipo...</p>;

  if (!team)
    return (
      <p className="text-center mt-10 text-red-600">
        No se encontró el equipo.
      </p>
    );

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => navigate("/teams")}
          className="mb-6 text-gray-600 hover:text-gray-800 text-sm"
        >
          ← Volver a Equipos
        </button>

        {/* HEADER */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-xl mb-10">
          <h1 className="text-3xl font-semibold text-gray-800">
            {team.name}
          </h1>

          {team.description && (
            <p className="text-gray-700 text-sm mt-2 whitespace-pre-line">
              {team.description}
            </p>
          )}

          <div className="flex items-center gap-6 mt-5 text-gray-700 text-sm">
            <span>{team.members.length} miembros</span>
            <span>•</span>
            <span>{tasks.length} tareas asignadas</span>
          </div>

          <p className="text-gray-600 text-sm mt-4">
            Propietario: <strong>{team.owner?.name}</strong>
          </p>
        </div>

        {/* INVITAR */}
        <div className="bg-white p-5 rounded-xl border shadow-sm mb-10">
          <h3 className="text-lg font-semibold mb-3">Invitar miembro</h3>

          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Email del usuario"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={handleInvite}
              className="bg-gray-800 hover:bg-black text-white px-5 py-2 rounded-lg text-sm"
            >
              Invitar
            </button>
          </div>
        </div>

        {/* MIEMBROS */}
        <div className="bg-white p-5 rounded-xl border shadow-sm mb-10">
          <h3 className="text-lg font-semibold mb-4">Miembros del equipo</h3>

          {team.members.length === 0 ? (
            <p className="text-gray-500">Aún no hay miembros.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {team.members.map((m) => (
                <li key={m.id} className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} />
                    <div>
                      <p className="font-medium text-gray-800">{m.name}</p>
                      <p className="text-sm text-gray-500">{m.email}</p>
                    </div>
                  </div>

                  {/* Quitar solo si NO es el owner */}
                  {m.id !== team.owner.id && (
                    <button
                      onClick={() => removeMember(m.id)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Quitar
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* TAREAS */}
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Tareas del equipo</h3>

          {tasks.length === 0 ? (
            <p className="text-gray-500">Este equipo aún no tiene tareas asignadas.</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((t) => (
                <li
                  key={t.id}
                  className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                >
                  <p className="font-semibold text-gray-800">{t.title}</p>
                  <p className="text-sm text-gray-600">
                    Estado: {t.status} | Prioridad: {t.priority}
                  </p>
                  <p className="text-sm text-gray-600">
                    Fecha límite:{" "}
                    {new Date(t.fecha_limite).toLocaleDateString("es-AR")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
