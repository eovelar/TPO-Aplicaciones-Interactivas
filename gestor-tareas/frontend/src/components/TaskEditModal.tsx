import { useState, useEffect } from "react";
import { api } from "../api/http";
import { useUser } from "../context/UserContext";

interface Task {
  id?: number;
  title: string;
  description: string;
  priority: "alta" | "media" | "baja";
  status: string;
  fecha_limite: string;
  assignedToId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Comment {
  id: number;
  contenido: string;
  createdAt: string;
  user: { id: number; name: string; email: string } | null;
}

interface TaskEditModalProps {
  task: Task;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

export default function TaskEditModal({
  task,
  onClose,
  onSave,
}: TaskEditModalProps) {
  const { user } = useUser();
  const [editedTask, setEditedTask] = useState<Task>({
    ...task,
    fecha_limite: (task as any).fecha_limite || "",
    assignedToId:
      task.assignedToId !== undefined
        ? task.assignedToId
        : (task as any).assignedTo?.id || null,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  // 🔹 Cargar usuarios (solo propietario)
  useEffect(() => {
    if (user?.role === "propietario") {
      api
        .get("/users", {
          headers: {
            "x-user-id": String(user.id),
            "x-user-role": user.role,
            "x-user-email": user.email,
          },
        })
        .then((res) => setUsers(res.data))
        .catch((err) => console.error("Error al cargar usuarios:", err));
    }
  }, [user]);

  // 🔹 Cargar comentarios
  const fetchComments = async () => {
    if (!editedTask.id) return;
    try {
      const res = await api.get(`/tasks/${editedTask.id}/comments`, {
        headers: {
          "x-user-id": String(user?.id),
          "x-user-role": user?.role,
          "x-user-email": user?.email,
        },
      });
      setComments(res.data.items || []);
    } catch (err) {
      console.error("Error al cargar comentarios:", err);
    }
  };

  useEffect(() => {
    if (editedTask.id) fetchComments();
  }, [editedTask.id]);

  // 🔹 Agregar comentario
  const handleAddComment = async () => {
    if (!newComment.trim() || !editedTask.id) return;
    try {
      await api.post(
        `/tasks/${editedTask.id}/comments`,
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

  // 🔹 Eliminar comentario
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

  // 🔹 Cambiar valores del formulario
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({
      ...prev,
      [name]: name === "assignedToId" ? (value ? Number(value) : null) : value,
    }));
  };

  // 🔹 Guardar cambios
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedTask.title.trim()) return alert("El título es obligatorio");
    if (!editedTask.fecha_limite)
      return alert("La fecha límite es obligatoria");

    const hoy = new Date();
    const limite = new Date(editedTask.fecha_limite);
    hoy.setHours(0, 0, 0, 0);
    if (limite < hoy)
      return alert("La fecha límite no puede ser en el pasado");

    onSave(editedTask);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[9999] overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] sm:w-[550px] max-h-[90vh] overflow-y-auto transition-all duration-150">
        <h3 className="text-xl font-semibold text-blue-700 mb-2 text-center">
          {editedTask.id ? "Editar Tarea" : "Nueva Tarea"}
        </h3>

        {/* 🕒 Fechas de creación y actualización */}
        {(editedTask.createdAt || editedTask.updatedAt) && (
          <div className="flex justify-between text-xs text-gray-500 mb-3 px-1">
            {editedTask.createdAt && (
              <span>
                🕒 Creada:{" "}
                {new Date(editedTask.createdAt).toLocaleDateString("es-AR")}
              </span>
            )}
            {editedTask.updatedAt && (
              <span>
                🔁 Actualizada:{" "}
                {new Date(editedTask.updatedAt).toLocaleDateString("es-AR")}
              </span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <input
            name="title"
            type="text"
            placeholder="Título"
            value={editedTask.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            required
          />

          {/* Descripción */}
          <textarea
            name="description"
            placeholder="Descripción"
            value={editedTask.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-24 resize-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />

          {/* Fecha límite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha límite:
            </label>
            <input
              type="date"
              name="fecha_limite"
              value={editedTask.fecha_limite}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              required
            />
          </div>

          {/* Prioridad y estado */}
          <div className="flex gap-3">
            <select
              name="priority"
              value={editedTask.priority}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>

            <select
              name="status"
              value={editedTask.status}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            >
              <option value="pendiente">Pendiente</option>
              <option value="en progreso">En progreso</option>
              <option value="completada">Completada</option>
            </select>
          </div>

          {/* Asignar usuario */}
          {user?.role === "propietario" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asignar a usuario:
              </label>
              <select
                name="assignedToId"
                value={editedTask.assignedToId || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              >
                <option value="">-- Sin asignar --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Comentarios */}
          {editedTask.id && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">💬 Comentarios</h4>

              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm">Aún no hay comentarios.</p>
              ) : (
                <ul className="space-y-3">
                  {comments.map((c) => (
                    <li
                      key={c.id}
                      className="border border-gray-200 rounded-md p-3 bg-gray-50"
                    >
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
                        {(user?.role === "propietario" ||
                          user?.id === c.user?.id) && (
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

              {/* Campo nuevo comentario */}
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  placeholder="Escribí un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700"
                >
                  Enviar
                </button>
              </div>
            </div>
          )}

          {/* Botones finales */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
