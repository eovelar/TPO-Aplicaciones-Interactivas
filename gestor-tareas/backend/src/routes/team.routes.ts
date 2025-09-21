import { Router } from "express";
import { authRequired } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  teamSchema,
  addMemberSchema,
  removeMemberSchema,
} from "../validations/team.validation";
import {
  createTeam,
  getTeams,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
} from "../controllers/team.controller";

const router = Router();

// Crear un equipo
router.post("/", authRequired(), validate(teamSchema), createTeam);

// Listar equipos
router.get("/", authRequired(), getTeams);

// Actualizar un equipo
router.put("/:id", authRequired(), validate(teamSchema), updateTeam);

// Eliminar un equipo
router.delete("/:id", authRequired(), deleteTeam);

// Añadir miembro a un equipo
router.post("/:id/members", authRequired(), validate(addMemberSchema), addMember);

// Quitar miembro de un equipo
router.delete(
  "/:id/members/:userId",
  authRequired(),
  validate(removeMemberSchema),
  removeMember
);

export default router;
