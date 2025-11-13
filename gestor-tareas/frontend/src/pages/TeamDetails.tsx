import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/http";
import { useUser } from "../context/UserContext";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Team {
  id: number;
  name: string;
  description: string;
  members: Member[];
  owner: Member;
}

export default function TeamDetails() {
  const { id } = useParams();
  const { user } = useUser();

  const [team, setTeam] = useState<Team | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");

  const fetchTeam = async () => {
    try {
      const res = await api.get(`/teams`, {
        headers: {
          "x-user-id": user?.id,
          "x-user-role": user?.role,
          "x-user-email": user?.email,
        },
      });

      const found = res.data.find((t: Team) => t.id === Number(id));
      setTeam(found);
    } catch (err) {
      console.error("Error al cargar equipo:", err);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

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

      alert("Miembro agregado correctamente");
      setInviteEmail("");
      fetchTeam();
    } catch (err) {
      alert("No se pudo agregar el miembro");
    }
  };

  if (!team)
    return <p className="text-center text-gray-600 mt-10">Cargando...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-semibold mb-4">👥 {team.name}</h2>

      <p className="text-gray-700 mb-6">{team.description || "Sin descripción"}</p>

      {/* INFO DEL EQUIPO */}
      <div className="bg-white p-5 rounded-xl shadow border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold mb-4">Información del equipo</h3>

        <p className="text-gray-700">
          <strong>Propietario:</strong> {team.owner?.name} ({team.owner?.email})
        </p>

        <p className="text-gray-700 mt-2">
          <strong>Miembros:</strong> {team.members.length}
        </p>
      </div>

      {/* LISTA DE MIEMBROS */}
      <div className="bg-white p-5 rounded-xl shadow border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold mb-4">Miembros del equipo</h3>

        {team.members.length === 0 ? (
          <p className="text-gray-600">Aún no hay miembros.</p>
        ) : (
          <ul className="space-y-2">
            {team.members.map((m) => (
              <li
                key={m.id}
                className="bg-gray-50 p-3 rounded-lg border flex justify-between"
              >
                <span>
                  <strong>{m.name}</strong> — {m.email}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* INVITAR MIEMBRO */}
      <div className="bg-white p-5 rounded-xl shadow border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Invitar miembro</h3>

        <div className="flex gap-3">
          <input
            type="email"
            placeholder="Email del usuario"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 border px-3 py-2 rounded-lg"
          />
          <button
            onClick={handleInvite}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg"
          >
            Invitar
          </button>
        </div>
      </div>
    </div>
  );
}
