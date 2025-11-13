import { useEffect, useState } from "react";
import { api } from "../api/http";
import { useUser } from "../context/UserContext";

interface Comment {
  id: number;
  contenido: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default function TaskComments({ taskId }: { taskId: number }) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/tasks/${taskId}/comments`, {
        headers: {
          "x-user-id": String(user?.id),
          "x-user-role": user?.role,
          "x-user-email": user?.email,
        },
      });
      setComments(res.data.items || []);
    } catch (err) {
      console.error("Error al cargar comentarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.post(
        `/tasks/${taskId}/comments`,
        { contenido: newComment.trim() },
        {
          headers: {
            "x-user-id": String(user?.id),
            "x-user-role": user?.role,
            "x-user-email": user?.email,
          },
        }
      );
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Error al agregar comentario:", err);
      alert("No se pudo agregar el comentario");
    }
  };

  const handleDeleteComment = async (id: number) => {
    if (!confirm("¿Eliminar comentario?")) return;
    try {
      await api.delete(`/comments/${id}`, {
        headers: {
          "x-user-id": String(user?.id),
          "x-user-role": user?.role,
          "x-user-email": user?.email,
        },
      });
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error al eliminar comentario:", err);
    }
  };

  if (loading) return <p className="text-gray-500 text-sm">Cargando comentarios...</p>;

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <h4 className="font-semibold text-gray-800 mb-3">💬 Comentarios</h4>

      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm">Aún no hay comentarios.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="border border-gray-200 rounded-md p-3 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-800">
                    <strong>{c.user?.name || "Usuario eliminado"}</strong> —{" "}
                    <span className="text-gray-500 text-xs">
                      {new Date(c.createdAt).toLocaleString("es-AR")}
                    </span>
                  </p>
                  <p className="text-gray-700 text-sm mt-1">{c.contenido}</p>
                </div>
                {(user?.role === "propietario" || user?.id === c.user?.id) && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Campo para agregar comentario */}
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          placeholder="Escribí un comentario..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
        />
        <button
          onClick={handleAddComment}
          className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
