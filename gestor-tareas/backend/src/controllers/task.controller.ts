// src/controllers/task.controller.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Task } from "../entities/Task";
import { User } from "../entities/User";
import { prettyJson } from "../utils/response";

const taskRepo = AppDataSource.getRepository(Task);
const userRepo = AppDataSource.getRepository(User);

// Tipado local para evitar errores
type AuthUser = { id: number; role: "propietario" | "miembro" };

// 📌 Listar tareas → propietario ve todas, miembro solo las suyas
export const getTasks = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user as AuthUser | undefined;

    let tasks: Task[];
    if (currentUser?.role === "propietario") {
      tasks = await taskRepo.find({ relations: ["user"] });
    } else {
      tasks = await taskRepo.find({
        where: { user: { id: currentUser?.id } },
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
    const currentUser = (req as any).user as AuthUser;
    if (!currentUser) return prettyJson(res, { message: "No autenticado" }, 401);

    // por defecto: el usuario logueado
    let assignedUserId = currentUser.id;

    // si es propietario y manda userId, puede asignar a otro
    if (currentUser.role === "propietario" && req.body.userId != null) {
      assignedUserId = Number(req.body.userId);
    }

    // ✅ Pre-cargar el usuario para evitar `as any` y ambigüedades
    const assignee = await userRepo.findOne({ where: { id: assignedUserId } });
    if (!assignee) {
      return prettyJson(res, { message: "Usuario asignado no existe" }, 404);
    }

    // ✅ Usar save() directo evita la sobrecarga Task | Task[]
    const saved = await taskRepo.save({
      ...(req.body as Partial<Task>),
      user: assignee,
    });

    // Recuperar con relaciones
    const savedTask = await taskRepo.findOne({
      where: { id: saved.id },
      relations: ["user"],
    });

    if (!savedTask) {
      return prettyJson(res, { message: "Error al recuperar la tarea creada" }, 500);
    }

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
    const currentUser = (req as any).user as AuthUser | undefined;
    if (!currentUser) return prettyJson(res, { message: "No autenticado" }, 401);

    const taskId = Number(req.params.id);
    const task = await taskRepo.findOne({
      where: { id: taskId },
      relations: ["user"],
    });

    if (!task) return prettyJson(res, { message: "Tarea no encontrada" }, 404);

    // Verificar autorización
    if (currentUser.role !== "propietario" && task.user.id !== currentUser.id) {
      return prettyJson(res, { message: "No autorizado" }, 403);
    }

    // Actualizar la tarea
    taskRepo.merge(task, req.body);
    const updatedTask = await taskRepo.save(task);

    prettyJson(res, updatedTask);
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
    const currentUser = (req as any).user as AuthUser | undefined;
    if (!currentUser) return prettyJson(res, { message: "No autenticado" }, 401);

    const taskId = Number(req.params.id);
    const task = await taskRepo.findOne({
      where: { id: taskId },
      relations: ["user"],
    });

    if (!task) return prettyJson(res, { message: "Tarea no encontrada" }, 404);

    // Verificar autorización
    if (currentUser.role !== "propietario" && task.user.id !== currentUser.id) {
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
