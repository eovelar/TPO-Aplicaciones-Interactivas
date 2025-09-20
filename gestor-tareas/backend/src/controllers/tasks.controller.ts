import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Task } from "../entities/Task";

const taskRepo = AppDataSource.getRepository(Task);

// listar tareas - si es propietario ve todas, si es miembro solo las suyas
export const getTasks = async (req: Request, res: Response) => {
  try {
    let tasks;

    if (req.user?.role === "propietario") {
      tasks = await taskRepo.find({ relations: ["user"] });
    } else {
      tasks = await taskRepo.find({
        where: { user: { id: req.user?.id } },
        relations: ["user"],
      });
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener tareas", error });
  }
};

// Crear tarea - se guarda con el userId del usuario logueado
export const createTask = async (req: Request, res: Response) => {
  try {
    const task = taskRepo.create({
      ...req.body,
      user: { id: req.user!.id }, // relacionar con el usuario logueado
    });

    await taskRepo.save(task);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: "Error al crear la tarea", error });
  }
};

// actualizar tarea - miembro solo sus tareas, propietario cualquiera
export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await taskRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["user"],
    });

    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

    if (req.user?.role !== "propietario" && task.user.id !== req.user?.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    taskRepo.merge(task, req.body);
    await taskRepo.save(task);

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar la tarea", error });
  }
};

// eliminar tarea - miembro solo sus tareas, propietario cualquiera
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await taskRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["user"],
    });

    if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

    if (req.user?.role !== "propietario" && task.user.id !== req.user?.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    await taskRepo.remove(task);
    res.json({ message: "Tarea eliminada" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la tarea", error });
  }
};
