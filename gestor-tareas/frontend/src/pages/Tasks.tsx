import { useEffect, useState } from "react";
import { api } from "../api/http";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
}

export default function Tasks() {
  const { user, setUser } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("media");
  const [status, setStatus] = useState("pendiente");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 🔽 Filtros
  const [filterStatus, setFilterStatus] = useState("todas");
  const [filterPriority, setFilterPriority] = useState("todas");
  const [sortBy, setSortBy] = useState("fecha");

  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const res = await api.get("/tasks", {
        headers: {
          "x-user-id": user.id,
          "x-user-role": user.role,
          "x-user-email": user.email,
        },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Error al cargar tareas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  // Crear o actualizar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingTask) {
        const res = await api.put(
          `/tasks/${editingTask.id}`,
          { title, description, priority, status },
          {
            headers: {
              "x-user-id": user.id,
              "x-user-role": user.role,
              "x-user-email": user.email,
            },
          }
        );
        setTasks(tasks.map((t) => (t.id === editingTask.id ? res.data : t)));
        setEditingTask(null);
      } else {
        const res = await api.post(
          "/tasks",
          { title, description, priority, status },
          {
            headers: {
              "x-user-id": user.id,
              "x-user-role": user.role,
              "x-user-email": user.email,
            },
          }
        );
        setTasks([...tasks, res.data]);
      }

      setTitle("");
      setDescription("");
      setPriority("media");
      setStatus("pendiente");
    } catch (err) {
      console.error("Error al guardar tarea:", err);
      alert("Error al guardar tarea ❌");
    }
  };

  // Eliminar tarea
  const handleDeleteTask = async (id: number) => {
    if (!user) return;
    if (!confirm("¿Seguro que querés eliminar esta tarea?")) return;

    try {
      await api.delete(`/tasks/${id}`, {
        headers: {
          "x-user-id": user.id,
          "x-user-role": user.role,
          "x-user-email": user.email,
        },
      });
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error al eliminar tarea:", err);
      alert("Error al eliminar tarea ❌");
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setStatus(task.status);
  };

  // 🔍 Filtrar y ordenar tareas
  const filteredTasks = tasks
    .filter((t) =>
      filterStatus === "todas" ? true : t.status === filterStatus
    )
    .filter((t) =>
      filterPriority === "todas" ? true : t.priority === filterPriority
    )
    .sort((a, b) => {
      if (sortBy === "titulo") return a.title.localeCompare(b.title);
      if (sortBy === "prioridad")
        return a.priority.localeCompare(b.priority);
      return a.id - b.id;
    });

  if (loading) return <p>Cargando tareas...</p>;
  if (!user) return <p>No estás autenticado</p>;

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>📋 Lista de Tareas</h2>
        <button onClick={handleLogout}>Cerrar sesión 🚪</button>
      </div>

      <p>Usuario: <strong>{user.name}</strong></p>

      {/* 🔹 Filtros */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          marginBottom: "1.5rem",
        }}
      >
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="todas">Todas</option>
          <option value="pendiente">Pendiente</option>
          <option value="en progreso">En progreso</option>
          <option value="completada">Completada</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="todas">Todas</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="fecha">Ordenar por Fecha</option>
          <option value="titulo">Ordenar por Título</option>
          <option value="prioridad">Ordenar por Prioridad</option>
        </select>
      </div>

      {/* 🔹 Formulario */}
      <form
        onSubmit={handleSubmit}
        style={{
          margin: "2rem auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          maxWidth: "400px",
        }}
      >
        <h3>{editingTask ? "✏️ Editar Tarea" : "➕ Nueva Tarea"}</h3>
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pendiente">Pendiente</option>
          <option value="en progreso">En progreso</option>
          <option value="completada">Completada</option>
        </select>
        <button type="submit">
          {editingTask ? "Guardar cambios 💾" : "Agregar tarea ➕"}
        </button>
        {editingTask && (
          <button
            type="button"
            onClick={() => {
              setEditingTask(null);
              setTitle("");
              setDescription("");
              setPriority("media");
              setStatus("pendiente");
            }}
          >
            Cancelar ❌
          </button>
        )}
      </form>

      {/* 🔹 Lista */}
      {filteredTasks.length === 0 ? (
        <p>No hay tareas que coincidan con los filtros.</p>
      ) : (
        <ul style={{ textAlign: "left", marginTop: "1.5rem" }}>
          {filteredTasks.map((t) => (
            <li key={t.id} style={{ marginBottom: "1rem" }}>
              <strong>{t.title}</strong> — {t.status} ({t.priority})
              <p>{t.description}</p>
              <button onClick={() => handleEditTask(t)}>✏️ Editar</button>{" "}
              <button onClick={() => handleDeleteTask(t.id)}>🗑️ Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
