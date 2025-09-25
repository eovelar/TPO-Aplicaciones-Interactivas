import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Comment } from "../entities/comment.entities";
import { Task } from "../entities/Task";

export const listCommentsByTask = async (req: Request, res: Response) => {
  const taskId = Number(req.params.taskId);
  const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
  const offset = Math.max(Number(req.query.offset ?? 0), 0);

  const repo = AppDataSource.getRepository(Comment);
  const [items, total] = await repo.createQueryBuilder("c")
    .where("c.taskId = :taskId", { taskId })
    .orderBy("c.createdAt", "ASC")
    .take(limit)
    .skip(offset)
    .getManyAndCount();

  res.json({ total, items, limit, offset });
};

export const createComment = async (req: Request, res: Response) => {
  const taskId = Number(req.params.taskId);
  const userId = req.user!.id;
  const { contenido } = req.body as { contenido: string };

  // validar existencia de task
  const task = await AppDataSource.getRepository(Task).findOne({ where: { id: taskId } });
  if (!task) return res.status(404).json({ message: "Tarea no encontrada" });

  const comment = AppDataSource.getRepository(Comment).create({
    taskId,
    userId,
    contenido: contenido.trim(),
  });

  await AppDataSource.getRepository(Comment).save(comment);
  // El AuditSubscriber registrará "CREAR" automáticamente
  res.status(201).json(comment);
};

export const deleteComment = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const user = req.user!; // { id, role }

  const repo = AppDataSource.getRepository(Comment);
  const found = await repo.findOne({ where: { id } });
  if (!found) return res.status(404).json({ message: "Comentario no encontrado" });

  // Permisos: propietario o autor
  const isOwner = user.role === "propietario";
  const isAuthor = found.userId === user.id;
  if (!isOwner && !isAuthor) {
    return res.status(403).json({ message: "No tienes permisos para borrar este comentario" });
  }

  await repo.remove(found);
  // El AuditSubscriber registrará "ELIMINAR" automáticamente
  res.status(204).end();
};
