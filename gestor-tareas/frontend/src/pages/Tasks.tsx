import { useEffect, useState } from "react";
import { api } from "../api/http";
import { useUser } from "../context/UserContext";
import TaskEditModal from "../components/TaskEditModal";
import TaskActionsMenu from "../components/TaskActionsMenu";

interface Task {
  id?: number;
  title: string;
  description: string;
  priority: "alta" | "media" | "baja";
  status: string;
  fecha_limite: string;
  createdAt?: string;
  updatedAt?: string;
  assignedTo?: {
    id: number;
    name: string;
    email: string;
  } | null;
  assignedToId?: number | null;
}

export default function Tasks() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterPriority, setFilterPriority] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");

  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Task>({
    title: "",
    description: "",
    priority: "media",
    status: "pendiente",
    fecha_limite: "",
    assignedTo: null,
  });

  // PAGINACIÓN
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // ----------------------------------------------------------
  // Cargar tareas desde backend (maneja ambos formatos: array o {data, meta})
  // ----------------------------------------------------------
  const fetchTasks = async () => {
    if (!user) return;

    try {
      const res = await api.get("/tasks", {
        headers: {
          "x-user-id": String(user.id),
          "x-user-role": user.role,
          "x-user-email": user.email,
        },
        params: {
          page,
          limit,
          status: filterStatus,
          priority: filterPriority,
          search: searchQuery,
        },
      });

      // Soporta backend devolviendo ARRAY DIRECTO
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data ?? [];

      // Meta opcional
      const metaInfo = res.data?.meta ?? {
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1,
      };

      setTasks(data);
      setFilteredTasks(data);
      setMeta(metaInfo);

    } catch (err) {
      console.error("Error al cargar tareas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  useEffect(() => {
    if (user) fetchTasks();
  }, [page, filterStatus, filterPriority, searchQuery]);

  // ----------------------------------------------------------
  // Filtrado local
  // ----------------------------------------------------------
  useEffect(() => {
    let filtered = [...tasks];

    if (filterStatus !== "todos") {
      filtered = filtered.filter((t) =>
        t.status.toLowerCase().includes(filterStatus)
      );
    }

    if (filterPriority !== "todas") {
      filtered = filtered.filter((t) => t.priority === filterPriority);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    setFilteredTasks(filtered);
  }, [filterStatus, filterPriority, searchQuery, tasks]);

  // ----------------------------------------------------------
  // Crear tarea
  // ----------------------------------------------------------
  const handleCreateTask = async (taskData: Task) => {
    if (!taskData.title.trim()) return alert("El título es obligatorio");
    if (!taskData.fecha_limite) return alert("La fecha límite es obligatoria");

    try {
      await api.post(
        "/tasks",
        {
          ...taskData,
          assignedToId: taskData.assignedTo?.id || null,
        },
        {
          headers: {
            "x-user-id": String(user?.id),
            "x-user-role": user?.role,
            "x-user-email": user?.email,
          },
        }
      );

      await fetchTasks();
      setShowModal(false);
      setNewTask({
        title: "",
        description: "",
        priority: "media",
        status: "pendiente",
        fecha_limite: "",
        assignedTo: null,
      });
    } catch (err) {
      console.error("❌ Error al crear tarea:", err);
      alert("Error al crear la tarea");
    }
  };

  // ----------------------------------------------------------
  // Completar tarea
  // ----------------------------------------------------------
  const handleCompleteTask = async (task: Task) => {
    try {
      await api.put(
        `/tasks/${task.id}`,
        {
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: "completada",
          fecha_limite: task.fecha_limite,
          assignedToId: task.assignedTo ? task.assignedTo.id : null,
        },
        {
          headers: {
            "x-user-id": String(user?.id),
            "x-user-role": user?.role,
            "x-user-email": user?.email,
          },
        }
      );

      await fetchTasks();
    } catch (err) {
      console.error("❌ Error al completar tarea:", err);
      alert("Error al actualizar la tarea");
    }
  };

  // ----------------------------------------------------------
  // Guardar edición
  // ----------------------------------------------------------
  const handleSaveEdit = async (updated: Task) => {
    if (!updated || !updated.title) return;

    try {
      const assignedId =
        updated.assignedToId !== undefined
          ? Number(updated.assignedToId)
          : updated.assignedTo
          ? Number(updated.assignedTo.id)
          : null;

      const payload = {
        title: updated.title,
        description: updated.description,
        priority: updated.priority,
        status: updated.status,
        fecha_limite: updated.fecha_limite,
        assignedToId: assignedId,
      };

      await api.put(`/tasks/${updated.id}`, payload, {
        headers: {
          "x-user-id": String(user?.id),
          "x-user-role": user?.role,
          "x-user-email": user?.email,
        },
      });

      await fetchTasks();
      setEditTask(null);
    } catch (err) {
      console.error("❌ Error al guardar cambios:", err);
      alert("Error al guardar cambios");
    }
  };

  // ----------------------------------------------------------
  // Eliminar
  // ----------------------------------------------------------
  const handleDeleteTask = async (taskId?: number) => {
    if (!taskId) return;
    if (!confirm("¿Seguro que deseas eliminar esta tarea?")) return;

    try {
      await api.delete(`/tasks/${taskId}`, {
        headers: {
          "x-user-id": String(user?.id),
          "x-user-role": user?.role,
          "x-user-email": user?.email,
        },
      });

      await fetchTasks();
    } catch (err) {
      console.error("Error al eliminar la tarea:", err);
      alert("Error inesperado al eliminar la tarea");
    }
  };

  // ----------------------------------------------------------
  // Helpers visuales
  // ----------------------------------------------------------
  const getPriorityStyle = (priority: Task["priority"]) => {
    switch (priority) {
      case "alta":
        return "bg-red-100 text-red-700 border border-red-300";
      case "media":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      default:
        return "bg-green-100 text-green-700 border border-green-300";
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("pendiente"))
      return "bg-gray-200 text-gray-700 border border-gray-300";
    if (s.includes("en progreso"))
      return "bg-blue-100 text-blue-700 border border-blue-300";
    if (s.includes("complet"))
      return "bg-green-100 text-green-700 border border-green-300";
    return "bg-gray-100 text-gray-600 border border-gray-200";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR");
  };

  const visibleTasks = showOnlyMine
    ? filteredTasks.filter((t) => t.assignedTo?.id === user?.id)
    : filteredTasks;

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  if (loading)
    return <p className="text-center mt-10 text-gray-600">Cargando tareas...</p>;

  if (!user)
    return <p className="text-center mt-10 text-gray-600">No estás autenticado.</p>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-10 py-8">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">Gestor de Tareas</h2>
          <button
            onClick={() => setShowModal(true)}
            className="border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition"
          >
            + Nueva Tarea
          </button>
        </div>

        {/* TOGGLE */}
        <div className="flex justify-center gap-2 mb-5">
          <button
            onClick={() => setShowOnlyMine(false)}
            className={`px-4 py-1 rounded-md text-sm font-medium ${
              !showOnlyMine
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Todas
          </button>

          <button
            onClick={() => setShowOnlyMine(true)}
            className={`px-4 py-1 rounded-md text-sm font-medium ${
              showOnlyMine
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Mis tareas
          </button>
        </div>

        {/* FILTROS */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 justify-center items-center">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => {
              setPage(1);
              setSearchQuery(e.target.value);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-72 focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          />
          <select
            value={filterStatus}
            onChange={(e) => {
              setPage(1);
              setFilterStatus(e.target.value);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en progreso">En progreso</option>
            <option value="completada">Completada</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => {
              setPage(1);
              setFilterPriority(e.target.value);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          >
            <option value="todas">Todas las prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>

        {/* TABLA */}
        {visibleTasks.length === 0 ? (
          <p className="text-center text-gray-600">No hay tareas que coincidan.</p>
        ) : (
          <div className="flex justify-center">
            <div className="w-full max-w-[95vw] md:max-w-7xl bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <table className="w-full table-auto border-collapse text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-3 py-3">Título</th>
                    <th className="px-3 py-3">Descripción</th>
                    <th className="px-3 py-3 text-center">Prioridad</th>
                    <th className="px-3 py-3 text-center">Estado</th>
                    <th className="px-3 py-3 text-center">Asignado a</th>
                    <th className="px-3 py-3 text-center">Fecha Límite</th>
                    <th className="px-3 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTasks.map((t) => (
                    <tr key={t.id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium text-gray-800 break-words">
                        {t.title}
                      </td>
                      <td className="px-3 py-3 text-gray-600 break-words">
                        {t.description}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-md ${getPriorityStyle(
                            t.priority
                          )}`}
                        >
                          {t.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap ${getStatusStyle(
                            t.status
                          )}`}
                        >
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-700">
                        {t.assignedTo ? t.assignedTo.name : "—"}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-700">
                        {formatDate(t.fecha_limite)}
                      </td>
                      <td className="px-3 py-3 text-center relative z-50">
                        <TaskActionsMenu
                          onEdit={() => setEditTask(t)}
                          onComplete={() => handleCompleteTask(t)}
                          onDelete={() => handleDeleteTask(t.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINACIÓN */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Anterior
          </button>

          <span className="text-sm text-gray-600">
            Página {meta.page} de {meta.totalPages}
          </span>

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, meta.totalPages))}
            disabled={page === meta.totalPages}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* MODALES */}
      {showModal && (
        <TaskEditModal
          task={newTask}
          onClose={() => setShowModal(false)}
          onSave={handleCreateTask}
        />
      )}

      {editTask && (
        <TaskEditModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
