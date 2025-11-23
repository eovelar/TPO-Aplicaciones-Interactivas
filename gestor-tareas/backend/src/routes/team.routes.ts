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
  getTeamById,     // ← NUEVO
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  inviteToTeam,
} from "../controllers/team.controller";

const router = Router();

/* ============================================================
   🔹 Crear equipo
============================================================ */
router.post("/", simpleAuth, validate(teamSchema), createTeam);

/* ============================================================
   🔹 Listar equipos
============================================================ */
router.get("/", simpleAuth, getTeams);

/* ============================================================
   🔹 Obtener equipo por ID (NECESARIO PARA TeamDetails)
============================================================ */
router.get("/:id", simpleAuth, getTeamById);

/* ============================================================
   🔹 Actualizar equipo
============================================================ */
router.put("/:id", simpleAuth, validate(teamSchema), updateTeam);

/* ============================================================
   🔹 Eliminar equipo
============================================================ */
router.delete("/:id", simpleAuth, requireRole(["propietario"]), deleteTeam);

/* ============================================================
   🔹 Añadir miembro
============================================================ */
router.post("/:id/members", simpleAuth, validate(addMemberSchema), addMember);

/* ============================================================
   🔹 Quitar miembro
============================================================ */
router.delete(
  "/:id/members/:userId",
  simpleAuth,
  validate(removeMemberSchema),
  removeMember
);

/* ============================================================
   🔹 Invitar usuario por email
============================================================ */
router.post(
  "/:id/invite",
  simpleAuth,
  requireRole(["propietario"]),
  inviteToTeam
);

export default router;
