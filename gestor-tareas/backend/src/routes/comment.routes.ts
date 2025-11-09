import { Router } from "express";
import { simpleAuth } from "../middleware/auth.middleware";
import { setUserInContextMiddleware } from "../middleware/request-context.middleware";
import { validate } from "../middleware/validate.middleware";
import { createCommentSchema } from "../schemas/comment.schema";
import {
  listCommentsByTask,
  createComment,
  deleteComment,
} from "../controllers/comment.controller";

const router = Router();

// Listar comentarios de una tarea → requiere autenticación
router.get(
  "/tasks/:taskId/comments",
  simpleAuth,
  listCommentsByTask
);

// Crear comentario → requiere autenticación y contexto de usuario
router.post(
  "/tasks/:taskId/comments",
  simpleAuth,
  setUserInContextMiddleware, // para que el subscriber tenga userId
  validate(createCommentSchema),
  createComment
);

// Eliminar comentario (autor o propietario)
router.delete(
  "/comments/:id",
  simpleAuth,
  setUserInContextMiddleware,
  deleteComment
);

export default router;
