import { Request, Response } from "express";
import { Like } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { Task } from "../entities/Task";
import { User } from "../entities/User";
import { Historial } from "../entities/Historial.entities";
import { getPagination } from "../utils/pagination"; // ⬅️ agregado

const taskRepository = AppDataSource.getRepository(Task);
const userRepository = AppDataSource.getRepository(User);
const historialRepository = AppDataSource.getRepository(Historial);

// Obtener todas las tareas → ahora con paginación + filtros
export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.headers["x-user-id"]);
    const userRole = String(req.headers["x-user-role"]);

    if (!userId || !userRole) {
      return res.status(400).json({ message: "Faltan datos del usuario autenticado" });
    }

    const { page, limit, skip } = getPagination(req.query);

    // Filtros opcionales
    const { status, priority, search } = req.query;

    const where: any = {};

    // Si NO es propietario → solo ve tareas asignadas a él
    if (userRole !== "propietario") {
      where.assignedTo = { id: userId };
    }

    if (status && status !== "todos") {
      where.status = status;
    }

    if (priority && priority !== "todas") {
      where.priority = priority;
    }

    if (search) {
      where.title = Like(`%${search}%`);
    }

    const [tasks, total] = await taskRepository.findAndCount({
      where,
      relations: ["user", "assignedTo"],
      order: { id: "DESC" },
      skip,
      take: limit,
    });

    return res.status(200).json({
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    return res.status(500).json({ message: "Error interno al listar tareas" });
  }
};

// Crear nueva tarea
export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.headers["x-user-id"]);
    const { title, description, priority, status, assignedToId, fecha_limite } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "El título es obligatorio" });
    }

    if (!fecha_limite) {
      return res.status(400).json({ message: "La fecha límite es obligatoria" });
    }

    const limite = new Date(fecha_limite);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (limite < hoy) {
      return res.status(400).json({ message: "La fecha límite no puede ser en el pasado" });
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
      fecha_limite,
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
        fecha_limite: newTask.fecha_limite,
        assignedTo: newTask.assignedTo?.name,
      },
    });

    return res.status(201).json({ message: "Tarea creada correctamente ✅", task: newTask });
  } catch (error) {
    console.error("Error al crear tarea:", error);
    return res.status(500).json({ message: "Error interno al crear tarea" });
  }
};

// Actualizar tarea (incluye validación)
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Number(req.headers["x-user-id"]);
    const { title, description, priority, status, assignedToId, fecha_limite } = req.body;

    console.log("BODY recibido:", req.body);

    const existing = await taskRepository.findOne({
      where: { id: Number(id) },
      relations: ["assignedTo", "user"],
    });

    if (!existing) return res.status(404).json({ message: "Tarea no encontrada" });

    const prev = { ...existing };

    if (fecha_limite) {
      const limite = new Date(fecha_limite);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (limite < hoy) {
        return res.status(400).json({ message: "La fecha límite no puede ser en el pasado" });
      }
    }

    const newTitle = title ?? existing.title;
    const newDescription = description ?? existing.description;
    const newPriority = priority ?? existing.priority;
    const newStatus = status ?? existing.status;
    const newFechaLimite = fecha_limite ?? existing.fecha_limite;

    const assignedId = assignedToId ? Number(assignedToId) : null;
    let newAssignedUser = existing.user;

    if (assignedId && !isNaN(assignedId)) {
      const found = await userRepository.findOneBy({ id: assignedId });
      if (found) {
        newAssignedUser = found;
      } else {
        return res.status(400).json({ message: "Usuario asignado no encontrado" });
      }
    }

    await AppDataSource.query(
      `
      UPDATE task
      SET
        title = $1,
        description = $2,
        priority = $3,
        status = $4,
        fecha_limite = $5,
        assigned_to_id = $6,
        updated_at = NOW()
      WHERE id = $7
      `,
      [
        newTitle,
        newDescription,
        newPriority,
        newStatus,
        newFechaLimite,
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
          fecha_limite: prev.fecha_limite,
          assignedTo: prev.assignedTo?.name || null,
        },
        despues: {
          title: newTitle,
          status: newStatus,
          priority: newPriority,
          fecha_limite: newFechaLimite,
          assignedTo: newAssignedUser?.name || null,
        },
      },
    });

    const updatedTask = await taskRepository.findOne({
      where: { id: Number(id) },
      relations: ["assignedTo", "user"],
    });

    return res.status(200).json({
      message: "Tarea actualizada correctamente ✅",
      task: updatedTask,
    });
  } catch (error) {
    console.error("💥 Error en updateTask:", error);
    return res.status(500).json({ message: "Error interno al actualizar tarea" });
  }
};

// Eliminar tarea
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
