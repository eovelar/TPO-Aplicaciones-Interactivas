import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Task } from "../entities/Task";
import { User } from "../entities/User";
import { Historial } from "../entities/Historial.entities";

const taskRepository = AppDataSource.getRepository(Task);
const userRepository = AppDataSource.getRepository(User);
const historialRepository = AppDataSource.getRepository(Historial);

// 🔹 Obtener todas las tareas
export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.headers["x-user-id"]);
    const userRole = String(req.headers["x-user-role"]);

    if (!userId || !userRole) {
      return res.status(400).json({ message: "Faltan datos del usuario autenticado" });
    }

    const tasks =
      userRole === "propietario"
        ? await taskRepository.find({
            relations: ["user", "assignedTo"],
            order: { id: "DESC" },
          })
        : await taskRepository.find({
            where: [{ user: { id: userId } }, { assignedTo: { id: userId } }],
            relations: ["user", "assignedTo"],
            order: { id: "DESC" },
          });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    return res.status(500).json({ message: "Error interno al listar tareas" });
  }
};

// 🔹 Crear nueva tarea
export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.headers["x-user-id"]);
    const { title, description, priority, status, assignedToId } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "El título es obligatorio" });
    }

    const creator = await userRepository.findOneBy({ id: userId });
    if (!creator) return res.status(404).json({ message: "Usuario creador no encontrado" });

    let assignedUser = creator;

    if (assignedToId && !isNaN(Number(assignedToId))) {
      const found = await userRepository.findOneBy({ id: Number(assignedToId) });
      if (found) assignedUser = found;
    }

    const newTask = taskRepository.create({
      title,
      description: description || "",
      priority: priority || "media",
      status: status || "pendiente",
      user: creator,
      assignedTo: assignedUser,
    });

    await taskRepository.save(newTask);

    await historialRepository.save({
      entidad: "task",
      entidadId: newTask.id,
      accion: "CREAR",
      usuarioId: userId,
      detalles: {
        title: newTask.title,
        status: newTask.status,
        priority: newTask.priority,
        assignedTo: newTask.assignedTo?.name,
      },
    });

    return res.status(201).json({ message: "Tarea creada correctamente ✅", task: newTask });
  } catch (error) {
    console.error("Error al crear tarea:", error);
    return res.status(500).json({ message: "Error interno al crear tarea" });
  }
};

// 🔹 Actualizar tarea (versión forzada y depurada)
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(req.headers["x-user-id"]);
    const { title, description, priority, status, assignedToId } = req.body;

    console.log("📩 BODY recibido:", req.body);

    const existing = await taskRepository.findOne({
      where: { id: Number(id) },
      relations: ["assignedTo", "user"],
    });

    if (!existing) return res.status(404).json({ message: "Tarea no encontrada" });

    const prev = { ...existing };

    // 🔸 Campos básicos
    const newTitle = title ?? existing.title;
    const newDescription = description ?? existing.description;
    const newPriority = priority ?? existing.priority;
    const newStatus = status ?? existing.status;

    // 🔸 Conversión segura del ID asignado
    const assignedId = assignedToId ? Number(assignedToId) : null;
    console.log("➡️ Asignado recibido:", assignedId);

    let newAssignedUser = existing.user; // por defecto el creador

    if (assignedId && !isNaN(assignedId)) {
      const found = await userRepository.findOneBy({ id: assignedId });
      if (found) {
        newAssignedUser = found;
      } else {
        console.warn("⚠️ Usuario asignado no encontrado:", assignedId);
        return res.status(400).json({ message: "Usuario asignado no encontrado" });
      }
    }

    console.log("🧾 Ejecutando UPDATE con assigned_to_id =", newAssignedUser.id);

    // 🔸 SQL directo (forzado)
    await AppDataSource.query(
      `
      UPDATE task
      SET
        title = $1,
        description = $2,
        priority = $3,
        status = $4,
        assigned_to_id = $5
      WHERE id = $6
      `,
      [
        newTitle,
        newDescription,
        newPriority,
        newStatus,
        newAssignedUser.id,
        Number(id),
      ]
    );

    await historialRepository.save({
      entidad: "task",
      entidadId: Number(id),
      accion: "ACTUALIZAR",
      usuarioId: userId,
      detalles: {
        antes: {
          title: prev.title,
          status: prev.status,
          priority: prev.priority,
          assignedTo: prev.assignedTo?.name || null,
        },
        despues: {
          title: newTitle,
          status: newStatus,
          priority: newPriority,
          assignedTo: newAssignedUser?.name || null,
        },
      },
    });

    const updatedTask = await taskRepository.findOne({
      where: { id: Number(id) },
      relations: ["assignedTo", "user"],
    });

    console.log("✅ Tarea actualizada:", updatedTask?.assignedTo?.name);

    return res.status(200).json({
      message: "Tarea actualizada correctamente ✅",
      task: updatedTask,
    });
  } catch (error) {
    console.error("💥 Error en updateTask:", error);
    return res.status(500).json({ message: "Error interno al actualizar tarea" });
  }
};

// 🔹 Eliminar tarea
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(req.headers["x-user-id"]);

    const existing = await taskRepository.findOneBy({ id: Number(id) });
    if (!existing) return res.status(404).json({ message: "Tarea no encontrada" });

    await taskRepository.delete(id);

    await historialRepository.save({
      entidad: "task",
      entidadId: Number(id),
      accion: "ELIMINAR",
      usuarioId: userId,
      detalles: { title: existing.title },
    });

    return res.status(200).json({ message: "Tarea eliminada con éxito ✅" });
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    return res.status(500).json({ message: "Error interno al eliminar tarea" });
  }
};
