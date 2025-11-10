import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Task } from "../entities/Task";

const taskRepository = AppDataSource.getRepository(Task);

// 📋 Obtener todas las tareas (si propietario: todas, si miembro: solo las suyas)
export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.headers["x-user-id"]);
    const userRole = String(req.headers["x-user-role"]);

    if (!userId || !userRole) {
      return res.status(400).json({ message: "Faltan datos del usuario autenticado" });
    }

    let tasks;

    // 👑 Propietario ve todas las tareas
    if (userRole === "propietario") {
      tasks = await taskRepository.find({
        relations: ["user"],
        order: { id: "DESC" },
      });
    } else {
      // 👤 Miembro solo las suyas
      tasks = await taskRepository.find({
        where: { user: { id: userId } },
        order: { id: "DESC" },
      });
    }

    return res.json(tasks);
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    return res.status(500).json({ message: "Error interno al listar tareas" });
  }
};

// ➕ Crear una nueva tarea
export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.headers["x-user-id"]);
    const { title, description, priority, status } = req.body;

    if (!userId) return res.status(400).json({ message: "Falta el ID de usuario" });
    if (!title) return res.status(400).json({ message: "El título es obligatorio" });

    const newTask = taskRepository.create({
      title,
      description,
      priority,
      status,
      user: { id: userId } as any, // relación con el usuario
    });

    await taskRepository.save(newTask);
    return res.status(201).json(newTask);
  } catch (error) {
    console.error("Error al crear tarea:", error);
    return res.status(500).json({ message: "Error interno al crear tarea" });
  }
};

// 🔁 Actualizar tarea
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const task = await taskRepository.findOneBy({ id: Number(id) });
    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

    Object.assign(task, data);
    await taskRepository.save(task);

    return res.status(200).json(task);
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    return res.status(500).json({ message: "Error interno al actualizar tarea" });
  }
};

// 🗑️ Eliminar tarea
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = await taskRepository.findOneBy({ id: Number(id) });

    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

    await taskRepository.delete(id);
    return res.status(200).json({ message: "Tarea eliminada correctamente ✅" });
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    return res.status(500).json({ message: "Error interno al eliminar tarea" });
  }
};
