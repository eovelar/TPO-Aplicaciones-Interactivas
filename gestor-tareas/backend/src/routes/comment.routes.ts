import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware";
import { setUserInContextMiddleware } from "../middleware/request-context.middleware";
import { validate } from "../middleware/validate.middleware";
import { createCommentSchema } from "../schemas/comment.schema";
import { listCommentsByTask, createComment, deleteComment } from "../controllers/comment.controller";

const router = Router();

// Listar comentarios de una tarea
router.get(
  "/tasks/:taskId/comments",
  authRequired(),
  listCommentsByTask
);

// Crear comentario
router.post(
  "/tasks/:taskId/comments",
  authRequired(),
  setUserInContextMiddleware, // para que el subscriber tenga userId
  validate(createCommentSchema),
  createComment
);

// Eliminar comentario (autor o propietario)
router.delete(
  "/comments/:id",
  authRequired(),
  setUserInContextMiddleware,
  deleteComment
);

export default router;
