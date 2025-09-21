import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Task } from "../entities/Task";
import { prettyJson } from "../utils/response";

const taskRepo = AppDataSource.getRepository(Task);

// 📌 Listar tareas → propietario ve todas, miembro solo las suyas
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

    prettyJson(res, tasks);
  } catch (error) {
    prettyJson(res, { message: "Error al obtener tareas", error: (error as Error).message }, 500);
  }
};

// 📌 Crear tarea → se guarda con el userId del usuario logueado
export const createTask = async (req: Request, res: Response) => {
  try {
    const task = taskRepo.create({
      ...req.body,
      user: { id: req.user!.id }, // relacionar con el usuario logueado
    });

    await taskRepo.save(task);
    prettyJson(res, task, 201);
  } catch (error) {
    prettyJson(res, { message: "Error al crear la tarea", error: (error as Error).message }, 400);
  }
};

// 📌 Actualizar tarea → miembro solo sus tareas, propietario cualquiera
export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = await taskRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["user"],
    });

    if (!task) return prettyJson(res, { message: "Tarea no encontrada" }, 404);

    if (req.user?.role !== "propietario" && task.user.id !== req.user?.id) {
      return prettyJson(res, { message: "No autorizado" }, 403);
    }

    taskRepo.merge(task, req.body);
    await taskRepo.save(task);

    prettyJson(res, task);
  } catch (error) {
    prettyJson(res, { message: "Error al actualizar la tarea", error: (error as Error).message }, 400);
  }
};

// 📌 Eliminar tarea → miembro solo sus tareas, propietario cualquiera
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = await taskRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["user"],
    });

    if (!task) return prettyJson(res, { message: "Tarea no encontrada" }, 404);

    if (req.user?.role !== "propietario" && task.user.id !== req.user?.id) {
      return prettyJson(res, { message: "No autorizado" }, 403);
    }

    await taskRepo.remove(task);
    prettyJson(res, { message: "Tarea eliminada" });
  } catch (error) {
    prettyJson(res, { message: "Error al eliminar la tarea", error: (error as Error).message }, 500);
  }
};
