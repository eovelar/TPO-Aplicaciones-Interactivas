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

export default function TeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [team, setTeam] = useState<Team | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Cargar equipo
  const fetchTeam = async () => {
    try {
      const res = await api.get("/teams", {
        headers: {
          "x-user-id": user?.id,
          "x-user-role": user?.role,
          "x-user-email": user?.email,
        },
      });

      const found = res.data.find((t: Team) => t.id === Number(id));
      setTeam(found || null);
    } catch (err) {
      console.error("Error al cargar equipo:", err);
    } finally {
      setLoading(false);
    }
  };


  //  Cargar tareas asignadas
  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks", {
        headers: {
          "x-user-id": user?.id,
          "x-user-role": user?.role,
          "x-user-email": user?.email,
        },
      });

      const filtered = res.data.filter((t: Task) =>
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

  // Invitar miembro

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return alert("Ingresá un email válido");

    try {
      await api.post(
        `/teams/${id}/invite`,
        { email: inviteEmail },
        {
          headers: {
            "x-user-id": user?.id,
            "x-user-role": user?.role,
            "x-user-email": user?.email,
          },
        }
      );

      setInviteEmail("");
      fetchTeam();
      alert("Usuario agregado ✔");
    } catch (err) {
      console.error(err);
      alert("No se pudo invitar al usuario");
    }
  };

  // Quitar miembro

  const removeMember = async (memberId: number) => {
    if (!confirm("¿Quitar miembro del equipo?")) return;

    try {
      await api.delete(`/teams/${id}/members/${memberId}`, {
        headers: {
          "x-user-id": user?.id,
          "x-user-role": user?.role,
          "x-user-email": user?.email,
        },
      });

      fetchTeam();
    } catch (err) {
      console.error("Error al remover miembro:", err);
      alert("No se pudo remover al miembro");
    }
  };

  // Render
  if (loading || !team)
    return <p className="text-center mt-10 text-gray-500">Cargando equipo...</p>;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* VOLVER */}
        <button
          onClick={() => navigate("/teams")}
          className="mb-6 text-purple-600 hover:underline text-sm"
        >
          ← Volver a Equipos
        </button>

        {/* CABECERA */}
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Equipo: {team.name}
        </h2>

        {/* DESCRIPCIÓN DEL EQUIPO */}
        {team.description && (
          <p className="text-gray-700 text-md mb-4 whitespace-pre-line">
            {team.description}
          </p>
        )}

        <p className="text-gray-600 mb-6">
          Propietario: <strong>{team.owner?.name}</strong>
        </p>

        {/* INVITAR */}
        <div className="bg-white p-5 rounded-xl border shadow mb-8">
          <h3 className="text-lg font-semibold mb-3">Invitar miembro</h3>

          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Email del usuario..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={handleInvite}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm"
            >
              Invitar
            </button>
          </div>
        </div>

        {/* MIEMBROS */}
        <div className="bg-white p-5 rounded-xl border shadow mb-8">
          <h3 className="text-lg font-semibold mb-4">Miembros del equipo</h3>

          {team.members.length === 0 ? (
            <p className="text-gray-500">Aún no hay miembros.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {team.members.map((m) => (
                <li
                  key={m.id}
                  className="flex justify-between items-center py-3"
                >
                  <div>
                    <p className="font-medium text-gray-800">{m.name}</p>
                    <p className="text-sm text-gray-500">{m.email}</p>
                  </div>

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
        <div className="bg-white p-5 rounded-xl border shadow">
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
                  <p className="font-semibold">{t.title}</p>
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
