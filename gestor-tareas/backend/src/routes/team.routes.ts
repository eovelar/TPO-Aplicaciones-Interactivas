import { Router } from "express";
import { simpleAuth, requireRole } from "../middleware/auth.middleware";
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
  inviteToTeam, // nuevo controlador
} from "../controllers/team.controller";

const router = Router();

// Crear un equipo → cualquier usuario autenticado
router.post("/", simpleAuth, validate(teamSchema), createTeam);

// Listar equipos → cualquier usuario autenticado
router.get("/", simpleAuth, getTeams);

// Actualizar un equipo → cualquier usuario autenticado
router.put("/:id", simpleAuth, validate(teamSchema), updateTeam);

// Eliminar un equipo → solo propietario
router.delete("/:id", simpleAuth, requireRole(["propietario"]), deleteTeam);

// Añadir miembro a un equipo → cualquier usuario autenticado
router.post("/:id/members", simpleAuth, validate(addMemberSchema), addMember);

// Quitar miembro de un equipo → cualquier usuario autenticado
router.delete(
  "/:id/members/:userId",
  simpleAuth,
  validate(removeMemberSchema),
  removeMember
);

// Invitar usuario a un equipo → solo propietario
router.post(
  "/:id/invite",
  simpleAuth,
  requireRole(["propietario"]),
  inviteToTeam
);

export default router;
