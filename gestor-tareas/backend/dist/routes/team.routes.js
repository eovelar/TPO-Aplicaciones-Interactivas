"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const team_validation_1 = require("../validations/team.validation");
const team_controller_1 = require("../controllers/team.controller");
const router = (0, express_1.Router)();
// Crear un equipo
router.post("/", (0, auth_middleware_1.authRequired)(), (0, validate_middleware_1.validate)(team_validation_1.teamSchema), team_controller_1.createTeam);
// Listar equipos
router.get("/", (0, auth_middleware_1.authRequired)(), team_controller_1.getTeams);
// Actualizar un equipo
router.put("/:id", (0, auth_middleware_1.authRequired)(), (0, validate_middleware_1.validate)(team_validation_1.teamSchema), team_controller_1.updateTeam);
// Eliminar un equipo
router.delete("/:id", (0, auth_middleware_1.authRequired)(), team_controller_1.deleteTeam);
// Añadir miembro a un equipo
router.post("/:id/members", (0, auth_middleware_1.authRequired)(), (0, validate_middleware_1.validate)(team_validation_1.addMemberSchema), team_controller_1.addMember);
// Quitar miembro de un equipo
router.delete("/:id/members/:userId", (0, auth_middleware_1.authRequired)(), (0, validate_middleware_1.validate)(team_validation_1.removeMemberSchema), team_controller_1.removeMember);
exports.default = router;
