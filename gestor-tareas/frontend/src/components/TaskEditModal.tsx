import { useState } from "react";

interface Task {
  id?: number; // ← ahora es opcional (para nuevas tareas)
  title: string;
  description: string;
  priority: "alta" | "media" | "baja";
  status: string;
}

interface TaskEditModalProps {
  task: Task;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
}

export default function TaskEditModal({ task, onClose, onSave }: TaskEditModalProps) {
  const [editedTask, setEditedTask] = useState<Task>({ ...task });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedTask.title.trim()) return alert("El título es obligatorio");
    onSave(editedTask);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[9999]">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] sm:w-[500px] transition-all duration-150">
        <h3 className="text-xl font-semibold text-blue-700 mb-4 text-center">
          {editedTask.id ? "Editar Tarea" : "Nueva Tarea"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            type="text"
            placeholder="Título"
            value={editedTask.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            required
          />

          <textarea
            name="description"
            placeholder="Descripción"
            value={editedTask.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-24 resize-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />

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
