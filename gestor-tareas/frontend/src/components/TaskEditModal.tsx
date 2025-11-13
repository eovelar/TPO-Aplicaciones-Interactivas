import { useState, useEffect } from "react";
import { api } from "../api/http";
import { useUser } from "../context/UserContext";

interface Task {
  id?: number;
  title: string;
  description: string;
  priority: "alta" | "media" | "baja";
  status: string;
  assignedToId?: number | null;
}

interface User {
  id: number;
  name: string;
  email: string;
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
    assignedToId:
      task.assignedToId !== undefined
        ? task.assignedToId
        : (task as any).assignedTo?.id || null,
  });
  const [users, setUsers] = useState<User[]>([]);

  // 🔹 Cargar usuarios (solo si el actual es propietario)
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

  // 🔹 Manejar cambios de texto / selects comunes
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

    console.log("📦 Payload enviado:", editedTask); // 👀
    onSave(editedTask);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[9999]">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] sm:w-[500px] transition-all duration-150">
        <h3 className="text-xl font-semibold text-blue-700 mb-4 text-center">
          {editedTask.id ? "Editar Tarea" : "Nueva Tarea"}
        </h3>

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

          {/* Prioridad + Estado */}
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

          {/* Asignar a usuario (solo propietario) */}
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

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2">
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
