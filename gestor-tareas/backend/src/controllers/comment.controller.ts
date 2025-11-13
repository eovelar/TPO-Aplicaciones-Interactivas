import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Comment } from "../entities/comment.entities";
import { Task } from "../entities/Task";
import { User } from "../entities/User";

// 📌 Listar comentarios por tarea
export const listCommentsByTask = async (req: Request, res: Response) => {
  try {
    const taskId = Number(req.params.taskId);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
    const offset = Math.max(Number(req.query.offset ?? 0), 0);

    const repo = AppDataSource.getRepository(Comment);
    const [items, total] = await repo
      .createQueryBuilder("c")
      .where("c.taskId = :taskId", { taskId })
      .orderBy("c.createdAt", "ASC")
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    res.json({ total, items, limit, offset });
  } catch (error) {
    console.error("Error al listar comentarios:", error);
    res.status(500).json({ message: "Error interno al listar comentarios" });
  }
};

// 📌 Crear comentario en una tarea
export const createComment = async (req: Request, res: Response) => {
  try {
    const taskId = Number(req.params.taskId);
    const userId = req.user!.id;
    const { contenido } = req.body as { contenido: string };

    if (!contenido?.trim()) {
      return res.status(400).json({ message: "El contenido no puede estar vacío" });
    }

    // Validar existencia de la tarea
    const taskEntity = await AppDataSource.getRepository(Task).findOne({
      where: { id: taskId },
    });
    if (!taskEntity) return res.status(404).json({ message: "Tarea no encontrada" });

    // Validar existencia del usuario
    const userEntity = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
    });
    if (!userEntity) return res.status(404).json({ message: "Usuario no encontrado" });

    // Crear comentario
    const newComment = AppDataSource.getRepository(Comment).create({
      contenido: contenido.trim(),
      task: taskEntity,
      user: userEntity,
    });

    await AppDataSource.getRepository(Comment).save(newComment);

    // El AuditSubscriber registrará la acción automáticamente
    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error al crear comentario:", error);
    res.status(500).json({ message: "Error interno al crear comentario" });
  }
};

// 📌 Eliminar comentario (propietario o autor)
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = req.user!; // { id, role }

    const repo = AppDataSource.getRepository(Comment);
    const found = await repo.findOne({ where: { id }, relations: ["user"] });

    if (!found) return res.status(404).json({ message: "Comentario no encontrado" });

    const isOwner = user.role === "propietario";
    const isAuthor = found.user.id === user.id;

    if (!isOwner && !isAuthor) {
      return res.status(403).json({ message: "No tienes permisos para borrar este comentario" });
    }

    await repo.remove(found);

    res.status(204).end();
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    res.status(500).json({ message: "Error interno al eliminar comentario" });
  }
};
