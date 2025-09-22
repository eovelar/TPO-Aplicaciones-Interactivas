// src/controllers/task.controller.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Task } from "../entities/Task";
import { User } from "../entities/User";
import { prettyJson } from "../utils/response";

const taskRepo = AppDataSource.getRepository(Task);
const userRepo = AppDataSource.getRepository(User);

// 📌 Listar tareas → propietario ve todas, miembro solo las suyas
export const getTasks = async (req: Request, res: Response) => {
  try {
    let tasks: Task[];

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
    prettyJson(
      res,
      { message: "Error al obtener tareas", error: (error as Error).message },
      500
    );
  }
};

// 📌 Crear tarea → propietario puede asignar, miembro solo a sí mismo
export const createTask = async (req: Request, res: Response) => {
  try {
    let assignedUserId = req.user!.id; // por defecto: usuario logueado

    if (req.user?.role === "propietario" && req.body.userId) {
      assignedUserId = req.body.userId;
      const user = (await userRepo.findOne({
        where: { id: assignedUserId },
      })) as User | null;
      if (!user)
        return prettyJson(res, { message: "Usuario asignado no existe" }, 404);
    }

    const task = taskRepo.create({
      ...req.body,
      user: { id: assignedUserId },
    });

    await taskRepo.save(task);

    const savedTask = (await taskRepo.findOne({
      where: { id: task.id },
      relations: ["user"],
    })) as Task | null;

    prettyJson(res, savedTask, 201);
  } catch (error) {
    prettyJson(
      res,
      { message: "Error al crear la tarea", error: (error as Error).message },
      400
    );
  }
};

// 📌 Actualizar tarea → miembro solo sus tareas, propietario cualquiera
export const updateTask = async (req: Request, res: Response) => {
  try {
    const task = (await taskRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["user"],
    })) as Task | null;

    if (!task) return prettyJson(res, { message: "Tarea no encontrada" }, 404);

    if (req.user?.role !== "propietario" && task.user.id !== req.user?.id) {
      return prettyJson(res, { message: "No autorizado" }, 403);
    }

    taskRepo.merge(task, req.body);
    await taskRepo.save(task);

    prettyJson(res, task);
  } catch (error) {
    prettyJson(
      res,
      { message: "Error al actualizar la tarea", error: (error as Error).message },
      400
    );
  }
};

// 📌 Eliminar tarea → miembro solo sus tareas, propietario cualquiera
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const task = (await taskRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["user"],
    })) as Task | null;

    if (!task) return prettyJson(res, { message: "Tarea no encontrada" }, 404);

    if (req.user?.role !== "propietario" && task.user.id !== req.user?.id) {
      return prettyJson(res, { message: "No autorizado" }, 403);
    }

    await taskRepo.remove(task);
    prettyJson(res, { message: "Tarea eliminada" });
  } catch (error) {
    prettyJson(
      res,
      { message: "Error al eliminar la tarea", error: (error as Error).message },
      500
    );
  }
};
